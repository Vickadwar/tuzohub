import { Hono } from "hono";
import { db } from "../../db";
import { consumers, redemptionsQueue } from "../../db/schema";
import { eq, and } from "drizzle-orm";

const app = new Hono();

/**
 * Daraja B2C Result Callback
 * Handles the final result of a payout request.
 */
app.post("/b2c/callback", async (c) => {
  const body = await c.req.json();
  const tenantId = c.req.query("tenantId");

  if (!body.Result) return c.json({ ResultCode: 1, ResultDesc: "Invalid payload" });

  const { ResultCode, ResultDesc, ConversationID, ResultParameters } = body.Result;

  console.log(`[Mpesa B2C Callback] Result: ${ResultCode} (${ResultDesc}) for Tenant: ${tenantId}`);

  if (ResultCode === 0 && ResultParameters && ResultParameters.ResultParameter) {
    // 1. Find the recipient's phone number and name from parameters
    // Safaricom returns "ReceiverPartyPublicName" in the parameters
    const params = ResultParameters.ResultParameter;
    const receiverName = params.find((p: any) => p.Key === "ReceiverPartyPublicName")?.Value;
    const transactionId = params.find((p: any) => p.Key === "TransactionID")?.Value;
    const b2cAmount = params.find((p: any) => p.Key === "TransactionAmount")?.Value;

    // 2. Find the redemption record by ConversationID
    const redemption = await db.query.redemptionsQueue.findFirst({
      where: and(
        eq(redemptionsQueue.externalReference, ConversationID),
        eq(redemptionsQueue.tenantId, tenantId as string)
      )
    });

    if (redemption && receiverName) {
      const phone = redemption.destinationAccount;
      
      // 3. AUTO-VERIFY CONSUMER NAME
      const consumer = await db.query.consumers.findFirst({
        where: and(eq(consumers.phoneNumber, phone), eq(consumers.tenantId, tenantId as string))
      });

      if (consumer && (consumer.firstName === "Guest" || !consumer.isVerified)) {
        console.log(`[Mpesa Auto-Verify] Updating ${phone} name to ${receiverName}`);
        
        // Split name: "JOHN DOE" -> "JOHN", "DOE"
        const nameParts = receiverName.split(" ");
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "Member";

        await db.update(consumers).set({
          firstName,
          lastName,
          isVerified: true,
          updatedAt: new Date(),
        }).where(eq(consumers.id, consumer.id));
      }
    }
  }

  return c.json({ ResultCode: 0, ResultDesc: "Success" });
});

/**
 * Daraja B2C Timeout Callback
 */
app.post("/b2c/timeout", async (c) => {
  const body = await c.req.json();
  console.warn("[Mpesa B2C Timeout]", body);
  return c.json({ ResultCode: 0, ResultDesc: "Accepted" });
});

export default app;
