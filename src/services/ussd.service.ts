/**
 * Africa's Talking USSD Service
 * Handles stateful USSD sessions for TuZoHub consumers.
 */

import { db } from "../db";
import { consumers, wallets, vouchers, tenantSettings, countries, tenants, towns } from "../db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { LoyaltyService } from "./loyalty.service";
import * as crypto from "crypto";
import { LocationsService } from "./locations.service";
import { v4 as uuidv4 } from "uuid";
import { SmsService } from "./sms.service";
import { WalletRepository } from "../db/repositories/wallet.repo";

export class UssdService {
  /**
   * Process an incoming USSD request.
   * Returns a string that starts with CON (continue) or END (terminate).
   */
  static async processRequest(params: {
    sessionId: string;
    serviceCode: string;
    phoneNumber: string;
    text: string;
    tenantId: string;
  }): Promise<string> {
    const { phoneNumber, text, tenantId } = params;
    const normalizedPhone = this.normalizePhone(phoneNumber);
    const levels = text.split("*").filter(Boolean);

    // 1. Fetch Consumer, Tenant, and Settings
    const [consumer, tenantRecord, tSettingsRecord] = await Promise.all([
      this.findConsumer(normalizedPhone, tenantId),
      db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1).then(r => r[0]),
      db.select().from(tenantSettings).where(eq(tenantSettings.tenantId, tenantId)).limit(1).then(r => r[0])
    ]);

    // ── REGISTRATION FLOW (If not registered) ────────────────────────
    if (!consumer || !consumer.isRegistered) {
      if (text === "") {
        return [
          "CON Welcome to TuZo Rewards!",
          "1. Register Now",
          "0. Exit",
        ].join("\n");
      }

      if (levels[0] === "0") return "END Asante! Karibu tena.";

      if (levels.length === 1) return "CON Enter your First Name:";
      if (levels.length === 2) return "CON Enter your Last Name:";
      if (levels.length === 3) return "CON Enter your National ID Number:";

      const allRegions = await LocationsService.getRegions(tenantId);
      if (levels.length === 4) {
        if (allRegions.length === 0) return "END No regions configured. Please contact support.";
        const menu = allRegions.map((r: any, i: number) => `${i + 1}. ${r.name}`).join("\n");
        return `CON Select your Region:\n${menu}`;
      }

      const selectedRegionIdx = parseInt(levels[4]) - 1;
      const selectedRegion = allRegions[selectedRegionIdx];
      if (!selectedRegion) return "END Invalid region selection.";
      
      const regionTowns = await db.select().from(towns).where(and(eq(towns.regionId, selectedRegion.id), isNull(towns.deletedAt)));
      
      if (levels.length === 5) {
        if (regionTowns.length === 0) return "END No towns in this region. Please try another region.";
        const menu = regionTowns.map((t: any, i: number) => `${i + 1}. ${t.name}`).join("\n");
        return `CON Select your Town:\n${menu}`;
      }

      if (levels.length === 6) {
        const selectedTownIdx = parseInt(levels[5]) - 1;
        if (!regionTowns[selectedTownIdx]) return "END Invalid town selection.";
        return "CON Select Language:\n1. English\n2. Swahili";
      }

      if (levels.length === 7) return "CON Accept Terms & Conditions?\n1. Yes\n2. No\n(Terms at: tuzohub.com/terms)";

      if (levels.length === 8) {
        if (levels[7] !== "1") return "END You must accept the T&Cs to join the program.";

        const firstName = levels[1];
        const lastName = levels[2];
        const idNumber = levels[3];
        const town = regionTowns[parseInt(levels[5]) - 1];
        const language = levels[6] === "2" ? "sw" : "en";

        await db.transaction(async (tx) => {
          let cid = consumer?.id;
          if (consumer) {
            await tx.update(consumers).set({
              firstName, lastName, idNumber, townId: town.id, preferredLanguage: language, isRegistered: true, updatedAt: new Date(),
            }).where(eq(consumers.id, consumer.id));
          } else {
            cid = uuidv4();
            await tx.insert(consumers).values({
              id: cid, tenantId, phoneNumber: normalizedPhone, loyaltyNumber: "TZ" + Math.floor(100000 + Math.random() * 900000),
              firstName, lastName, idNumber, townId: town.id, preferredLanguage: language, isRegistered: true, status: "active",
            });
          }

          const existingWallet = await WalletRepository.findByOwner(tenantId, cid!, "CONSUMER", tx);
          if (!existingWallet) {
            await WalletRepository.create({
              tenantId, ownerId: cid!, ownerType: "CONSUMER", currencyCode: tenantRecord?.baseCurrency || "KES",
            }, tx);
          }
        });

        if (tSettingsRecord?.credentials) {
           const creds = tSettingsRecord.credentials as any;
           if (creds.atApiKey) {
              SmsService.sendSms({
                config: { username: creds.atUsername, apiKey: creds.atApiKey, senderId: creds.atSenderId },
                to: phoneNumber,
                message: `Welcome to TuZo Hub, ${firstName}! Your account is now active. Terms: https://tuzohub.com/terms`
              }).catch(err => console.error("Welcome SMS failed", err));
           }
        }
        return `END Registration successful!\nWelcome ${firstName}, you can now start earning points. Dial again to check balance.`;
      }
      return "END Something went wrong. Please try again.";
    }

