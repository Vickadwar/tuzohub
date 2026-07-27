import { db } from "../../db";
import { consumers, vouchers, tenants, tenantSettings, towns, regions, voucherBatches, products } from "../../db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { LoyaltyService } from "../loyalty.service";
import * as crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import { SmsService } from "../sms.service";
import { WalletRepository } from "../../db/repositories/wallet.repo";
import { IUssdHandler, UssdRequestParams, UssdRequestContext } from "./ussd.interface";

export class GammaUssdService implements IUssdHandler {
  async processRequest(params: UssdRequestParams, context: UssdRequestContext): Promise<string> {
    const { text, phoneNumber } = params;
    const { tenantId, normalizedPhone, levels, consumer, tenantRecord } = context;

    // Check if they are in a registration session (stateless level tracking)
    const isRegistrationSession = !consumer || !consumer.isRegistered || levels.length > 2;

    // ── UNREGISTERED USER FLOW (Scenarios A & B) ───────────────────
    if (isRegistrationSession) {
      if (text === "") {
        return [
          "CON Welcome to Gamma Rangi na Chapaa!",
          "1. English",
          "2. Kiswahili",
        ].join("\n");
      }

      const langChoice = levels[0];
      if (langChoice !== "1" && langChoice !== "2") {
        return "END Invalid choice. Select 1 or 2.";
      }
      const isSwahili = langChoice === "2";

      if (levels.length === 1) {
        return isSwahili ? "CON Tafadhali weka Majina yako Kamili:" : "CON Please enter your Full Name:";
      }

      if (levels.length === 2) {
        return isSwahili ? "CON Weka nambari yako ya Kitambulisho (ID):" : "CON Enter your National ID Number:";
      }

      // Region selection (Dynamically configured per tenant in admin dashboard)
      const allRegions = await db.select().from(regions).where(and(eq(regions.tenantId, tenantId), isNull(regions.deletedAt)));
      
      if (allRegions.length === 0) {
        return isSwahili 
          ? "END Hakuna mikoa iliyosanidiwa kwa mpango huu. Tafadhali wasiliana na huduma kwa wateja." 
          : "END No regions configured for this loyalty program. Please contact support.";
      }

      if (levels.length === 3) {
        const menu = allRegions.map((r, i) => `${i + 1}. ${r.name}`).join("\n");
        return isSwahili ? `CON Chagua Mkoa wako:\n${menu}` : `CON Select your Region:\n${menu}`;
      }

      const regionIdx = parseInt(levels[3]) - 1;
      const selectedRegion = allRegions[regionIdx];
      if (!selectedRegion) {
        return isSwahili ? "END Mkoa usio sahihi." : "END Invalid region selection.";
      }

      const regionTowns = await db.select().from(towns).where(and(eq(towns.regionId, selectedRegion.id), isNull(towns.deletedAt)));

      if (levels.length === 4) {
        const page1Towns = regionTowns.slice(0, 5);
        const menu = page1Towns.length > 0 
          ? page1Towns.map((t, i) => `${i + 1}. ${t.name}`).join("\n") 
          : (isSwahili ? "1. Mwingine" : "1. Other");
        const moreOption = regionTowns.length > 5 ? (isSwahili ? "\n8. Ukurasa Ufuatao" : "\n8. Next Page") : "";
        const otherOption = isSwahili ? "\n9. Mwingine (Other)" : "\n9. Other";
        return isSwahili ? `CON Chagua Mji wako:\n${menu}${moreOption}${otherOption}` : `CON Select your Town:\n${menu}${moreOption}${otherOption}`;
      }

      let townSelectionLevel = levels[4];
      let pageOffset = 0;
      let currentLevelIdx = 5;

      if (levels[4] === "8") {
        if (levels.length === 5) {
          const page2Towns = regionTowns.slice(5, 10);
          const menu = page2Towns.map((t, i) => `${i + 1}. ${t.name}`).join("\n");
          const otherOption = isSwahili ? "\n9. Mwingine (Other)" : "\n9. Other";
          return isSwahili ? `CON Chagua Mji wako (Ukurasa 2):\n${menu}${otherOption}` : `CON Select your Town (Page 2):\n${menu}${otherOption}`;
        }
        townSelectionLevel = levels[5];
        pageOffset = 5;
        currentLevelIdx = 6;
      }

      if (levels.length === currentLevelIdx) {
        return isSwahili 
          ? "CON Je, unakubali Vigezo na Masharti ya Gamma Rangi na Chapaa? (Utatumiwa ujumbe mfupi)\n1. Ndio (Accept)\n2. Hapana (Reject)"
          : "CON Do you accept the Terms & Conditions of the Gamma Loyalty Program? (T&Cs link will be sent via SMS)\n1. Accept\n2. Reject";
      }

      if (levels.length === currentLevelIdx + 1) {
        if (levels[currentLevelIdx - 1] !== "1") {
          return isSwahili ? "END Lazima ukubali Vigezo na Masharti ili kusajiliwa." : "END You must accept the Terms & Conditions to register.";
        }

        const fullName = levels[1];
        const idNumber = levels[2];
        const townIdx = (parseInt(townSelectionLevel) || 1) - 1 + pageOffset;
        const selectedTown = regionTowns[townIdx] || regionTowns[0];

        const parts = fullName.trim().split(/\s+/);
        const firstName = parts[0] || "Gamma";
        const lastName = parts.slice(1).join(" ") || "User";
        const language = isSwahili ? "sw" : "en";

        let newConsumerId = consumer?.id;

        await db.transaction(async (tx) => {
          if (consumer) {
            await tx.update(consumers).set({
              firstName,
              lastName,
              idNumber,
              townId: selectedTown?.id || null,
              preferredLanguage: language,
              isRegistered: true,
              updatedAt: new Date(),
            }).where(eq(consumers.id, consumer.id));
          } else {
            newConsumerId = uuidv4();
            await tx.insert(consumers).values({
              id: newConsumerId,
              tenantId,
              phoneNumber: normalizedPhone,
              loyaltyNumber: "GM" + Math.floor(100000 + Math.random() * 900000),
              firstName,
              lastName,
              idNumber,
              townId: selectedTown?.id || null,
              preferredLanguage: language,
              isRegistered: true,
              status: "active",
            });
          }

          const existingWallet = await WalletRepository.findByOwner(tenantId, newConsumerId!, "CONSUMER", tx);
          if (!existingWallet) {
            await WalletRepository.create({
              tenantId,
              ownerId: newConsumerId!,
              ownerType: "CONSUMER",
              currencyCode: tenantRecord?.baseCurrency || "KES",
            }, tx);
          }
        });

        return isSwahili
          ? "CON Umesajiliwa kikamilifu! Weka nambari ya Vocha:"
          : "CON Registration successful! Enter your Gamma Voucher Number:";
      }

      if (levels.length === currentLevelIdx + 2) {
        const enteredCode = levels[currentLevelIdx + 1]?.trim();
        if (!enteredCode) {
          return isSwahili ? "END Vocha sio sahihi." : "END Invalid voucher number.";
        }

        const fullName = levels[1];
        const parts = fullName.trim().split(/\s+/);
        const firstName = parts[0] || "Gamma";
        const lastName = parts.slice(1).join(" ") || "User";

        // Trigger background verification & SMS
        this.verifyVoucherAndSendSms({
          tenantId,
          consumerId: consumer?.id || "",
          enteredCode,
          phoneNumber,
          language: isSwahili ? "sw" : "en",
          fullName: `${firstName} ${lastName}`.trim(),
        }).catch(err => console.error("Error in background voucher processing", err));

        return isSwahili
          ? "END Asante! Vocha yako inashughulikiwa. Utapokea SMS hivi punde kuthibitisha malipo yako."
          : "END Thank you! Your voucher is being verified. You will receive an SMS with your top-up status shortly.";
      }

      return isSwahili ? "END Chaguo lisilo sahihi." : "END Invalid option.";
    }

    // ── REGISTERED USER FLOW (Scenario C) ──────────────────────────
    const consumerLang = consumer.preferredLanguage || "en";
    const isConsumerSwahili = consumerLang === "sw";

    if (text === "") {
      return isConsumerSwahili
        ? [
            `CON Karibu tena, ${consumer.firstName || "mteja"}!`,
            "1. Weka Vocha (Redeem)",
            "2. Ondoka (Exit)",
          ].join("\n")
        : [
            `CON Welcome back to Gamma, ${consumer.firstName || "Customer"}!`,
            "1. Redeem Voucher",
            "2. Exit",
          ].join("\n");
    }

    const option = levels[0];

    if (option === "1") {
      if (levels.length === 1) {
        return isConsumerSwahili
          ? "CON Weka nambari ya Vocha:"
          : "CON Enter your Gamma Voucher Number:";
      }

      if (levels.length === 2) {
        const enteredCode = levels[1]?.trim();
        if (!enteredCode) {
          return isConsumerSwahili ? "END Vocha sio sahihi." : "END Invalid voucher number.";
        }

        // Trigger background verification & SMS
        this.verifyVoucherAndSendSms({
          tenantId,
          consumerId: consumer.id,
          enteredCode,
          phoneNumber,
          language: consumerLang,
          fullName: `${consumer.firstName} ${consumer.lastName}`.trim(),
        }).catch(err => console.error("Error in background returning voucher processing", err));

        return isConsumerSwahili
          ? "END Asante, vocha inashughulikiwa."
          : "END Thank you! Your voucher is being verified. You will receive an SMS confirmation shortly.";
      }
    }

    if (option === "2") {
      return isConsumerSwahili ? "END Ondoka!" : "END Goodbye!";
    }

    return isConsumerSwahili ? "END Chaguo lisilo sahihi." : "END Invalid option.";
  }

