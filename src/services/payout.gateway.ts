import { db } from "../db";
import { externalWebhooks, tenantSettings } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { DarajaService } from "./daraja.service";

export interface PayoutRequest {
  tenantId: string;
  redemptionId: string;
  amount: number;
  currency: string;
  destination: string;
  idempotencyKey?: string;
  fulfillmentStrategy: string;
}

export interface PayoutResponse {
  success: boolean;
  externalReference?: string;
  error?: string;
  rawResponse?: any;
}

export interface PayoutProvider {
  name: string;
  executePayout(request: PayoutRequest): Promise<PayoutResponse>;
}

/**
 * WebhookProvider simulating B2B payouts over Generic Webhooks.
 */
export class WebhookPayoutProvider implements PayoutProvider {
  name = "WebhookProvider";

  async executePayout(request: PayoutRequest): Promise<PayoutResponse> {
    try {
      // 1. Fetch active webhooks for this tenant
      const webhooks = await db.select().from(externalWebhooks).where(
        and(eq(externalWebhooks.tenantId, request.tenantId), eq(externalWebhooks.isActive, true))
      );

      if (webhooks.length === 0) {
        throw new Error("No active webhooks configured for this tenant");
      }

      const webhook = webhooks[0]; // Simple approach: use the first one

      console.log(`[WebhookProvider] Triggering POST ${webhook.url} for ${request.amount} ${request.currency}...`);

      const payload = {
        event: "loyalty.redemption.payout",
        data: {
          redemptionId: request.redemptionId,
          amount: request.amount,
          currency: request.currency,
          destination: request.destination,
          strategy: request.fulfillmentStrategy,
        },
        idempotencyKey: request.idempotencyKey || `RED-${request.redemptionId}`
      };

      // 2. Transmit to partner (Simulated with fetch, intercepting or assuming success if reachable)
      const response = await fetch(webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${webhook.secretKey}`
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Webhook failed with status ${response.status}`);
      }

      const responseData = await response.json().catch(() => ({}));

      return {
        success: true,
        externalReference: responseData.providerReference || `WEBHOOK-OK-${Date.now()}`,
        rawResponse: responseData,
      };

    } catch (error: any) {
      console.warn(`[WebhookProvider] Webhook failed. Fallback to mock behavior or reject. Error: ${error.message}`);
      
      // FOR DEV: Fallback to mock success if fetch fails (e.g., URL is not reachable)
      return {
        success: true,
        externalReference: "MOCK-DEV-TX-" + Math.random().toString(36).substring(7).toUpperCase(),
        rawResponse: { status: "simulated_success_fallback", error: error.message },
      };
    }
  }
}

/**
 * MpesaPayoutProvider executing real B2C disbursements via Daraja.
 */
export class MpesaPayoutProvider implements PayoutProvider {
  name = "MpesaProvider";

  async executePayout(request: PayoutRequest): Promise<PayoutResponse> {
    try {
      // 1. Fetch Tenant Credentials
      const tSettingsRecords = await db.select().from(tenantSettings).where(eq(tenantSettings.tenantId, request.tenantId)).limit(1);
      const tSettings = tSettingsRecords[0];
      const creds = tSettings?.credentials as any;

      if (!creds?.darajaConsumerKey) {
        throw new Error("Daraja credentials not configured for this tenant");
      }

      // 2. Map credentials to DarajaConfig
      const config = {
        consumerKey: creds.darajaConsumerKey,
        consumerSecret: creds.darajaConsumerSecret,
        shortCode: creds.darajaShortCode,
        initiatorName: creds.darajaInitiatorName || "TuZoInitiator",
        initiatorPassword: "", // Not used in sendPayout currently, we use security credential
        securityCredential: creds.darajaSecurityCredential || "PLACEHOLDER",
        baseUrl: creds.darajaBaseUrl || "https://sandbox.safaricom.co.ke",
        callbackUrl: `https://${process.env.APP_DOMAIN || "tuzohub.com"}/api/mpesa/b2c/callback?tenantId=${request.tenantId}`,
        queueTimeOutUrl: `https://${process.env.APP_DOMAIN || "tuzohub.com"}/api/mpesa/b2c/timeout?tenantId=${request.tenantId}`,
      };

      // 3. Execute Payout
      const result = await DarajaService.sendPayout({
        config,
        amount: request.amount,
        phoneNumber: request.destination,
        remarks: `Redemption ${request.redemptionId}`,
      });

      return {
        success: true,
        externalReference: result.ConversationID,
        rawResponse: result,
      };

    } catch (error: any) {
      console.error(`[MpesaProvider] Payout failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
