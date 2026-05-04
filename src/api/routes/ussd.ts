import { Hono } from "hono";
import { UssdService } from "../../services/ussd.service";

/**
 * Africa's Talking USSD Callback Handler
 *
 * Africa's Talking sends a POST x-www-form-urlencoded request to this route.
 * Register this URL in your Africa's Talking dashboard:
 *   POST https://yourdomain.com/api/ussd/callback?tenantId=<uuid>
 *
 * Required form fields:
 *   sessionId   - unique session identifier
 *   serviceCode - USSD short code dialed
 *   phoneNumber - consumer's phone number
 *   text        - accumulated input (e.g. "1*2*50")
 */

const app = new Hono();

app.post("/callback", async (c) => {
  // Africa's Talking sends form-encoded body
  const body = await c.req.parseBody();

  const sessionId   = body["sessionId"] as string;
  const serviceCode = body["serviceCode"] as string;
  const phoneNumber = body["phoneNumber"] as string;
  const text        = (body["text"] as string) || "";

  // Tenant is identified via query param (each tenant gets their own USSD code mapping)
  const tenantId = c.req.query("tenantId");

  if (!tenantId) {
    return c.text("END Configuration error: Missing tenantId.", 400);
  }

  console.log(`[USSD] Session: ${sessionId}, Phone: ${phoneNumber}, Text: "${text}"`);

  try {
    const response = await UssdService.processRequest({
      sessionId,
      serviceCode,
      phoneNumber,
      text,
      tenantId,
    });

    // Africa's Talking expects plain text response
    return c.text(response);
  } catch (err: any) {
    console.error("[USSD Error]", err.message);
    return c.text("END An error occurred. Please try again later.");
  }
});

export default app;
