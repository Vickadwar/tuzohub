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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500 dark:border-white/10 dark:border-t-brand-400"></div>
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
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 rounded-lg bg-white p-6 border border-gray-200 shadow-sm dark:bg-[#18181b] dark:border-white/10">
        <div className="flex items-center gap-5">
          <Link href="/settings/towns" className="h-10 w-10 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5 transition-colors">
            <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          </Link>
          <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-orange-100 text-orange-700 font-bold text-lg dark:bg-orange-500/20 dark:text-orange-400">
            {townData.name?.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{townData.name}</h1>
            <p className="text-sm text-gray-500">Town Analytics · {townOrgs.length} Registered Organizations</p>
          </div>
        </div>
        <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} className="px-4 py-2 bg-brand-600 text-white rounded-md text-sm font-medium hover:bg-brand-700 transition-colors">
          {isSaving ? "Saving..." : isEditing ? "Save Changes" : "Edit Town"}
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 xl:col-span-8 space-y-6">
          {/* Metadata Card */}
          <div className="bg-white border border-gray-200 rounded-lg dark:bg-[#18181b] dark:border-white/10 overflow-hidden text-sm">
             <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 font-semibold">Location Data</div>
             <div className="p-6 grid grid-cols-2 gap-6">
                <div>
                  <label className="text-gray-500 block mb-1">Town Name</label>
                  {isEditing ? (
                    <input className="w-full h-10 px-3 border border-gray-200 rounded-md dark:bg-white/5 dark:border-white/10 text-gray-900 dark:text-white" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} />
                  ) : (
                    <p className="font-medium text-gray-900 dark:text-white">{townData.name}</p>
                  )}
                </div>
                <div>
                  <label className="text-gray-500 block mb-1">Parent Region</label>
                  {isEditing ? (
                    <ModernSelect
                       options={regions?.map(r => ({ value: r.id, label: r.name })) || []}
                       value={editData.regionId}
                       onChange={val => setEditData({...editData, regionId: val})}
                    />
                  ) : (
                    <p className="font-medium text-gray-900 dark:text-white">{townData.region?.name || "Not Assigned"}</p>
                  )}
                </div>
             </div>
          </div>

          {/* Local Organizations */}
          <div className="bg-white border border-gray-200 rounded-lg dark:bg-[#18181b] dark:border-white/10 overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                <span className="font-semibold text-sm">Active Organizations</span>
                <Badge color="light">{townOrgs.length} Found</Badge>
             </div>
             <Table>
                <TableHeader className="bg-gray-50 dark:bg-white/5">
                   <TableRow>
                      <TableCell isHeader className="px-6 py-3 text-xs">Organization</TableCell>
                      <TableCell isHeader className="px-6 py-3 text-xs">Primary Category</TableCell>
                      <TableCell isHeader className="px-6 py-3 text-xs">Status</TableCell>
                   </TableRow>
                </TableHeader>
                <TableBody>
                   {townOrgs.length > 0 ? townOrgs.map(o => (
                      <TableRow key={o.id}>
                         <TableCell className="px-6 py-4 text-sm font-medium"><Link href={`/settings/organizations/${o.id}`} className="hover:text-brand-600">{o.name}</Link></TableCell>
                         <TableCell className="px-6 py-4 text-sm text-gray-500"><Badge size="sm" color="light">{o.type}</Badge></TableCell>
                         <TableCell className="px-6 py-4 text-sm">
                            <Badge size="sm" color={o.isActive ? "success" : "light"}>{o.isActive ? "Active" : "Disabled"}</Badge>
                         </TableCell>
                      </TableRow>
                   )) : (
                      <TableRow><TableCell colSpan={3} className="text-center py-8 text-gray-500 text-sm">No organizations registered in this town.</TableCell></TableRow>
                   )}
                </TableBody>
             </Table>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-4 space-y-6">
           <div className="bg-white border border-gray-200 rounded-lg dark:bg-[#18181b] dark:border-white/10 p-6">
              <h3 className="font-semibold text-sm mb-4">Local Performance</h3>
              <div className="space-y-4">
                 <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20">
                    <span className="text-xs text-orange-600 dark:text-orange-400 font-bold uppercase">Lifting Value</span>
                    <p className="text-2xl font-bold mt-1">KES 420.5k</p>
                    <p className="text-[10px] text-orange-600 mt-1 opacity-80">↑ 14.2% from last quarter</p>
                 </div>
                 <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase">Reward Redemption %</span>
                    <p className="text-2xl font-bold mt-1">68%</p>
                    <div className="mt-2 h-1 w-full bg-emerald-200 rounded-full dark:bg-emerald-900/40">
                       <div className="h-full bg-emerald-600 rounded-full" style={{ width: '68%' }}></div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="rounded-lg border border-gray-200 bg-white dark:bg-[#18181b] dark:border-white/10 p-6">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Field Agent Snapshot</h4>
              <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold dark:bg-orange-500/20 dark:text-orange-400">J</div>
                 <div>
                    <p className="text-sm font-semibold">John Kamau</p>
                    <p className="text-xs text-gray-500">Territory Representative</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
