/**
 * Bonga / Olive Tree Media USSD Route Handler
 *
 * Mounts directly at /ussd so the Bonga USSD dashboard callback URL
 * can be set to: https://your-domain.vercel.app/ussd
 *
 * Delegates to the Hono USSD handler via the shared app instance.
 * Works in both development and production without relying on Next.js rewrites.
 *
 * Bonga/Olive Tree API spec (GET):
 *   ?mobile_number=254712345678&session_id=1234567&message=&service_code=*617%2385%23&network=Safaricom
 */

import { handle } from "hono/vercel";
import { Hono } from "hono";
import { UssdService } from "@/services/ussd.service";

const ussdApp = new Hono();

async function handleUssd(c: any, method: "GET" | "POST") {
  let sessionId = "";
  let serviceCode = "";
  let phoneNumber = "";
  let text = "";

  if (method === "GET") {
    // Bonga/Olive Tree Media field names
    sessionId   = c.req.query("session_id")   || c.req.query("sessionId")   || "";
    serviceCode = c.req.query("service_code") || c.req.query("serviceCode") || "";
    phoneNumber = c.req.query("mobile_number")|| c.req.query("phoneNumber") || "";
    text        = c.req.query("message")      || c.req.query("text")        || "";
  } else {
    // Africa's Talking / Jenga POST body
    const body = (await c.req.parseBody().catch(() => ({}))) as Record<string, any>;
    sessionId   = (body["sessionId"]   || body["session_id"]   || c.req.query("sessionId")   || "") as string;
    serviceCode = (body["serviceCode"] || body["service_code"] || c.req.query("serviceCode") || "") as string;
    phoneNumber = (body["phoneNumber"] || body["mobile_number"]|| c.req.query("phoneNumber") || "") as string;
    text        = (body["text"]        || body["message"]      || c.req.query("text")        || "") as string;
  }

  const tenantId   = c.req.query("tenantId");
  const tenantSlug = c.req.query("tenantSlug") || c.req.query("slug") || c.req.query("tenant");

  console.log(`[/ussd ${method}] Session: ${sessionId}, Phone: ${phoneNumber}, Code: ${serviceCode}, Text: "${text}"`);

  try {
    const responseText = await UssdService.processRequest({
      sessionId,
      serviceCode,
      phoneNumber,
      text,
      tenantId,
      tenantSlug,
    });

    return new Response(responseText, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err: any) {
    console.error("[/ussd Error]", err);
    return new Response("END An internal error occurred. Please try again.", {
      status: 200, // Always 200 for USSD
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

ussdApp.get("/",  (c) => handleUssd(c, "GET"));
ussdApp.post("/", (c) => handleUssd(c, "POST"));

const handler = handle(ussdApp);

export const GET  = handler;
export const POST = handler;

// Opt out of Next.js caching - USSD is always real-time
export const dynamic = "force-dynamic";
