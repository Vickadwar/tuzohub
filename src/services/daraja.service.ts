import axios from "axios";
import { generateSecurityCredential } from "../lib/daraja-auth";

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
  certificatePem?: string; // Optional custom Safaricom X509 cert
}

export class DarajaService {
  private static async getAccessToken(config: DarajaConfig): Promise<string> {
    const auth = Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString("base64");
    
    try {
      const response = await axios.get(`${config.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
        headers: { Authorization: `Basic ${auth}` },
        timeout: 10000, // 10s timeout
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
    
    // Dynamically encrypt security credential if plain password is supplied or credential is placeholder
    let securityCredential = config.securityCredential;
    if ((!securityCredential || securityCredential === "PLACEHOLDER") && config.initiatorPassword) {
      securityCredential = generateSecurityCredential(config.initiatorPassword, config.certificatePem, config.baseUrl);
    }

    const payload = {
      InitiatorName: config.initiatorName,
      SecurityCredential: securityCredential,
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
        timeout: 15000, // 15s timeout for B2C request
      });
      return response.data;
    } catch (error: any) {
      console.error("Daraja B2C Error:", error.response?.data || error.message);
      throw new Error("Daraja Payout Request Failed");
    }
  }

  /**
   * Triggers an Account Balance query for M-Pesa float
   */
  static async getAccountBalance(params: {
    config: DarajaConfig;
    remarks?: string;
  }) {
    const { config, remarks = "Float Balance Query" } = params;

    // Simulation check: If credentials look like placeholders, simulate success
    if (config.consumerKey.includes("PLACEHOLDER") || !config.consumerKey) {
      console.log(`[Daraja Simulation] Triggering Account Balance Query for ${config.shortCode}`);
      return {
        ConversationID: `SIM-BAL-${Math.random().toString(36).slice(2, 9)}`,
        OriginatorConversationID: `SIM-ORG-BAL-${Math.random().toString(36).slice(2, 9)}`,
        ResponseDescription: "Accept the service request successfully."
      };
    }

    const accessToken = await this.getAccessToken(config);

    let securityCredential = config.securityCredential;
    if ((!securityCredential || securityCredential === "PLACEHOLDER") && config.initiatorPassword) {
      securityCredential = generateSecurityCredential(config.initiatorPassword, config.certificatePem, config.baseUrl);
    }

    const payload = {
      Initiator: config.initiatorName,
      SecurityCredential: securityCredential,
      CommandID: "AccountBalance",
      PartyA: config.shortCode,
      IdentifierType: "4", // 4 = Shortcode
      Remarks: remarks,
      QueueTimeOutURL: config.queueTimeOutUrl,
      ResultURL: config.callbackUrl,
    };

    try {
      const response = await axios.post(`${config.baseUrl}/mpesa/accountbalance/v1/query`, payload, {
        headers: { Authorization: `Bearer ${accessToken}` },
        timeout: 15000,
      });
      return response.data;
    } catch (error: any) {
      console.error("Daraja Balance Query Error:", error.response?.data || error.message);
      throw new Error("Daraja Balance Query Failed");
    }
  }

  /**
   * Triggers a B2B Payout (Business to Business / Shortcode to Shortcode / Merchant / Paybill)
   */
  static async sendB2bPayout(params: {
    config: DarajaConfig;
    amount: number;
    destinationShortCode: string;
    remarks: string;
    commandId?: "BusinessPayment" | "BusinessBuyGoods" | "DisburseFundsToBusiness";
    senderIdentifierType?: "4"; // 4 = Shortcode
    receiverIdentifierType?: "4" | "2"; // 4 = Shortcode, 2 = Till Number
  }) {
    const {
      config,
      amount,
      destinationShortCode,
      remarks,
      commandId = "BusinessPayment",
      senderIdentifierType = "4",
      receiverIdentifierType = "4",
    } = params;

    if (config.consumerKey.includes("PLACEHOLDER") || !config.consumerKey) {
      console.log(`[Daraja B2B Simulation] Transferring ${amount} KES to ${destinationShortCode}`);
      return {
        ConversationID: `SIM-B2B-${Math.random().toString(36).slice(2, 9)}`,
        OriginatorConversationID: `SIM-ORG-B2B-${Math.random().toString(36).slice(2, 9)}`,
        ResponseDescription: "Accept the service request successfully.",
      };
    }

    const accessToken = await this.getAccessToken(config);

    let securityCredential = config.securityCredential;
    if ((!securityCredential || securityCredential === "PLACEHOLDER") && config.initiatorPassword) {
      securityCredential = generateSecurityCredential(config.initiatorPassword, config.certificatePem, config.baseUrl);
    }

    const payload = {
      Initiator: config.initiatorName,
      SecurityCredential: securityCredential,
      CommandID: commandId,
      SenderIdentifierType: senderIdentifierType,
      RecieverIdentifierType: receiverIdentifierType,
      Amount: Math.floor(amount),
      PartyA: config.shortCode,
      PartyB: destinationShortCode,
      AccountReference: remarks.slice(0, 12),
      Remarks: remarks,
      QueueTimeOutURL: config.queueTimeOutUrl,
      ResultURL: config.callbackUrl,
    };

    try {
      const response = await axios.post(`${config.baseUrl}/mpesa/b2b/v1/paymentrequest`, payload, {
        headers: { Authorization: `Bearer ${accessToken}` },
        timeout: 15000,
      });
      return response.data;
    } catch (error: any) {
      console.error("Daraja B2B Error:", error.response?.data || error.message);
      throw new Error("Daraja B2B Transfer Failed");
    }
  }
}

