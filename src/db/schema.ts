// ============================================================================
// FILE 1: Core Entities & Master Data
// ============================================================================

import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  numeric,
  integer,
  jsonb,
  unique,
  uniqueIndex,
  index,
  primaryKey,
  foreignKey,
  check,
  pgEnum,
  date,
  bigint,
  bigserial,
  pgPolicy,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// ============================================================================
// 1. SYSTEM ENUMS (Complete)
// ============================================================================

export const accountingEntryEnum = pgEnum("accounting_entry", ["CREDIT", "DEBIT"]);
export const userRoleEnum = pgEnum("user_role", ["SYSTEM_ADMIN", "TENANT_ADMIN", "MANAGER", "OPERATOR", "VIEWER", "AGENT"]);
export const consumerGenderEnum = pgEnum("consumer_gender", ["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]);
export const integrationTypeEnum = pgEnum("integration_type", ["PAYMENT_GATEWAY", "REWARD_PARTNER", "ERP_WEBHOOK", "SMS_GATEWAY", "ERP_SYSTEM", "POS_SYSTEM", "PAYOUT_GATEWAY", "REWARD_AGGREGATOR"]);
export const organizationTypeEnum = pgEnum("organization_type", ["DEALER", "CONTRACTOR", "DISTRIBUTOR"]);
export const walletOwnerTypeEnum = pgEnum("wallet_owner_type", ["CONSUMER", "ORGANIZATION"]);
export const cardStatusEnum = pgEnum("card_status", ["INACTIVE", "ACTIVE", "ALLOCATED", "SOLD", "BANKED", "REDEEMED", "EXPIRED", "BLACKLISTED"]);
export const batchStatusEnum = pgEnum("batch_status", ["PRINTED", "AT_FACTORY", "PARTIALLY_ACTIVATED", "ACTIVATED", "SUSPENDED", "RETIRED"]);
export const flagStatusEnum = pgEnum("flag_status", ["ACTIVE", "RESOLVED", "FALSE_POSITIVE"]);
export const redemptionAttemptStatusEnum = pgEnum("redemption_attempt_status", ["SUCCESS", "FAILURE", "BLOCKED"]);
export const redemptionQueueStatusEnum = pgEnum("redemption_queue_status", ["PENDING", "PROCESSING", "SUCCESS", "FAILED", "REFUNDED"]);
export const fulfillmentStrategyEnum = pgEnum("fulfillment_strategy", [
  "INSTANT",
  "WALLET_BANKING",
  "AUTOMATED_PAYOUT",
  "INTERNAL_VOUCHER",
  "MANUAL_FULFILLMENT"
]);
export const rewardTypeEnum = pgEnum("reward_type", [
  "AIRTIME",
  "MOBILE_MONEY",
  "PHYSICAL",
  "PHYSICAL_GOOD",
  "CASH",
  "STORE_CREDIT",
  "DIGITAL_CODE",
  "DONATION",
  "FUEL_VOUCHER",
  "SHOPPING_VOUCHER"
]);
export const ruleTypeEnum = pgEnum("rule_type", ["VELOCITY", "SCHEDULE", "GEOGRAPHIC", "PRODUCT_BUNDLE", "FIRST_PURCHASE", "CART_TOTAL", "REFERRAL"]);
export const scheduleTypeEnum = pgEnum("schedule_type", ["DAILY", "WEEKLY", "MONTHLY", "CUSTOM_RANGE"]);
export const limitPeriodEnum = pgEnum("limit_period", ["DAILY", "WEEKLY", "MONTHLY", "LIFETIME"]);
export const channelTypeEnum = pgEnum("channel_type", ["USSD", "SMS", "WHATSAPP", "WEB", "MOBILE_APP", "POS", "API"]);
export const salesHierarchyRoleEnum = pgEnum("sales_hierarchy_role", ["SALES_PERSON", "ASM", "REGIONAL_MANAGER", "CEO"]);
export const voucherStatusEnum = pgEnum("voucher_status", ["PRINTED", "IN_TRANSIT", "ACTIVE", "REDEEMED"]);
export const invoiceStatusEnum = pgEnum("invoice_status", ["PAID", "PENDING", "OVERDUE"]);
export const promotionTypeEnum = pgEnum("promotion_type", ["BUY_X_GET_Y", "PERCENTAGE_DISCOUNT", "FIXED_DISCOUNT", "FREE_SHIPPING", "BUNDLE", "LOYALTY_MULTIPLIER"]);
export const promotionStackingEnum = pgEnum("promotion_stacking", ["NONE", "COMPOUND", "BEST_PRICE", "SEQUENTIAL"]);
export const segmentTypeEnum = pgEnum("segment_type", ["SYSTEM", "MANUAL", "DYNAMIC"]);
export const fraudRuleSeverityEnum = pgEnum("fraud_rule_severity", ["LOG", "FLAG", "BLOCK", "REQUIRE_REVIEW"]);
export const consentTypeEnum = pgEnum("consent_type", ["EMAIL_MARKETING", "SMS_PROMOTIONS", "PUSH_NOTIFICATIONS", "THIRD_PARTY_SHARING", "DATA_ANALYTICS"]);
export const jobStatusEnum = pgEnum("job_status", ["PENDING", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED"]);
export const featureFlagTypeEnum = pgEnum("feature_flag_type", ["BOOLEAN", "PERCENTAGE_ROLLOUT", "TENANT_WHITELIST"]);
export const challengeGoalTypeEnum = pgEnum("challenge_goal_type", ["TRANSACTION_COUNT", "SPEND_AMOUNT", "REFERRAL_COUNT", "PRODUCT_PURCHASE"]);
export const challengeStatusEnum = pgEnum("challenge_status", ["IN_PROGRESS", "COMPLETED", "EXPIRED"]);

// ============================================================================
// 2. GLOBAL MASTER DATA (No changes)
// ============================================================================

export const currencies = pgTable("currencies", {
  code: varchar("code", { length: 3 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  symbol: varchar("symbol", { length: 10 }).notNull(),
}, (t) => [
  pgPolicy("public_read", { for: "select", to: "public", using: sql`true` }),
  pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
]);

export const countries = pgTable("countries", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: varchar("code", { length: 2 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  dialingCode: varchar("dialing_code", { length: 10 }).notNull(),
}, (t) => [
  pgPolicy("public_read", { for: "select", to: "public", using: sql`true` }),
  pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
]);

export const counties = pgTable("counties", {
  id: uuid("id").defaultRandom().primaryKey(),
  countryId: uuid("country_id").references(() => countries.id).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  code: varchar("code", { length: 10 }), // County number or ISO code
}, (t) => [
  pgPolicy("public_read", { for: "select", to: "public", using: sql`true` }),
  pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
]);

export const regions = pgTable("regions", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  countryId: uuid("country_id").references(() => countries.id).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
}, (t) => ({
  tenantRegionUnique: uniqueIndex("region_tenant_name_unique").on(t.tenantId, t.name, t.countryId),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
      withCheck: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));

export const towns = pgTable("towns", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  regionId: uuid("region_id").references(() => regions.id).notNull(),
  countyId: uuid("county_id").references(() => counties.id), // Global county link
  name: varchar("name", { length: 100 }).notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
}, (t) => ({
  tenantTownUnique: uniqueIndex("town_tenant_name_unique").on(t.tenantId, t.name, t.regionId),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
      withCheck: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));

// ============================================================================
// 3. TENANTS, USERS & TENANT SETTINGS (Enhanced)
// ============================================================================

export const tenants = pgTable("tenants", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  externalId: varchar("external_id", { length: 100 }).unique(),
  registrationNumber: varchar("registration_number", { length: 100 }),
  countryId: uuid("country_id").references(() => countries.id).notNull(),
  baseCurrency: varchar("base_currency", { length: 3 }).references(() => currencies.code).notNull(),
  defaultPointValue: numeric("default_point_value", { precision: 10, scale: 4 }).notNull(),
  pointExpiryMonths: integer("point_expiry_months").default(12).notNull(),
  taxPin: varchar("tax_pin", { length: 50 }).unique(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }), // Added for tenant contact
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  plan: varchar("plan", { length: 50 }).notNull().default("basic"),
  settings: jsonb("settings").default({}),
  isActive: boolean("is_active").default(true).notNull(),
  isPlatformOwner: boolean("is_platform_owner").default(false).notNull(),
  metadata: jsonb("metadata"),
  deletedAt: timestamp("deleted_at", { withTimezone: true }), // Added soft delete
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  emailCheck: check("email_check", sql`email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'`),
  phoneCheck: check("phone_check", sql`phone IS NULL OR phone ~ '^[0-9]{9,15}$'`),
  statusCheck: check("status_check", sql`status IN ('active', 'suspended', 'pending', 'declined')`),
  planCheck: check("plan_check", sql`plan IN ('basic', 'professional', 'enterprise')`),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`id = (select tenant_id from users where id = auth.uid())`,
      withCheck: sql`id = (select tenant_id from users where id = auth.uid())`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));

// NEW: Tenant Global Settings (system-level banking, redemption, security, etc.)
export const tenantSettings = pgTable("tenant_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull().unique(),

  // Redemption global settings
  redemptionRequiresApproval: boolean("redemption_requires_approval").default(false).notNull(),
  redemptionMinPoints: numeric("redemption_min_points", { precision: 14, scale: 2 }).default("0").notNull(),
  redemptionMaxPerDay: numeric("redemption_max_per_day", { precision: 14, scale: 2 }),
  redemptionMaxPerWeek: numeric("redemption_max_per_week", { precision: 14, scale: 2 }),
  redemptionMaxPerMonth: numeric("redemption_max_per_month", { precision: 14, scale: 2 }),
  redemptionTimeWindowMinutes: integer("redemption_time_window_minutes").default(5), // for duplicate prevention

  // Banking (points expiry & rollover)
  pointExpiryEnabled: boolean("point_expiry_enabled").default(true).notNull(),
  pointExpiryMonthsGlobal: integer("point_expiry_months_global").default(12),
  pointRolloverEnabled: boolean("point_rollover_enabled").default(false).notNull(),
  rolloverMaxPercentage: integer("rollover_max_percentage").default(100), // max % of points that can roll over

  // Consumer controls (global defaults)
  defaultCanPurchase: boolean("default_can_purchase").default(true).notNull(),
  defaultCanEarnPoints: boolean("default_can_earn_points").default(true).notNull(),
  defaultCanRedeemPoints: boolean("default_can_redeem_points").default(true).notNull(),
  defaultCanBankPoints: boolean("default_can_bank_points").default(true).notNull(), // allow points to be "banked" (locked for future)
  defaultCanTransferPoints: boolean("default_can_transfer_points").default(false).notNull(),

  // Fraud & security
  maxFailedRedemptionsPerHour: integer("max_failed_redemptions_per_hour").default(5),
  requireMfaForRedemption: boolean("require_mfa_for_redemption").default(false),
  redemptionVelocityCheckMinutes: integer("redemption_velocity_check_minutes").default(60),
  maxPointsEarnedPerDay: numeric("max_points_earned_per_day", { precision: 14, scale: 2 }),

  // White-label & branding
  brandPrimaryColor: varchar("brand_primary_color", { length: 20 }),
  brandLogoUrl: varchar("brand_logo_url", { length: 512 }),
  smsSenderId: varchar("sms_sender_id", { length: 20 }),
  emailFooterHtml: text("email_footer_html"),

  // Webhooks & integrations (global settings)
  globalWebhookRetryCount: integer("global_webhook_retry_count").default(3),
  globalWebhookTimeoutSeconds: integer("global_webhook_timeout_seconds").default(10),

  // Audit & compliance
  auditLogRetentionDays: integer("audit_log_retention_days").default(365),
  consumerDataRetentionDays: integer("consumer_data_retention_days").default(2555), // 7 years

  // External Credentials (AT, Daraja, etc.)
  credentials: jsonb("credentials").default({}),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
      withCheck: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));

export const pointValueHistory = pgTable("point_value_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  oldPointValue: numeric("old_point_value", { precision: 10, scale: 4 }),
  newPointValue: numeric("new_point_value", { precision: 10, scale: 4 }).notNull(),
  reason: text("reason"),
  effectiveDate: timestamp("effective_date", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  tenantIdx: index("point_value_history_tenant_idx").on(t.tenantId),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
      withCheck: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));


export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  role: userRoleEnum("role").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  mfaEnabled: boolean("mfa_enabled").default(false),
  mfaSecret: text("mfa_secret"),
  // requiresPasswordChange: boolean("requires_password_change").default(false), // Commented out until DB push
  metadata: jsonb("metadata").default({}),
  lastActive: timestamp("last_active", { withTimezone: true }),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  emailCheck: check("email_check", sql`email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'`),
  statusCheck: check("status_check", sql`status IN ('active', 'inactive')`),
  policies: [
    pgPolicy("users_tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`id = auth.uid() OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN' OR (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()))`,
      withCheck: sql`(SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN' OR (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()))`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));

// ============================================================================
// 4. ORGANIZATIONS & SALES HIERARCHY (Enhanced with partner support)
// ============================================================================

export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  type: organizationTypeEnum("type").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  registrationNumber: varchar("registration_number", { length: 100 }),
  taxId: varchar("tax_id", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  addressLine1: varchar("address_line1", { length: 255 }),
  townId: uuid("town_id").references(() => towns.id),
  isActive: boolean("is_active").default(true).notNull(),
  metadata: jsonb("metadata"),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  tenantIdx: index("orgs_tenant_idx").on(t.tenantId),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
      withCheck: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));

export const salesHierarchy = pgTable("sales_hierarchy", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).unique(),
  phone: varchar("phone", { length: 20 }),
  role: salesHierarchyRoleEnum("role").notNull(),
  managerId: uuid("manager_id"),
  regionId: uuid("region_id").references(() => regions.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  tenantIdx: index("sales_hierarchy_tenant_idx").on(t.tenantId),
  managerIdx: index("sales_hierarchy_manager_idx").on(t.managerId),
  managerFk: foreignKey({ columns: [t.managerId], foreignColumns: [t.id] }),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
      withCheck: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));

export const salesHierarchyAssignments = pgTable("sales_hierarchy_assignments", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  staffId: uuid("staff_id").references(() => salesHierarchy.id).notNull(),
  organizationId: uuid("organization_id").references(() => organizations.id).notNull(),
  assignedAt: timestamp("assigned_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  tenantIdx: index("hierarchy_assign_tenant_idx").on(t.tenantId),
  staffIdx: index("hierarchy_assign_staff_idx").on(t.staffId),
  uniqueAssignment: uniqueIndex("hierarchy_assign_unique").on(t.staffId, t.organizationId),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
      withCheck: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));

// ============================================================================
// 5. CONSUMERS (Enhanced: redemption, banking, disable controls, plus innovative fields)
// ============================================================================

export const consumers = pgTable("consumers", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  authId: uuid("auth_id"),

  // Loyalty identifier
  loyaltyNumber: varchar("loyalty_number", { length: 50 }).notNull(),

  // Contact details
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  email: varchar("email", { length: 255 }),
  firstName: varchar("first_name", { length: 100 }),
  secondName: varchar("second_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  idNumber: varchar("id_number", { length: 50 }),
  taxPin: varchar("tax_pin", { length: 50 }),
  gender: consumerGenderEnum("gender"),
  dateOfBirth: date("date_of_birth"),
  townId: uuid("town_id").references(() => towns.id),

  // Consumer type and tier
  consumerType: varchar("consumer_type", { length: 50 }).default("END_USER").notNull(),
  loyaltyTierId: uuid("loyalty_tier_id").references(() => tenantTiers.id),

  // ========== NEW: Redemption Controls (per consumer) ==========
  redemptionEnabled: boolean("redemption_enabled").default(true).notNull(),
  redemptionDailyLimit: numeric("redemption_daily_limit", { precision: 14, scale: 2 }), // null = use tenant default
  redemptionWeeklyLimit: numeric("redemption_weekly_limit", { precision: 14, scale: 2 }),
  redemptionMonthlyLimit: numeric("redemption_monthly_limit", { precision: 14, scale: 2 }),
  redemptionSingleMaxPoints: numeric("redemption_single_max_points", { precision: 14, scale: 2 }),
  redemptionRequiresApproval: boolean("redemption_requires_approval").default(false),
  redemptionBlockedReason: text("redemption_blocked_reason"), // if redemptionEnabled=false, reason

  // ========== NEW: Banking Controls (points banking) ==========
  bankingEnabled: boolean("banking_enabled").default(true).notNull(), // can "bank" points for future use
  bankedPointsBalance: numeric("banked_points_balance", { precision: 14, scale: 4 }).default("0").notNull(), // points set aside
  autoBankingThreshold: numeric("auto_banking_threshold", { precision: 14, scale: 2 }), // auto-bank points above this
  bankingWithdrawMinPoints: numeric("banking_withdraw_min_points", { precision: 14, scale: 2 }),

  // ========== NEW: Individual Disable Controls (granular locks) ==========
  canPurchase: boolean("can_purchase").default(true).notNull(),
  canEarnPoints: boolean("can_earn_points").default(true).notNull(),
  canRedeemPoints: boolean("can_redeem_points").default(true).notNull(),
  canBankPoints: boolean("can_bank_points").default(true).notNull(),
  canTransferPoints: boolean("can_transfer_points").default(false).notNull(),
  canReceiveGifts: boolean("can_receive_gifts").default(true).notNull(),
  canParticipateInCampaigns: boolean("can_participate_in_campaigns").default(true).notNull(),

  // ========== NEW: Security & Fraud Flags ==========
  isVerified: boolean("is_verified").default(false),
  isRegistered: boolean("is_registered").default(false).notNull(),
  hasPortalAccess: boolean("has_portal_access").default(false).notNull(),
  mfaEnabled: boolean("mfa_enabled").default(false),
  mfaSecret: text("mfa_secret"),
  deviceFingerprint: text("device_fingerprint"),
  riskScore: integer("risk_score").default(0), // 0-100, higher = higher risk
  lastActive: timestamp("last_active", { withTimezone: true }),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  lastPasswordChange: timestamp("last_password_change", { withTimezone: true }),
  failedLoginAttempts: integer("failed_login_attempts").default(0),
  lockedUntil: timestamp("locked_until", { withTimezone: true }),

  // ========== NEW: Behavioral & Analytics ==========
  totalSpent: numeric("total_spent", { precision: 14, scale: 2 }).default("0"),
  totalPointsEarnedLifetime: numeric("total_points_earned_lifetime", { precision: 14, scale: 4 }).default("0"),
  totalPointsRedeemedLifetime: numeric("total_points_redeemed_lifetime", { precision: 14, scale: 4 }).default("0"),
  averageTransactionValue: numeric("average_transaction_value", { precision: 12, scale: 2 }),
  lastPurchaseDate: timestamp("last_purchase_date", { withTimezone: true }),
  preferredChannel: channelTypeEnum("preferred_channel"),
  preferredCategory: varchar("preferred_category", { length: 100 }),
  churnRiskScore: integer("churn_risk_score").default(0), // 0-100
  lifetimeValueTier: varchar("lifetime_value_tier", { length: 20 }), // bronze, silver, gold, platinum

  // ========== NEW: Preferences & Consent ==========
  marketingOptIn: boolean("marketing_opt_in").default(false),
  smsOptIn: boolean("sms_opt_in").default(false),
  emailOptIn: boolean("email_opt_in").default(false),
  pushOptIn: boolean("push_opt_in").default(false),
  preferredLanguage: varchar("preferred_language", { length: 10 }).default("en"),
  birthdayRewardSent: boolean("birthday_reward_sent").default(false),

  // ========== NEW: Referral Tracking ==========
  referredBy: uuid("referred_by"), // consumer id who referred this consumer
  referralCode: varchar("referral_code", { length: 50 }).unique(),
  referralCount: integer("referral_count").default(0),
  referralPointsEarned: numeric("referral_points_earned", { precision: 14, scale: 4 }).default("0"),

  // ========== NEW: Innovative African Market Fields ==========
  ussdPinHash: text("ussd_pin_hash"), // salted hash of 4-6 digit PIN
  onboardedByAgentId: uuid("onboarded_by_agent_id").references(() => salesHierarchy.id),
  physicalTagId: varchar("physical_tag_id", { length: 100 }), // NFC/QR tag ID
  kycVerifiedAt: timestamp("kyc_verified_at", { withTimezone: true }),
  kycVerifiedBy: uuid("kyc_verified_by").references(() => users.id),
  identificationImageUrl: text("identification_image_url"), // Path to ID photo

  // ========== Status & Metadata ==========
  status: varchar("status", { length: 20 }).default("active").notNull(),
  metadata: jsonb("metadata"),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),

  // ========== Existing foreign keys ==========
  dealerOrganizationId: uuid("dealer_organization_id").references(() => organizations.id),
}, (t) => ({
  tenantPhoneUnique: uniqueIndex("consumer_tenant_phone_unique").on(t.tenantId, t.phoneNumber),
  tenantLoyaltyNumberUnique: uniqueIndex("consumer_tenant_loyalty_number_unique").on(t.tenantId, t.loyaltyNumber),
  referralCodeIdx: uniqueIndex("consumer_referral_code_idx").on(t.referralCode),
  authIdIdx: index("consumer_auth_id_idx").on(t.authId),
  statusIdx: index("consumer_status_idx").on(t.status),
  emailCheck: check("email_check", sql`email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'`),
  ageCheck: check("age_check", sql`date_of_birth IS NULL OR EXTRACT(YEAR FROM AGE(date_of_birth)) BETWEEN 18 AND 120`),
  statusCheck: check("status_check", sql`status IN ('active', 'suspended', 'blocked')`),
  riskScoreCheck: check("risk_score_check", sql`risk_score BETWEEN 0 AND 100`),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
      withCheck: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));

export const consumerSessions = pgTable("consumer_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  consumerId: uuid("consumer_id").references(() => consumers.id).notNull(),
  token: text("token").notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  deviceFingerprint: text("device_fingerprint"),
  isValid: boolean("is_valid").default(true).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  tenantIdx: index("consumer_sessions_tenant_idx").on(t.tenantId),
  consumerIdx: index("consumer_sessions_consumer_idx").on(t.consumerId),
  tokenIdx: uniqueIndex("consumer_sessions_token_idx").on(t.token),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
      withCheck: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));

export const consumerTierHistory = pgTable("consumer_tier_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  consumerId: uuid("consumer_id").references(() => consumers.id).notNull(),
  oldTierId: uuid("old_tier_id").references(() => tenantTiers.id),
  newTierId: uuid("new_tier_id").references(() => tenantTiers.id).notNull(),
  reason: text("reason"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  tenantIdx: index("tier_history_tenant_idx").on(t.tenantId),
  consumerIdx: index("tier_history_consumer_idx").on(t.consumerId),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
      withCheck: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));


export const organizationMembers = pgTable("organization_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").references(() => organizations.id).notNull(),
  consumerId: uuid("consumer_id").references(() => consumers.id).notNull(),
  role: varchar("role", { length: 50 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow().notNull(),
  leftAt: timestamp("left_at", { withTimezone: true }),
}, (t) => ({
  uniqueMembership: uniqueIndex("org_member_unique_idx").on(t.organizationId, t.consumerId),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`organization_id In (select id from organizations where tenant_id = (select tenant_id from users where id = auth.uid()))`,
      withCheck: sql`organization_id In (select id from organizations where tenant_id = (select tenant_id from users where id = auth.uid()))`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));

// ============================================================================
// 6. LOYALTY TIERS (No changes)
// ============================================================================

export const tenantTiers = pgTable("tenant_tiers", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  name: varchar("name", { length: 50 }).notNull(),
  priority: integer("priority").notNull(),
  minPointsRequired: numeric("min_points_required", { precision: 14, scale: 2 }).notNull(),
  earningMultiplier: numeric("earning_multiplier", { precision: 5, scale: 2 }).default("1.00").notNull(),
  description: text("description"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  tenantNameUnique: uniqueIndex("tier_tenant_name_unique").on(t.tenantId, t.name),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
      withCheck: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));

export const productCategories = pgTable("product_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  nameTenantUnique: unique().on(t.name, t.tenantId),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
      withCheck: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));

export const productUoms = pgTable("product_uoms", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  symbol: varchar("symbol", { length: 20 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  nameTenantUnique: unique().on(t.name, t.tenantId),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
      withCheck: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  sku: varchar("sku", { length: 100 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }),
  subcategory: varchar("subcategory", { length: 100 }),
  unitOfMeasure: varchar("unit_of_measure", { length: 20 }),
  measurementValue: numeric("measurement_value", { precision: 10, scale: 2 }),
  barcode: varchar("barcode", { length: 100 }),
  brand: varchar("brand", { length: 100 }),
  pointsPerUnit: integer("points_per_unit").notNull().default(0),
  price: numeric("price", { precision: 10, scale: 2 }),
  costPrice: numeric("cost_price", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").default(true).notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  skuUnique: unique().on(t.sku, t.tenantId),
  pointsCheck: check("points_per_unit_check", sql`points_per_unit >= 0`),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
      withCheck: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));

export const productBatches = pgTable("product_batches", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  productId: uuid("product_id").references(() => products.id).notNull(),
  batchNumber: varchar("batch_number", { length: 100 }).notNull(),
  quantityProduced: integer("quantity_produced").notNull(),
  quantityRemaining: integer("quantity_remaining").notNull(),
  productionDate: timestamp("production_date", { withTimezone: true }).notNull(),
  expiryDate: timestamp("expiry_date", { withTimezone: true }),
  status: varchar("status", { length: 20 }).default("active").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  tenantBatchUnique: uniqueIndex("product_batch_tenant_batch_unique").on(t.tenantId, t.batchNumber),
  productIdx: index("product_batch_product_idx").on(t.productId),
  statusCheck: check("status_check", sql`status IN ('active', 'inactive', 'completed')`),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
      withCheck: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));

// ============================================================================
// 8. VENDORS (No changes)
// ============================================================================

export const vendors = pgTable("vendors", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  contactEmail: varchar("contact_email", { length: 255 }),
  isActive: boolean("is_active").default(true).notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  pgPolicy("tenant_isolation", {
    for: "all",
    to: "authenticated",
    using: sql`tenant_id = (select tenant_id from users where id = auth.uid())`,
    withCheck: sql`tenant_id = (select tenant_id from users where id = auth.uid())`,
  }),
  pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
]);

// ============================================================================
// 9. PARTIAL RELATIONS (for file 1, continue in file 2)
// ============================================================================

// Relations formerly here moved to Section 27 for consolidation.

// ============================================================================
// 10. CAMPAIGNS & PROMOTIONS (Enhanced with promotion engine)
// ============================================================================

export const campaigns = pgTable("campaigns", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  parentCampaignId: uuid("parent_campaign_id"),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  campaignType: varchar("campaign_type", { length: 50 }).notNull(),
  pointConversionOverride: numeric("point_conversion_override", { precision: 10, scale: 4 }),
  pointsMultiplier: numeric("points_multiplier", { precision: 5, scale: 2 }).default("1.0"),
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }),
  priority: integer("priority").default(0).notNull(),
  isRecurring: boolean("is_recurring").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  tenantIdx: index("campaigns_tenant_idx").on(t.tenantId),
  parentFk: foreignKey({ columns: [t.parentCampaignId], foreignColumns: [t.id] }),
  dateCheck: check("date_check", sql`start_date <= end_date`),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
      withCheck: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));

