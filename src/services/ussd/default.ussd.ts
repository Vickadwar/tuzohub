import { db } from "../../db";
import { consumers, towns } from "../../db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { LoyaltyService } from "../loyalty.service";
import * as crypto from "crypto";
import { LocationsService } from "../locations.service";
import { v4 as uuidv4 } from "uuid";
import { SmsService } from "../sms.service";
import { WalletRepository } from "../../db/repositories/wallet.repo";
import { IUssdHandler, UssdRequestParams, UssdRequestContext } from "./ussd.interface";

export class DefaultUssdService implements IUssdHandler {
  async processRequest(params: UssdRequestParams, context: UssdRequestContext): Promise<string> {
    const { text, phoneNumber } = params;
    const { tenantId, normalizedPhone, levels, consumer, tenantRecord, tSettingsRecord } = context;

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

      if (levels.length === 1) {
        return "CON Select Language:\n1. English\n2. Swahili";
      }

      const isSwahili = levels[1] === "2";
      const language = isSwahili ? "sw" : "en";

      if (levels.length === 2) return isSwahili ? "CON Weka Jina lako la Kwanza:" : "CON Enter your First Name:";
      if (levels.length === 3) return isSwahili ? "CON Weka Jina lako la Mwisho:" : "CON Enter your Last Name:";
      if (levels.length === 4) return isSwahili ? "CON Weka Nambari yako ya Kitambulisho (ID):" : "CON Enter your National ID Number:";

      const allRegions = await LocationsService.getRegions(tenantId);
      if (levels.length === 5) {
        if (allRegions.length === 0) return isSwahili ? "END Hakuna mikoa iliyosanidiwa." : "END No regions configured. Please contact support.";
        const menu = allRegions.map((r: any, i: number) => `${i + 1}. ${r.name}`).join("\n");
        return isSwahili ? `CON Chagua Mkoa wako:\n${menu}` : `CON Select your Region:\n${menu}`;
      }

      const selectedRegionIdx = parseInt(levels[5]) - 1;
      const selectedRegion = allRegions[selectedRegionIdx];
      if (!selectedRegion) return isSwahili ? "END Mkoa sio sahihi." : "END Invalid region selection.";
      
      const regionTowns = await db.select().from(towns).where(and(eq(towns.regionId, selectedRegion.id), isNull(towns.deletedAt)));
      
      if (levels.length === 6) {
        if (regionTowns.length === 0) return isSwahili ? "END Hakuna miji katika mkoa huu." : "END No towns in this region. Please try another region.";
        const page1Towns = regionTowns.slice(0, 5);
        const menu = page1Towns.map((t: any, i: number) => `${i + 1}. ${t.name}`).join("\n");
        const moreOption = regionTowns.length > 5 ? "\n8. Next Page" : "";
        return isSwahili ? `CON Chagua Mji wako:\n${menu}${moreOption}\n9. Other` : `CON Select your Town:\n${menu}${moreOption}\n9. Other`;
      }

      let townSelectionLevel = levels[6];
      let pageOffset = 0;
      let termsLevelIdx = 7;

      if (levels[6] === "8") {
        if (levels.length === 7) {
          const page2Towns = regionTowns.slice(5, 10);
          const menu = page2Towns.map((t: any, i: number) => `${i + 1}. ${t.name}`).join("\n");
          return isSwahili ? `CON Chagua Mji wako (Ukurasa 2):\n${menu}\n9. Other` : `CON Select your Town (Page 2):\n${menu}\n9. Other`;
        }
        townSelectionLevel = levels[7];
        pageOffset = 5;
        termsLevelIdx = 8;
      }

      if (levels.length === termsLevelIdx) {
        const selectedTownIdx = (parseInt(townSelectionLevel) || 1) - 1 + pageOffset;
        if (!regionTowns[selectedTownIdx] && townSelectionLevel !== "9") {
          return isSwahili ? "END Mji sio sahihi." : "END Invalid town selection.";
        }
        return isSwahili
          ? "CON Kubali Vigezo na Masharti?\n1. Ndio\n2. Hapana\n(Vigezo: tuzohub.com/terms)"
          : "CON Accept Terms & Conditions?\n1. Yes\n2. No\n(Terms at: tuzohub.com/terms)";
      }

      if (levels.length === termsLevelIdx + 1) {
        if (levels[termsLevelIdx] !== "1") {
          return isSwahili ? "END Lazima ukubali Vigezo ili kujiunga." : "END You must accept the T&Cs to join the program.";
        }

        const firstName = levels[2];
        const lastName = levels[3];
        const idNumber = levels[4];
        const town = regionTowns[(parseInt(townSelectionLevel) || 1) - 1 + pageOffset] || regionTowns[0];

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
           if (creds.atApiKey || creds.bongaApiKey || creds.key) {
              SmsService.sendSms({
                config: {
                  provider: creds.smsProvider,
                  username: creds.atUsername,
                  apiKey: creds.atApiKey,
                  senderId: creds.atSenderId,
                  apiClientID: creds.bongaApiClientID || creds.apiClientID || creds.oliveClientId,
                  key: creds.bongaApiKey || creds.key || creds.oliveApiKey,
                  secret: creds.bongaApiSecret || creds.secret || creds.oliveApiSecret,
                  serviceID: creds.bongaServiceID || creds.serviceID || creds.oliveServiceId || "1",
                },
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
}
