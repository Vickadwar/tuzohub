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
import ModernSelect from "@/components/ui/ModernSelect";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function TownDetail({ params }: PageProps) {
  const resolvedParams = use(params as any) as any;
  const id = resolvedParams?.id;

  const { data: town, isLoading, isError, mutate } = useApi<any>(`/locations/towns/${id}`);
  const { data: organizations } = useApi<any[]>("/organizations");
  const { data: regions } = useApi<any[]>("/locations/regions");

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState<any>({});

  useEffect(() => {
    if (town) {
      setEditData(town.data || town);
    }
  }, [town]);

  if (isLoading || !town) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  const townData = town.data || town;
  const townOrgs = organizations?.filter(o => o.townId === id) || [];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await authenticatedFetch(`/api/locations/towns/${id}`, {
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200/80 dark:border-white/[0.06] pb-5">
        <div className="flex items-center gap-4">
          <Link
            href="/settings/towns"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>

          {/* Rounded Avatar Circle */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold text-sm border border-sky-500/20 shadow-2xs">
            {townData.name?.charAt(0) || "T"}
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                {townData.name}
              </h1>
              <Badge color="info" size="sm">
                District Node
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Town analytics · {townOrgs.length} registered organizations
            </p>
          </div>
        </div>

        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-brand-500/20 transition disabled:opacity-50"
        >
          {isSaving ? "Saving..." : isEditing ? "Save changes" : "Edit town"}
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 xl:col-span-8 space-y-6">
          {/* Metadata Card */}
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4 dark:border-white/5">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Location Data</h3>
            </div>
            <div className="p-6 grid grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Town Name</label>
                {isEditing ? (
                  <input
                    className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 text-xs font-medium text-gray-900 shadow-2xs dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                    value={editData.name}
                    onChange={e => setEditData({...editData, name: e.target.value})}
                  />
                ) : (
                  <p className="text-xs font-bold text-gray-900 dark:text-white">{townData.name}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Parent Region</label>
                {isEditing ? (
                  <ModernSelect
                    options={regions?.map(r => ({ value: r.id, label: r.name })) || []}
                    value={editData.regionId}
                    onChange={val => setEditData({...editData, regionId: val})}
                  />
                ) : (
                  <p className="text-xs font-bold text-gray-900 dark:text-white">{townData.region?.name || "Not assigned"}</p>
                )}
              </div>
            </div>
          </div>

          {/* Local Organizations */}
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4 dark:border-white/5 flex justify-between items-center">
              <span className="text-sm font-bold text-gray-900 dark:text-white">Active Organizations</span>
              <Badge color="light">{townOrgs.length} found</Badge>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 dark:bg-white/[0.01]">
                  <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Organization</TableCell>
                  <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Primary Category</TableCell>
                  <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Status</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                {townOrgs.length > 0 ? townOrgs.map(o => (
                  <TableRow key={o.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <TableCell className="py-3.5 px-6 text-xs font-bold">
                      <Link href={`/settings/organizations/${o.id}`} className="text-brand-600 hover:text-brand-700 dark:text-brand-400 transition">
                        {o.name}
                      </Link>
                    </TableCell>
                    <TableCell className="py-3.5 px-6 text-xs text-gray-500">
                      <Badge size="sm" color="light">{o.type}</Badge>
                    </TableCell>
                    <TableCell className="py-3.5 px-6 text-xs">
                      <Badge size="sm" color={o.isActive ? "success" : "light"}>{o.isActive ? "Active" : "Disabled"}</Badge>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={3} className="py-12 text-center text-xs font-semibold text-gray-400 italic">
                      No organizations registered in this town.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-4 space-y-6">
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Local Performance</h3>
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Lifting Value</span>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">KES 420.5k</p>
                <p className="text-[11px] text-emerald-500 font-semibold mt-1">↑ 14.2% vs last quarter</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
