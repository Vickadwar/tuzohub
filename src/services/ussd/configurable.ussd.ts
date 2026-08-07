import { db } from "../../db";
import { consumers, towns, vouchers, voucherBatches, products } from "../../db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { LocationsService } from "../locations.service";
import { resolveRewardTerminology } from "../../lib/rewardTerminology";
import { IUssdHandler, UssdRequestParams, UssdRequestContext } from "./ussd.interface";
import { v4 as uuidv4 } from "uuid";
import * as crypto from "crypto";

export class ConfigurableUssdEngine implements IUssdHandler {
  async processRequest(params: UssdRequestParams, context: UssdRequestContext): Promise<string> {
    const { text } = params;
    const { tenantId, normalizedPhone, levels, consumer, tenantRecord, tSettingsRecord } = context;

    const tenantName = tenantRecord?.name || "TuZo Rewards";
    const ussdConfig = (tSettingsRecord?.ussdConfig as any) || {};

    const terminology = resolveRewardTerminology({
      tenantSettings: tSettingsRecord,
    });

    const greeting = ussdConfig.greeting || `Welcome to ${tenantName}!`;

    // ── UNREGISTERED / REGISTRATION FLOW ─────────────────────────────
    if (!consumer || !consumer.isRegistered) {
      if (text === "") {
        return [
          `CON ${greeting}`,
          "1. Register / Jisajili",
          "0. Exit",
        ].join("\n");
      }

      if (levels[0] === "0") return "END Asante! Karibu tena.";

      if (levels.length === 1) {
        return "CON Select Language / Chagua Lugha:\n1. Swahili\n2. English";
      }

      const isSwahili = levels[1] === "1";

      if (levels.length === 2) return isSwahili ? "CON Weka Jina lako la Kwanza:" : "CON Enter your First Name:";
      if (levels.length === 3) return isSwahili ? "CON Weka Jina lako la Mwisho:" : "CON Enter your Last Name:";
      if (levels.length === 4) return isSwahili ? "CON Weka Nambari ya Kitambulisho (ID):" : "CON Enter your National ID Number:";

      const allRegions = await LocationsService.getRegions(tenantId);
      if (levels.length === 5) {
        if (allRegions.length === 0) return isSwahili ? "END Hakuna mikoa iliyosanidiwa." : "END No regions configured.";
        const menu = allRegions.map((r: any, i: number) => `${i + 1}. ${r.name}`).join("\n");
        return isSwahili ? `CON Chagua Mkoa wako:\n${menu}` : `CON Select your Region:\n${menu}`;
      }

      const selectedRegionIdx = parseInt(levels[5]) - 1;
      const selectedRegion = allRegions[selectedRegionIdx];
      if (!selectedRegion) return isSwahili ? "END Mkoa sio sahihi." : "END Invalid region selection.";
      
      const regionTowns = await db.select().from(towns).where(and(eq(towns.regionId, selectedRegion.id), isNull(towns.deletedAt)));
      
      if (levels.length === 6) {
        if (regionTowns.length === 0) return isSwahili ? "END Hakuna miji katika mkoa huu." : "END No towns in this region.";
        const page1Towns = regionTowns.slice(0, 5);
        const menu = page1Towns.map((t: any, i: number) => `${i + 1}. ${t.name}`).join("\n");
        return isSwahili ? `CON Chagua Mji wako:\n${menu}` : `CON Select your Town:\n${menu}`;
      }

      if (levels.length === 7) {
        const firstName = levels[2];
        const lastName = levels[3];
        const idNumber = levels[4];
        const selectedTownIdx = parseInt(levels[6]) - 1;
        const selectedTown = regionTowns[selectedTownIdx] || regionTowns[0];

        try {
          if (!consumer) {
            await db.insert(consumers).values({
              id: uuidv4(),
              tenantId,
              phoneNumber: normalizedPhone,
              loyaltyNumber: "TZ" + Math.floor(100000 + Math.random() * 900000),
              firstName,
              lastName,
              idNumber,
              townId: selectedTown?.id || null,
              isRegistered: true,
              status: "active",
            });
          } else {
            await db.update(consumers).set({
              firstName,
              lastName,
              idNumber,
              townId: selectedTown?.id || null,
              isRegistered: true,
              updatedAt: new Date(),
            }).where(eq(consumers.id, consumer.id));
          }

          return isSwahili 
            ? `END Hongera ${firstName}! Umesajiliwa kikamilifu ${tenantName}. Piga tena kutumia huduma.` 
            : `END Congratulations ${firstName}! Registered successfully with ${tenantName}. Dial again to start.`;
        } catch (err: any) {
          return isSwahili ? "END Hitilafu imetokea. Tafadhali jaribu tena." : "END Registration error. Please try again.";
        }
      }
    }

    // ── MAIN USSD MENU (REGISTERED CONSUMER) ──────────────────────────
    if (text === "") {
      return [
        `CON ${greeting}`,
        `1. Enter Scratch Code / Weka Code`,
        `2. Check ${terminology.balanceHeader}`,
        `3. Withdraw Rewards / Payout`,
        "0. Exit",
      ].join("\n");
    }

    if (levels[0] === "0") return "END Asante kwa kutumia huduma zetu.";

    // Option 1: Code Scanning / Redemption Verification
    if (levels[0] === "1") {
      if (levels.length === 1) {
        return "CON Weka Nambari ya Scratch Code (Enter Code):";
      }

      const scratchCode = levels[1].trim();
      const codeHash = crypto.createHash("sha256").update(scratchCode).digest("hex");

      try {
        const [voucherRow] = await db.select({
          id: vouchers.id,
          status: vouchers.status,
          tenantId: voucherBatches.tenantId,
          productPoints: products.pointsPerUnit,
        })
        .from(vouchers)
        .innerJoin(voucherBatches, eq(vouchers.batchId, voucherBatches.id))
        .leftJoin(products, eq(voucherBatches.productId, products.id))
        .where(eq(vouchers.secureCodeHash, codeHash))
        .limit(1);

        if (!voucherRow || voucherRow.tenantId !== tenantId) {
          return `END Code ${scratchCode} haikupatikana au sio sahihi. Jaribu tena.`;
        }

        if (voucherRow.status === "REDEEMED") {
          return `END Code ${scratchCode} ishatumika (Already redeemed).`;
        }

        return `END Hongera! Code ${scratchCode} imekubaliwa. Utapokea ujumbe mfupi wa kuthibitisha zawadi yako.`;
      } catch (err: any) {
        return `END Hitilafu: ${err.message || "Imefeli kuangalia code"}`;
      }
    }

    // Option 2: Check Balance
    if (levels[0] === "2") {
      const activeBalance = consumer.pointsBalance || "0";
      return `END Habari ${consumer.firstName || "Mteja"}! ${terminology.balanceHeader}: ${activeBalance} ${terminology.unitLabel}.`;
    }

    // Option 3: Withdraw / Request Payout
    if (levels[0] === "3") {
      const activeBalance = Number(consumer.pointsBalance || 0);
      if (activeBalance <= 0) {
        return `END Huna salio la kutosha kutoa. Salio yako ni: ${activeBalance} ${terminology.unitLabel}.`;
      }

      return `END Umefanikiwa kuomba kutoa ${activeBalance} ${terminology.unitLabel}. Utapokea ujumbe wa M-Pesa hivi karibuni.`;
    }

    return "END Chaguo sio sahihi. Jaribu tena.";
  }
}
