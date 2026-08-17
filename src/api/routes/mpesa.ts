import { Context, Hono } from "hono";
import { db } from "../../db";
import { consumers, redemptionsQueue, tenantSettings, users, tenants } from "../../db/schema";
import { eq, and } from "drizzle-orm";
import { SmsService } from "../../services/sms.service";
import { DarajaService } from "../../services/daraja.service";
import { PayoutGateway } from "../../services/payout.gateway";
import { getAppBaseUrl } from "../../lib/domain";
import { supabase } from "../../lib/supabase";

const app = new Hono<{ Variables: { user: any } }>();

async function resolveTenantId(c: Context) {
  let tenantId = c.req.query("tenantId") || c.get("user")?.tenantId;
  if (tenantId) return tenantId;

  const authHeader = c.req.header("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        const dbUser = await db.query.users.findFirst({
          where: eq(users.id, user.id)
        });
        if (dbUser?.tenantId) return dbUser.tenantId;
      }
    } catch (e) {
      console.warn("[Mpesa resolveTenantId] Auth token check error:", e);
    }
  }

  // Fallback to first available tenant in DB
  const firstTenant = await db.query.tenants.findFirst();
  return firstTenant?.id || null;
}


/**
 * Daraja B2C Result Callback
 *
 * Safaricom POSTs here asynchronously after a B2C transaction is settled.
 *
 * Payload shape (ResultCode === 0 = success):
 * {
 *   "Result": {
 *     "ResultType": 0,
 *     "ResultCode": 0,
 *     "ResultDesc": "The service request is processed successfully.",
 *     "OriginatorConversationID": "...",
 *     "ConversationID": "AG_...",          ← we stored this in externalReference
 *     "TransactionID": "NLJ7RT61SV",      ← Safaricom M-Pesa receipt
 *     "ResultParameters": {
 *       "ResultParameter": [
 *         { "Key": "TransactionAmount",       "Value": 100 },
 *         { "Key": "TransactionReceipt",      "Value": "NLJ7RT61SV" },
 *         { "Key": "B2CRecipientIsRegisteredCustomer", "Value": "Y" },
 *         { "Key": "B2CChargesPaidAccountAvailableFunds", "Value": -4510 },
 *         { "Key": "ReceiverPartyPublicName", "Value": "254712345678 - JOHN DOE" },
 *         { "Key": "TransactionCompletedDateTime", "Value": "08.07.2017 12:19:06" },
 *         { "Key": "B2CUtilityAccountAvailableFunds", "Value": 10116 },
 *         { "Key": "B2CWorkingAccountAvailableFunds", "Value": 900000 }
 *       ]
 *     }
 *   }
 * }
 */
