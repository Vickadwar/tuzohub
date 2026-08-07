export interface RewardTerminology {
  rewardMode: "POINTS" | "INSTANT_CASHBACK" | "INSTANT_AIRTIME" | "HYBRID";
  unitLabel: string;
  balanceHeader: string;
  earnedHeader: string;
  redeemedHeader: string;
  actionEarnLabel: string;
  actionRedeemLabel: string;
  badgeColor: "brand" | "emerald" | "purple" | "warning";
}

/**
 * Resolves dynamic reward terminology based on campaign-level overrides or tenant-level defaults.
 * Hierarchy:
 * 1. Specific Campaign/Activity Override (metadata.rewardMode or campaignType)
 * 2. Tenant Settings Default (tenant.settings.defaultRewardMode)
 * 3. Fallback System Default ("POINTS")
 */
export function resolveRewardTerminology(
  context?: {
    campaignType?: string;
    metadata?: any;
    tenantSettings?: any;
  }
): RewardTerminology {
  const meta = context?.metadata || {};
  const settings = context?.tenantSettings || {};
  const creds = settings.credentials || {};

  // 1. Determine Reward Mode
  let mode: string = 
    meta.rewardMode || 
    context?.campaignType || 
    settings.defaultRewardMode || 
    settings.rewardMode ||
    creds.defaultRewardMode ||
    creds.rewardMode ||
    (settings.ussdHandlerStrategy === "GAMMA_COATINGS" ? "INSTANT_CASHBACK" : "POINTS");

  // Normalize mode string
  mode = mode.toUpperCase();
  if (mode.includes("CASHBACK") || mode.includes("CASH")) mode = "INSTANT_CASHBACK";
  else if (mode.includes("AIRTIME")) mode = "INSTANT_AIRTIME";
  else if (mode.includes("HYBRID")) mode = "HYBRID";
  else mode = "POINTS";

  let defaultUnit = "PTS";
  if (mode === "INSTANT_CASHBACK") defaultUnit = "KES";
  else if (mode === "INSTANT_AIRTIME") defaultUnit = "Airtime";
  else if (mode === "HYBRID") defaultUnit = "PTS / KES";

  const customUnit = settings.rewardUnitLabel || meta.unitLabel;
  // If custom unit is same as another mode's default or standard fallback, use mode's natural unit
  const activeUnit = (customUnit && customUnit !== "PTS" && mode === "INSTANT_CASHBACK") 
    ? customUnit 
    : (customUnit && mode !== "INSTANT_CASHBACK" && mode !== "INSTANT_AIRTIME")
    ? customUnit
    : defaultUnit;

  switch (mode) {
    case "INSTANT_CASHBACK":
      return {
        rewardMode: "INSTANT_CASHBACK",
        unitLabel: (settings.rewardUnitLabel && settings.rewardUnitLabel !== "PTS") ? settings.rewardUnitLabel : "KES",
        balanceHeader: "Total Instant Disbursed",
        earnedHeader: "Instant Cashback Disbursed",
        redeemedHeader: "M-Pesa Disbursed Payouts",
        actionEarnLabel: "Cashback Disbursed",
        actionRedeemLabel: "M-Pesa Payout",
        badgeColor: "emerald",
      };

    case "INSTANT_AIRTIME":
      return {
        rewardMode: "INSTANT_AIRTIME",
        unitLabel: (settings.rewardUnitLabel && settings.rewardUnitLabel !== "PTS") ? settings.rewardUnitLabel : "Airtime",
        balanceHeader: "Total Airtime Credited",
        earnedHeader: "Airtime Disbursed",
        redeemedHeader: "Airtime Recharges",
        actionEarnLabel: "Airtime Credited",
        actionRedeemLabel: "Airtime Recharge",
        badgeColor: "purple",
      };

    case "HYBRID":
      return {
        rewardMode: "HYBRID",
        unitLabel: (settings.rewardUnitLabel && settings.rewardUnitLabel !== "PTS") ? settings.rewardUnitLabel : "PTS / KES",
        balanceHeader: "Points & Cash Rewards",
        earnedHeader: "Combined Rewards Earned",
        redeemedHeader: "Redemptions & Cash Payouts",
        actionEarnLabel: "Earned & Disbursed",
        actionRedeemLabel: "Redeem / Payout",
        badgeColor: "warning",
      };

    case "POINTS":
    default:
      return {
        rewardMode: "POINTS",
        unitLabel: settings.rewardUnitLabel || "PTS",
        balanceHeader: "Available Loyalty Points",
        earnedHeader: "Total Points Earned",
        redeemedHeader: "Total Points Redeemed",
        actionEarnLabel: "Points Earned",
        actionRedeemLabel: "Points Redeemed",
        badgeColor: "brand",
      };
  }
}
