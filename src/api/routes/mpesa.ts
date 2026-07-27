import { Hono } from "hono";
import { db } from "../../db";
import { consumers, redemptionsQueue, tenantSettings } from "../../db/schema";
import { eq, and } from "drizzle-orm";
import { SmsService } from "../../services/sms.service";

const app = new Hono();

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
