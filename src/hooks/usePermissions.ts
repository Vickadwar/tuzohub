"use client";

import { useUser } from "@/context/UserContext";
import { ModuleKey } from "@/config/modules.config";
import { getModulePermissions, hasPermission, PermissionFlags, ROLE_PROFILES } from "@/config/permissions.config";

export function usePermissions() {
  const { user, loading } = useUser();
  const role = user?.role || null;

  /**
   * Get permissions for a specific module
   */
  const getPermissions = (moduleKey: ModuleKey): PermissionFlags => {
    return getModulePermissions(role, moduleKey);
  };

  /**
   * Check if user can perform an action on a module
   */
  const can = (moduleKey: ModuleKey, action: keyof PermissionFlags = "canRead"): boolean => {
    if (loading) return false;
    return hasPermission(role, moduleKey, action);
  };

  /**
   * Check if a module should be visible in the navigation sidebar
   */
  const isModuleVisible = (moduleKey: ModuleKey): boolean => {
    if (loading) return true; // Show placeholder during hydration
    return hasPermission(role, moduleKey, "uiVisible") && hasPermission(role, moduleKey, "canRead");
  };

  return {
    role,
    loading,
    getPermissions,
    can,
    isModuleVisible,
    allRoleProfiles: ROLE_PROFILES,
  };
}
