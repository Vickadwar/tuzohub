import { db } from "../../db";
import { tenants, tenantSettings, consumers } from "../../db/schema";
import { eq, and } from "drizzle-orm";
import { IUssdHandler, UssdRequestParams, UssdRequestContext } from "./ussd.interface";
import { DefaultUssdService } from "./default.ussd";
import { GammaUssdService } from "./gamma.ussd";

export class UssdDispatcher {
  private static readonly HANDLERS: Record<string, IUssdHandler> = {
    "gamma-coatings": new GammaUssdService(),
    "gamma": new GammaUssdService(),
  };

  private static readonly defaultHandler: IUssdHandler = new DefaultUssdService();

  /**
   * Dispatch an incoming USSD request to the appropriate tenant strategy handler.
   * Implements Hybrid Routing:
   * 1. Primary: Resolves tenant via explicit URL parameter (`tenantId` or `tenantSlug`).
   * 2. Fallback: Discovers tenant by inspecting `serviceCode` in tenant database settings.
   */
  static async dispatch(params: UssdRequestParams): Promise<string> {
    let resolvedTenantId = params.tenantId;

    // 1. Resolve tenantSlug if provided instead of tenantId
    if (!resolvedTenantId && params.tenantSlug) {
      const tenantRow = await db.select({ id: tenants.id }).from(tenants)
        .where(eq(tenants.slug, params.tenantSlug))
        .limit(1)
        .then(r => r[0]);
      if (tenantRow) {
        resolvedTenantId = tenantRow.id;
      }
    }

    // 2. Fallback Safeguard: Auto-discovery via shortcode (serviceCode) lookup
    if (!resolvedTenantId && params.serviceCode) {
      const allSettings = await db.select().from(tenantSettings);
      for (const setting of allSettings) {
        const creds = (setting.credentials || {}) as any;
        if (creds.ussdServiceCode === params.serviceCode || creds.serviceCode === params.serviceCode) {
          resolvedTenantId = setting.tenantId;
          break;
        }
      }
    }

    if (!resolvedTenantId) {
      return "END Configuration error: Unable to resolve tenant for this shortcode.";
    }

    const normalizedPhone = this.normalizePhone(params.phoneNumber);
    const levels = params.text.split("*").filter(Boolean);

    // 3. Fetch Consumer, Tenant, and Tenant Settings
    const [consumer, tenantRecord, tSettingsRecord] = await Promise.all([
      this.findConsumer(normalizedPhone, resolvedTenantId),
      db.select().from(tenants).where(eq(tenants.id, resolvedTenantId)).limit(1).then(r => r[0]),
      db.select().from(tenantSettings).where(eq(tenantSettings.tenantId, resolvedTenantId)).limit(1).then(r => r[0]).catch(() => null)
    ]);

    const context: UssdRequestContext = {
      sessionId: params.sessionId,
      serviceCode: params.serviceCode,
      phoneNumber: params.phoneNumber,
      text: params.text,
      tenantId: resolvedTenantId,
      normalizedPhone,
      levels,
      consumer,
      tenantRecord,
      tSettingsRecord,
    };

    // 4. Resolve Strategy Handler
    const slug = (tenantRecord?.slug || "").toLowerCase();
    const isGamma = slug === "gamma-coatings" || slug === "gamma" || (tenantRecord?.name || "").toLowerCase().includes("gamma");
    
    const handler = isGamma ? new GammaUssdService() : (this.HANDLERS[slug] || this.defaultHandler);

    return await handler.processRequest(params, context);
  }

  private static async findConsumer(phone: string, tenantId: string) {
    return await db.query.consumers.findFirst({
      where: and(eq(consumers.phoneNumber, phone), eq(consumers.tenantId, tenantId)),
    });
  }

  private static normalizePhone(phone: string): string {
    let p = phone.replace(/\s/g, "");
    if (p.startsWith("+254")) return "0" + p.slice(4);
    if (p.startsWith("254")) return "0" + p.slice(3);
    return p;
  }
}