app.post("/b2c/callback", async (c) => {
  const body = await c.req.json();
  const tenantId = c.req.query("tenantId");

  if (!body.Result) return c.json({ ResultCode: 1, ResultDesc: "Invalid payload" });

  const { ResultCode, ResultDesc, ConversationID, TransactionID, ResultParameters } = body.Result;

  console.log(`[Mpesa B2C Callback] ConversationID: ${ConversationID} | ResultCode: ${ResultCode} | Tenant: ${tenantId}`);

  // ── 1. Find the redemption record by ConversationID ────────────────────────
  const redemption = await db.query.redemptionsQueue.findFirst({
    where: and(
      eq(redemptionsQueue.externalReference, ConversationID),
      eq(redemptionsQueue.tenantId, tenantId as string)
    ),
    with: { consumer: true }
  });

  if (!redemption) {
    console.warn(`[Mpesa B2C Callback] No redemption found for ConversationID: ${ConversationID}`);
    return c.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }

  // Idempotency check: prevent processing same transaction receipt/status twice
  if (redemption.status === "SUCCESS" || redemption.status === "FAILED") {
    console.log(`[Mpesa B2C Callback] Idempotent ignore — redemption ${redemption.id} is already ${redemption.status}`);
    return c.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }

  // ── 2. FAILURE PATH ────────────────────────────────────────────────────────
  if (ResultCode !== 0) {
    console.error(`[Mpesa B2C Callback] FAILED — ${ResultDesc}`);
    await db.update(redemptionsQueue)
      .set({
        status: "FAILED",
        lastError: `Daraja ResultCode ${ResultCode}: ${ResultDesc}`,
        updatedAt: new Date(),
        metadata: {
          ...(redemption.metadata as object || {}),
          darajaResultCode: ResultCode,
          darajaResultDesc: ResultDesc,
          failedAt: new Date().toISOString(),
        },
      })
      .where(eq(redemptionsQueue.id, redemption.id));

    // Notify customer of failure
    await sendSmsToConsumer(tenantId as string, redemption.consumer.phoneNumber, 
      `Sorry, your Gamma loyalty payout could not be processed. Reason: ${ResultDesc}. Please contact support.`
    ).catch(e => console.error("Failure SMS error:", e));

    return c.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }

  // ── 3. SUCCESS PATH — Parse result parameters ──────────────────────────────
  const params: Array<{ Key: string; Value: any }> = ResultParameters?.ResultParameter || [];

  const getParam = (key: string) => params.find((p) => p.Key === key)?.Value;

  // "254712345678 - JOHN DOE KAMAU" → strip the phone prefix
  const receiverPartyRaw: string = getParam("ReceiverPartyPublicName") || "";
  const mpesaTransactionId: string = getParam("TransactionReceipt") || TransactionID || "";
  const transactionAmount    = getParam("TransactionAmount");
  const completedAt          = getParam("TransactionCompletedDateTime");

  // Parse the verified name from Safaricom (format: "254XXXXXXXXX - FULL NAME")
  const dashIndex = receiverPartyRaw.indexOf(" - ");
  const verifiedFullName = dashIndex !== -1
    ? receiverPartyRaw.slice(dashIndex + 3).trim()   // everything after " - "
    : receiverPartyRaw.trim();

  console.log(`[Mpesa B2C Callback] SUCCESS — TxID: ${mpesaTransactionId} | Name: "${verifiedFullName}" | Amount: ${transactionAmount}`);

  const consumer = redemption.consumer;

  // ── 4 & 5. Atomic DB Transaction: Mark COMPLETED & Sync authoritative M-Pesa Name ──
  await db.transaction(async (tx) => {
    await tx.update(redemptionsQueue)
      .set({
        status: "SUCCESS",
        externalReference: ConversationID,
        updatedAt: new Date(),
        metadata: {
          ...(redemption.metadata as object || {}),
          mpesaTransactionId,
          transactionAmount,
          completedAt,
          receiverPartyPublicName: receiverPartyRaw,
          verifiedFullName,
        },
      })
      .where(eq(redemptionsQueue.id, redemption.id));

    if (consumer && verifiedFullName) {
      const nameParts = verifiedFullName.split(/\s+/);
      const verifiedFirstName: string = (nameParts[0] || consumer.firstName || "Member");
      const verifiedLastName: string  = nameParts.length > 1 ? nameParts.slice(1).join(" ") : (consumer.lastName || "");

      const nameChanged =
        consumer.firstName?.toUpperCase() !== verifiedFirstName.toUpperCase() ||
        consumer.lastName?.toUpperCase()  !== verifiedLastName.toUpperCase();

      if (nameChanged || !consumer.isVerified) {
        console.log(`[Mpesa Auto-Verify] Syncing name for ${consumer.phoneNumber}: "${consumer.firstName} ${consumer.lastName}" → "${verifiedFirstName} ${verifiedLastName}"`);

        await tx.update(consumers).set({
          firstName:  verifiedFirstName,
          lastName:   verifiedLastName,
          isVerified: true,
          updatedAt:  new Date(),
        }).where(eq(consumers.id, consumer.id));
      }
    }
  });

  // ── 6. Send final confirmation SMS ────────────────────────────────────────
  const displayName   = verifiedFullName || `${consumer.firstName} ${consumer.lastName}`.trim();
  const displayAmount = transactionAmount ?? redemption.amountValue;
  const successMsg    = [
    `Dear ${displayName},`,
    `Your Gamma loyalty reward of Ksh ${displayAmount} has been sent to ${redemption.destinationAccount}.`,
    `M-Pesa Receipt: ${mpesaTransactionId}.`,
    `Thank you for choosing Gamma Coatings!`,
  ].join(" ");

  await sendSmsToConsumer(tenantId as string, redemption.destinationAccount, successMsg)
    .catch(e => console.error("Success SMS error:", e));

  return c.json({ ResultCode: 0, ResultDesc: "Success" });
});

