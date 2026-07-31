"use client";

import React from "react";
import Link from "next/link";
import ComponentCard from "@/components/common/ComponentCard";
import { GroupIcon, BoxCubeIcon, PieChartIcon, TableIcon } from "@/icons";
import EcosystemCirculationChart from "@/components/platform/EcosystemCirculationChart";
import { useApi } from "@/hooks/useApi";

export default function PlatformDashboard() {
  const { data, isLoading } = useApi<any>("/system/stats");
  const stats = data?.data || data;

  const statCards = [
    { 
      label: "Total Organizations", 
      value: stats?.totalTenants ?? 0, 
      icon: <GroupIcon className="w-5 h-5" />, 
      color: "brand",
      desc: "Registered loyalty tenants" 
    },
    { 
      label: "Active Platform Nodes", 
      value: stats?.activeTenants ?? 0, 
      icon: <PieChartIcon className="w-5 h-5" />, 
      color: "emerald",
      desc: "Live operational accounts" 
    },
    { 
      label: "Global Points Circulation", 
      value: parseFloat(stats?.globalPointsCirculation || "0").toLocaleString(), 
      icon: <TableIcon className="w-5 h-5" />, 
      color: "amber",
      desc: "Across all active wallets" 
    },
    { 
      label: "Total Platform Consumers", 
      value: stats?.totalConsumers ?? 0, 
      icon: <BoxCubeIcon className="w-5 h-5" />, 
      color: "blue",
      desc: "Registered end-users" 
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* ── Page Header Bar ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200/80 dark:border-white/[0.06] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              Super Admin Command Center
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold border border-brand-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
              Global Telemetry
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Real-time aggregate data, multi-tenant node management, and ecosystem compliance monitoring.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/registrations"
            className="px-4 py-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold hover:bg-amber-500/20 transition flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            Review Registrations ({stats?.pendingRegistrations || 0})
          </Link>
          <Link
            href="/platform/tenants"
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition shadow-lg shadow-brand-500/20 flex items-center gap-1.5"
          >
            Manage Tenants
          </Link>
        </div>
      </div>

      {/* ── Metrics Cards Grid ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <div 
            key={idx} 
            className="rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-white/[0.06] dark:bg-white/[0.02] shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                {stat.label}
              </span>
              <div className={`p-2.5 rounded-xl bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400`}>
                {stat.icon}
              </div>
            </div>
            <div className="mt-4">
              <h4 className="text-2xl font-bold font-mono tracking-tight text-gray-900 dark:text-white">
                {isLoading ? "..." : stat.value}
              </h4>
              <p className="text-[11px] text-gray-400 mt-0.5">{stat.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Analytics & Compliance Bento Grid ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ComponentCard title="Ecosystem Points Circulation Distribution">
            <EcosystemCirculationChart data={stats?.tenantDistribution || []} loading={isLoading} />
          </ComponentCard>
        </div>

        <ComponentCard title="System Health & Compliance">
          <div className="space-y-6 py-2">
            <div>
              <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-wide">
                <span className="text-gray-500">Active Tenant Node Ratio</span>
                <span className="text-brand-600 dark:text-brand-400">
                  {stats?.totalTenants ? Math.round(((stats?.activeTenants || 0) / stats.totalTenants) * 100) : 0}%
                </span>
              </div>
              <div className="h-2.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-brand-500 transition-all duration-1000" 
                  style={{ width: `${stats?.totalTenants ? ((stats?.activeTenants || 0) / stats.totalTenants) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Pending Tenant Approvals</p>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-white">Action Needed</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-black text-gray-900 dark:text-white">{stats?.pendingRegistrations || 0}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">Organizations awaiting KYC review</p>
                </div>
                <Link 
                  href="/admin/registrations"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
                >
                  Review Queue
                </Link>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-200">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Isolated Multi-Tenant Security</h4>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                All <strong>{stats?.totalTenants || 0}</strong> tenants operate under strict row-level security (RLS) with dedicated financial ledger partitions.
              </p>
            </div>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
