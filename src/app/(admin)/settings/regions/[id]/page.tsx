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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500 dark:border-white/10 dark:border-t-brand-400"></div>
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
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 rounded-lg bg-white p-6 border border-gray-200 shadow-sm dark:bg-[#18181b] dark:border-white/10">
        <div className="flex items-center gap-5">
          <Link href="/settings/regions" className="h-10 w-10 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5 transition-colors">
            <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          </Link>
          <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-purple-100 text-purple-700 font-bold text-lg dark:bg-purple-500/20 dark:text-purple-400">
            {regionData.name?.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{regionData.name}</h1>
            <p className="text-sm text-gray-500">Region Overview · {regionTowns.length} Towns · {regionOrgs.length} Organizations</p>
          </div>
        </div>
        <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} className="px-4 py-2 bg-brand-600 text-white rounded-md text-sm font-medium hover:bg-brand-700 transition-colors">
          {isSaving ? "Saving..." : isEditing ? "Save Region" : "Edit Region"}
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 xl:col-span-8 space-y-6">
          {/* Detailed Info */}
          <div className="bg-white border border-gray-200 rounded-lg dark:bg-[#18181b] dark:border-white/10 overflow-hidden text-sm">
             <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 font-semibold">Region Details</div>
             <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-gray-500 block mb-1">Region Name</label>
                      {isEditing ? (
                        <input className="w-full h-10 px-3 border border-gray-200 rounded-md dark:bg-white/5 dark:border-white/10" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} />
                      ) : (
                        <p className="font-medium">{regionData.name}</p>
                      )}
                   </div>
                   <div>
                      <label className="text-gray-500 block mb-1">Country</label>
                      <p className="font-medium">{regionData.country?.name || "Kenya"}</p>
                   </div>
                </div>
             </div>
          </div>

          {/* Organizations List */}
          <div className="bg-white border border-gray-200 rounded-lg dark:bg-[#18181b] dark:border-white/10 overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                <span className="font-semibold text-sm">Organizations in {regionData.name}</span>
                <Badge color="light">{regionOrgs.length}</Badge>
             </div>
             <Table>
                <TableHeader className="bg-gray-50 dark:bg-white/5">
                   <TableRow>
                      <TableCell isHeader className="px-6 py-3 text-xs">Organization</TableCell>
                      <TableCell isHeader className="px-6 py-3 text-xs">Type</TableCell>
                      <TableCell isHeader className="px-6 py-3 text-xs">Town</TableCell>
                   </TableRow>
                </TableHeader>
                <TableBody>
                   {regionOrgs.length > 0 ? regionOrgs.map(o => (
                      <TableRow key={o.id}>
                         <TableCell className="px-6 py-4 text-sm font-medium"><Link href={`/settings/organizations/${o.id}`} className="hover:text-brand-600">{o.name}</Link></TableCell>
                         <TableCell className="px-6 py-4 text-sm text-gray-500"><Badge size="sm" color="light">{o.type}</Badge></TableCell>
                         <TableCell className="px-6 py-4 text-sm text-gray-500">{o.town?.name}</TableCell>
                      </TableRow>
                   )) : (
                      <TableRow><TableCell colSpan={3} className="text-center py-8 text-gray-500 text-sm">No organizations found in this region.</TableCell></TableRow>
                   )}
                </TableBody>
             </Table>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-4 space-y-6">
           <div className="bg-white border border-gray-200 rounded-lg dark:bg-[#18181b] dark:border-white/10 p-6">
              <h3 className="font-semibold text-sm mb-4">Regional Performance</h3>
              <div className="space-y-4">
                 <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20">
                    <span className="text-xs text-purple-600 dark:text-purple-400 font-bold uppercase">Total Redemptions</span>
                    <p className="text-2xl font-bold mt-1">KES 1.2M</p>
                 </div>
                 <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase">Active Consumers</span>
                    <p className="text-2xl font-bold mt-1">4.5k</p>
                 </div>
              </div>
           </div>

           <div className="bg-gray-900 rounded-lg p-6 text-white overflow-hidden relative border border-white/10">
              <div className="relative z-10">
                 <span className="text-[10px] uppercase font-bold text-brand-400 tracking-widest">Analytics Insight</span>
                 <p className="text-lg font-bold mt-2">Leading Town</p>
                 <p className="text-sm text-gray-400 mt-1">Nairobi Central is contributing 45% of total volume for this region.</p>
              </div>
              <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-brand-500/20 blur-2xl"></div>
           </div>
        </div>
      </div>
    </div>
  );
}
