"use client";

import React, { useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Badge from "@/components/ui/badge/Badge";
import { MODULE_CATALOG, ModuleKey } from "@/config/modules.config";
import { ROLE_PROFILES, PermissionFlags } from "@/config/permissions.config";
import { 
  LockIcon, 
  UserCircleIcon, 
  GroupIcon, 
  GridIcon, 
  CheckCircleIcon, 
  CloseIcon,
  BoxCubeIcon,
  ShootingStarIcon,
  DollarLineIcon,
  ListIcon,
  BoxIconLine
} from "@/icons";

type RoleKey = keyof typeof ROLE_PROFILES;

const ROLE_METADATA: Record<string, { title: string; badgeColor: "primary" | "success" | "warning" | "info" | "error" | "light"; description: string }> = {
  SYSTEM_ADMIN: {
    title: "System Administrator",
    badgeColor: "error",
    description: "Unrestricted platform-wide governance, tenant management, and infrastructure control.",
  },
  TENANT_ADMIN: {
    title: "Tenant Administrator",
    badgeColor: "primary",
    description: "Full management of organization users, vouchers, campaigns, payouts, and settings.",
  },
  MANAGER: {
    title: "Finance & Operations Manager",
    badgeColor: "info",
    description: "Manages financial transactions, voucher logistics, campaign execution, and payout approvals.",
  },
  OPERATOR: {
    title: "Store Clerk / Operator",
    badgeColor: "success",
    description: "Handles daily customer registration, over-the-counter earning, and redemption terminal.",
  },
  AGENT: {
    title: "Field Agent",
    badgeColor: "warning",
    description: "Field onboarding of consumers, loyalty registration, and terminal transactions.",
  },
  VIEWER: {
    title: "Auditor / Viewer",
    badgeColor: "light",
    description: "Read-only access for compliance auditing, telemetry tracking, and exporting reports.",
  },
};

export default function RolesPermissionsPage() {
  const [selectedRole, setSelectedRole] = useState<RoleKey>("TENANT_ADMIN");
  const [permissionState, setPermissionState] = useState(ROLE_PROFILES);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("ALL");

  const currentRoleMeta = ROLE_METADATA[selectedRole] || {
    title: selectedRole,
    badgeColor: "primary",
    description: "Custom role profile configuration.",
  };

  const currentPermissions = permissionState[selectedRole] || {};
  const moduleEntries = Object.entries(MODULE_CATALOG);

  const categories = ["ALL", "Platform Governance", "Analytics & Intelligence", "Core Operations", "Finance & Logistics", "Administration & Setup"];

  const filteredModules = moduleEntries.filter(([_, mod]) => {
    if (activeCategoryFilter === "ALL") return true;
    return mod.category === activeCategoryFilter;
  });

  const togglePermission = (moduleKey: ModuleKey, flag: keyof PermissionFlags) => {
    setPermissionState((prev) => {
      const roleMap = { ...prev[selectedRole] };
      const currentFlags = roleMap[moduleKey] || { uiVisible: false, canRead: false };
      
      const updatedFlags = {
        ...currentFlags,
        [flag]: !currentFlags[flag],
      };

      // Auto-enable canRead if UI is made visible
      if (flag === "uiVisible" && updatedFlags.uiVisible) {
        updatedFlags.canRead = true;
      }

      return {
        ...prev,
        [selectedRole]: {
          ...roleMap,
          [moduleKey]: updatedFlags,
        },
      };
    });
  };

  const visibleCount = Object.values(currentPermissions).filter((p) => p.uiVisible).length;
  const readCount = Object.values(currentPermissions).filter((p) => p.canRead).length;
  const approveCount = Object.values(currentPermissions).filter((p) => p.canApprove).length;

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumb */}
      <PageBreadcrumb pageTitle="Roles & Module Profiles" />

      {/* Page Description Header */}
      <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-white/[0.06] dark:bg-white/[0.02]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400 shrink-0">
              <LockIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white font-mono tracking-tight">
                  Enterprise RBAC Governance
                </h1>
                <Badge color="primary" size="sm">Zero-Schema Architecture</Badge>
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-3xl">
                Configure role profiles, fine-grained CRUD capabilities, and sidebar menu visibility across all functional platform modules.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Role Profile Selection Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {(Object.keys(ROLE_PROFILES) as RoleKey[]).map((rKey) => {
          const meta = ROLE_METADATA[rKey] || { title: rKey, badgeColor: "primary", description: "" };
          const isSelected = selectedRole === rKey;
          return (
            <button
              key={rKey}
              onClick={() => setSelectedRole(rKey)}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? "border-brand-500 bg-brand-500/5 dark:bg-brand-500/10 shadow-sm ring-1 ring-brand-500/30"
                  : "border-gray-200/80 bg-white hover:border-gray-300 dark:border-white/[0.06] dark:bg-white/[0.02] dark:hover:border-white/10"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold font-mono uppercase text-gray-400 tracking-wider">
                    {rKey}
                  </span>
                  {isSelected && (
                    <span className="h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
                  )}
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                  {meta.title}
                </h3>
              </div>
              <div className="mt-3 pt-2 border-t border-gray-100 dark:border-white/[0.06] flex items-center justify-between">
                <Badge color={meta.badgeColor} size="sm">
                  Profile
                </Badge>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Role Summary Banner */}
      <div className="rounded-2xl border border-brand-500/20 bg-brand-500/[0.03] p-5 dark:border-brand-500/30 dark:bg-brand-500/[0.05] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {currentRoleMeta.title}
            </h2>
            <Badge color={currentRoleMeta.badgeColor} size="sm">
              {selectedRole}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
            {currentRoleMeta.description}
          </p>
        </div>

        {/* Telemetry Chips */}
        <div className="flex items-center gap-4 shrink-0 font-mono text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-white/5 border border-gray-200/80 dark:border-white/10 text-center">
            <span className="block text-[10px] text-gray-400 font-sans uppercase font-semibold">Sidebar Visible</span>
            <span className="font-bold text-brand-600 dark:text-brand-400">{visibleCount} Modules</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-white/5 border border-gray-200/80 dark:border-white/10 text-center">
            <span className="block text-[10px] text-gray-400 font-sans uppercase font-semibold">Read Access</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{readCount} Modules</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-white/5 border border-gray-200/80 dark:border-white/10 text-center">
            <span className="block text-[10px] text-gray-400 font-sans uppercase font-semibold">Payout Approval</span>
            <span className="font-bold text-purple-600 dark:text-purple-400">{approveCount} Modules</span>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategoryFilter(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeCategoryFilter === cat
                ? "bg-gray-900 text-white dark:bg-white dark:text-gray-950"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10"
            }`}
          >
            {cat === "ALL" ? "All Modules" : cat}
          </button>
        ))}
      </div>

      {/* Enterprise Permission Matrix Table */}
      <div className="rounded-2xl border border-gray-200/80 bg-white overflow-hidden shadow-sm dark:border-white/[0.06] dark:bg-white/[0.02]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.01] text-[11px] font-bold uppercase tracking-wider text-gray-400">
                <th className="py-3.5 px-5">Module Profile</th>
                <th className="py-3.5 px-5">Category</th>
                <th className="py-3.5 px-4 text-center">Sidebar Menu</th>
                <th className="py-3.5 px-4 text-center">Read</th>
                <th className="py-3.5 px-4 text-center">Create</th>
                <th className="py-3.5 px-4 text-center">Update</th>
                <th className="py-3.5 px-4 text-center">Delete</th>
                <th className="py-3.5 px-4 text-center">Approve</th>
                <th className="py-3.5 px-4 text-center">Export</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.04] text-xs">
              {filteredModules.map(([mKey, mod]) => {
                const flags: PermissionFlags = currentPermissions[mKey as ModuleKey] || { uiVisible: false, canRead: false };

                return (
                  <tr key={mKey} className="hover:bg-gray-50/60 dark:hover:bg-white/[0.01] transition-colors">
                    {/* Module Column */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-600 dark:text-gray-300 font-mono font-bold text-xs shrink-0">
                          {mod.label.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white leading-tight">
                            {mod.label}
                          </p>
                          <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                            {mod.defaultRoute}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category Column */}
                    <td className="py-4 px-5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400">
                        {mod.category}
                      </span>
                    </td>

                    {/* Sidebar Menu Toggle */}
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => togglePermission(mKey as ModuleKey, "uiVisible")}
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-lg transition-all ${
                          flags.uiVisible
                            ? "bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400 border border-brand-500/20"
                            : "bg-gray-100 text-gray-400 dark:bg-white/5 dark:text-gray-500 hover:bg-gray-200"
                        }`}
                        title="Toggle Sidebar Visibility"
                      >
                        {flags.uiVisible ? <CheckCircleIcon className="w-4 h-4" /> : <CloseIcon className="w-3.5 h-3.5" />}
                      </button>
                    </td>

                    {/* Read Capability */}
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => togglePermission(mKey as ModuleKey, "canRead")}
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-lg transition-all ${
                          flags.canRead
                            ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-gray-100 text-gray-400 dark:bg-white/5 dark:text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {flags.canRead ? <CheckCircleIcon className="w-4 h-4" /> : <CloseIcon className="w-3.5 h-3.5" />}
                      </button>
                    </td>

                    {/* Create Capability */}
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => togglePermission(mKey as ModuleKey, "canCreate")}
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-lg transition-all ${
                          flags.canCreate
                            ? "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-500/20"
                            : "bg-gray-100 text-gray-300 dark:bg-white/5 dark:text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {flags.canCreate ? <CheckCircleIcon className="w-4 h-4" /> : <CloseIcon className="w-3.5 h-3.5" />}
                      </button>
                    </td>

                    {/* Update Capability */}
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => togglePermission(mKey as ModuleKey, "canUpdate")}
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-lg transition-all ${
                          flags.canUpdate
                            ? "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-500/20"
                            : "bg-gray-100 text-gray-300 dark:bg-white/5 dark:text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {flags.canUpdate ? <CheckCircleIcon className="w-4 h-4" /> : <CloseIcon className="w-3.5 h-3.5" />}
                      </button>
                    </td>

                    {/* Delete Capability */}
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => togglePermission(mKey as ModuleKey, "canDelete")}
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-lg transition-all ${
                          flags.canDelete
                            ? "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-500/20"
                            : "bg-gray-100 text-gray-300 dark:bg-white/5 dark:text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {flags.canDelete ? <CheckCircleIcon className="w-4 h-4" /> : <CloseIcon className="w-3.5 h-3.5" />}
                      </button>
                    </td>

                    {/* Approve Capability */}
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => togglePermission(mKey as ModuleKey, "canApprove")}
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-lg transition-all ${
                          flags.canApprove
                            ? "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 border border-purple-500/20"
                            : "bg-gray-100 text-gray-300 dark:bg-white/5 dark:text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {flags.canApprove ? <CheckCircleIcon className="w-4 h-4" /> : <CloseIcon className="w-3.5 h-3.5" />}
                      </button>
                    </td>

                    {/* Export Capability */}
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => togglePermission(mKey as ModuleKey, "canExport")}
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-lg transition-all ${
                          flags.canExport
                            ? "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 border border-indigo-500/20"
                            : "bg-gray-100 text-gray-300 dark:bg-white/5 dark:text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {flags.canExport ? <CheckCircleIcon className="w-4 h-4" /> : <CloseIcon className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