  private async verifyVoucherAndSendSms(params: {
    tenantId: string;
    consumerId: string;
    enteredCode: string;
    phoneNumber: string;
    language: string;
    fullName: string;
  }) {
    const { tenantId, consumerId, enteredCode, phoneNumber, fullName } = params;

    // 1. Fetch Tenant Settings for SMS/Daraja config
    const [tenantRecord, tSettingsRecord] = await Promise.all([
      db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1).then(r => r[0]),
      db.select().from(tenantSettings).where(eq(tenantSettings.tenantId, tenantId)).limit(1).then(r => r[0]).catch(() => null)
    ]);

    const creds = (tSettingsRecord?.credentials || {}) as any;
    
    // Resolve SMS configuration
    const smsConfig = {
      provider: creds.smsProvider,
      username: creds.atUsername,
      apiKey: creds.atApiKey,
      senderId: creds.atSenderId,
      apiClientID: creds.bongaApiClientID || creds.apiClientID || creds.oliveClientId,
      key: creds.bongaApiKey || creds.key || creds.oliveApiKey,
      secret: creds.bongaApiSecret || creds.secret || creds.oliveApiSecret,
      serviceID: creds.bongaServiceID || creds.serviceID || creds.oliveServiceId || "1",
    };

    const codeHash = crypto.createHash("sha256").update(enteredCode).digest("hex");

