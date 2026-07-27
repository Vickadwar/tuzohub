import { Hono } from "hono";
import { UssdService } from "../../services/ussd.service";

/**
 * Multi-Tenant USSD Callback Handler
 *
 * Supports both GET (Olive Tree Media / Bonga USSD) and POST (Africa's Talking / Jenga)
 * Supports both /api/ussd and /api/ussd/callback endpoints.
 */

const app = new Hono();

async function handleUssd(c: any, method: "GET" | "POST") {
  let sessionId = "";
  let serviceCode = "";
  let phoneNumber = "";
  let text = "";

  if (method === "GET") {
    sessionId   = c.req.query("session_id") || c.req.query("sessionId") || "";
    serviceCode = c.req.query("service_code") || c.req.query("serviceCode") || "";
    phoneNumber = c.req.query("mobile_number") || c.req.query("phoneNumber") || "";
    text        = c.req.query("message") || c.req.query("text") || "";
  } else {
    const body = (await c.req.parseBody().catch(() => ({}))) as Record<string, any>;
    sessionId   = (body["sessionId"] || body["session_id"] || c.req.query("sessionId") || "") as string;
    serviceCode = (body["serviceCode"] || body["service_code"] || c.req.query("serviceCode") || "") as string;
    phoneNumber = (body["phoneNumber"] || body["mobile_number"] || c.req.query("phoneNumber") || "") as string;
    text        = (body["text"] || body["message"] || c.req.query("text") || "") as string;
  }

  const tenantId = c.req.query("tenantId");
  const tenantSlug = c.req.query("tenantSlug") || c.req.query("slug") || c.req.query("tenant");

  console.log(`[USSD ${method}] Session: ${sessionId}, Phone: ${phoneNumber}, Code: ${serviceCode}, Text: "${text}", TenantId: ${tenantId || "none"}, TenantSlug: ${tenantSlug || "none"}`);

  try {
    const response = await UssdService.processRequest({
      sessionId,
      serviceCode,
      phoneNumber,
      text,
      tenantId,
      tenantSlug,
    });

    c.header("Content-Type", "text/plain");
    return c.text(response);
  } catch (err: any) {
    console.error(`[USSD ${method} Error]`, err);
    c.header("Content-Type", "text/plain");
    return c.text("END An internal system error occurred. Please try again later.");
  }
}

// Support both root /api/ussd and /api/ussd/callback (GET and POST)
app.get("/", (c) => handleUssd(c, "GET"));
app.get("/callback", (c) => handleUssd(c, "GET"));
app.get("/*", (c) => handleUssd(c, "GET"));

app.post("/", (c) => handleUssd(c, "POST"));
app.post("/callback", (c) => handleUssd(c, "POST"));
app.post("/*", (c) => handleUssd(c, "POST"));

export default app;
