import axios from "axios";

export interface JengaConfig {
  apiKey: string;
  merchantCode: string;
  consumerSecret?: string;
  accountNumber: string;
  baseUrl?: string; // https://uat.finserve.africa or https://api.jengaapi.io
  environment?: "sandbox" | "production";
}

export class JengaService {
  /**
   * Resolves Jenga API Base URL based on environment or custom config
   */
  private static getBaseUrl(config: JengaConfig): string {
    if (config.baseUrl) return config.baseUrl;
    return config.environment === "production"
      ? "https://api.jengaapi.io"
      : "https://uat.finserve.africa";
  }

  /**
   * Generates Jenga OAuth Bearer Token
   */
  private static async getAccessToken(config: JengaConfig): Promise<string> {
    const baseUrl = this.getBaseUrl(config);

    // Simulation check: If credentials look like placeholders, simulate bearer token
    if (!config.apiKey || config.apiKey.includes("PLACEHOLDER") || config.apiKey.includes("SAMPLE")) {
      return "SIMULATED_JENGA_TOKEN_" + Math.random().toString(36).slice(2, 9);
    }

    try {
      const response = await axios.post(
        `${baseUrl}/authentication/api/v3/authenticate`,
        {
          merchantCode: config.merchantCode,
          consumerSecret: config.consumerSecret || config.apiKey,
        },
        {
          headers: {
            "Api-Key": config.apiKey,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );
      return response.data.accessToken || response.data.token || response.data.access_token;
    } catch (error: any) {
      console.error("Jenga Auth Error:", error.response?.data || error.message);
      throw new Error("Failed to authenticate with Jenga API");
    }
  }

  /**
   * Executes a Mobile Money Payout (B2C / M-Pesa / Equitel / Airtel Money) via Jenga HQ API
   */
  static async sendMobilePayout(params: {
    config: JengaConfig;
    amount: number;
    currency?: string;
    phoneNumber: string;
    remarks: string;
    reference?: string;
  }) {
    const { config, amount, currency = "KES", phoneNumber, remarks, reference } = params;
    const baseUrl = this.getBaseUrl(config);
    const ref = reference || `JENGA-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Simulation check
    if (!config.apiKey || config.apiKey.includes("PLACEHOLDER") || config.apiKey.includes("SAMPLE")) {
      console.log(`[Jenga Simulation] Sending ${amount} ${currency} to ${phoneNumber}`);
      return {
        status: "SUCCESS",
        transactionId: ref,
        referenceNumber: ref,
        responseDescription: "Service request accepted successfully (Simulated).",
      };
    }

    const token = await this.getAccessToken(config);

    // Standardize phone number to international format without leading +
    let formattedPhone = phoneNumber.replace(/\s/g, "");
    if (formattedPhone.startsWith("+")) formattedPhone = formattedPhone.slice(1);
    if (formattedPhone.startsWith("0")) formattedPhone = "254" + formattedPhone.slice(1);

    const payload = {
      source: {
        countryCode: "KE",
        name: "TuZo Rewards",
        accountNumber: config.accountNumber,
      },
      destination: {
        type: "MOBILE",
        countryCode: "KE",
        name: "Recipient",
        mobileNumber: formattedPhone,
        walletName: "MPESA",
      },
      transfer: {
        type: "MobilePayout",
        amount: amount.toString(),
        currency,
        reference: ref,
        date: new Date().toISOString().split("T")[0],
        description: remarks,
      },
    };

    try {
      const response = await axios.post(`${baseUrl}/sendmoney/v3/mobile`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      });
      return response.data;
    } catch (error: any) {
      console.error("Jenga Mobile Payout Error:", error.response?.data || error.message);
      throw new Error("Jenga Mobile Payout Failed");
    }
  }

  /**
   * Executes a Bank Payout (B2B / EFT / RTGS / Equity Bank Account) via Jenga API
   */
  static async sendBankPayout(params: {
    config: JengaConfig;
    amount: number;
    currency?: string;
    bankCode: string;
    accountNumber: string;
    recipientName: string;
    remarks: string;
    reference?: string;
  }) {
    const { config, amount, currency = "KES", bankCode, accountNumber, recipientName, remarks, reference } = params;
    const baseUrl = this.getBaseUrl(config);
    const ref = reference || `JENGA-BANK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    if (!config.apiKey || config.apiKey.includes("PLACEHOLDER")) {
      console.log(`[Jenga Bank Simulation] Sending ${amount} ${currency} to ${bankCode}:${accountNumber}`);
      return {
        status: "SUCCESS",
        transactionId: ref,
        referenceNumber: ref,
        responseDescription: "Bank transfer accepted successfully (Simulated).",
      };
    }

    const token = await this.getAccessToken(config);

    const payload = {
      source: {
        countryCode: "KE",
        name: "TuZo Rewards",
        accountNumber: config.accountNumber,
      },
      destination: {
        type: "BANK",
        countryCode: "KE",
        name: recipientName,
        bankCode,
        accountNumber,
      },
      transfer: {
        type: "BankTransfer",
        amount: amount.toString(),
        currency,
        reference: ref,
        date: new Date().toISOString().split("T")[0],
        description: remarks,
      },
    };

    try {
      const response = await axios.post(`${baseUrl}/sendmoney/v3/bank`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      });
      return response.data;
    } catch (error: any) {
      console.error("Jenga Bank Payout Error:", error.response?.data || error.message);
      throw new Error("Jenga Bank Transfer Failed");
    }
  }
}
