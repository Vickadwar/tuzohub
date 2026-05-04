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

export default function OrganizationDetail({ params }: PageProps) {
  const resolvedParams = use(params as any) as any;
  const id = resolvedParams?.id;

  const { data: org, isLoading, isError, mutate } = useApi<any>(`/organizations/${id}`);
  const { data: members, mutate: mutateMembers } = useApi<any[]>(`/organizations/${id}/members`);
  const { data: consumers } = useApi<any[]>("/consumers");
  const { data: regions } = useApi<any[]>("/locations/regions");
  const { data: towns } = useApi<any[]>("/locations/towns");
  const { data: salesHierarchy } = useApi<any[]>("/sales");

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [editData, setEditData] = useState<any>({});

  // Add member modal state
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedConsumerId, setSelectedConsumerId] = useState("");
  const [memberRole, setMemberRole] = useState("WORKER");
  const [isAddingMember, setIsAddingMember] = useState(false);

  useEffect(() => {
    if (org) {
      setEditData(org);
    }
  }, [org]);

  if (isError) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-3 rounded-md bg-error-50 p-4 border border-error-200 dark:bg-error-500/10 dark:border-error-500/20">
          <svg className="h-5 w-5 shrink-0 text-error-600 dark:text-error-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm font-medium text-error-800 dark:text-error-300">Failed to load organization. Please try again.</p>
        </div>
      </div>
    );
  }

  if (isLoading || !org) {
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
    if (!editData.name) { setError("Organization name is required"); setIsSaving(false); return; }
    if (editData.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(editData.email)) {
      setError("Invalid email address"); setIsSaving(false); return;
    }
    if (editData.taxId && editData.taxId.length > 20) {
      setError("Tax ID is too long (max 20 characters)"); setIsSaving(false); return;
    }
    if (editData.registrationNumber && editData.registrationNumber.length > 30) {
      setError("Registration number is too long (max 30 characters)"); setIsSaving(false); return;
    }

    try {
      const resData = await authenticatedFetch(`/api/organizations/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: editData.name,
          type: editData.type,
          registrationNumber: editData.registrationNumber,
          taxId: editData.taxId,
          phone: editData.phone,
          email: editData.email,
          addressLine1: editData.addressLine1,
          townId: editData.townId,
          isActive: editData.isActive,
        }),
      });
      if (resData.success) {
        setIsEditing(false);
        mutate();
      } else {
        setError(resData.error || "Update failed");
      }
    } catch (err: any) {
      const msg = err.info?.error || err.message || "Network error occurred";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedConsumerId) return;
    setIsAddingMember(true);
    setError("");
    try {
      const res = await authenticatedFetch(`/api/organizations/${id}/members`, {
        method: "POST",
        body: JSON.stringify({ consumerId: selectedConsumerId, role: memberRole }),
      });
      if (res.success) {
        mutateMembers();
        setSelectedConsumerId("");
        setMemberRole("WORKER");
        setShowAddMember(false);
      } else {
        setError(res.error || "Failed to add member");
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    try {
      const res = await authenticatedFetch(`/api/organizations/${id}/members/${memberId}`, {
        method: "DELETE",
      });
      if (res.success) {
        mutateMembers();
      } else {
        alert(res.error || "Failed to remove member");
      }
    } catch (err: any) {
      alert(err.message || "Network error");
    }
  };

  const toggleStatus = async () => {
    const newStatus = !org.isActive;
    setIsSaving(true);
    try {
      const res = await authenticatedFetch(`/api/organizations/${id}`, {
        method: "PUT",
        body: JSON.stringify({ isActive: newStatus }),
      });
      if (res.success) {
        mutate();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "DEALER": return "info";
      case "DISTRIBUTOR": return "primary";
      case "CONTRACTOR": return "warning";
      default: return "light";
    }
  };

  // Filter out consumers already in the org
  const availableConsumers = consumers?.filter(
    (c) => !members?.find((m) => m.consumer?.id === c.id)
  ) || [];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 rounded-lg bg-white p-6 border border-gray-200 shadow-sm dark:bg-[#18181b] dark:border-white/10">
        <div className="flex items-center gap-5">
          <Link
            href="/settings/organizations"
            className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition-all hover:bg-gray-50 dark:border-white/10 dark:bg-[#18181b] dark:hover:bg-white/5"
          >
            <svg className="h-4 w-4 text-gray-500 transition-transform group-hover:-translate-x-0.5 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-lg font-bold text-amber-700 shadow-sm dark:bg-amber-500/20 dark:text-amber-400">
            {org.name?.charAt(0) || "O"}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
                {org.name}
              </h1>
              <Badge color={getTypeBadgeColor(org.type) as any} size="sm">
                {org.type}
              </Badge>
            </div>
            <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
              {org.registrationNumber || "No registration number"} · {org.phone || "No phone"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button
                onClick={() => { setIsEditing(false); setEditData(org); setError(""); }}
                className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 shadow-sm hover:bg-gray-50 dark:bg-white/5 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-60 transition-colors"
              >
                {isSaving ? "Saving changes..." : "Save changes"}
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
              Edit details
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

      {/* ── Main Layout: 12-Column Grid ───────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-6">

        {/* Left Column (Spans 8 columns) */}
        <div className="col-span-12 space-y-6 xl:col-span-8">

          {/* Organization Details */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#18181b] overflow-hidden">
            <div className="border-b border-gray-100 px-6 py-5 dark:border-white/5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Organization details</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Core business information and contact details.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 p-6">
              <DetailItem label="Organization name" value={org.name} isEditing={isEditing} field="name" data={editData} setData={setEditData} />
              <DetailItem label="Type" value={org.type} isEditing={isEditing} field="type" data={editData} setData={setEditData} type="select" options={[
                { value: "DEALER", label: "Dealer" },
                { value: "DISTRIBUTOR", label: "Distributor" },
                { value: "CONTRACTOR", label: "Contractor" },
              ]} />
              <DetailItem label="Registration number" value={org.registrationNumber} isEditing={isEditing} field="registrationNumber" data={editData} setData={setEditData} />
              <DetailItem label="Tax ID" value={org.taxId} isEditing={isEditing} field="taxId" data={editData} setData={setEditData} />
              <DetailItem label="Phone" value={org.phone} isEditing={isEditing} field="phone" data={editData} setData={setEditData} />
              <DetailItem label="Email" value={org.email} isEditing={isEditing} field="email" data={editData} setData={setEditData} />
              <DetailItem label="Address" value={org.addressLine1} isEditing={isEditing} field="addressLine1" data={editData} setData={setEditData} />
              <DetailItem label="Region" value={org.region?.name} isEditing={isEditing} field="regionId" data={editData} setData={setEditData} type="select" options={regions?.map((r: any) => ({ value: r.id, label: r.name }))} />
              <DetailItem label="Town" value={org.town?.name} isEditing={isEditing} field="townId" data={editData} setData={setEditData} type="select" options={towns?.map((t: any) => ({ value: t.id, label: t.name }))} />
              <DetailItem label="Sales Person" value={org.salesStaff?.name} isEditing={isEditing} field="salesPersonId" data={editData} setData={setEditData} type="select" options={salesHierarchy?.map((s: any) => ({ value: s.id, label: `${s.name} (${s.role})` }))} />
            </div>
          </div>

          {/* Members Section */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#18181b] overflow-hidden">
            <div className="border-b border-gray-100 px-6 py-5 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Organization members</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{members?.length || 0} members currently enrolled</p>
              </div>
              <button
                onClick={() => setShowAddMember(!showAddMember)}
                className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add member
              </button>
            </div>

            {/* Add Member Form */}
            {showAddMember && (
              <div className="border-b border-gray-100 px-6 py-4 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
                <div className="flex flex-col sm:flex-row items-end gap-3">
                  <div className="w-full sm:w-[300px]">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Consumer</label>
                    <ModernSelect
                      options={availableConsumers.map((c: any) => ({
                        value: c.id,
                        label: `${c.firstName} ${c.lastName} (${c.phoneNumber})`,
                      }))}
                      value={selectedConsumerId}
                      onChange={setSelectedConsumerId}
                      placeholder="Select consumer..."
                    />
                  </div>
                  <div className="w-full sm:w-[180px]">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Role</label>
                    <ModernSelect
                      options={[
                        { value: "WORKER", label: "Worker" },
                        { value: "FOREMAN", label: "Foreman" },
                        { value: "MANAGER", label: "Manager" },
                        { value: "OWNER", label: "Owner" },
                      ]}
                      value={memberRole}
                      onChange={setMemberRole}
                      placeholder="Select role"
                    />
                  </div>
                  <button
                    onClick={handleAddMember}
                    disabled={!selectedConsumerId || isAddingMember}
                    className="inline-flex h-10 items-center justify-center rounded-md bg-brand-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-brand-700 disabled:opacity-60 transition-colors shrink-0"
                  >
                    {isAddingMember ? "Adding..." : "Enroll"}
                  </button>
                </div>
              </div>
            )}

            <div className="w-full overflow-x-auto">
              {members && members.length > 0 ? (
                <Table className="w-full">
                  <TableHeader className="bg-gray-50/50 dark:bg-white/5">
                    <TableRow className="border-b border-gray-100 dark:border-white/5">
                      <TableCell isHeader className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Member</TableCell>
                      <TableCell isHeader className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Role</TableCell>
                      <TableCell isHeader className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Loyalty #</TableCell>
                      <TableCell isHeader className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Joined</TableCell>
                      <TableCell isHeader className="py-3 px-6 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Actions</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((m: any) => (
                      <TableRow key={m.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                        <TableCell className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-400">
                              {m.consumer?.firstName?.charAt(0) || "?"}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-900 dark:text-white leading-tight">
                                {m.consumer?.firstName} {m.consumer?.lastName}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{m.consumer?.phoneNumber}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <Badge size="sm" color="light">{m.role}</Badge>
                        </TableCell>
                        <TableCell className="py-4 px-6 text-sm font-mono text-gray-500 dark:text-gray-400">
                          {m.consumer?.loyaltyNumber || "—"}
                        </TableCell>
                        <TableCell className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400">
                          {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : "—"}
                        </TableCell>
                        <TableCell className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleRemoveMember(m.id)}
                            className="text-error-600 hover:text-error-700 dark:text-error-400 dark:hover:text-error-300 transition-colors"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <svg className="mb-3 h-8 w-8 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">No members enrolled</p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Add consumers as members to track their loyalty under this organization.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (Spans 4 columns) */}
        <div className="col-span-12 space-y-6 xl:col-span-4">

          {/* Metrics */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#18181b]">
            <div className="border-b border-gray-100 px-6 py-5 dark:border-white/5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Organization metrics</h3>
            </div>
            <div className="flex flex-col p-6 space-y-4">
              <div className="flex flex-col gap-1 rounded-md border border-gray-100 bg-gray-50 p-4 dark:border-white/5 dark:bg-white/5">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total members</span>
                <span className="text-2xl font-semibold text-gray-900 dark:text-white">{members?.length || 0}</span>
              </div>
              <div className="flex flex-col gap-1 rounded-md border border-gray-100 bg-gray-50 p-4 dark:border-white/5 dark:bg-white/5">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Points earned (all time)</span>
                <span className="text-2xl font-semibold text-gray-900 dark:text-white">0</span>
              </div>
              <div className="flex flex-col gap-1 rounded-md border border-gray-100 bg-gray-50 p-4 dark:border-white/5 dark:bg-white/5">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Redemptions value</span>
                <span className="text-2xl font-semibold text-success-600 dark:text-success-500">KES 0</span>
              </div>
            </div>
          </div>

          {/* New Performance Metrics */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#18181b]">
            <div className="border-b border-gray-100 px-6 py-5 dark:border-white/5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Performance Analytics</h3>
            </div>
            <div className="p-6 space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
                    <span className="text-xs uppercase tracking-wider opacity-80">Sales Volume</span>
                    <p className="text-2xl font-bold mt-1">45,210 L</p>
                    <div className="mt-2 flex items-center text-xs text-brand-100">
                      <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" /></svg>
                      +12% vs last month
                    </div>
                  </div>
               </div>

               <div>
                 <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Top Products</h4>
                 <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Premium Gloss White</span>
                      <span className="text-sm font-semibold">1,240 scans</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Acrylic Emulsion Grey</span>
                      <span className="text-sm font-semibold">890 scans</span>
                    </div>
                 </div>
               </div>
            </div>
          </div>

          {/* Insights */}
          <div className="relative overflow-hidden rounded-lg bg-gray-900 p-6 text-white shadow-sm dark:bg-[#121212] dark:border dark:border-white/10">
            <div className="relative z-10">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-brand-400">Insights engine</h4>
              <p className="mt-2 text-lg font-semibold leading-tight text-white">Engagement tracking</p>
              <p className="mt-2 text-sm leading-relaxed text-gray-400">
                As members earn and redeem points, this panel will show purchase trends, top products, and ROI metrics.
              </p>
            </div>
            <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-brand-500/20 blur-2xl pointer-events-none"></div>
          </div>

          {/* Actions */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#18181b]">
            <div className="border-b border-gray-100 px-6 py-4 dark:border-white/5">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Actions</h4>
            </div>
            <div className="p-4 space-y-2">
              <button className="flex w-full items-center justify-between rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white transition-colors">
                Export member list
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </button>
              <button className="flex w-full items-center justify-between rounded-md px-4 py-2 text-sm font-medium text-error-600 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-500/10 transition-colors">
                Deactivate organization
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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
        <span className={`text-sm mt-0.5 ${!value ? "text-gray-400 font-normal" : "text-gray-900 font-medium dark:text-gray-200 capitalize"}`}>
          {value || "Not provided"}
        </span>
      )}
    </div>
  );
}
