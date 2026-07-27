/**
 * Standard Contract for Multi-Tenant USSD Handlers
 * Every tenant-specific USSD strategy (Gamma, Crown, Default) implements this interface.
 */

export interface UssdRequestParams {
  sessionId: string;
  serviceCode: string;
  phoneNumber: string;
  text: string;
  tenantId?: string;
  tenantSlug?: string;
}

export interface UssdRequestContext {
  sessionId: string;
  serviceCode: string;
  phoneNumber: string;
  text: string;
  tenantId: string;
  normalizedPhone: string;
  levels: string[];
  consumer: any;
  tenantRecord: any;
  tSettingsRecord: any;
}

export interface IUssdHandler {
  /**
   * Process an incoming USSD session request.
   * Must return a string starting with "CON " (continue session) or "END " (terminate session).
   */
  processRequest(params: UssdRequestParams, context: UssdRequestContext): Promise<string>;
}
