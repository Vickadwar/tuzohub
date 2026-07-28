"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import Badge from "@/components/ui/badge/Badge";
import { useApi, authenticatedFetch } from "@/hooks/useApi";
import ModernSelect from "@/components/ui/ModernSelect";
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

export default function SalesHierarchyDetail({ params }: PageProps) {
  const resolvedParams = use(params as any) as any;
  const id = resolvedParams?.id;

  const { data: staff, isLoading, isError, mutate } = useApi<any>(`/sales/${id}`);
  const { data: allStaff } = useApi<any[]>("/sales");
  const { data: regions } = useApi<any[]>("/locations/regions");
  const { data: assignments, mutate: mutateAssignments } = useApi<any[]>(`/sales/${id}/assignments`);
  const { data: organizations } = useApi<any[]>("/organizations");

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [editData, setEditData] = useState<any>({});

  // Assignment modal state
  const [showAddAssignment, setShowAddAssignment] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    if (staff) {
      setEditData(staff);
    }
  }, [staff]);

  if (isError) {
    return (
      <div className="w-full p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold animate-fadeIn">
        Failed to load staff details. Please refresh or try again.
      </div>
    );
  }

  if (isLoading || !staff) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    setError("");

    if (!editData.name) { setError("Name is required"); setIsSaving(false); return; }
    if (editData.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(editData.email)) {
      setError("Invalid email address format"); setIsSaving(false); return;
    }

    try {
      const resData = await authenticatedFetch(`/api/sales/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: editData.name,
          email: editData.email,
          phone: editData.phone,
          role: editData.role,
          managerId: editData.managerId,
          regionId: editData.regionId,
          status: editData.status,
        }),
      });
      if (resData.success) {
        setIsEditing(false);
        mutate();
      } else {
        setError(resData.error || "Update failed");
      }
    } catch (err: any) {
      setError(err.message || "Network error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAssignOrg = async () => {
    if (!selectedOrgId) return;
    setIsAssigning(true);
    try {
      const res = await authenticatedFetch(`/api/sales/${id}/assignments`, {
        method: "POST",
        body: JSON.stringify({ organizationId: selectedOrgId }),
      });
      if (res.success) {
        mutateAssignments();
        setSelectedOrgId("");
        setShowAddAssignment(false);
      } else {
        setError(res.error || "Failed to assign organization");
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setIsAssigning(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "CEO": return "error";
      case "REGIONAL_MANAGER": return "warning";
      case "ASM": return "info";
      default: return "success";
    }
  };

  const formatRoleLabel = (role?: string) => {
    if (!role) return "Staff";
    return role.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  };

  function toggleStatus() {
    mutate({ ...staff, status: staff.status === "inactive" ? "active" : "inactive" }, false);
  }

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-12">

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200/80 dark:border-white/[0.06] pb-5">
        <div className="flex items-center gap-4">
          <Link
            href="/settings/sales-hierarchy"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>

          {/* Rounded Avatar Circle */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-sm border border-purple-500/20 shadow-2xs">
            {staff.name?.charAt(0) || "S"}
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                {staff.name}
              </h1>
              <Badge color={getRoleBadgeColor(staff.role) as any} size="sm">
                {formatRoleLabel(staff.role)}
              </Badge>
              {staff.status === "inactive" && <Badge color="error" size="sm">Inactive</Badge>}
            </div>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              {staff.email || "No email"} · {staff.phone || "No phone contact"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button
                onClick={() => { setIsEditing(false); setEditData(staff); setError(""); }}
                className="px-4 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-brand-500/20 transition disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save changes"}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-xl transition flex items-center gap-2 shadow-2xs"
            >
              <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
              Edit staff
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 xl:col-span-8 space-y-6">
          {/* Staff Details */}
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4 dark:border-white/5">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Staff Information</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 p-6">
              <DetailItem label="Full name" value={staff.name} isEditing={isEditing} field="name" data={editData} setData={setEditData} />
              <DetailItem label="Role" value={formatRoleLabel(staff.role)} isEditing={isEditing} field="role" data={editData} setData={setEditData} type="select" options={[
                { value: "CEO", label: "CEO" },
                { value: "REGIONAL_MANAGER", label: "Regional Manager" },
                { value: "ASM", label: "ASM" },
                { value: "SALES_PERSON", label: "Sales Person" },
              ]} />
              <DetailItem label="Email" value={staff.email} isEditing={isEditing} field="email" data={editData} setData={setEditData} />
              <DetailItem label="Phone" value={staff.phone} isEditing={isEditing} field="phone" data={editData} setData={setEditData} />
              <DetailItem label="Manager" value={staff.manager?.name} isEditing={isEditing} field="managerId" data={editData} setData={setEditData} type="select" options={allStaff?.filter(s => s.id !== id).map(s => ({ value: s.id, label: s.name }))} />
              <DetailItem label="Region" value={staff.region?.name} isEditing={isEditing} field="regionId" data={editData} setData={setEditData} type="select" options={regions?.map(r => ({ value: r.id, label: r.name }))} />
              <DetailItem label="Status" value={staff.status || "active"} isEditing={isEditing} field="status" data={editData} setData={setEditData} type="select" options={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]} />
            </div>
          </div>

          {/* Assigned Organizations */}
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Assigned Organizations</h3>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Dealers and distributors managed by this staff member.</p>
              </div>
              <button
                onClick={() => setShowAddAssignment(!showAddAssignment)}
                className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
              >
                Add assignment
              </button>
            </div>

            {showAddAssignment && (
              <div className="border-b border-gray-100 px-6 py-4 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01]">
                <div className="flex flex-col sm:flex-row items-end gap-3">
                  <div className="w-full sm:w-[300px]">
                    <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Organization</label>
                    <ModernSelect
                      options={organizations?.map((o: any) => ({ value: o.id, label: o.name })) || []}
                      value={selectedOrgId}
                      onChange={setSelectedOrgId}
                      placeholder="Select organization..."
                    />
                  </div>
                  <button
                    onClick={handleAssignOrg}
                    disabled={!selectedOrgId || isAssigning}
                    className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-sm transition disabled:opacity-50 shrink-0"
                  >
                    {isAssigning ? "Assigning..." : "Assign"}
                  </button>
                </div>
              </div>
            )}

            <div className="w-full overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="bg-gray-50/50 dark:bg-white/[0.01]">
                    <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Organization</TableCell>
                    <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Type</TableCell>
                    <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Location</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                  {assignments && assignments.length > 0 ? (
                    assignments.map((a: any) => (
                      <TableRow key={a.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                        <TableCell className="py-3.5 px-6 text-xs font-bold text-gray-900 dark:text-white">
                          {a.organization?.name}
                        </TableCell>
                        <TableCell className="py-3.5 px-6 text-xs text-gray-500">
                          <Badge size="sm" color="light">{a.organization?.type}</Badge>
                        </TableCell>
                        <TableCell className="py-3.5 px-6 text-xs text-gray-500 font-medium">
                          {a.organization?.town?.name}, {a.organization?.region?.name}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="py-12 text-center text-xs font-semibold text-gray-400 italic">
                        No organizations currently assigned.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-4 space-y-6">
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Performance Summary</h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Target Achievement</span>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">94.2%</p>
                <div className="mt-3 h-2 w-full bg-purple-100 rounded-full overflow-hidden dark:bg-purple-900/40">
                  <div className="h-full bg-purple-600 rounded-full" style={{ width: '94.2%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={toggleStatus}
                className={`w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-xs font-semibold ${staff.status === "inactive" ? "text-emerald-600" : "text-rose-600"}`}
              >
                {staff.status === "inactive" ? "Re-activate staff member" : "Mark as inactive"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value, isEditing, field, data, setData, type = "text", options }: any) {
  return (
    <div className="flex flex-col gap-1 py-2.5 border-b border-gray-100/50 dark:border-white/5 last:border-0">
      <span className="text-xs font-semibold text-gray-400">
        {label}
      </span>
      {isEditing ? (
        <div className="pt-1">
          {type === "select" ? (
            <ModernSelect
              options={options || []}
              value={data[field] || ""}
              onChange={(val) => setData({ ...data, [field]: val })}
              placeholder={`Select ${label.toLowerCase()}`}
            />
          ) : (
            <input
              type={type}
              value={data[field] || ""}
              onChange={(e) => setData({ ...data, [field]: e.target.value })}
              className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 text-xs font-medium text-gray-900 shadow-2xs transition-colors placeholder:text-gray-400 focus:border-brand-500/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
            />
          )}
        </div>
      ) : (
        <span className={`text-xs font-bold ${!value ? "text-gray-400 italic" : "text-gray-900 dark:text-white"}`}>
          {value || "Not provided"}
        </span>
      )}
    </div>
  );
}
