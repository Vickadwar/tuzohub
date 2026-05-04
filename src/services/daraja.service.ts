import axios from "axios";

export interface DarajaConfig {
  consumerKey: string;
  consumerSecret: string;
  shortCode: string;
  initiatorName: string;
  initiatorPassword: string; // Plain password, we'll hash it if needed or use security credential
  securityCredential: string;
  callbackUrl: string;
  queueTimeOutUrl: string;
  baseUrl: string; // https://sandbox.safaricom.co.ke or https://api.safaricom.co.ke
}

export class DarajaService {
  private static async getAccessToken(config: DarajaConfig): Promise<string> {
    const auth = Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString("base64");
    
    try {
      const response = await axios.get(`${config.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
        headers: { Authorization: `Basic ${auth}` },
      });
      return response.data.access_token;
    } catch (error: any) {
      console.error("Daraja Auth Error:", error.response?.data || error.message);
      throw new Error("Failed to authenticate with Daraja");
    }
  }

  /**
   * Triggers a B2C Payout (Business to Customer)
   */
  static async sendPayout(params: {
    config: DarajaConfig;
    amount: number;
    phoneNumber: string;
    remarks: string;
    occasion?: string;
    commandId?: "SalaryPayment" | "BusinessPayment" | "PromotionPayment";
  }) {
    const { config, amount, phoneNumber, remarks, occasion = "Loyalty Reward", commandId = "PromotionPayment" } = params;

    // Simulation check: If credentials look like placeholders, simulate success
    if (config.consumerKey.includes("PLACEHOLDER") || !config.consumerKey) {
      console.log(`[Daraja Simulation] Sending ${amount} KES to ${phoneNumber}`);
      return { 
        ConversationID: `SIM-${Math.random().toString(36).slice(2, 9)}`,
        OriginatorConversationID: `SIM-ORG-${Math.random().toString(36).slice(2, 9)}`,
        ResponseDescription: "Accept the service request successfully."
      };
    }

    const accessToken = await this.getAccessToken(config);
    
    const payload = {
      InitiatorName: config.initiatorName,
      SecurityCredential: config.securityCredential,
      CommandID: commandId,
      Amount: Math.floor(amount),
      PartyA: config.shortCode,
      PartyB: phoneNumber.replace("+", ""),
      Remarks: remarks,
      QueueTimeOutURL: config.queueTimeOutUrl,
      ResultURL: config.callbackUrl,
      Occasion: occasion
    };

    try {
      const response = await axios.post(`${config.baseUrl}/mpesa/b2c/v1/paymentrequest`, payload, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return response.data;
    } catch (error: any) {
      console.error("Daraja B2C Error:", error.response?.data || error.message);
      throw new Error("Daraja Payout Request Failed");
    }
  }
}