    // ── MAIN MENU (For registered users) ───────────────────────────
    if (text === "") {
      return [
        `CON Welcome ${consumer.firstName || "to TuZo"}!`,
        "1. Check Points Balance",
        "2. Claim Voucher Code",
        "3. Redeem Points",
        "0. Exit",
      ].join("\n");
    }

    const topLevel = levels[0];

    // ── BALANCE INQUIRY ────────────────────────────────────────────
    if (topLevel === "1") {
      try {
        const balance = await LoyaltyService.getBalance(tenantId, consumer.id);
        const pts = parseFloat(balance.pointsBalance).toFixed(0);
        return `END TuZo Points\n---\nCurrent: ${pts} PTS\n\nKeep scanning to earn more!`;
      } catch {
        return "END Failed to retrieve balance.";
      }
    }

    // ── CLAIM VOUCHER ──────────────────────────────────────────────
    if (topLevel === "2") {
      if (levels.length === 1) return "CON Enter your voucher code:";
      const enteredCode = levels[1]?.trim();
      if (!enteredCode) return "END Invalid code.";

      try {
        const codeHash = crypto.createHash("sha256").update(enteredCode).digest("hex");
        await LoyaltyService.redeemVoucher({ tenantId, consumerId: consumer.id, voucherCode: codeHash }, db);
        return `END Voucher Claimed!\nPoints added successfully!`;
      } catch (err: any) {
        return `END ${err.message || "Invalid voucher code."}`;
      }
    }

    // ── REDEEM POINTS ──────────────────────────────────────────────
    if (topLevel === "3") {
      if (levels.length === 1) return "CON Redeem Points\n1. M-Pesa (Cash Out)\n0. Back";

      const secondLevel = levels[1];
      if (secondLevel === "1") {
        if (levels.length === 2) return "CON Enter amount to redeem (KES):";
        const amount = parseFloat(levels[2]);
        if (isNaN(amount) || amount <= 0) return "END Invalid amount.";

        try {
          const conversionRate = parseFloat(tenantRecord?.defaultPointValue || "10.0");
          const ptsRequired = (amount * conversionRate).toString(); 
          
          await LoyaltyService.processRedemption({
            tenantId, consumerId: consumer.id, pointsToRedeem: ptsRequired, destinationAccount: normalizedPhone,
            amountValue: amount.toString(), currencyCode: "KES", fulfillmentMode: "AUTOMATED_PAYOUT", description: `USSD M-Pesa Redemption`,
          }, db);
          return `END Request Received!\nProcessing KES ${amount} to ${normalizedPhone}.`;
        } catch (err: any) {
          return `END ${err.message || "Insufficient points."}`;
        }
      }
    }

    if (topLevel === "0") return "END Asante! Goodbye.";
    return "END Invalid option.";
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