// Route aliases for Safaricom B2C callbacks (supporting /b2c/result and /b2c/queue-timeout)
app.post("/b2c/result", async (c) => app.fetch(new Request(c.req.url.replace("/b2c/result", "/b2c/callback"), c.req.raw)));
app.post("/b2c/queue-timeout", async (c) => app.fetch(new Request(c.req.url.replace("/b2c/queue-timeout", "/b2c/timeout"), c.req.raw)));

/**
 * Daraja B2C Timeout Callback
 * Safaricom calls this if the B2C request times out before being processed.
 */
app.post("/b2c/timeout", async (c) => {
  const body = await c.req.json();
  const tenantId = c.req.query("tenantId");
  console.warn("[Mpesa B2C Timeout]", body);

  // Attempt to mark the timed-out redemption so it can be retried
  const { ConversationID } = body.Result || {};
  if (ConversationID && tenantId) {
    await db.update(redemptionsQueue)
      .set({
        status: "FAILED",
        lastError: "Daraja B2C request timed out — will be retried",
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(redemptionsQueue.externalReference, ConversationID),
          eq(redemptionsQueue.tenantId, tenantId)
        )
      );
  }

  return c.json({ ResultCode: 0, ResultDesc: "Accepted" });
});

/**
 * GET /api/mpesa/balance
 * Returns the current live stored M-Pesa float balances and configured shortcode for the tenant.
 */
