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
      <div className="w-full">
        <div className="flex items-center gap-3 rounded-md bg-error-50 p-4 border border-error-200 dark:bg-error-500/10 dark:border-error-500/20">
          <svg className="h-5 w-5 shrink-0 text-error-600 dark:text-error-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm font-medium text-error-800 dark:text-error-300">Failed to load staff details. Please try again.</p>
        </div>
      </div>
    );
  }

  if (isLoading || !staff) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500 dark:border-white/10 dark:border-t-brand-400"></div>
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    setError("");

    // Validation
    if (!editData.name) { setError("Name is required"); setIsSaving(false); return; }
    if (editData.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(editData.email)) {
      setError("Invalid email address"); setIsSaving(false); return;
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

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 rounded-lg bg-white p-6 border border-gray-200 shadow-sm dark:bg-[#18181b] dark:border-white/10">
        <div className="flex items-center gap-5">
          <Link
            href="/settings/sales-hierarchy"
            className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition-all hover:bg-gray-50 dark:border-white/10 dark:bg-[#18181b] dark:hover:bg-white/5"
          >
            <svg className="h-4 w-4 text-gray-500 transition-transform group-hover:-translate-x-0.5 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-lg font-bold text-indigo-700 shadow-sm dark:bg-indigo-500/20 dark:text-indigo-400">
            {staff.name?.charAt(0) || "S"}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
                {staff.name}
              </h1>
              <Badge color={getRoleBadgeColor(staff.role) as any} size="sm">
                {staff.role?.replace(/_/g, " ")}
              </Badge>
              {staff.status === "inactive" && <Badge color="error" size="sm">Inactive</Badge>}
            </div>
            <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
              {staff.email || "No email"} · {staff.phone || "No phone"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button
                onClick={() => { setIsEditing(false); setEditData(staff); setError(""); }}
                className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 shadow-sm hover:bg-gray-50 dark:bg-white/5 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-60 transition-colors"
              >
                {isSaving ? "Saving..." : "Save changes"}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 shadow-sm hover:bg-gray-50 dark:bg-white/5 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10 transition-colors"
            >
              <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit staff
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-md bg-error-50 p-4 border border-error-200 dark:bg-error-500/10 dark:border-error-500/20">
          <svg className="h-5 w-5 shrink-0 text-error-600 dark:text-error-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-medium text-error-800 dark:text-error-300">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-8">
          {/* Staff Details */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#18181b] overflow-hidden">
            <div className="border-b border-gray-100 px-6 py-5 dark:border-white/5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Staff Information</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 p-6">
              <DetailItem label="Full name" value={staff.name} isEditing={isEditing} field="name" data={editData} setData={setEditData} />
              <DetailItem label="Role" value={staff.role} isEditing={isEditing} field="role" data={editData} setData={setEditData} type="select" options={[
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
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#18181b] overflow-hidden">
            <div className="border-b border-gray-100 px-6 py-5 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Assigned Organizations</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Dealers and distributors managed by this staff member.</p>
              </div>
              <button
                onClick={() => setShowAddAssignment(!showAddAssignment)}
                className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 transition-colors"
              >
                Add assignment
              </button>
            </div>

            {showAddAssignment && (
              <div className="border-b border-gray-100 px-6 py-4 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
                <div className="flex flex-col sm:flex-row items-end gap-3">
                  <div className="w-full sm:w-[300px]">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Organization</label>
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
                    className="inline-flex h-10 items-center justify-center rounded-md bg-brand-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-brand-700 disabled:opacity-60 transition-colors shrink-0"
                  >
                    {isAssigning ? "Assigning..." : "Assign"}
                  </button>
                </div>
              </div>
            )}

            <div className="w-full overflow-x-auto">
              <Table className="w-full">
                <TableHeader className="bg-gray-50/50 dark:bg-white/5">
                  <TableRow className="border-b border-gray-100 dark:border-white/5">
                    <TableCell isHeader className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Organization</TableCell>
                    <TableCell isHeader className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Type</TableCell>
                    <TableCell isHeader className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Location</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments && assignments.length > 0 ? (
                    assignments.map((a: any) => (
                      <TableRow key={a.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                        <TableCell className="py-4 px-6 text-sm font-medium text-gray-900 dark:text-white">
                          {a.organization?.name}
                        </TableCell>
                        <TableCell className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400">
                           <Badge size="sm" color="light">{a.organization?.type}</Badge>
                        </TableCell>
                        <TableCell className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400">
                          {a.organization?.town?.name}, {a.organization?.region?.name}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                        No organizations assigned.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <div className="col-span-12 space-y-6 xl:col-span-4">
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#18181b] p-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Performance Summary</h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 dark:bg-indigo-500/10 dark:border-indigo-500/20">
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase">Sales Target Achievement</span>
                <p className="text-3xl font-bold text-indigo-900 dark:text-white mt-1">94.2%</p>
                <div className="mt-3 h-2 w-full bg-indigo-200 rounded-full overflow-hidden dark:bg-indigo-900/40">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: '94.2%' }}></div>
                </div>
              </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500">Retailers Met</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">28/30</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500">New Onboards</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">+5</span>
                  </div>
               </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#18181b] p-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button
                 onClick={() => setIsEditing(true)}
                 className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-sm text-gray-700 dark:text-gray-300"
              >
                Promote / Change Role
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              </button>
              <button
                 onClick={toggleStatus}
                 className={`w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-sm ${staff.status === "inactive" ? "text-success-600" : "text-error-600"}`}
              >
                {staff.status === "inactive" ? "Re-activate Staff" : "Mark as Exited / Disable"}
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  function toggleStatus() {
     // Mock toggle for UI demonstration
     mutate({ ...staff, status: staff.status === "inactive" ? "active" : "inactive" }, false);
  }
}

function DetailItem({ label, value, isEditing, field, data, setData, type = "text", options }: any) {
  return (
    <div className="flex flex-col gap-1.5 py-3 border-b border-gray-50 last:border-0 dark:border-white/5">
      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
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
              className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30"
            />
          )}
        </div>
      ) : (
        <span className={`text-sm mt-0.5 ${!value ? "text-gray-400 font-normal" : "text-gray-900 font-medium dark:text-gray-200"}`}>
          {value || "Not provided"}
        </span>
      )}
    </div>
  );
}
