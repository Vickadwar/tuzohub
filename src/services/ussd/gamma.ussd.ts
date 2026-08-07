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
    const { tenantId, normalizedPhone, levels, consumer, tenantRecord, tSettingsRecord } = context;

    // Check if they are in a registration session (stateless level tracking)
    const isRegistrationSession = !consumer || !consumer.isRegistered || levels.length > 2;

    // --- AGGRESSIVE GATEWAY JUNK FILTER ---
    // If Safaricom sends garbage on the first ping (e.g. "85#" or "*617*85#") instead of a clean empty string,
    // we silently delete the junk so the rest of the flow treats it as a brand new session.
    if (levels.length > 0 && !["0", "1", "2"].includes(levels[0])) {
      levels.shift();
    }

    // ── UNREGISTERED USER FLOW (Scenarios A & B) ───────────────────
    if (isRegistrationSession) {
      if (levels.length === 0) {
        const creds = (tSettingsRecord?.credentials || {}) as any;
        const customGreeting = creds.ussdGreeting || "Welcome to Gamma Rangi na Chapaa!";
        return [
          `CON ${customGreeting}`,
          "1. English",
          "2. Kiswahili",
        ].join("\n");
      }

      const langChoice = levels[0];
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
          ? "CON Umesajiliwa kikamilifu! Weka nambari ya Vocha, au bonyeza 0 kuruka kwa sasa:"
          : "CON Registration successful! Enter your Gamma Voucher Number, or press 0 to skip for now:";
      }

      if (levels.length === currentLevelIdx + 2) {
        const enteredCode = levels[currentLevelIdx + 1]?.trim();
        const fullName = levels[1];
        const parts = fullName.trim().split(/\s+/);
        const firstName = parts[0] || "Gamma";
        const lastName = parts.slice(1).join(" ") || "User";
        const lang = isSwahili ? "sw" : "en";

        // Trigger onboarding SMS (Welcome + T&C link)
        // Await the SMS so Vercel serverless doesn't aggressively kill the background task
        await this.sendOnboardingSms({
          tenantId,
          phoneNumber,
          language: lang,
          fullName: `${firstName} ${lastName}`.trim(),
        }).catch(err => console.error("Error sending onboarding SMS", err));

        // If user enters 0 or skip, finish registration cleanly
        if (!enteredCode || enteredCode === "0" || enteredCode.toUpperCase() === "SKIP") {
          return isSwahili
            ? `END Karibu ${firstName}! Usajili wako umekamilika. Utapokea SMS yenye maelezo ya akaunti yako na Vigezo na Masharti.`
            : `END Welcome ${firstName}! Your registration is complete. You will receive an SMS with your account details & Terms & Conditions link shortly.`;
        }

        // Trigger voucher processing
        // Await this to ensure Vercel doesn't kill the lambda
        await this.verifyVoucherAndSendSms({
          tenantId,
          consumerId: consumer?.id || "",
          enteredCode,
          phoneNumber,
          language: lang,
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

    // Check if consumer is locked/suspended
    if (consumer.status === "suspended" || (consumer as any).isRedemptionLocked) {
      return isConsumerSwahili
        ? "END Ilani ya Akaunti: Huduma za kutoa fedha zimefungwa kwenye nambari yako. Tafadhali wasiliana na huduma kwa wateja kwa +254 756 509 898."
        : "END Account Notice: Cashout privileges are currently locked for your mobile number. Please contact customer support (+254 756 509 898).";
    }

    if (levels.length === 0) {
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
          return isConsumerSwahili ? "END Nambari ya vocha inahitajika." : "END Voucher code is required.";
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
          ? "END Asante! Vocha yako inashughulikiwa. Utapokea SMS hivi punde kuthibitisha."
          : "END Thank you! Your voucher is being verified. You will receive an SMS confirmation shortly.";
      }
    }

    if (option === "2") {
      return isConsumerSwahili ? "END Asante kwa kutumia Gamma Rangi na Chapaa!" : "END Thank you for using Gamma Coatings!";
    }

    return isConsumerSwahili ? "END Chaguo lisilo sahihi." : "END Invalid option.";
  }

  /**
   * Sends Welcome & T&C Link SMS upon registration
   */
  private async sendOnboardingSms(params: {
    tenantId: string;
    phoneNumber: string;
    language: string;
    fullName: string;
  }) {
    const { tenantId, phoneNumber, language, fullName } = params;

    const [tSettingsRecord] = await Promise.all([
      db.select().from(tenantSettings).where(eq(tenantSettings.tenantId, tenantId)).limit(1).then(r => r[0]).catch(() => null)
    ]);

    const creds = (tSettingsRecord?.credentials || {}) as any;
    const termsUrl = (tSettingsRecord as any)?.termsUrl || (creds as any)?.termsUrl || "https://tuzohub.vercel.app/terms";

    const smsConfig = {
      provider: creds.smsProvider,
      username: creds.atUsername,
      apiKey: creds.atApiKey,
      senderId: creds.atSenderId || creds.bongaSenderId,
      apiClientID: creds.bongaClientId || creds.bongaApiClientID || creds.apiClientID || creds.oliveClientId,
      key: creds.bongaApiKey || creds.key || creds.oliveApiKey,
      secret: creds.bongaApiSecret || creds.secret || creds.oliveApiSecret,
      serviceID: creds.bongaServiceId || creds.bongaServiceID || creds.serviceID || creds.oliveServiceId || "1",
    };

    const shortcode = (tSettingsRecord as any)?.primaryShortcode || creds?.ussdServiceCode || "*617*85#";
    const isSwahili = language === "sw";
    const welcomeMsg = isSwahili
      ? `Karibu kwenye Gamma Rangi na Chapaa, ${fullName}! Akaunti yako imefunguliwa. Piga ${shortcode} wakati wowote kuweka vocha.`
      : `Welcome to Gamma Rangi na Chapaa, ${fullName}! Your account is active. Dial ${shortcode} anytime to redeem vouchers.`;

    const termsMsg = isSwahili
      ? `Tazama Vigezo na Masharti ya Mpango wa Gamma hapa: ${termsUrl}`
      : `View Gamma Loyalty Program Terms & Conditions here: ${termsUrl}`;

    await SmsService.sendSms({ config: smsConfig, to: phoneNumber, message: `${welcomeMsg}\n\n${termsMsg}` }).catch(err => {
      console.error("Failed to dispatch onboarding SMS", err);
    });
  }

  /**
   * Instant Cashback Verification & Payout Logic
   */
  private async verifyVoucherAndSendSms(params: {
    tenantId: string;
    consumerId: string;
    enteredCode: string;
    phoneNumber: string;
    language: string;
    fullName: string;
  }) {
    const { tenantId, consumerId, enteredCode, phoneNumber, language, fullName } = params;
    const isSwahili = language === "sw";

    // 1. Fetch Tenant Settings for SMS/Daraja config & Terms URL
    const [tenantRecord, tSettingsRecord] = await Promise.all([
      db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1).then(r => r[0]),
      db.select().from(tenantSettings).where(eq(tenantSettings.tenantId, tenantId)).limit(1).then(r => r[0]).catch(() => null)
    ]);

    const creds = (tSettingsRecord?.credentials || {}) as any;
    const termsUrl = (tSettingsRecord as any)?.termsUrl || (creds as any)?.termsUrl || "https://tuzohub.vercel.app/terms";
    const shortcode = (tSettingsRecord as any)?.primaryShortcode || creds?.ussdServiceCode || "*617*85#";
    const autoDisburse = creds.autoDisburse !== false && creds.allowInstantRedemption !== false;

    // Resolve SMS configuration
    const smsConfig = {
      provider: creds.smsProvider,
      username: creds.atUsername,
      apiKey: creds.atApiKey,
      senderId: creds.atSenderId || creds.bongaSenderId,
      apiClientID: creds.bongaClientId || creds.bongaApiClientID || creds.apiClientID || creds.oliveClientId,
      key: creds.bongaApiKey || creds.key || creds.oliveApiKey,
      secret: creds.bongaApiSecret || creds.secret || creds.oliveApiSecret,
      serviceID: creds.bongaServiceId || creds.bongaServiceID || creds.serviceID || creds.oliveServiceId || "1",
    };

    const codeHash = crypto.createHash("sha256").update(enteredCode).digest("hex");

    try {
      // Query voucher in DB
      const [voucherRow] = await db.select({
        id: vouchers.id,
        serialNumber: vouchers.serialNumber,
        status: vouchers.status,
        batchId: vouchers.batchId,
        tenantId: voucherBatches.tenantId,
        productPoints: products.pointsPerUnit,
        productName: products.name,
        redeemedAt: vouchers.redeemedAt,
      })
      .from(vouchers)
      .innerJoin(voucherBatches, eq(vouchers.batchId, voucherBatches.id))
      .leftJoin(products, eq(voucherBatches.productId, products.id))
      .where(eq(vouchers.secureCodeHash, codeHash))
      .limit(1);

      if (!voucherRow || voucherRow.tenantId !== tenantId) {
        // INVALID VOUCHER
        const msg = isSwahili
          ? `Pole, vocha nambari ${enteredCode} haipo au sio sahihi. Tafadhali hakiki na upige ${shortcode} kujaribu tena.`
          : `Pole, the voucher code ${enteredCode} is invalid or not found. Please check the number and dial ${shortcode} to try again.`;
        await SmsService.sendSms({ config: smsConfig, to: phoneNumber, message: msg });
        return;
      }

      const vStatus = voucherRow.status as string;

      if (vStatus === "REDEEMED") {
        // ALREADY REDEEMED
        const dateStr = voucherRow.redeemedAt ? new Date(voucherRow.redeemedAt).toLocaleDateString() : "";
        const msg = isSwahili
          ? `Pole, vocha nambari ${enteredCode} tayari ilishatumiwa${dateStr ? ` tarehe ${dateStr}` : ""}. Tafadhali tumia vocha nyingine halali ya Gamma.`
          : `Pole, the voucher code ${enteredCode} has already been used${dateStr ? ` on ${dateStr}` : ""}. Please try another valid Gamma voucher.`;
        await SmsService.sendSms({ config: smsConfig, to: phoneNumber, message: msg });
        return;
      }

      if (vStatus === "PENDING") {
        // ALREADY PENDING IN QUEUE
        const msg = isSwahili
          ? `Hujambo ${fullName}, vocha yako ${enteredCode} tayari ipo kwenye foleni ya kushughulikiwa. Utapokea malipo yako hivi punde.`
          : `Dear ${fullName}, your voucher code ${enteredCode} is already in queue pending processing. Your wallet will be topped up shortly once confirmed.`;
        await SmsService.sendSms({ config: smsConfig, to: phoneNumber, message: msg });
        return;
      }

      if (vStatus !== "ACTIVE") {
        const msg = isSwahili
          ? `Pole, vocha nambari ${enteredCode} haijawashwa. Hali: ${vStatus}.`
          : `Pole, the voucher code ${enteredCode} is not active. Status: ${vStatus}.`;
        await SmsService.sendSms({ config: smsConfig, to: phoneNumber, message: msg });
        return;
      }

      // Calculate Cash Amount directly from points / rate
      const points = voucherRow.productPoints || 50;
      const conversionRate = parseFloat(tenantRecord?.defaultPointValue || "1.0");
      const cashAmount = (points * conversionRate).toString();

      // If autoDisburse is disabled or system is queued
      if (!autoDisburse) {
        await db.update(vouchers)
          .set({ status: "PENDING" as any })
          .where(eq(vouchers.id, voucherRow.id));

        const msg = isSwahili
          ? `Hujambo ${fullName}, vocha yako ${enteredCode} imepokewa na ipo kwenye foleni ya kushughulikiwa. Malipo yako yatatumwa hivi punde. Vigezo: ${termsUrl}`
          : `Dear ${fullName}, your voucher ${enteredCode} has been received and queued for processing. Your wallet will be topped up shortly. T&Cs: ${termsUrl}`;
        await SmsService.sendSms({ config: smsConfig, to: phoneNumber, message: msg });
        return;
      }

      // Execute Instant M-Pesa B2C Cashout Payout
      try {
        await db.update(vouchers)
          .set({ 
            status: "REDEEMED" as any,
            redeemedAt: new Date(),
            redeemedBy: consumerId || null,
          })
          .where(eq(vouchers.id, voucherRow.id));

        const { queueItem } = await LoyaltyService.processRedemption({
          tenantId,
          consumerId: consumerId || "",
          pointsToRedeem: "0", // Instant cashback does NOT consume points balance
          destinationAccount: phoneNumber,
          amountValue: cashAmount,
          currencyCode: "KES",
          fulfillmentMode: "AUTOMATED_PAYOUT",
          description: `Direct instant cashback payout for Gamma voucher ${enteredCode}`,
        }, db);

        await LoyaltyService.approveRedemption(queueItem.id, tenantId, null as any);

        // Send Success SMS
        const msg = isSwahili
          ? `Hongera ${fullName}! Vocha ${enteredCode} ni halali. Ksh ${cashAmount} imetumwa kwa M-Pesa yako. Asante kwa kuchagua Gamma Coatings. Vigezo: ${termsUrl}`
          : `Hongera ${fullName}! Voucher code ${enteredCode} is valid. Ksh ${cashAmount} has been sent to your mobile wallet. Thank you for choosing Gamma Coatings. T&Cs: ${termsUrl}`;
        await SmsService.sendSms({ config: smsConfig, to: phoneNumber, message: msg });

      } catch (payoutErr: any) {
        console.error("Instant payout execution queued", payoutErr);
        // Mark as PENDING in queue if payout gateway delays
        await db.update(vouchers).set({ status: "PENDING" as any }).where(eq(vouchers.id, voucherRow.id)).catch(() => null);

        const msg = isSwahili
          ? `Hujambo ${fullName}, vocha yako ${enteredCode} imepokewa na ipo kwenye foleni. Pesa zitatumwa kwa M-Pesa yako hivi punde.`
          : `Dear ${fullName}, your voucher ${enteredCode} has been received and queued. Your wallet will be topped up shortly once confirmed.`;
        await SmsService.sendSms({ config: smsConfig, to: phoneNumber, message: msg });
      }

    } catch (err: any) {
      console.error("Error processing voucher background verification", err);
      const msg = isSwahili
        ? `Hujambo ${fullName}, imetokea hitilafu wakati wa kuhakiki vocha yako ${enteredCode}. Tafadhali jaribu tena baadaye.`
        : `Dear ${fullName}, an error occurred while verifying your voucher ${enteredCode}. Please try again later.`;
      await SmsService.sendSms({ config: smsConfig, to: phoneNumber, message: msg }).catch(e => console.error("Error sending error SMS", e));
    }
  }
}