app.get("/balance", async (c) => {
  const tenantId = await resolveTenantId(c);

  if (!tenantId) {
    return c.json({ success: false, error: "No active tenant found in system" }, 400);
  }

  try {
    const tSettingsRecords = await db.select().from(tenantSettings).where(eq(tenantSettings.tenantId, tenantId)).limit(1);
    const creds = (tSettingsRecords[0]?.credentials || {}) as any;

    const shortCode = creds.darajaShortCode || creds.darajaShortcode || creds.darajaB2cShortcode || creds.shortCode || null;
    const isConfigured = Boolean(creds.darajaConsumerKey && shortCode);

    const storedBalance = creds?.floatBalance || {};

    const responseData = {
      shortCode: shortCode || "Not Configured",
      utility: storedBalance.utility || (isConfigured ? "Pending Query" : "Unconfigured"),
      working: storedBalance.working || (isConfigured ? "Pending Query" : "Unconfigured"),
      charge: storedBalance.charge || (isConfigured ? "Pending Query" : "Unconfigured"),
      lastCheckedAt: storedBalance.lastCheckedAt || null,
      isConfigured,
      environment: creds.darajaBaseUrl?.includes("sandbox") || creds.darajaEnv === "sandbox" ? "Sandbox" : isConfigured ? "Production" : "Unconfigured"
    };

    return c.json({ success: true, data: responseData });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * POST /api/mpesa/balance/query
 * Triggers an on-demand M-Pesa float balance check with Safaricom Daraja API.
 */
app.post("/balance/query", async (c) => {
  const tenantId = await resolveTenantId(c);

  if (!tenantId) {
    return c.json({ success: false, error: "No active tenant found in system" }, 400);
  }

  try {
    const tSettingsRecords = await db.select().from(tenantSettings).where(eq(tenantSettings.tenantId, tenantId)).limit(1);
    const creds = (tSettingsRecords[0]?.credentials || {}) as any;

    if (!creds?.darajaConsumerKey) {
      return c.json({ success: false, error: "Daraja credentials not configured for this tenant" }, 400);
    }

    const config = {
      consumerKey: creds.darajaConsumerKey,
      consumerSecret: creds.darajaConsumerSecret || "",
      shortCode: creds.darajaShortCode || creds.darajaShortcode || creds.darajaB2cShortcode || creds.shortCode || "600000",
      initiatorName: creds.darajaInitiatorName || "TuZoInitiator",
      initiatorPassword: creds.darajaInitiatorPassword || creds.darajaPassword || "",
      securityCredential: creds.darajaSecurityCredential || "",
      certificatePem: creds.certificatePem || creds.darajaCertificatePem || undefined,
      baseUrl: creds.darajaBaseUrl || (creds.darajaEnv === "production" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke"),
      callbackUrl: `${getAppBaseUrl()}/api/mpesa/balance/callback?tenantId=${tenantId}`,
      queueTimeOutUrl: `${getAppBaseUrl()}/api/mpesa/balance/timeout?tenantId=${tenantId}`,
    };

    const result = await DarajaService.getAccountBalance({ config });

    return c.json({
      success: true,
      message: "Balance query request submitted to Safaricom successfully",
      conversationId: result.ConversationID,
      rawResponse: result,
    });
  } catch (error: any) {
    console.error("[Mpesa Balance Query Error]", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * POST /api/mpesa/test-connection
 * Tests live connection to Safaricom Daraja OAuth generation endpoint for Sandbox or Live credentials.
 */
app.post("/test-connection", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { consumerKey, consumerSecret, baseUrl = "https://sandbox.safaricom.co.ke" } = body;

  if (!consumerKey || !consumerSecret) {
    return c.json({ success: false, error: "Both Consumer Key and Consumer Secret are required to test connection" }, 400);
  }

  // Simulation check
  if (consumerKey.includes("PLACEHOLDER")) {
    return c.json({
      success: true,
      simulated: true,
      message: "Daraja Simulation Mode active (Placeholder credentials detected)"
    });
  }

  try {
    const auth = Buffer.from(`${consumerKey.trim()}:${consumerSecret.trim()}`).toString("base64");
    const response = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      method: "GET",
      headers: { Authorization: `Basic ${auth}` },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return c.json({
        success: false,
        error: `Daraja Authentication Failed (${response.status}): ${errorText || "Invalid credentials or environment mismatch"}`
      }, 400);
    }

    const data = await response.json();
    return c.json({
      success: true,
      message: `Successfully authenticated with Safaricom Daraja (${baseUrl.includes("sandbox") ? "Sandbox" : "Live Production"})!`,
      expiresInSeconds: data.expires_in,
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: `Network / Connection Failed: ${error.message}`
    }, 500);
  }
});

/**
 * POST /api/mpesa/balance/callback
 * Safaricom calls this asynchronously with account float balances.
 */
app.post("/balance/callback", async (c) => {
  const body = await c.req.json();
  const tenantId = c.req.query("tenantId");

  console.log(`[Mpesa Balance Callback] Tenant: ${tenantId}`, JSON.stringify(body));

  if (!body.Result || !tenantId) {
    return c.json({ ResultCode: 1, ResultDesc: "Invalid payload or tenantId missing" });
  }

  const { ResultCode, ResultDesc, ResultParameters } = body.Result;

  if (ResultCode === 0 && ResultParameters?.ResultParameter) {
    const params: Array<{ Key: string; Value: any }> = ResultParameters.ResultParameter;
    const getParam = (key: string) => params.find((p) => p.Key === key)?.Value;

    // Safaricom balance parameters
    // Format is typically "Working Account|KES|900000.00|900000.00|0.00|0.00"
    const accountBalanceRaw = getParam("AccountBalance") || getParam("Balance") || "";
    const utilityFund = getParam("B2CUtilityAccountAvailableFunds") || getParam("UtilityAccountAvailableFunds");
    const workingFund = getParam("B2CWorkingAccountAvailableFunds") || getParam("WorkingAccountAvailableFunds");
    const chargeFund  = getParam("ChargeAccountAvailableFunds");

    try {
      const tSettingsRecords = await db.select().from(tenantSettings).where(eq(tenantSettings.tenantId, tenantId)).limit(1);
      const tSettings = tSettingsRecords[0];

      if (tSettings) {
        const creds = (tSettings.credentials || {}) as any;
        const updatedCreds = {
          ...creds,
          floatBalance: {
            utility: utilityFund ?? creds.floatBalance?.utility ?? "N/A",
            working: workingFund ?? creds.floatBalance?.working ?? "N/A",
            charge: chargeFund ?? creds.floatBalance?.charge ?? "N/A",
            raw: accountBalanceRaw,
            lastCheckedAt: new Date().toISOString(),
          }
        };

        await db.update(tenantSettings)
          .set({ credentials: updatedCreds, updatedAt: new Date() })
          .where(eq(tenantSettings.id, tSettings.id));
        
        console.log(`[Mpesa Balance Callback] Updated float balance for tenant ${tenantId}`);
      }
    } catch (err) {
      console.error("[Mpesa Balance Callback DB Error]", err);
    }
  }

  return c.json({ ResultCode: 0, ResultDesc: "Accepted" });
});

/**
 * POST /api/mpesa/balance/timeout
 * Safaricom calls this if account balance query times out.
 */
app.post("/balance/timeout", async (c) => {
  const body = await c.req.json();
  console.warn("[Mpesa Balance Timeout]", body);
  return c.json({ ResultCode: 0, ResultDesc: "Accepted" });
});

/**
 * POST /api/mpesa/manual-payout
 * Directly triggers a manual M-Pesa B2C payout to any number or selected consumer.
 */
app.post("/manual-payout", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const tenantId = body.tenantId || await resolveTenantId(c);

  if (!tenantId) {
    return c.json({ success: false, error: "No active tenant found in system" }, 400);
  }

  const { phoneNumber, consumerId, amount, remarks } = body;

  if (!phoneNumber || !amount || amount <= 0) {
    return c.json({ success: false, error: "Valid phone number and positive amount in KES are required" }, 400);
  }

  try {
    const formattedPhone = phoneNumber.startsWith("+") 
      ? phoneNumber.slice(1) 
      : phoneNumber.startsWith("0") 
        ? "254" + phoneNumber.slice(1) 
        : phoneNumber;

    // 1. Create a recorded redemption queue entry for auditability
    let resolvedConsumerId = consumerId;
    if (!resolvedConsumerId) {
      const foundConsumer = await db.query.consumers.findFirst({
        where: and(eq(consumers.phoneNumber, formattedPhone), eq(consumers.tenantId, tenantId))
      });
      if (foundConsumer) {
        resolvedConsumerId = foundConsumer.id;
      }
    }

    const redemptionId = "MANUAL-" + Math.random().toString(36).substring(2, 9).toUpperCase();

    // 2. Dispatch payout directly via PayoutGateway
    const result = await PayoutGateway.execute({
      tenantId,
      redemptionId,
      amount: Number(amount),
      currency: "KES",
      destination: formattedPhone,
      fulfillmentStrategy: "AUTOMATED_PAYOUT",
    });

    if (!result.success) {
      return c.json({ success: false, error: result.error || "Manual payout failed" }, 400);
    }

    return c.json({
      success: true,
      message: `Manual payout of KES ${amount} dispatched to ${formattedPhone} successfully`,
      externalReference: result.externalReference,
      rawResponse: result.rawResponse,
    });
  } catch (error: any) {
    console.error("[Mpesa Manual Payout Error]", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Fetches tenant SMS config and sends an SMS.
 * Falls back silently if settings are not yet available (e.g. before db:push).
 */
async function sendSmsToConsumer(tenantId: string, phoneNumber: string, message: string) {
  const tSettings = await db.query.tenantSettings
    .findFirst({ where: eq(tenantSettings.tenantId, tenantId) })
    .catch(() => null);

  const creds = (tSettings?.credentials || {}) as any;

  return SmsService.sendSms({
    config: {
      provider:   creds.smsProvider,
      username:   creds.atUsername,
      apiKey:     creds.atApiKey,
      senderId:   creds.atSenderId,
      apiClientID: creds.bongaApiClientID,
      key:        creds.bongaApiKey,
      secret:     creds.bongaApiSecret,
      serviceID:  creds.bongaServiceID,
    },
    to: phoneNumber,
    message,
  });
}

export default app;
