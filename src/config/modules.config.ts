/**
 * Module Profile Catalog
 * Central taxonomy of all functional modules within TuzoHub platform.
 */

export type ModuleCategory = 
  | "Platform Governance" 
  | "Analytics & Intelligence" 
  | "Core Operations" 
  | "Finance & Logistics" 
  | "Administration & Setup";

export type ModuleKey = 
  // Super Admin Governance
  | "global_dashboard"
  | "tenants_orgs"
  | "pending_registrations"
  | "saas_billing"
  | "super_admin_team"
  // Operational Modules
  | "overview"
  | "consumers"
  | "campaigns"
  | "rewards"
  | "inventory"
  | "terminal"
  | "transactions"
  | "redemptions"
  | "team_management"
  // Setup & Governance
  | "setup_masters"
  | "audit_logs"
  | "account_profile";

export interface ModuleDefinition {
  key: ModuleKey;
  label: string;
  category: ModuleCategory;
  defaultRoute: string;
  description: string;
  isSystemModule?: boolean;
}

export const MODULE_CATALOG: Record<ModuleKey, ModuleDefinition> = {
  // Super Admin Modules
  global_dashboard: {
    key: "global_dashboard",
    label: "Global Dashboard",
    category: "Platform Governance",
    defaultRoute: "/platform/dashboard",
    description: "System-wide multi-tenant telemetry and revenue analytics.",
    isSystemModule: true,
  },
  tenants_orgs: {
    key: "tenants_orgs",
    label: "Organizations & Tenants",
    category: "Platform Governance",
    defaultRoute: "/platform/tenants",
    description: "Multi-tenant workspace provisioning and onboarding.",
    isSystemModule: true,
  },
  pending_registrations: {
    key: "pending_registrations",
    label: "Pending Registrations",
    category: "Platform Governance",
    defaultRoute: "/admin/registrations",
    description: "Approval queue for new tenant onboarding requests.",
    isSystemModule: true,
  },
  saas_billing: {
    key: "saas_billing",
    label: "SaaS Billing & Invoices",
    category: "Platform Governance",
    defaultRoute: "/platform/billing",
    description: "Platform tier subscriptions and invoice ledgers.",
    isSystemModule: true,
  },
  super_admin_team: {
    key: "super_admin_team",
    label: "Super Admin Team",
    category: "Platform Governance",
    defaultRoute: "/platform/team",
    description: "System administrator access management.",
    isSystemModule: true,
  },

  // Operational Modules
  overview: {
    key: "overview",
    label: "Overview & Analytics",
    category: "Analytics & Intelligence",
    defaultRoute: "/overview",
    description: "Tenant operational stats, volume metrics, and campaign KPIs.",
  },
  consumers: {
    key: "consumers",
    label: "Consumer Profile CRM",
    category: "Core Operations",
    defaultRoute: "/consumers",
    description: "End-user wallets, identity KYC, and activity history.",
  },
  campaigns: {
    key: "campaigns",
    label: "Campaign Engine",
    category: "Core Operations",
    defaultRoute: "/campaigns",
    description: "Automated point-earning rules and promotional SMS broadcasts.",
  },
  rewards: {
    key: "rewards",
    label: "Rewards Catalog",
    category: "Core Operations",
    defaultRoute: "/rewards",
    description: "Redeemable merchandise, airtime, and cash reward definitions.",
  },
  inventory: {
    key: "inventory",
    label: "Products & Voucher Inventory",
    category: "Finance & Logistics",
    defaultRoute: "/vouchers",
    description: "SKU catalog, production batches, and voucher serials.",
  },
  terminal: {
    key: "terminal",
    label: "POS & Agent Terminal",
    category: "Core Operations",
    defaultRoute: "/terminal",
    description: "Over-the-counter point issuance and manual voucher redemption.",
  },
  transactions: {
    key: "transactions",
    label: "Financial Ledger & Tx",
    category: "Finance & Logistics",
    defaultRoute: "/transactions",
    description: "Double-entry debit/credit ledger and audit entries.",
  },
  redemptions: {
    key: "redemptions",
    label: "Redemptions & Payouts",
    category: "Finance & Logistics",
    defaultRoute: "/redemptions",
    description: "Automated M-Pesa B2C payout queues and approval actions.",
  },
  team_management: {
    key: "team_management",
    label: "Team & Staff Management",
    category: "Administration & Setup",
    defaultRoute: "/team",
    description: "Tenant user roles, staff permissions, and access assignment.",
  },

  // Setup & Governance
  setup_masters: {
    key: "setup_masters",
    label: "Setup & Masters",
    category: "Administration & Setup",
    defaultRoute: "/settings",
    description: "Territory regions, sales hierarchy, and organization masters.",
  },
  audit_logs: {
    key: "audit_logs",
    label: "Audit & Security Logs",
    category: "Platform Governance",
    defaultRoute: "/audit-logs",
    description: "Security events, auth attempts, and administrative telemetry.",
  },
  account_profile: {
    key: "account_profile",
    label: "Account Profile",
    category: "Administration & Setup",
    defaultRoute: "/profile",
    description: "Personal account credentials and security settings.",
  },
};
