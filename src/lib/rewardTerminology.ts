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

  // 1. Determine Reward Mode
  let mode: string = 
    meta.rewardMode || 
    context?.campaignType || 
    settings.defaultRewardMode || 
    "POINTS";

  // Normalize mode string
  mode = mode.toUpperCase();
  if (mode.includes("CASHBACK") || mode.includes("CASH")) mode = "INSTANT_CASHBACK";
  else if (mode.includes("AIRTIME")) mode = "INSTANT_AIRTIME";
  else if (mode.includes("HYBRID")) mode = "HYBRID";
  else mode = "POINTS";

  const customUnit = settings.rewardUnitLabel || meta.unitLabel;

  switch (mode) {
    case "INSTANT_CASHBACK":
      return {
        rewardMode: "INSTANT_CASHBACK",
        unitLabel: customUnit || "KES",
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
        unitLabel: customUnit || "Airtime",
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
        unitLabel: customUnit || "PTS / KES",
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
        unitLabel: customUnit || "PTS",
        balanceHeader: "Available Loyalty Points",
        earnedHeader: "Total Points Earned",
        redeemedHeader: "Total Points Redeemed",
        actionEarnLabel: "Points Earned",
        actionRedeemLabel: "Points Redeemed",
        badgeColor: "brand",
      };
  }
}