// NEW: Promotions (stackable offers)
export const promotions = pgTable("promotions", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  promotionType: promotionTypeEnum("promotion_type").notNull(),
  stackingType: promotionStackingEnum("stacking_type").default("NONE").notNull(),
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }),
  priority: integer("priority").default(0).notNull(),
  configuration: jsonb("configuration").notNull(), // e.g., { "buy": 2, "get": 1, "discount_percent": 20 }
  usageLimitPerConsumer: integer("usage_limit_per_consumer"),
  usageLimitTotal: integer("usage_limit_total"),
  usageCount: integer("usage_count").default(0),
  minCartValue: numeric("min_cart_value", { precision: 12, scale: 2 }),
  applicableProducts: jsonb("applicable_products").default([]), // array of product IDs or categories
  excludedProducts: jsonb("excluded_products").default([]),
  applicableConsumerSegments: jsonb("applicable_consumer_segments").default([]),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  tenantIdx: index("promotions_tenant_idx").on(t.tenantId),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
      withCheck: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));

export const campaignRules = pgTable("campaign_rules", {
  id: uuid("id").defaultRandom().primaryKey(),
  campaignId: uuid("campaign_id").references(() => campaigns.id).notNull(),
  ruleType: ruleTypeEnum("rule_type").notNull(),
  configuration: jsonb("configuration").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  pgPolicy("tenant_isolation", {
    for: "all",
    to: "authenticated",
    using: sql`campaign_id IN (select id from campaigns where tenant_id = (select tenant_id from users where id = auth.uid()))`,
    withCheck: sql`campaign_id IN (select id from campaigns where tenant_id = (select tenant_id from users where id = auth.uid()))`,
  }),
  pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
]);