    try {
      // Query voucher
      const [voucherRow] = await db.select({
        id: vouchers.id,
        serialNumber: vouchers.serialNumber,
        status: vouchers.status,
        batchId: vouchers.batchId,
        tenantId: voucherBatches.tenantId,
        productPoints: products.pointsPerUnit,
        productName: products.name,
      })
      .from(vouchers)
      .innerJoin(voucherBatches, eq(vouchers.batchId, voucherBatches.id))
      .leftJoin(products, eq(voucherBatches.productId, products.id))
      .where(eq(vouchers.secureCodeHash, codeHash))
      .limit(1);

      if (!voucherRow) {
        // Invalid voucher
        const msg = `Pole, the voucher code ${enteredCode} is invalid or not found. Please check the number and dial *453*34# to try again.`;
        await SmsService.sendSms({ config: smsConfig, to: phoneNumber, message: msg });
        return;
      }

      if (voucherRow.tenantId !== tenantId) {
        const msg = `Pole, the voucher code ${enteredCode} is invalid for this program.`;
        await SmsService.sendSms({ config: smsConfig, to: phoneNumber, message: msg });
        return;
      }

      if (voucherRow.status === "REDEEMED") {
        // Voucher already used
        const msg = `Pole, the voucher code ${enteredCode} has already been used. Please try another valid Gamma voucher.`;
        await SmsService.sendSms({ config: smsConfig, to: phoneNumber, message: msg });
        return;
      }

      if (voucherRow.status !== "ACTIVE") {
        const msg = `Pole, the voucher code ${enteredCode} is not active. Status: ${voucherRow.status}.`;
        await SmsService.sendSms({ config: smsConfig, to: phoneNumber, message: msg });
        return;
      }

      // Mark voucher as redeemed and credit points in a transaction
      const points = voucherRow.productPoints || 50; // default 50 points if not specified
      const conversionRate = parseFloat(tenantRecord?.defaultPointValue || "1.0");
      const amountValue = (points * conversionRate).toString();

      let finalPoints = points;
      
      await db.transaction(async (tx) => {
        // Update voucher
        await tx.update(vouchers)
          .set({ 
            status: "REDEEMED",
            redeemedAt: new Date(),
            redeemedBy: consumerId
          })
          .where(eq(vouchers.id, voucherRow.id));

        // Credit points
        await LoyaltyService.processEarning({
          tenantId,
          consumerId,
          points: finalPoints.toString(),
          actionCategory: "VOUCHER_REDEMPTION",
          description: `Redeemed Gamma voucher ${enteredCode} (Product: ${voucherRow.productName || "Paint"})`,
        }, tx);
      });

      // Now attempt Cashout / M-Pesa payout
      try {
        // Process redemption
        const { queueItem } = await LoyaltyService.processRedemption({
          tenantId,
          consumerId,
          pointsToRedeem: finalPoints.toString(),
          destinationAccount: phoneNumber,
          amountValue,
          currencyCode: "KES",
          fulfillmentMode: "AUTOMATED_PAYOUT",
          description: `Auto-cashout for Gamma voucher ${enteredCode}`,
        }, db);

        // Try to approve/send the payout immediately (automated — no human approver)
        await LoyaltyService.approveRedemption(queueItem.id, tenantId, null as any);

        // If successful, send success SMS
        const msg = `Hongera! Voucher code ${enteredCode} is valid. Ksh ${amountValue} has been sent to your mobile wallet. Thank you for choosing Gamma Coatings. T&Cs apply: https://tuzohub.com/terms`;
        await SmsService.sendSms({ config: smsConfig, to: phoneNumber, message: msg });

      } catch (payoutErr: any) {
        console.error("Payout failed, sending pending SMS", payoutErr);
        // Payout failed/delayed, send pending SMS
        const msg = `Dear ${fullName}, your voucher ${enteredCode} has been received and is pending processing. Your wallet will be topped up shortly once confirmed.`;
        await SmsService.sendSms({ config: smsConfig, to: phoneNumber, message: msg });
      }

    } catch (err: any) {
      console.error("Error processing voucher background verification", err);
      const msg = `Dear ${fullName}, an error occurred while verifying your voucher ${enteredCode}. Please try again later.`;
      await SmsService.sendSms({ config: smsConfig, to: phoneNumber, message: msg }).catch(e => console.error("Error sending error SMS", e));
    }
  }
}
