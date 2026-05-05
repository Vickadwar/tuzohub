"use client";
import React, { useEffect, useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import { GroupIcon, BoxCubeIcon, PieChartIcon, TableIcon } from "@/icons";

import EcosystemCirculationChart from "@/components/platform/EcosystemCirculationChart";

export default function PlatformDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/system/stats")
      .then(res => res.json())
      .then(result => {
        if (result.success) setStats(result.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch platform stats", err);
        setLoading(false);
      });
  }, []);

  const statCards = [
    { label: "Total Tenants", value: stats?.totalTenants || 0, icon: <GroupIcon />, color: "brand" },
    { label: "Active Nodes", value: stats?.activeTenants || 0, icon: <PieChartIcon />, color: "success" },
    { label: "Global Points", value: parseFloat(stats?.globalPointsCirculation || "0").toLocaleString(), icon: <TableIcon />, color: "warning" },
    { label: "Total Consumers", value: stats?.totalConsumers || 0, icon: <BoxCubeIcon />, color: "info" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Platform Governance
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time aggregate data across all registered loyalty tenants.
          </p>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-600 rounded-full border border-brand-100 shadow-sm">
           <span className="relative flex h-2 w-2">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
           </span>
           <span className="text-[10px] font-bold uppercase tracking-widest">Global Master Monitor</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
         {statCards.map((stat, idx) => (
            <div key={idx} className="rounded-3xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 shadow-theme-xs hover:shadow-theme-md transition-all">
               <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl bg-${stat.color === 'brand' ? 'brand-500' : stat.color + '-500'}/10 text-${stat.color === 'brand' ? 'brand-500' : stat.color + '-500'}`}>
                     {stat.icon}
                  </div>
                  <div>
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                     <p className="text-2xl font-black text-gray-900 dark:text-white leading-none">
                        {loading ? "..." : stat.value}
                     </p>
                  </div>
               </div>
            </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2">
            <ComponentCard title="Ecosystem Scale (Circulation)">
               <EcosystemCirculationChart data={stats?.tenantDistribution || []} loading={loading} />
            </ComponentCard>
         </div>

         <ComponentCard title="Compliance Health">
            <div className="space-y-6">
               <div>
                  <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-wide">
                     <span className="text-gray-500">Active vs Total</span>
                     <span className="text-brand-600">{Math.round(((stats?.activeTenants || 0) / (stats?.totalTenants || 1)) * 100)}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                     <div 
                        className="h-full bg-brand-500 transition-all duration-1000" 
                        style={{ width: `${((stats?.activeTenants || 0) / (stats?.totalTenants || 1)) * 100}%` }}
                     ></div>
                  </div>
               </div>

               <div className="p-5 rounded-2xl bg-amber-50 border border-amber-100">
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-2">Pending Action</p>
                  <div className="flex items-center justify-between">
                     <p className="text-2xl font-black text-amber-900">{stats?.pendingRegistrations || 0}</p>
                     <button 
                        onClick={() => window.location.href='/admin/registrations'}
                        className="px-4 py-2 bg-white text-amber-700 text-xs font-bold rounded-lg border border-amber-200 shadow-sm hover:bg-amber-100 transition"
                     >
                        Review Now
                     </button>
                  </div>
               </div>
            </div>
         </ComponentCard>
      </div>
    </div>
  );
}