export const campaignProducts = pgTable("campaign_products", {
  campaignId: uuid("campaign_id").notNull().references(() => campaigns.id),
  productId: uuid("product_id").notNull().references(() => products.id),
  category: varchar("category", { length: 100 }),
}, (t) => ({
  pk: primaryKey({ columns: [t.campaignId, t.productId] }),
}));

export const campaignBudgets = pgTable("campaign_budgets", {
  id: uuid("id").defaultRandom().primaryKey(),
  campaignId: uuid("campaign_id").references(() => campaigns.id).notNull().unique(),
  totalPointsAllocated: numeric("total_points_allocated", { precision: 14, scale: 2 }).notNull(),
  totalPointsIssued: numeric("total_points_issued", { precision: 14, scale: 2 }).default("0").notNull(),
  isAlertTriggered: boolean("is_alert_triggered").default(false).notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  pgPolicy("tenant_isolation", {
    for: "all",
    to: "authenticated",
    using: sql`campaign_id IN (select id from campaigns where tenant_id = (select tenant_id from users where id = auth.uid()))`,
    withCheck: sql`campaign_id IN (select id from campaigns where tenant_id = (select tenant_id from users where id = auth.uid()))`,
  }),
  pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
]);

// ============================================================================
// 11. WALLETS & POINTS (FIFO with banking support)
// ============================================================================

