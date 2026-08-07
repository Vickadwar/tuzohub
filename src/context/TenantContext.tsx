"use client";

import React, { createContext, useContext, useMemo } from "react";
import { useApi } from "@/hooks/useApi";
import { resolveRewardTerminology, RewardTerminology } from "@/lib/rewardTerminology";

interface TenantContextType {
  tenant: any | null;
  settings: any | null;
  terminology: RewardTerminology;
  isLoading: boolean;
  isError: any;
  refreshTenant: () => void;
}

const TenantContext = createContext<TenantContextType>({
  tenant: null,
  settings: null,
  terminology: resolveRewardTerminology(),
  isLoading: true,
  isError: null,
  refreshTenant: () => {},
});

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const { data: tenantData, isLoading, isError, mutate: refreshTenant } = useApi("/tenants/me", {
    revalidateOnFocus: false,
    dedupingInterval: 10000,
  });

  const tenant = tenantData || null;
  const settings = tenantData?.settings || null;

  const terminology = useMemo(() => {
    return resolveRewardTerminology({ tenantSettings: settings });
  }, [settings]);

  React.useEffect(() => {
    if (settings?.brandPrimaryColor && typeof document !== "undefined") {
      const color = settings.brandPrimaryColor;
      document.documentElement.style.setProperty("--color-brand-600", color);
      document.documentElement.style.setProperty("--color-brand-500", color);
      document.documentElement.style.setProperty("--color-brand-700", color);
      document.documentElement.style.setProperty("--color-brand-50", color + "15");
      document.documentElement.style.setProperty("--brand-primary", color);
    }
  }, [settings?.brandPrimaryColor]);

  const value = useMemo(
    () => ({
      tenant,
      settings,
      terminology,
      isLoading,
      isError,
      refreshTenant,
    }),
    [tenant, settings, terminology, isLoading, isError, refreshTenant]
  );

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  return useContext(TenantContext);
}
