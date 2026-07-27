import axios from "axios";

export interface AtSmsConfig {
  username: string;
  apiKey: string;
  senderId?: string; // Optional senderId or shortCode
}

export class SmsService {
  /**
   * Sends an SMS via Africa's Talking or BongaSMS (Olive) API
   */
  static async sendSms(params: {
    config: {
      provider?: string;
      // Africa's Talking
      username?: string;
      apiKey?: string;
      senderId?: string;
      // BongaSMS (Olive)
      apiClientID?: string;
      key?: string;
      secret?: string;
      serviceID?: string;
    };
    to: string; // Phone number
    message: string;
  }) {
    const { config, to, message } = params;
    
    // Determine provider: default to BongaSMS if bonga credentials are present, otherwise default to Africa's Talking
    const provider = config.provider || (config.apiClientID ? "bongasms" : "africastalking");

    if (provider === "bongasms" || provider === "olive") {
      // Simulation check
      if (!config.key || config.key.includes("PLACEHOLDER") || config.key.includes("SAMPLE")) {
        console.log(`[BongaSMS Simulation] To: ${to}, Message: ${message}`);
        return { success: true, simulated: true };
      }

      const url = "https://app.bongasms.co.ke/api/send-bulk-sms";
      
      // BongaSMS expects phone numbers in international format (e.g. 254712345678)
      let formattedPhone = to.replace(/\s/g, "");
      if (formattedPhone.startsWith("+")) {
        formattedPhone = formattedPhone.slice(1);
      } else if (formattedPhone.startsWith("0")) {
        formattedPhone = "254" + formattedPhone.slice(1);
      }

      const body = new URLSearchParams();
      body.append("apiClientID", config.apiClientID || "");
      body.append("key", config.key || "");
      body.append("secret", config.secret || "");
      body.append("txtMessage", message);
      body.append("MSISDN", formattedPhone);
      body.append("serviceID", config.serviceID || "1");

      try {
        const response = await axios.post(url, body, {
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
          }
        });
        console.log("[BongaSMS Success]", response.data);
        return response.data;
      } catch (error: any) {
        console.error("BongaSMS Error:", error.response?.data || error.message);
        throw new Error("Failed to send SMS via BongaSMS");
      }
    } else {
      // Africa's Talking
      if (!config.apiKey || config.apiKey.includes("PLACEHOLDER")) {
        console.log(`[AT SMS Simulation] To: ${to}, Message: ${message}`);
        return { success: true, simulated: true };
      }

      // Ensure international format starting with +
      let formattedPhone = to.replace(/\s/g, "");
      if (formattedPhone.startsWith("0")) {
        formattedPhone = "+254" + formattedPhone.slice(1);
      } else if (formattedPhone.startsWith("254")) {
        formattedPhone = "+" + formattedPhone;
      } else if (!formattedPhone.startsWith("+")) {
        formattedPhone = "+254" + formattedPhone;
      }

      const url = "https://api.africastalking.com/version1/messaging";
      
      const body = new URLSearchParams();
      body.append("username", config.username || "sandbox");
      body.append("to", formattedPhone);
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
}