export const wallets = pgTable("wallets", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerType: walletOwnerTypeEnum("owner_type").notNull(),
  ownerId: uuid("owner_id").notNull(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  pointsBalance: numeric("points_balance", { precision: 14, scale: 4 }).default("0").notNull(),
  bankedPointsBalance: numeric("banked_points_balance", { precision: 14, scale: 4 }).default("0").notNull(),
  lifetimePointsEarned: numeric("lifetime_points_earned", { precision: 14, scale: 4 }).default("0").notNull(),
  version: integer("version").default(1).notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  uniqueOwnerWallet: uniqueIndex("wallets_owner_tenant_idx").on(t.ownerType, t.ownerId, t.tenantId),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
      withCheck: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));

// Transactions table with partitioning hint (by month on created_at)
export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  walletId: uuid("wallet_id").references(() => wallets.id).notNull(),
  campaignId: uuid("campaign_id").references(() => campaigns.id),
  promotionId: uuid("promotion_id").references(() => promotions.id),
  accountingEntry: accountingEntryEnum("accounting_entry").notNull(),
  actionCategory: varchar("action_category", { length: 100 }).notNull(),
  pointsAmount: numeric("points_amount", { precision: 12, scale: 4 }).notNull(),
  balanceAfter: numeric("balance_after", { precision: 14, scale: 4 }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  reversalOf: uuid("reversal_of"),
  providerReference: varchar("provider_reference", { length: 255 }),
  idempotencyKey: varchar("idempotency_key", { length: 255 }).unique(),
  metadata: jsonb("metadata"),
  description: text("description"),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  tenantIdx: index("tx_tenant_idx").on(t.tenantId),
  walletIdx: index("tx_wallet_idx").on(t.walletId),
  createdIdx: index("tx_created_idx").on(t.createdAt),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
      withCheck: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
  // Partitioning comment (for manual migration)
  // PARTITION BY RANGE (created_at)
}));

export const pointLots = pgTable("point_lots", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  transactionId: uuid("transaction_id").references(() => transactions.id).notNull(),
  originalAmount: numeric("original_amount", { precision: 14, scale: 4 }).notNull(),
  remainingAmount: numeric("remaining_amount", { precision: 14, scale: 4 }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  tenantIdx: index("point_lots_tenant_idx").on(t.tenantId),
  transactionIdx: index("point_lots_transaction_idx").on(t.transactionId),
  // For FIFO queries
  expiryIdx: index("point_lots_expiry_idx").on(t.expiresAt),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
      withCheck: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));

// ============================================================================
// 12. PURCHASES (Earning events)
// ============================================================================

export const purchases = pgTable("purchases", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  consumerId: uuid("consumer_id").references(() => consumers.id).notNull(),
  dealerOrganizationId: uuid("dealer_organization_id").references(() => organizations.id).notNull(),
  productId: uuid("product_id").references(() => products.id),
  cardId: uuid("card_id").references(() => cards.id),
  campaignId: uuid("campaign_id").references(() => campaigns.id),
  promotionId: uuid("promotion_id").references(() => promotions.id),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }),
  pointsEarned: numeric("points_earned", { precision: 12, scale: 4 }),
  purchaseDate: timestamp("purchase_date", { withTimezone: true }).defaultNow().notNull(),
  invoiceNumber: varchar("invoice_number", { length: 100 }),
  returnedAt: timestamp("returned_at", { withTimezone: true }),
  idempotencyKey: varchar("idempotency_key", { length: 255 }).unique(),
  metadata: jsonb("metadata"),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  tenantIdx: index("purchases_tenant_idx").on(t.tenantId),
  consumerIdx: index("purchases_consumer_idx").on(t.consumerId),
  cardIdx: uniqueIndex("purchases_card_idx").on(t.cardId),
  idempotencyIdx: uniqueIndex("purchases_idempotency_key_idx").on(t.idempotencyKey),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
      withCheck: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));

// ============================================================================
// 13. PHYSICAL CARDS & VOUCHERS (Existing)
// ============================================================================

export const cardBatches = pgTable("card_batches", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  productBatchId: uuid("product_batch_id").references(() => productBatches.id),
  campaignId: uuid("campaign_id").references(() => campaigns.id),
  vendorId: uuid("vendor_id").references(() => vendors.id).notNull(),
  batchNumber: varchar("batch_number", { length: 50 }).notNull().unique(),
  description: text("description"),
  activationHash: varchar("activation_hash", { length: 255 }),
  totalCards: integer("total_cards").notNull(),
  basePointValue: numeric("base_point_value", { precision: 10, scale: 2 }).notNull(),
  status: batchStatusEnum("status").default("PRINTED").notNull(),
  erpReference: varchar("erp_reference", { length: 100 }),
  isInvoiced: boolean("is_invoiced").default(false).notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  tenantIdx: index("batches_tenant_idx").on(t.tenantId),
  productBatchIdx: index("card_batches_product_batch_idx").on(t.productBatchId),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
      withCheck: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));

export const cards = pgTable("cards", {
  id: uuid("id").defaultRandom().primaryKey(),
  batchId: uuid("batch_id").references(() => cardBatches.id).notNull(),
  productId: uuid("product_id").references(() => products.id),
  codeHash: varchar("code_hash", { length: 255 }).notNull().unique(),
  codeEncrypted: text("code_encrypted"),
  serialNumber: varchar("serial_number", { length: 100 }),
  basePointValue: numeric("base_point_value", { precision: 10, scale: 2 }).notNull(),
  status: cardStatusEnum("status").default("INACTIVE").notNull(),
  dealerId: uuid("dealer_id").references(() => organizations.id),
  activatedAt: timestamp("activated_at", { withTimezone: true }),
  redeemedAt: timestamp("redeemed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  batchIdx: index("cards_batch_idx").on(t.batchId),
  codeHashIdx: uniqueIndex("cards_code_hash_idx").on(t.codeHash),
  statusIdx: index("cards_status_idx").on(t.status),
  productIdx: index("cards_product_idx").on(t.productId),
  dealerIdx: index("cards_dealer_idx").on(t.dealerId),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`batch_id IN (select id from card_batches where tenant_id = (select tenant_id from users where id = auth.uid()))`,
      withCheck: sql`batch_id IN (select id from card_batches where tenant_id = (select tenant_id from users where id = auth.uid()))`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));

export const voucherBatches = pgTable("voucher_batches", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  campaignId: uuid("campaign_id").references(() => campaigns.id),
  productId: uuid("product_id").references(() => products.id),
  batchNumber: varchar("batch_number", { length: 100 }).unique().notNull(),
  quantity: integer("quantity").notNull(),
  generated: integer("generated").default(0),
  isActivated: boolean("is_activated").default(false),
  activatedAt: timestamp("activated_at", { withTimezone: true }),
  activatedBy: uuid("activated_by").references(() => users.id),
  expiryDate: timestamp("expiry_date", { withTimezone: true }),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  quantityCheck: check("quantity_check", sql`quantity > 0`),
  tenantIdx: index("voucher_batches_tenant_idx").on(t.tenantId),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
      withCheck: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));

export const vouchers = pgTable("vouchers", {
  id: uuid("id").defaultRandom().primaryKey(),
  batchId: uuid("batch_id").references(() => voucherBatches.id, { onDelete: "cascade" }),
  serialNumber: varchar("serial_number", { length: 100 }).unique().notNull(),
  secureCodeHash: text("secure_code_hash").notNull(),
  status: voucherStatusEnum("status").default("PRINTED").notNull(),
  currentDealerId: uuid("current_dealer_id").references(() => organizations.id),
  redeemedBy: uuid("redeemed_by").references(() => consumers.id),
  redeemedAt: timestamp("redeemed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  idx_serial: index("idx_voucher_serial").on(t.serialNumber),
  idx_dealer: index("idx_voucher_dealer").on(t.currentDealerId),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`batch_id IN (select id from voucher_batches where tenant_id = (select tenant_id from users where id = auth.uid()))`,
      withCheck: sql`batch_id IN (select id from voucher_batches where tenant_id = (select tenant_id from users where id = auth.uid()))`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));

// ============================================================================
// 14. REWARDS & REDEMPTION (Enhanced with category-level availability)
// ============================================================================

// Reward categories (for grouping)
export const rewardCategories = pgTable("reward_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  tenantNameUnique: uniqueIndex("reward_category_tenant_name_unique").on(t.tenantId, t.name),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
      withCheck: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));

export const rewardItems = pgTable("reward_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  categoryId: uuid("category_id").references(() => rewardCategories.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  rewardType: rewardTypeEnum("reward_type").notNull(),
  fulfillmentStrategy: fulfillmentStrategyEnum("fulfillment_strategy").default("WALLET_BANKING").notNull(),
  imageUrl: varchar("image_url", { length: 512 }),
  requiredPoints: numeric("required_points", { precision: 12, scale: 2 }).notNull(),
  dailyLimitPerConsumer: numeric("daily_limit_per_consumer", { precision: 14, scale: 2 }),
  monthlyLimitPerConsumer: numeric("monthly_limit_per_consumer", { precision: 14, scale: 2 }),
  lifetimeLimitPerConsumer: numeric("lifetime_limit_per_consumer", { precision: 14, scale: 2 }),
  stockQuantity: integer("stock_quantity"),
  reservedStock: integer("reserved_stock").default(0), // for pending redemptions
  minConsumerTier: varchar("min_consumer_tier", { length: 50 }), // tier name required
  allowedConsumerSegments: jsonb("allowed_consumer_segments").default([]),
  startDate: timestamp("start_date", { withTimezone: true }),
  endDate: timestamp("end_date", { withTimezone: true }),
  isActive: boolean("is_active").default(true).notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  tenantIdx: index("reward_items_tenant_idx").on(t.tenantId),
  categoryIdx: index("reward_items_category_idx").on(t.categoryId),
  requiredPointsCheck: check("required_points_check", sql`required_points > 0`),
  stockCheck: check("stock_check", sql`reserved_stock <= stock_quantity`),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
      withCheck: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));

