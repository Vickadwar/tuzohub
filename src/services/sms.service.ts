import axios from "axios";

export interface AtSmsConfig {
  username: string;
  apiKey: string;
  senderId?: string; // Optional senderId or shortCode
}

export class SmsService {
  /**
   * Sends an SMS via Africa's Talking API
   */
  static async sendSms(params: {
    config: AtSmsConfig;
    to: string; // Phone number in international format (+254...)
    message: string;
  }) {
    const { config, to, message } = params;

    // Simulation check
    if (!config.apiKey || config.apiKey.includes("PLACEHOLDER")) {
      console.log(`[AT SMS Simulation] To: ${to}, Message: ${message}`);
      return { success: true, simulated: true };
    }

    const url = "https://api.africastalking.com/version1/messaging";
    
    const body = new URLSearchParams();
    body.append("username", config.username);
    body.append("to", to);
    body.append("message", message);
    if (config.senderId) {
      body.append("from", config.senderId);
    }

    try {
      const response = await axios.post(url, body, {
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
          "apiKey": config.apiKey
        }
      });
      
      console.log("[AT SMS Success]", response.data);
      return response.data;
    } catch (error: any) {
      console.error("AT SMS Error:", error.response?.data || error.message);
      throw new Error("Failed to send SMS via Africa's Talking");
    }
  }
}
