import { db } from "../../db";
import { tenants, tenantSettings, consumers } from "../../db/schema";
import { eq, and } from "drizzle-orm";
import { IUssdHandler, UssdRequestParams, UssdRequestContext } from "./ussd.interface";
import { ConfigurableUssdEngine } from "./configurable.ussd";
import { GammaUssdService } from "./gamma.ussd";

export class UssdDispatcher {
  private static readonly HANDLERS: Record<string, IUssdHandler> = {
    "gamma-coatings": new GammaUssdService(),
    "gamma": new GammaUssdService(),
    "GAMMA_COATINGS": new GammaUssdService(),
  };

  private static readonly defaultHandler: IUssdHandler = new ConfigurableUssdEngine();

  /**
   * Dispatch an incoming USSD request to the appropriate tenant strategy handler.
   * Super Admin Telco Governance & Dynamic Strategy Resolution:
   * 1. Primary: Explicit URL parameter (`tenantId` or `tenantSlug`).
   * 2. Shortcode Binding: Match DB `primaryShortcode` or `sharedSubPrefix` against incoming `serviceCode`.
   * 3. Strategy Handler Selection: Route to `GammaUssdService` or universal `ConfigurableUssdEngine`.
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

    // 2. Shortcode Binding Auto-Discovery (Super Admin configured primaryShortcode & sharedSubPrefix)
    if (!resolvedTenantId && params.serviceCode) {
      const cleanCode = params.serviceCode.replace(/[^0-9*]/g, "");
      const allSettings = await db.select().from(tenantSettings);
      
      for (const setting of allSettings) {
        const creds = (setting.credentials || {}) as any;
        const primarySc = (setting.primaryShortcode || creds.ussdServiceCode || creds.serviceCode || "").replace(/[^0-9*]/g, "");
        const subPrefix = (setting.sharedSubPrefix || "").replace(/[^0-9*]/g, "");

        if (
          (primarySc && (primarySc === cleanCode || cleanCode.includes(primarySc))) ||
          (subPrefix && (subPrefix === cleanCode || cleanCode.includes(subPrefix)))
        ) {
          resolvedTenantId = setting.tenantId;
          break;
        }
      }
    }

    // 3. Fallback for Staging: Default to Gamma Coatings or first available tenant
    if (!resolvedTenantId) {
      const allTenants = await db.select().from(tenants).catch(() => []);
      const fallbackTenant = allTenants.find(t => t.slug === "gamma-coatings");
      const alternativeGamma = allTenants.find(t => t.slug.includes("gamma"));

      if (fallbackTenant) {
        resolvedTenantId = fallbackTenant.id;
      } else if (alternativeGamma) {
        resolvedTenantId = alternativeGamma.id;
      } else if (allTenants.length > 0) {
        resolvedTenantId = allTenants[0].id;
      }
    }

    if (!resolvedTenantId) {
      return "END Configuration error: Unable to resolve tenant for this shortcode.";
    }

    // --- USSD GATEWAY SANITIZATION ---
    // Gateways sometimes send the serviceCode, subcode, or whitespace as the first input.
    let rawText = params.text.trim();
    
    // 1. Strip exact service code if prepended (e.g., *617*85#*1 -> 1)
    if (params.serviceCode && rawText.startsWith(params.serviceCode)) {
      rawText = rawText.substring(params.serviceCode.length);
    }
    
    // 2. Strip clean version of service code if prepended
    const cleanServiceCode = params.serviceCode ? params.serviceCode.replace(/[^0-9*]/g, "") : "";
    if (cleanServiceCode && rawText.startsWith(cleanServiceCode)) {
      rawText = rawText.substring(cleanServiceCode.length);
    }

    // 3. Remove leading asterisks left over from stripping
    if (rawText.startsWith("*")) {
      rawText = rawText.substring(1);
    }
    
    // 4. Strip sub-code if passed purely as text (e.g. text="85", serviceCode="*617*85#")
    if (params.serviceCode && rawText.length > 0) {
      const parts = params.serviceCode.replace(/[^0-9*]/g, "").split("*").filter(Boolean);
      const subcode = parts[parts.length - 1]; // e.g., "85"
      if (rawText === subcode) {
        rawText = "";
      }
    }

    const normalizedPhone = this.normalizePhone(params.phoneNumber);
    const levels = rawText.split("*").filter(Boolean);

    // 5. Fetch Consumer, Tenant, and Tenant Settings
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

    // 5. Strategy Handler Resolution (Super Admin controlled ussdHandlerStrategy)
    const strategy = (tSettingsRecord?.ussdHandlerStrategy || "").toUpperCase();
    const slug = (tenantRecord?.slug || "").toLowerCase();
    
    let handler: IUssdHandler;
    if (strategy === "GAMMA_COATINGS" || strategy === "GAMMA" || slug.includes("gamma")) {
      handler = new GammaUssdService();
    } else if (this.HANDLERS[strategy]) {
      handler = this.HANDLERS[strategy];
    } else {
      // Default to universal schema-driven ConfigurableUssdEngine
      handler = this.defaultHandler;
    }

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