export const redemptionsQueue = pgTable("redemptions_queue", {
  id: uuid("id").defaultRandom().primaryKey(),
  transactionId: uuid("transaction_id").references(() => transactions.id).notNull().unique(),
  rewardItemId: uuid("reward_item_id").references(() => rewardItems.id),
  integrationId: uuid("integration_id").references(() => tenantIntegrations.id), // Link to partner integration (GiftPesa/Daraja)
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  consumerId: uuid("consumer_id").references(() => consumers.id).notNull(),
  destinationAccount: varchar("destination_account", { length: 255 }).notNull(),
  amountValue: numeric("amount_value", { precision: 10, scale: 2 }).notNull(),
  currencyCode: varchar("currency_code", { length: 3 }).references(() => currencies.code).notNull(),
  externalReference: varchar("external_reference", { length: 255 }), // Partner transaction ID
  idempotencyKey: varchar("idempotency_key", { length: 255 }).unique(),
  metadata: jsonb("metadata"),
  status: redemptionQueueStatusEnum("status").default("PENDING").notNull(),
  fulfillmentMode: fulfillmentStrategyEnum("fulfillment_mode").notNull(),
  retryCount: integer("retry_count").default(0).notNull(),
  lastError: text("last_error"),
  approvedBy: uuid("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  tenantStatusIdx: index("queue_tenant_status_idx").on(t.tenantId, t.status),
  consumerIdx: index("redemptions_queue_consumer_idx").on(t.consumerId),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
      withCheck: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));

// ============================================================================
// 15. REFERRAL TRACKING (New)
// ============================================================================

export const referrals = pgTable("referrals", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  referrerConsumerId: uuid("referrer_consumer_id").references(() => consumers.id).notNull(),
  referredConsumerId: uuid("referred_consumer_id").references(() => consumers.id).notNull(),
  referralCode: varchar("referral_code", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }).default("PENDING").notNull(), // PENDING, COMPLETED, EXPIRED
  rewardPointsAwarded: numeric("reward_points_awarded", { precision: 14, scale: 4 }).default("0"),
  rewardIssuedAt: timestamp("reward_issued_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }), // when referred consumer made first purchase
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  tenantIdx: index("referrals_tenant_idx").on(t.tenantId),
  referrerIdx: index("referrals_referrer_idx").on(t.referrerConsumerId),
  uniqueReferral: uniqueIndex("unique_referral_pair").on(t.referrerConsumerId, t.referredConsumerId),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
      withCheck: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));

// ============================================================================
// 16. FRAUD & RISK MANAGEMENT (New)
// ============================================================================

export const fraudRules = pgTable("fraud_rules", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  ruleType: varchar("rule_type", { length: 50 }).notNull(), // e.g., "velocity_earning", "velocity_redemption", "multiple_accounts"
  severity: fraudRuleSeverityEnum("severity").default("FLAG").notNull(),
  configuration: jsonb("configuration").notNull(), // e.g., { "max_points_per_hour": 1000, "time_window_minutes": 60 }
  isActive: boolean("is_active").default(true).notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  tenantIdx: index("fraud_rules_tenant_idx").on(t.tenantId),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
      withCheck: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));

export const fraudAlerts = pgTable("fraud_alerts", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  consumerId: uuid("consumer_id").references(() => consumers.id).notNull(),
  ruleId: uuid("rule_id").references(() => fraudRules.id),
  severity: fraudRuleSeverityEnum("severity").notNull(),
  details: jsonb("details"),
  status: varchar("status", { length: 20 }).default("OPEN").notNull(), // OPEN, REVIEWED, RESOLVED, FALSE_POSITIVE
  resolvedBy: uuid("resolved_by").references(() => users.id),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  resolutionNote: text("resolution_note"),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  tenantIdx: index("fraud_alerts_tenant_idx").on(t.tenantId),
  consumerIdx: index("fraud_alerts_consumer_idx").on(t.consumerId),
  statusIdx: index("fraud_alerts_status_idx").on(t.status),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
      withCheck: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));

// ============================================================================
// 17. CONSUMER SEGMENTS (Dynamic & Manual)
// ============================================================================

export const consumerSegments = pgTable("consumer_segments", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  segmentType: segmentTypeEnum("segment_type").default("MANUAL").notNull(),
  criteria: jsonb("criteria"), // for dynamic segments: e.g., { "total_spent": { "$gt": 1000 }, "last_purchase_days": { "$lt": 30 } }
  memberCount: integer("member_count").default(0),
  isActive: boolean("is_active").default(true).notNull(),
  lastRefreshedAt: timestamp("last_refreshed_at", { withTimezone: true }),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  tenantNameUnique: uniqueIndex("segment_tenant_name_unique").on(t.tenantId, t.name),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
      withCheck: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));

export const segmentMembers = pgTable("segment_members", {
  segmentId: uuid("segment_id").references(() => consumerSegments.id).notNull(),
  consumerId: uuid("consumer_id").references(() => consumers.id).notNull(),
  addedAt: timestamp("added_at", { withTimezone: true }).defaultNow().notNull(),
  removedAt: timestamp("removed_at", { withTimezone: true }),
}, (t) => ({
  pk: primaryKey({ columns: [t.segmentId, t.consumerId] }),
  consumerIdx: index("segment_members_consumer_idx").on(t.consumerId),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`segment_id IN (select id from consumer_segments where tenant_id = (select tenant_id from users where id = auth.uid()))`,
      withCheck: sql`segment_id IN (select id from consumer_segments where tenant_id = (select tenant_id from users where id = auth.uid()))`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));

// ============================================================================
// 18. CONSENT MANAGEMENT (GDPR compliance)
// ============================================================================

export const consentRecords = pgTable("consent_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  consumerId: uuid("consumer_id").references(() => consumers.id).notNull(),
  consentType: consentTypeEnum("consent_type").notNull(),
  isGranted: boolean("is_granted").notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  grantedAt: timestamp("granted_at", { withTimezone: true }).defaultNow().notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  metadata: jsonb("metadata"),
}, (t) => ({
  tenantIdx: index("consent_tenant_idx").on(t.tenantId),
  consumerIdx: index("consent_consumer_idx").on(t.consumerId),
  uniqueActiveConsent: uniqueIndex("unique_active_consent").on(t.consumerId, t.consentType).where(sql`revoked_at IS NULL`),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
      withCheck: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));

// ============================================================================
// 19. PARTNER LOYALTY (Cross-tenant)
// ============================================================================

export const partnerPrograms = pgTable("partner_programs", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(), // primary tenant
  partnerTenantId: uuid("partner_tenant_id").references(() => tenants.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  exchangeRate: numeric("exchange_rate", { precision: 10, scale: 4 }).notNull(), // 1 primary point = X partner points
  settlementTerms: varchar("settlement_terms", { length: 100 }),
  isActive: boolean("is_active").default(true).notNull(),
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  uniquePartner: uniqueIndex("unique_partner_program").on(t.tenantId, t.partnerTenantId),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`tenant_id = (select tenant_id from users where id = auth.uid()) OR partner_tenant_id = (select tenant_id from users where id = auth.uid())`,
      withCheck: sql`tenant_id = (select tenant_id from users where id = auth.uid()) OR partner_tenant_id = (select tenant_id from users where id = auth.uid())`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));

export const partnerTransactions = pgTable("partner_transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  partnerProgramId: uuid("partner_program_id").references(() => partnerPrograms.id).notNull(),
  consumerId: uuid("consumer_id").references(() => consumers.id).notNull(),
  direction: varchar("direction", { length: 10 }).notNull(), // SENT, RECEIVED
  pointsAmount: numeric("points_amount", { precision: 14, scale: 4 }).notNull(),
  convertedAmount: numeric("converted_amount", { precision: 14, scale: 4 }).notNull(),
  referenceTransactionId: uuid("reference_transaction_id"),
  status: varchar("status", { length: 20 }).default("PENDING").notNull(),
  settledAt: timestamp("settled_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  tenantIdx: index("partner_tx_tenant_idx").on(t.tenantId),
  consumerIdx: index("partner_tx_consumer_idx").on(t.consumerId),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
      withCheck: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));

// ============================================================================
// 20. OFFLINE SYNC QUEUE (For POS)
// ============================================================================

export const offlineSyncQueue = pgTable("offline_sync_queue", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  deviceId: varchar("device_id", { length: 255 }).notNull(),
  operation: varchar("operation", { length: 50 }).notNull(), // CREATE_PURCHASE, REDEEM_POINTS, etc.
  payload: jsonb("payload").notNull(),
  idempotencyKey: varchar("idempotency_key", { length: 255 }).unique(),
  status: varchar("status", { length: 20 }).default("PENDING").notNull(),
  retryCount: integer("retry_count").default(0),
  lastError: text("last_error"),
  syncedAt: timestamp("synced_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  tenantIdx: index("offline_sync_tenant_idx").on(t.tenantId),
  deviceStatusIdx: index("offline_sync_device_status_idx").on(t.deviceId, t.status),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
      withCheck: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));

// ============================================================================
// 21. BILLING & USAGE METERING (SaaS)
// ============================================================================

export const invoices = pgTable("invoices", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "restrict" }),
  invoiceNumber: varchar("invoice_number", { length: 50 }).unique().notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  status: invoiceStatusEnum("status").default("PENDING").notNull(),
  dueDate: timestamp("due_date", { withTimezone: true }).notNull(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  items: jsonb("items").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  amountCheck: check("amount_check", sql`amount > 0`),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
      withCheck: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));

export const usageMeters = pgTable("usage_meters", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  metricName: varchar("metric_name", { length: 100 }).notNull(), // "api_calls", "active_consumers", "points_issued"
  billingPeriodStart: timestamp("billing_period_start", { withTimezone: true }).notNull(),
  billingPeriodEnd: timestamp("billing_period_end", { withTimezone: true }).notNull(),
  usageValue: numeric("usage_value", { precision: 14, scale: 2 }).default("0").notNull(),
  tierLimit: numeric("tier_limit", { precision: 14, scale: 2 }),
  overageAmount: numeric("overage_amount", { precision: 12, scale: 2 }).default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  tenantMetricPeriodUnique: uniqueIndex("usage_meter_unique").on(t.tenantId, t.metricName, t.billingPeriodStart),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
      withCheck: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));

