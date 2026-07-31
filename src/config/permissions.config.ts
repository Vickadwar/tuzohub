import { ModuleKey } from "./modules.config";

/**
 * Enterprise Permission Capability Flags
 */
export interface PermissionFlags {
  uiVisible: boolean;   // Controls sidebar menu item visibility
  canRead: boolean;     // Can view page data and list endpoints
  canCreate?: boolean;  // Can add new records
  canUpdate?: boolean;  // Can edit existing records
  canDelete?: boolean;  // Can delete records
  canApprove?: boolean; // Can approve high-value transactions/payouts
  canExport?: boolean;  // Can export report CSVs/PDFs
}

export type RolePermissionMap = Record<ModuleKey, PermissionFlags>;

/**
 * Role Profiles Catalog Matrix
 */
export const ROLE_PROFILES: Record<string, RolePermissionMap> = {
  // ── 1. SYSTEM ADMIN (Super Admin Platform Governance) ──────────────────────
  SYSTEM_ADMIN: {
    global_dashboard: { uiVisible: true, canRead: true, canExport: true },
    tenants_orgs: { uiVisible: true, canRead: true, canCreate: true, canUpdate: true, canDelete: true, canExport: true },
    pending_registrations: { uiVisible: true, canRead: true, canApprove: true },
    saas_billing: { uiVisible: true, canRead: true, canCreate: true, canUpdate: true, canExport: true },
    super_admin_team: { uiVisible: true, canRead: true, canCreate: true, canUpdate: true, canDelete: true },
    overview: { uiVisible: true, canRead: true, canExport: true },
    consumers: { uiVisible: true, canRead: true, canCreate: true, canUpdate: true, canDelete: true, canExport: true },
    campaigns: { uiVisible: true, canRead: true, canCreate: true, canUpdate: true, canDelete: true },
    rewards: { uiVisible: true, canRead: true, canCreate: true, canUpdate: true, canDelete: true },
    inventory: { uiVisible: true, canRead: true, canCreate: true, canUpdate: true, canDelete: true, canExport: true },
    terminal: { uiVisible: true, canRead: true, canCreate: true },
    transactions: { uiVisible: true, canRead: true, canExport: true },
    redemptions: { uiVisible: true, canRead: true, canApprove: true, canExport: true },
    team_management: { uiVisible: true, canRead: true, canCreate: true, canUpdate: true, canDelete: true },
    setup_masters: { uiVisible: true, canRead: true, canCreate: true, canUpdate: true },
    audit_logs: { uiVisible: true, canRead: true, canExport: true },
    account_profile: { uiVisible: true, canRead: true, canUpdate: true },
  },

  // ── 2. TENANT ADMIN (Organization Executive / Admin) ────────────────────────
  TENANT_ADMIN: {
    global_dashboard: { uiVisible: false, canRead: false },
    tenants_orgs: { uiVisible: false, canRead: false },
    pending_registrations: { uiVisible: false, canRead: false },
    saas_billing: { uiVisible: false, canRead: false },
    super_admin_team: { uiVisible: false, canRead: false },
    overview: { uiVisible: true, canRead: true, canExport: true },
    consumers: { uiVisible: true, canRead: true, canCreate: true, canUpdate: true, canExport: true },
    campaigns: { uiVisible: true, canRead: true, canCreate: true, canUpdate: true, canDelete: true },
    rewards: { uiVisible: true, canRead: true, canCreate: true, canUpdate: true, canDelete: true },
    inventory: { uiVisible: true, canRead: true, canCreate: true, canUpdate: true, canExport: true },
    terminal: { uiVisible: true, canRead: true, canCreate: true },
    transactions: { uiVisible: true, canRead: true, canExport: true },
    redemptions: { uiVisible: true, canRead: true, canCreate: true, canApprove: true, canExport: true },
    team_management: { uiVisible: true, canRead: true, canCreate: true, canUpdate: true, canDelete: true },
    setup_masters: { uiVisible: true, canRead: true, canCreate: true, canUpdate: true },
    audit_logs: { uiVisible: true, canRead: true, canExport: true },
    account_profile: { uiVisible: true, canRead: true, canUpdate: true },
  },

  // ── 3. MANAGER / FINANCE MANAGER ──────────────────────────────────────────
  MANAGER: {
    global_dashboard: { uiVisible: false, canRead: false },
    tenants_orgs: { uiVisible: false, canRead: false },
    pending_registrations: { uiVisible: false, canRead: false },
    saas_billing: { uiVisible: false, canRead: false },
    super_admin_team: { uiVisible: false, canRead: false },
    overview: { uiVisible: true, canRead: true, canExport: true },
    consumers: { uiVisible: true, canRead: true, canCreate: true, canUpdate: true, canExport: true },
    campaigns: { uiVisible: true, canRead: true, canCreate: true, canUpdate: true },
    rewards: { uiVisible: true, canRead: true, canCreate: true, canUpdate: true },
    inventory: { uiVisible: true, canRead: true, canCreate: true, canUpdate: true, canExport: true },
    terminal: { uiVisible: true, canRead: true, canCreate: true },
    transactions: { uiVisible: true, canRead: true, canExport: true },
    redemptions: { uiVisible: true, canRead: true, canApprove: true, canExport: true },
    team_management: { uiVisible: false, canRead: false },
    setup_masters: { uiVisible: false, canRead: false },
    audit_logs: { uiVisible: true, canRead: true },
    account_profile: { uiVisible: true, canRead: true, canUpdate: true },
  },

  // ── 4. OPERATOR / STORE CLERK ──────────────────────────────────────────────
  OPERATOR: {
    global_dashboard: { uiVisible: false, canRead: false },
    tenants_orgs: { uiVisible: false, canRead: false },
    pending_registrations: { uiVisible: false, canRead: false },
    saas_billing: { uiVisible: false, canRead: false },
    super_admin_team: { uiVisible: false, canRead: false },
    overview: { uiVisible: true, canRead: true },
    consumers: { uiVisible: true, canRead: true, canCreate: true },
    campaigns: { uiVisible: false, canRead: false },
    rewards: { uiVisible: true, canRead: true },
    inventory: { uiVisible: true, canRead: true },
    terminal: { uiVisible: true, canRead: true, canCreate: true },
    transactions: { uiVisible: true, canRead: true },
    redemptions: { uiVisible: true, canRead: true, canCreate: true },
    team_management: { uiVisible: false, canRead: false },
    setup_masters: { uiVisible: false, canRead: false },
    audit_logs: { uiVisible: false, canRead: false },
    account_profile: { uiVisible: true, canRead: true, canUpdate: true },
  },

  // ── 5. AGENT / FIELD STAFF ────────────────────────────────────────────────
  AGENT: {
    global_dashboard: { uiVisible: false, canRead: false },
    tenants_orgs: { uiVisible: false, canRead: false },
    pending_registrations: { uiVisible: false, canRead: false },
    saas_billing: { uiVisible: false, canRead: false },
    super_admin_team: { uiVisible: false, canRead: false },
    overview: { uiVisible: true, canRead: true },
    consumers: { uiVisible: true, canRead: true, canCreate: true },
    campaigns: { uiVisible: false, canRead: false },
    rewards: { uiVisible: false, canRead: false },
    inventory: { uiVisible: false, canRead: false },
    terminal: { uiVisible: true, canRead: true, canCreate: true },
    transactions: { uiVisible: false, canRead: false },
    redemptions: { uiVisible: false, canRead: false },
    team_management: { uiVisible: false, canRead: false },
    setup_masters: { uiVisible: false, canRead: false },
    audit_logs: { uiVisible: false, canRead: false },
    account_profile: { uiVisible: true, canRead: true, canUpdate: true },
  },

  // ── 6. VIEWER / AUDITOR (Read-Only) ─────────────────────────────────────────
  VIEWER: {
    global_dashboard: { uiVisible: false, canRead: false },
    tenants_orgs: { uiVisible: false, canRead: false },
    pending_registrations: { uiVisible: false, canRead: false },
    saas_billing: { uiVisible: false, canRead: false },
    super_admin_team: { uiVisible: false, canRead: false },
    overview: { uiVisible: true, canRead: true, canExport: true },
    consumers: { uiVisible: true, canRead: true, canExport: true },
    campaigns: { uiVisible: true, canRead: true },
    rewards: { uiVisible: true, canRead: true },
    inventory: { uiVisible: true, canRead: true, canExport: true },
    terminal: { uiVisible: false, canRead: false },
    transactions: { uiVisible: true, canRead: true, canExport: true },
    redemptions: { uiVisible: true, canRead: true, canExport: true },
    team_management: { uiVisible: false, canRead: false },
    setup_masters: { uiVisible: false, canRead: false },
    audit_logs: { uiVisible: true, canRead: true, canExport: true },
    account_profile: { uiVisible: true, canRead: true },
  },
};

/**
 * Fallback permissions for unrecognized or guest roles
 */
export const DEFAULT_PERMISSION_FLAGS: PermissionFlags = {
  uiVisible: false,
  canRead: false,
  canCreate: false,
  canUpdate: false,
  canDelete: false,
  canApprove: false,
  canExport: false,
};

/**
 * Gets permission flags for a given role and module
 */
export function getModulePermissions(role: string | null | undefined, moduleKey: ModuleKey): PermissionFlags {
  if (!role) return DEFAULT_PERMISSION_FLAGS;
  const roleMap = ROLE_PROFILES[role] || ROLE_PROFILES.VIEWER;
  return roleMap[moduleKey] || DEFAULT_PERMISSION_FLAGS;
}

/**
 * Checks if a role has specific permission on a module
 */
export function hasPermission(
  role: string | null | undefined, 
  moduleKey: ModuleKey, 
  action: keyof PermissionFlags = "canRead"
): boolean {
  const perm = getModulePermissions(role, moduleKey);
  return !!perm[action];
}
