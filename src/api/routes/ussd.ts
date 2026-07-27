import { Hono } from "hono";
import { UssdService } from "../../services/ussd.service";

/**
 * Multi-Tenant USSD Callback Handler
 *
 * Supports both GET (Olive Tree Media / Bonga USSD) and POST (Africa's Talking / Jenga)
 *
 * Register this URL in your provider dashboard:
 *   GET/POST https://yourdomain.com/api/ussd/callback?tenantId=<uuid>
 *
 * Parameter Normalization:
 *   Session ID   - session_id (Olive) or sessionId (AT)
 *   Service Code - service_code (Olive) or serviceCode (AT)
 *   Phone Number - mobile_number (Olive) or phoneNumber (AT)
 *   User Input   - message (Olive) or text (AT)
 */

const app = new Hono();

// ── Olive Tree Media (Bonga USSD) GET Handler ──────────────────────────────
app.get("/callback", async (c) => {
  const sessionId   = c.req.query("session_id") || c.req.query("sessionId") || "";
  const serviceCode = c.req.query("service_code") || c.req.query("serviceCode") || "";
  const phoneNumber = c.req.query("mobile_number") || c.req.query("phoneNumber") || "";
  const text        = c.req.query("message") || c.req.query("text") || "";
  const tenantId    = c.req.query("tenantId");

  if (!tenantId) {
    return c.text("END Configuration error: Missing tenantId.", 400);
  }

  console.log(`[USSD GET - Olive/Bonga] Session: ${sessionId}, Phone: ${phoneNumber}, Text: "${text}"`);

  try {
    const response = await UssdService.processRequest({
      sessionId,
      serviceCode,
      phoneNumber,
      text,
      tenantId,
    });

    return c.text(response);
  } catch (err: any) {
    console.error("[USSD GET Error]", err.message);
    return c.text("END An error occurred. Please try again later.");
  }
});

// ── Africa's Talking / Jenga POST Handler ──────────────────────────────────
app.post("/callback", async (c) => {
  const body = (await c.req.parseBody().catch(() => ({}))) as Record<string, any>;

  const sessionId   = (body["sessionId"] || body["session_id"] || "") as string;
  const serviceCode = (body["serviceCode"] || body["service_code"] || "") as string;
  const phoneNumber = (body["phoneNumber"] || body["mobile_number"] || "") as string;
  const text        = (body["text"] || body["message"] || "") as string;
  const tenantId    = c.req.query("tenantId");

  if (!tenantId) {
    return c.text("END Configuration error: Missing tenantId.", 400);
  }

  console.log(`[USSD POST - AT/Jenga] Session: ${sessionId}, Phone: ${phoneNumber}, Text: "${text}"`);

  try {
    const response = await UssdService.processRequest({
      sessionId,
      serviceCode,
      phoneNumber,
      text,
      tenantId,
    });

    return c.text(response);
  } catch (err: any) {
    console.error("[USSD POST Error]", err.message);
    return c.text("END An error occurred. Please try again later.");
  }
});

export default app;