// ============================================================================
// 22. FEATURE FLAGS (Gradual rollout)
// ============================================================================

export const featureFlags = pgTable("feature_flags", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  name: varchar("name", { length: 100 }).notNull(),
  flagType: featureFlagTypeEnum("flag_type").default("BOOLEAN").notNull(),
  value: jsonb("value").notNull(), // { "enabled": true } or { "percentage": 25 } or { "whitelist": ["tenant1"] }
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  tenantNameUnique: uniqueIndex("feature_flag_tenant_name_unique").on(t.tenantId, t.name),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`tenant_id = (select tenant_id from users where id = auth.uid()) OR tenant_id IS NULL`,
      withCheck: sql`tenant_id = (select tenant_id from users where id = auth.uid()) OR tenant_id IS NULL`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));

// ============================================================================
// 23. INTEGRATIONS, WEBHOOKS, LOGS (Enhanced)
// ============================================================================

export const externalWebhooks = pgTable("external_webhooks", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  url: text("url").notNull(),
  eventTypes: jsonb("event_types").notNull(),
  secretKey: text("secret_key").notNull(),
  retryCount: integer("retry_count").default(3),
  timeoutSeconds: integer("timeout_seconds").default(10),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  pgPolicy("tenant_isolation", {
    for: "all",
    to: "authenticated",
    using: sql`tenant_id = (select tenant_id from users where id = auth.uid())`,
    withCheck: sql`tenant_id = (select tenant_id from users where id = auth.uid())`,
  }),
  pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
]);

export const webhookDeliveryLogs = pgTable("webhook_delivery_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  webhookId: uuid("webhook_id").references(() => externalWebhooks.id).notNull(),
  eventId: uuid("event_id").notNull(),
  payload: jsonb("payload"),
  responseCode: integer("response_code"),
  responseBody: text("response_body"),
  durationMs: integer("duration_ms"),
  success: boolean("success").notNull(),
  retryNumber: integer("retry_number").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  webhookIdx: index("webhook_delivery_webhook_idx").on(t.webhookId),
  eventIdx: index("webhook_delivery_event_idx").on(t.eventId),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`webhook_id IN (select id from external_webhooks where tenant_id = (select tenant_id from users where id = auth.uid()))`,
      withCheck: sql`webhook_id IN (select id from external_webhooks where tenant_id = (select tenant_id from users where id = auth.uid()))`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));

export const tenantIntegrations = pgTable("tenant_integrations", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  type: integrationTypeEnum("type").notNull(),
  providerName: varchar("provider_name", { length: 100 }).notNull(),
  credentials: jsonb("credentials").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  pgPolicy("tenant_isolation", {
    for: "all",
    to: "authenticated",
    using: sql`tenant_id = (select tenant_id from users where id = auth.uid())`,
    withCheck: sql`tenant_id = (select tenant_id from users where id = auth.uid())`,
  }),
  pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
]);

export const integrationLogs = pgTable("integration_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  integrationId: uuid("integration_id").references(() => tenantIntegrations.id),
  webhookId: uuid("webhook_id").references(() => externalWebhooks.id),
  direction: varchar("direction", { length: 10 }).notNull(),
  payload: jsonb("payload"),
  responseCode: integer("response_code"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  directionCheck: check("direction_check", sql`direction IN ('inbound', 'outbound')`),
  tenantCreatedIdx: index("integration_logs_tenant_created_idx").on(t.tenantId, t.createdAt),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
      withCheck: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));

// ============================================================================
// 24. CHANNELS & COMMUNICATION LOGS
// ============================================================================

export const tenantChannels = pgTable("tenant_channels", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  type: channelTypeEnum("type").notNull(),
  value: varchar("value", { length: 100 }).notNull(),
  description: text("description"),
  ussdMenuStructure: jsonb("ussd_menu_structure"),
  ussdWelcomeMessage: text("ussd_welcome_message"),
  ussdDefaultMessage: text("ussd_default_message"),
  smsKeywords: jsonb("sms_keywords"),
  smsAutoReply: text("sms_auto_reply"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  uniqueChannel: uniqueIndex("tenant_channel_unique").on(t.tenantId, t.type, t.value),
  tenantIdx: index("tenant_channels_tenant_idx").on(t.tenantId),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
      withCheck: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));

export const communicationLogs = pgTable("communication_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  channelId: uuid("channel_id").references(() => tenantChannels.id),
  consumerId: uuid("consumer_id").references(() => consumers.id),
  interactionType: varchar("interaction_type", { length: 50 }).notNull(),
  identifier: varchar("identifier", { length: 255 }),
  rawContent: text("raw_content"),
  status: redemptionAttemptStatusEnum("status").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  tenantIdx: index("comm_logs_tenant_idx").on(t.tenantId),
  channelIdx: index("comm_logs_channel_idx").on(t.channelId),
  createdIdx: index("comm_logs_created_idx").on(t.createdAt),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
      withCheck: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));

export const ussdSessions = pgTable("ussd_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  sessionId: varchar("session_id", { length: 100 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  consumerId: uuid("consumer_id").references(() => consumers.id),
  currentMenu: varchar("current_menu", { length: 100 }).notNull(),
  menuData: jsonb("menu_data"),
  lastInteraction: timestamp("last_interaction", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  sessionIdx: uniqueIndex("ussd_session_idx").on(t.sessionId),
  phoneIdx: index("ussd_phone_idx").on(t.phoneNumber),
  tenantIdx: index("ussd_tenant_idx").on(t.tenantId),
  consumerIdx: index("ussd_consumer_idx").on(t.consumerId),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
      withCheck: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));

export const tenantSmsProviders = pgTable("tenant_sms_providers", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  provider: varchar("provider", { length: 50 }).notNull(), // "twilio", "africastalking", "infobip"
  channelType: channelTypeEnum("channel_type").notNull().default("SMS"), // Supports SMS, USSD, WHATSAPP
  isActive: boolean("is_active").default(true).notNull(),
  // Credentials stored encrypted in production
  apiKey: text("api_key").notNull(),
  apiSecret: text("api_secret"),
  fromNumber: varchar("from_number", { length: 20 }).notNull(), // sender ID, shortcode or phone number
  // Provider-specific config as JSON
  config: jsonb("config").default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  tenantIdx: index("tenant_sms_providers_tenant_idx").on(t.tenantId),
  uniqueActiveProvider: uniqueIndex("tenant_sms_provider_active_unique").on(t.tenantId, t.provider).where(sql`is_active = true`),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
      withCheck: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));

// ============================================================================
// 25. GOVERNANCE & AUDIT
// ============================================================================

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }),
  entityId: uuid("entity_id"),
  oldData: jsonb("old_data"),
  newData: jsonb("new_data"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  tenantIdx: index("audit_tenant_idx").on(t.tenantId),
  createdIdx: index("audit_created_idx").on(t.createdAt),
  entityIdx: index("audit_entity_idx").on(t.entityType, t.entityId),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
      withCheck: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));

export const consumerFlags = pgTable("consumer_flags", {
  id: uuid("id").defaultRandom().primaryKey(),
  consumerId: uuid("consumer_id").references(() => consumers.id).notNull(),
  flaggedBy: uuid("flagged_by").references(() => users.id),
  reason: text("reason").notNull(),
  status: flagStatusEnum("status").default("ACTIVE").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  pgPolicy("tenant_isolation", {
    for: "all",
    to: "authenticated",
    using: sql`consumer_id IN (select id from consumers where tenant_id = (select tenant_id from users where id = auth.uid()))`,
    withCheck: sql`consumer_id IN (select id from consumers where tenant_id = (select tenant_id from users where id = auth.uid()))`,
  }),
  pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
]);

// ============================================================================
// 26. SYSTEM CONFIGURATION & JOBS
// ============================================================================

export const systemConfig = pgTable("system_config", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  key: varchar("key", { length: 100 }).notNull(),
  value: jsonb("value").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  tenantKey: uniqueIndex("config_tenant_key_idx").on(t.tenantId, t.key),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`tenant_id = (select tenant_id from users where id = auth.uid()) OR tenant_id IS NULL`,
      withCheck: sql`tenant_id = (select tenant_id from users where id = auth.uid()) OR tenant_id IS NULL`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));

export const scheduledJobs = pgTable("scheduled_jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  jobName: varchar("job_name", { length: 255 }).notNull(),
  jobType: varchar("job_type", { length: 50 }).notNull(), // "POINT_EXPIRY", "CAMPAIGN_END", "REPORT_GENERATION"
  cronExpression: varchar("cron_expression", { length: 100 }),
  payload: jsonb("payload"),
  status: jobStatusEnum("status").default("PENDING").notNull(),
  lastRunAt: timestamp("last_run_at", { withTimezone: true }),
  nextRunAt: timestamp("next_run_at", { withTimezone: true }),
  lastError: text("last_error"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  tenantIdx: index("scheduled_jobs_tenant_idx").on(t.tenantId),
  statusIdx: index("scheduled_jobs_status_idx").on(t.status),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
      withCheck: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));

// ============================================================================
// 28. POS/ERP CONNECTIVITY (Innovative)
// ============================================================================

export const tenantApiKeys = pgTable("tenant_api_keys", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  keyPrefix: varchar("key_prefix", { length: 10 }).notNull(),
  keyHash: text("key_hash").notNull(),
  scopes: jsonb("scopes").default(["read", "write"]).notNull(),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
}, (t) => ({
  tenantIdx: index("api_keys_tenant_idx").on(t.tenantId),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
      withCheck: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));

// ============================================================================
// 29. GAMIFICATION (Innovative: Challenges & Badges)
// ============================================================================

export const challenges = pgTable("challenges", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  goalType: challengeGoalTypeEnum("goal_type").notNull(),
  goalValue: numeric("goal_value", { precision: 14, scale: 2 }).notNull(),
  rewardPoints: numeric("reward_points", { precision: 14, scale: 4 }).notNull(),
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }),
  isActive: boolean("is_active").default(true).notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
}, (t) => ({
  tenantIdx: index("challenges_tenant_idx").on(t.tenantId),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
      withCheck: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));

