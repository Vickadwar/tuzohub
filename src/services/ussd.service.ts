/**
 * Africa's Talking / Olive Tree Media USSD Service Facade
 * Delegates request processing to the modular UssdDispatcher strategy engine.
 */

import { UssdDispatcher } from "./ussd/ussd.dispatcher";
import { UssdRequestParams } from "./ussd/ussd.interface";

export class UssdService {
  /**
   * Process an incoming USSD request.
   * Delegates to UssdDispatcher which handles hybrid routing and strategy execution.
   */
  static async processRequest(params: UssdRequestParams): Promise<string> {
    return await UssdDispatcher.dispatch(params);
  }
}
