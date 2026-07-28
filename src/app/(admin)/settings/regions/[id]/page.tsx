"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import Badge from "@/components/ui/badge/Badge";
import { useApi, authenticatedFetch } from "@/hooks/useApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RegionDetail({ params }: PageProps) {
  const resolvedParams = use(params as any) as any;
  const id = resolvedParams?.id;

  const { data: region, isLoading, isError, mutate } = useApi<any>(`/locations/regions/${id}`);
  const { data: organizations } = useApi<any[]>("/organizations");
  const { data: towns } = useApi<any[]>("/locations/towns");

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState<any>({});

  useEffect(() => {
    if (region) {
      setEditData(region.data || region);
    }
  }, [region]);

  if (isLoading || !region) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  const regionData = region.data || region;
  const regionOrgs = organizations?.filter(o => o.regionId === id) || [];
  const regionTowns = towns?.filter(t => t.regionId === id) || [];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await authenticatedFetch(`/api/locations/regions/${id}`, {
        method: "PUT",
        body: JSON.stringify(editData),
      });
      if (res.success) {
        setIsEditing(false);
        mutate();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200/80 dark:border-white/[0.06] pb-5">
        <div className="flex items-center gap-4">
          <Link
            href="/settings/regions"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>

          {/* Rounded Avatar Circle */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-sm border border-emerald-500/20 shadow-2xs">
            {regionData.name?.charAt(0) || "R"}
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                {regionData.name}
              </h1>
              <Badge color="success" size="sm">
                Territory
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Region overview · {regionTowns.length} towns · {regionOrgs.length} organizations
            </p>
          </div>
        </div>

        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-brand-500/20 transition disabled:opacity-50"
        >
          {isSaving ? "Saving..." : isEditing ? "Save region" : "Edit region"}
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 xl:col-span-8 space-y-6">
          {/* Detailed Info */}
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4 dark:border-white/5">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Region Details</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-1">Region Name</label>
                  {isEditing ? (
                    <input
                      className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 text-xs font-medium text-gray-900 shadow-2xs dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                      value={editData.name}
                      onChange={e => setEditData({...editData, name: e.target.value})}
                    />
                  ) : (
                    <p className="text-xs font-bold text-gray-900 dark:text-white">{regionData.name}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-1">Country</label>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">{regionData.country?.name || "Kenya"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Organizations List */}
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4 dark:border-white/5 flex justify-between items-center">
              <span className="text-sm font-bold text-gray-900 dark:text-white">Organizations in {regionData.name}</span>
              <Badge color="light">{regionOrgs.length}</Badge>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 dark:bg-white/[0.01]">
                  <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Organization</TableCell>
                  <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Type</TableCell>
                  <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Town</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                {regionOrgs.length > 0 ? regionOrgs.map(o => (
                  <TableRow key={o.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <TableCell className="py-3.5 px-6 text-xs font-bold">
                      <Link href={`/settings/organizations/${o.id}`} className="text-brand-600 hover:text-brand-700 dark:text-brand-400 transition">
                        {o.name}
                      </Link>
                    </TableCell>
                    <TableCell className="py-3.5 px-6 text-xs text-gray-500">
                      <Badge size="sm" color="light">{o.type}</Badge>
                    </TableCell>
                    <TableCell className="py-3.5 px-6 text-xs text-gray-500 font-medium">{o.town?.name || "—"}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={3} className="py-12 text-center text-xs font-semibold text-gray-400 italic">
                      No organizations mapped to this region.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-4 space-y-6">
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Regional Performance</h3>
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Total Redemptions</span>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">KES 1.2M</p>
              </div>
              <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/20">
                <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Active Consumers</span>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">4.5k</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 via-gray-950 to-black border border-gray-800 p-6 rounded-2xl text-white shadow-xl space-y-3 relative overflow-hidden">
            <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Analytics Insight</span>
            <h4 className="text-sm font-bold text-white">Leading District</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              District hubs in this region are synchronized with sales personnel to maximize consumer point accrual velocity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