export const consumerChallenges = pgTable("consumer_challenges", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  consumerId: uuid("consumer_id").references(() => consumers.id).notNull(),
  challengeId: uuid("challenge_id").references(() => challenges.id).notNull(),
  currentValue: numeric("current_value", { precision: 14, scale: 2 }).default("0").notNull(),
  status: challengeStatusEnum("status").default("IN_PROGRESS").notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  uniqueProgress: uniqueIndex("consumer_challenge_unique").on(t.consumerId, t.challengeId),
  tenantIdx: index("consumer_challenges_tenant_idx").on(t.tenantId),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
      withCheck: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));

// ============================================================================
// 30. VOUCHER SECURITY (Innovative: Anti-Brute Force)
// ============================================================================

export const voucherRedemptionAttempts = pgTable("voucher_redemption_attempts", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  consumerId: uuid("consumer_id").references(() => consumers.id),
  attemptedCode: varchar("attempted_code", { length: 100 }).notNull(),
  success: boolean("success").notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  deviceFingerprint: text("device_fingerprint"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  tenantIdx: index("voucher_attempts_tenant_idx").on(t.tenantId),
  consumerIdx: index("voucher_attempts_consumer_idx").on(t.consumerId),
  ipIdx: index("voucher_attempts_ip_idx").on(t.ipAddress),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
      withCheck: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));

// ============================================================================
// 31. ENTERPRISE RELIABILITY (Innovative: Health Monitoring)
// ============================================================================

export const integrationHealthLogs = pgTable("integration_health_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  integrationId: uuid("integration_id").references(() => tenantIntegrations.id).notNull(),
  status: varchar("status", { length: 20 }).notNull(), // UP, DOWN, DEGRADED
  latencyMs: integer("latency_ms"),
  errorMessage: text("error_message"),
  checkedAt: timestamp("checked_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  tenantIdx: index("health_logs_tenant_idx").on(t.tenantId),
  integrationIdx: index("health_logs_integration_idx").on(t.integrationId),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
      withCheck: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));

