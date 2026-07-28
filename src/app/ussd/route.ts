/**
 * Bonga / Olive Tree Media & Africa's Talking USSD Route Handler
 *
 * Mounts directly at /ussd so the USSD dashboard callback URL
 * can be mapped directly to: https://tuzohub.vercel.app/ussd
 *
 * Bonga/Olive Tree API spec (GET):
 *   ?mobile_number=254712345678&session_id=1234567&message=&service_code=*617%2385%23&network=Safaricom
 *
 * Africa's Talking / Jenga API spec (POST):
 *   sessionId=1234567&serviceCode=*617#&phoneNumber=+254712345678&text=
 */

import { UssdService } from "@/services/ussd.service";

async function handleUssdRequest(req: Request, method: "GET" | "POST") {
  let sessionId = "";
  let serviceCode = "";
  let phoneNumber = "";
  let text = "";

  const url = new URL(req.url);
  const tenantId = url.searchParams.get("tenantId") || undefined;
  const tenantSlug = url.searchParams.get("tenantSlug") || url.searchParams.get("slug") || url.searchParams.get("tenant") || undefined;

  if (method === "GET") {
    sessionId   = url.searchParams.get("session_id")   || url.searchParams.get("sessionId")   || "";
    serviceCode = url.searchParams.get("service_code") || url.searchParams.get("serviceCode") || "";
    phoneNumber = url.searchParams.get("mobile_number")|| url.searchParams.get("phoneNumber") || "";
    text        = url.searchParams.get("message")      || url.searchParams.get("text")        || "";
  } else {
    let body: Record<string, any> = {};
    const contentType = req.headers.get("content-type") || "";
    
    if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      const formData = await req.formData().catch(() => new FormData());
      body = Object.fromEntries(formData.entries());
    } else if (contentType.includes("application/json")) {
      body = await req.json().catch(() => ({}));
    }

    sessionId   = (body["sessionId"]   || body["session_id"]   || url.searchParams.get("sessionId")   || url.searchParams.get("session_id")   || "") as string;
    serviceCode = (body["serviceCode"] || body["service_code"] || url.searchParams.get("serviceCode") || url.searchParams.get("service_code") || "") as string;
    phoneNumber = (body["phoneNumber"] || body["mobile_number"]|| url.searchParams.get("phoneNumber") || url.searchParams.get("mobile_number")|| "") as string;
    text        = (body["text"]        || body["message"]      || url.searchParams.get("text")        || url.searchParams.get("message")      || "") as string;
  }

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
      headers: { 
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  } catch (err: any) {
    console.error("[/ussd Error]", err);
    return new Response("END An internal error occurred. Please try again.", {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

export async function GET(req: Request) {
  return handleUssdRequest(req, "GET");
}

export async function POST(req: Request) {
  return handleUssdRequest(req, "POST");
}

export const dynamic = "force-dynamic";