export const badges = pgTable("badges", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  imageUrl: varchar("image_url", { length: 512 }),
  criteria: jsonb("criteria"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
}, (t) => ({
  tenantIdx: index("badges_tenant_idx").on(t.tenantId),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
      withCheck: sql`tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));

export const consumerBadges = pgTable("consumer_badges", {
  id: uuid("id").defaultRandom().primaryKey(),
  consumerId: uuid("consumer_id").references(() => consumers.id).notNull(),
  badgeId: uuid("badge_id").references(() => badges.id).notNull(),
  awardedAt: timestamp("awarded_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  uniqueBadge: uniqueIndex("consumer_badge_unique").on(t.consumerId, t.badgeId),
  policies: [
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "authenticated",
      using: sql`consumer_id IN (select id from consumers where tenant_id = (select tenant_id from users where id = auth.uid()))`,
      withCheck: sql`consumer_id IN (select id from consumers where tenant_id = (select tenant_id from users where id = auth.uid()))`,
    }),
    pgPolicy("admin_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
}));

// ============================================================================
// 27. COMPLETE RELATIONS (Consolidated & Enhanced)

export const tenantsRelations = relations(tenants, ({ many, one }) => ({
  users: many(users),
  organizations: many(organizations),
  consumers: many(consumers),
  products: many(products),
  country: one(countries, { fields: [tenants.countryId], references: [countries.id] }),
  tenantSettings: one(tenantSettings, { fields: [tenants.id], references: [tenantSettings.tenantId] }),
  regions: many(regions),
  towns: many(towns),
  campaigns: many(campaigns),
  promotions: many(promotions),
  wallets: many(wallets),
  purchases: many(purchases),
  rewardCategories: many(rewardCategories),
  rewardItems: many(rewardItems),
  fraudRules: many(fraudRules),
  consumerSegments: many(consumerSegments),
  externalWebhooks: many(externalWebhooks),
  integrations: many(tenantIntegrations),
  channels: many(tenantChannels),
  smsProviders: many(tenantSmsProviders),
  auditLogs: many(auditLogs),
  scheduledJobs: many(scheduledJobs),
  apiKeys: many(tenantApiKeys),
  challenges: many(challenges),
  badges: many(badges),
  pointValueHistory: many(pointValueHistory),
  consumerSessions: many(consumerSessions),
  consumerTierHistory: many(consumerTierHistory),
  salesHierarchyAssignments: many(salesHierarchyAssignments),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  tenant: one(tenants, { fields: [users.tenantId], references: [tenants.id] }),
  approvedRedemptions: many(redemptionsQueue),
  resolvedAlerts: many(fraudAlerts),
  auditLogs: many(auditLogs),
}));

export const countriesRelations = relations(countries, ({ many }) => ({
  regions: many(regions),
  counties: many(counties),
  tenants: many(tenants),
}));

export const regionsRelations = relations(regions, ({ one, many }) => ({
  tenant: one(tenants, { fields: [regions.tenantId], references: [tenants.id] }),
  country: one(countries, { fields: [regions.countryId], references: [countries.id] }),
  towns: many(towns),
}));

export const countiesRelations = relations(counties, ({ one, many }) => ({
  country: one(countries, { fields: [counties.countryId], references: [countries.id] }),
  towns: many(towns),
}));

export const townsRelations = relations(towns, ({ one, many }) => ({
  tenant: one(tenants, { fields: [towns.tenantId], references: [tenants.id] }),
  region: one(regions, { fields: [towns.regionId], references: [regions.id] }),
  county: one(counties, { fields: [towns.countyId], references: [counties.id] }),
  consumers: many(consumers),
  organizations: many(organizations),
}));

export const organizationsRelations = relations(organizations, ({ one, many }) => ({
  tenant: one(tenants, { fields: [organizations.tenantId], references: [tenants.id] }),
  town: one(towns, { fields: [organizations.townId], references: [towns.id] }),
  members: many(organizationMembers),
  purchasesAsDealer: many(purchases),
  vouchers: many(vouchers),
}));

export const organizationMembersRelations = relations(organizationMembers, ({ one }) => ({
  organization: one(organizations, { fields: [organizationMembers.organizationId], references: [organizations.id] }),
  consumer: one(consumers, { fields: [organizationMembers.consumerId], references: [consumers.id] }),
}));

export const consumersRelations = relations(consumers, ({ one, many }) => ({
  tenant: one(tenants, { fields: [consumers.tenantId], references: [tenants.id] }),
  town: one(towns, { fields: [consumers.townId], references: [towns.id] }),
  loyaltyTier: one(tenantTiers, { fields: [consumers.loyaltyTierId], references: [tenantTiers.id] }),
  dealerOrganization: one(organizations, { fields: [consumers.dealerOrganizationId], references: [organizations.id] }),
  referredByConsumer: one(consumers, { fields: [consumers.referredBy], references: [consumers.id] }),
  wallets: many(wallets),
  purchases: many(purchases),
  redemptions: many(redemptionsQueue),
  referralsMade: many(referrals, { relationName: "referrer" }),
  referralsReceived: many(referrals, { relationName: "referred" }),
  fraudAlerts: many(fraudAlerts),
  segmentMemberships: many(segmentMembers),
  consentRecords: many(consentRecords),
  communicationLogs: many(communicationLogs),
  ussdSessions: many(ussdSessions),
  challengeProgress: many(consumerChallenges),
  badges: many(consumerBadges),
  redemptionAttempts: many(voucherRedemptionAttempts),
  sessions: many(consumerSessions),
  tierHistory: many(consumerTierHistory),
}));

export const walletsRelations = relations(wallets, ({ one, many }) => ({
  tenant: one(tenants, { fields: [wallets.tenantId], references: [tenants.id] }),
  transactions: many(transactions),
  consumer: one(consumers, { fields: [wallets.ownerId], references: [consumers.id] }),
}));

export const transactionsRelations = relations(transactions, ({ one, many }) => ({
  tenant: one(tenants, { fields: [transactions.tenantId], references: [tenants.id] }),
  wallet: one(wallets, { fields: [transactions.walletId], references: [wallets.id] }),
  campaign: one(campaigns, { fields: [transactions.campaignId], references: [campaigns.id] }),
  promotion: one(promotions, { fields: [transactions.promotionId], references: [promotions.id] }),
  pointLots: many(pointLots),
  redemption: one(redemptionsQueue, { fields: [transactions.id], references: [redemptionsQueue.transactionId] }),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  tenant: one(tenants, { fields: [products.tenantId], references: [tenants.id] }),
  batches: many(productBatches),
  campaigns: many(campaignProducts),
}));

export const productBatchesRelations = relations(productBatches, ({ one, many }) => ({
  tenant: one(tenants, { fields: [productBatches.tenantId], references: [tenants.id] }),
  product: one(products, { fields: [productBatches.productId], references: [products.id] }),
  cardBatches: many(cardBatches),
  voucherBatches: many(voucherBatches),
}));

export const voucherBatchesRelations = relations(voucherBatches, ({ one, many }) => ({
  tenant: one(tenants, { fields: [voucherBatches.tenantId], references: [tenants.id] }),
  product: one(products, { fields: [voucherBatches.productId], references: [products.id] }),
  campaign: one(campaigns, { fields: [voucherBatches.campaignId], references: [campaigns.id] }),
  vouchers: many(vouchers),
}));

export const vouchersRelations = relations(vouchers, ({ one }) => ({
  batch: one(voucherBatches, { fields: [vouchers.batchId], references: [voucherBatches.id] }),
  redeemer: one(consumers, { fields: [vouchers.redeemedBy], references: [consumers.id] }),
  dealer: one(organizations, { fields: [vouchers.currentDealerId], references: [organizations.id] }),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  tenant: one(tenants, { fields: [campaigns.tenantId], references: [tenants.id] }),
  parent: one(campaigns, { fields: [campaigns.parentCampaignId], references: [campaigns.id], relationName: "campaign_hierarchy" }),
  versions: many(campaigns, { relationName: "campaign_hierarchy" }),
  rules: many(campaignRules),
  products: many(campaignProducts),
  budget: one(campaignBudgets),
}));

export const campaignRulesRelations = relations(campaignRules, ({ one }) => ({
  campaign: one(campaigns, { fields: [campaignRules.campaignId], references: [campaigns.id] }),
}));

export const campaignBudgetsRelations = relations(campaignBudgets, ({ one }) => ({
  campaign: one(campaigns, { fields: [campaignBudgets.campaignId], references: [campaigns.id] }),
}));

export const campaignProductsRelations = relations(campaignProducts, ({ one }) => ({
  campaign: one(campaigns, { fields: [campaignProducts.campaignId], references: [campaigns.id] }),
  product: one(products, { fields: [campaignProducts.productId], references: [products.id] }),
}));

export const rewardCategoriesRelations = relations(rewardCategories, ({ one, many }) => ({
  tenant: one(tenants, { fields: [rewardCategories.tenantId], references: [tenants.id] }),
  rewards: many(rewardItems),
}));

export const rewardItemsRelations = relations(rewardItems, ({ one, many }) => ({
  tenant: one(tenants, { fields: [rewardItems.tenantId], references: [tenants.id] }),
  category: one(rewardCategories, { fields: [rewardItems.categoryId], references: [rewardCategories.id] }),
  redemptions: many(redemptionsQueue),
}));

export const redemptionsQueueRelations = relations(redemptionsQueue, ({ one }) => ({
  transaction: one(transactions, { fields: [redemptionsQueue.transactionId], references: [transactions.id] }),
  rewardItem: one(rewardItems, { fields: [redemptionsQueue.rewardItemId], references: [rewardItems.id] }),
  integration: one(tenantIntegrations, { fields: [redemptionsQueue.integrationId], references: [tenantIntegrations.id] }),
  tenant: one(tenants, { fields: [redemptionsQueue.tenantId], references: [tenants.id] }),
  consumer: one(consumers, { fields: [redemptionsQueue.consumerId], references: [consumers.id] }),
  approver: one(users, { fields: [redemptionsQueue.approvedBy], references: [users.id] }),
}));

export const referralsRelations = relations(referrals, ({ one }) => ({
  tenant: one(tenants, { fields: [referrals.tenantId], references: [tenants.id] }),
  referrer: one(consumers, { fields: [referrals.referrerConsumerId], references: [consumers.id], relationName: "referrer" }),
  referred: one(consumers, { fields: [referrals.referredConsumerId], references: [consumers.id], relationName: "referred" }),
}));

export const fraudRulesRelations = relations(fraudRules, ({ one, many }) => ({
  tenant: one(tenants, { fields: [fraudRules.tenantId], references: [tenants.id] }),
  alerts: many(fraudAlerts),
}));


export const salesHierarchyRelations = relations(salesHierarchy, ({ one, many }) => ({
  tenant: one(tenants, { fields: [salesHierarchy.tenantId], references: [tenants.id] }),
  manager: one(salesHierarchy, { fields: [salesHierarchy.managerId], references: [salesHierarchy.id], relationName: "management" }),
  subordinates: many(salesHierarchy, { relationName: "management" }),
  region: one(regions, { fields: [salesHierarchy.regionId], references: [regions.id] }),
  assignments: many(salesHierarchyAssignments),
}));

export const salesHierarchyAssignmentsRelations = relations(salesHierarchyAssignments, ({ one }) => ({
  tenant: one(tenants, { fields: [salesHierarchyAssignments.tenantId], references: [tenants.id] }),
  staff: one(salesHierarchy, { fields: [salesHierarchyAssignments.staffId], references: [salesHierarchy.id] }),
  organization: one(organizations, { fields: [salesHierarchyAssignments.organizationId], references: [organizations.id] }),
}));

export const consumerSessionsRelations = relations(consumerSessions, ({ one }) => ({
  tenant: one(tenants, { fields: [consumerSessions.tenantId], references: [tenants.id] }),
  consumer: one(consumers, { fields: [consumerSessions.consumerId], references: [consumers.id] }),
}));

export const consumerTierHistoryRelations = relations(consumerTierHistory, ({ one }) => ({
  tenant: one(tenants, { fields: [consumerTierHistory.tenantId], references: [tenants.id] }),
  consumer: one(consumers, { fields: [consumerTierHistory.consumerId], references: [consumers.id] }),
  oldTier: one(tenantTiers, { fields: [consumerTierHistory.oldTierId], references: [tenantTiers.id], relationName: "oldTier" }),
  newTier: one(tenantTiers, { fields: [consumerTierHistory.newTierId], references: [tenantTiers.id], relationName: "newTier" }),
}));

export const pointValueHistoryRelations = relations(pointValueHistory, ({ one }) => ({
  tenant: one(tenants, { fields: [pointValueHistory.tenantId], references: [tenants.id] }),
}));

export const tenantTiersRelations = relations(tenantTiers, ({ one, many }) => ({
  tenant: one(tenants, { fields: [tenantTiers.tenantId], references: [tenants.id] }),
  consumers: many(consumers),
  tierHistoryOld: many(consumerTierHistory, { relationName: "oldTier" }),
  tierHistoryNew: many(consumerTierHistory, { relationName: "newTier" }),
}));


export const fraudAlertsRelations = relations(fraudAlerts, ({ one }) => ({
  tenant: one(tenants, { fields: [fraudAlerts.tenantId], references: [tenants.id] }),
  consumer: one(consumers, { fields: [fraudAlerts.consumerId], references: [consumers.id] }),
  rule: one(fraudRules, { fields: [fraudAlerts.ruleId], references: [fraudRules.id] }),
  resolver: one(users, { fields: [fraudAlerts.resolvedBy], references: [users.id] }),
}));

export const consumerSegmentsRelations = relations(consumerSegments, ({ one, many }) => ({
  tenant: one(tenants, { fields: [consumerSegments.tenantId], references: [tenants.id] }),
  members: many(segmentMembers),
}));

export const segmentMembersRelations = relations(segmentMembers, ({ one }) => ({
  segment: one(consumerSegments, { fields: [segmentMembers.segmentId], references: [consumerSegments.id] }),
  consumer: one(consumers, { fields: [segmentMembers.consumerId], references: [consumers.id] }),
}));

export const consentRecordsRelations = relations(consentRecords, ({ one }) => ({
  tenant: one(tenants, { fields: [consentRecords.tenantId], references: [tenants.id] }),
  consumer: one(consumers, { fields: [consentRecords.consumerId], references: [consumers.id] }),
}));

export const externalWebhooksRelations = relations(externalWebhooks, ({ one, many }) => ({
  tenant: one(tenants, { fields: [externalWebhooks.tenantId], references: [tenants.id] }),
  logs: many(webhookDeliveryLogs),
}));

export const webhookDeliveryLogsRelations = relations(webhookDeliveryLogs, ({ one }) => ({
  webhook: one(externalWebhooks, { fields: [webhookDeliveryLogs.webhookId], references: [externalWebhooks.id] }),
}));

export const tenantIntegrationsRelations = relations(tenantIntegrations, ({ one, many }) => ({
  tenant: one(tenants, { fields: [tenantIntegrations.tenantId], references: [tenants.id] }),
  logs: many(integrationLogs),
  redemptions: many(redemptionsQueue),
  healthLogs: many(integrationHealthLogs),
}));

export const tenantApiKeysRelations = relations(tenantApiKeys, ({ one }) => ({
  tenant: one(tenants, { fields: [tenantApiKeys.tenantId], references: [tenants.id] }),
}));

export const challengesRelations = relations(challenges, ({ one, many }) => ({
  tenant: one(tenants, { fields: [challenges.tenantId], references: [tenants.id] }),
  consumerProgress: many(consumerChallenges),
}));

export const consumerChallengesRelations = relations(consumerChallenges, ({ one }) => ({
  challenge: one(challenges, { fields: [consumerChallenges.challengeId], references: [challenges.id] }),
  consumer: one(consumers, { fields: [consumerChallenges.consumerId], references: [consumers.id] }),
}));

export const badgesRelations = relations(badges, ({ one, many }) => ({
  tenant: one(tenants, { fields: [badges.tenantId], references: [tenants.id] }),
  awardedTo: many(consumerBadges),
}));

export const consumerBadgesRelations = relations(consumerBadges, ({ one }) => ({
  badge: one(badges, { fields: [consumerBadges.badgeId], references: [badges.id] }),
  consumer: one(consumers, { fields: [consumerBadges.consumerId], references: [consumers.id] }),
}));

export const voucherRedemptionAttemptsRelations = relations(voucherRedemptionAttempts, ({ one }) => ({
  tenant: one(tenants, { fields: [voucherRedemptionAttempts.tenantId], references: [tenants.id] }),
  consumer: one(consumers, { fields: [voucherRedemptionAttempts.consumerId], references: [consumers.id] }),
}));

export const integrationHealthLogsRelations = relations(integrationHealthLogs, ({ one }) => ({
  tenant: one(tenants, { fields: [integrationHealthLogs.tenantId], references: [tenants.id] }),
  integration: one(tenantIntegrations, { fields: [integrationHealthLogs.integrationId], references: [tenantIntegrations.id] }),
}));

export const tenantChannelsRelations = relations(tenantChannels, ({ one, many }) => ({
  tenant: one(tenants, { fields: [tenantChannels.tenantId], references: [tenants.id] }),
  logs: many(communicationLogs),
}));

export const communicationLogsRelations = relations(communicationLogs, ({ one }) => ({
  tenant: one(tenants, { fields: [communicationLogs.tenantId], references: [tenants.id] }),
  channel: one(tenantChannels, { fields: [communicationLogs.channelId], references: [tenantChannels.id] }),
  consumer: one(consumers, { fields: [communicationLogs.consumerId], references: [consumers.id] }),
}));

export const ussdSessionsRelations = relations(ussdSessions, ({ one }) => ({
  tenant: one(tenants, { fields: [ussdSessions.tenantId], references: [tenants.id] }),
  consumer: one(consumers, { fields: [ussdSessions.consumerId], references: [consumers.id] }),
}));

export const tenantSmsProvidersRelations = relations(tenantSmsProviders, ({ one }) => ({
  tenant: one(tenants, { fields: [tenantSmsProviders.tenantId], references: [tenants.id] }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  tenant: one(tenants, { fields: [auditLogs.tenantId], references: [tenants.id] }),
  user: one(users, { fields: [auditLogs.userId], references: [users.id] }),
}));

export const scheduledJobsRelations = relations(scheduledJobs, ({ one }) => ({
  tenant: one(tenants, { fields: [scheduledJobs.tenantId], references: [tenants.id] }),
}));
