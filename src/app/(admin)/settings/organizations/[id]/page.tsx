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
      <div className="w-full p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold animate-fadeIn">
        Failed to load organization details. Please refresh or try again.
      </div>
    );
  }

  if (isLoading || !org) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    setError("");

    if (!editData.name) { setError("Organization name is required"); setIsSaving(false); return; }
    if (editData.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(editData.email)) {
      setError("Invalid email address format"); setIsSaving(false); return;
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

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "DEALER": return "info";
      case "DISTRIBUTOR": return "primary";
      case "CONTRACTOR": return "warning";
      default: return "light";
    }
  };

  const formatTypeLabel = (type?: string) => {
    if (!type) return "Organization";
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  };

  const availableConsumers = consumers?.filter(
    (c) => !members?.find((m) => m.consumer?.id === c.id)
  ) || [];

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-12">

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200/80 dark:border-white/[0.06] pb-5">
        <div className="flex items-center gap-4">
          <Link
            href="/settings/organizations"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>

          {/* Rounded Avatar Circle */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-sm border border-amber-500/20 shadow-2xs">
            {org.name?.charAt(0) || "O"}
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                {org.name}
              </h1>
              <Badge color={getTypeBadgeColor(org.type) as any} size="sm">
                {formatTypeLabel(org.type)}
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              {org.registrationNumber || "No registration number"} · {org.phone || "No phone contact"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button
                onClick={() => { setIsEditing(false); setEditData(org); setError(""); }}
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
              Edit details
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* ── Main Layout: 12-Column Grid ───────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-6">

        {/* Left Column (Spans 8 columns) */}
        <div className="col-span-12 xl:col-span-8 space-y-6">

          {/* Organization Details */}
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4 dark:border-white/5">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Organization Details</h3>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Core business information, tax identifiers, and contact details.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 p-6">
              <DetailItem label="Organization name" value={org.name} isEditing={isEditing} field="name" data={editData} setData={setEditData} />
              <DetailItem label="Type" value={formatTypeLabel(org.type)} isEditing={isEditing} field="type" data={editData} setData={setEditData} type="select" options={[
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
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Organization Members</h3>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{members?.length || 0} members enrolled under this organization</p>
              </div>
              <button
                onClick={() => setShowAddMember(!showAddMember)}
                className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add member
              </button>
            </div>

            {/* Add Member Form */}
            {showAddMember && (
              <div className="border-b border-gray-100 px-6 py-4 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01]">
                <div className="flex flex-col sm:flex-row items-end gap-3">
                  <div className="w-full sm:w-[300px]">
                    <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Consumer</label>
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
                    <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Role</label>
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
                    className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-sm transition disabled:opacity-50 shrink-0"
                  >
                    {isAddingMember ? "Adding..." : "Enroll"}
                  </button>
                </div>
              </div>
            )}

            <div className="w-full overflow-x-auto">
              {members && members.length > 0 ? (
                <Table className="w-full">
                  <TableHeader>
                    <TableRow className="bg-gray-50/50 dark:bg-white/[0.01]">
                      <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Member</TableCell>
                      <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Role</TableCell>
                      <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Loyalty #</TableCell>
                      <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Joined</TableCell>
                      <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 text-right">Actions</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                    {members.map((m: any) => (
                      <TableRow key={m.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                        <TableCell className="py-3.5 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs shrink-0 border border-brand-500/20 shadow-2xs">
                              {m.consumer?.firstName?.charAt(0) || "?"}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
                                {m.consumer?.firstName} {m.consumer?.lastName}
                              </span>
                              <span className="text-[11px] text-gray-400 mt-0.5">{m.consumer?.phoneNumber}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3.5 px-6">
                          <Badge size="sm" color="light">{m.role?.charAt(0) + m.role?.slice(1).toLowerCase()}</Badge>
                        </TableCell>
                        <TableCell className="py-3.5 px-6 text-xs font-mono text-gray-500">
                          {m.consumer?.loyaltyNumber || "—"}
                        </TableCell>
                        <TableCell className="py-3.5 px-6 text-xs text-gray-500 font-medium">
                          {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : "—"}
                        </TableCell>
                        <TableCell className="py-3.5 px-6 text-right">
                          <button
                            onClick={() => handleRemoveMember(m.id)}
                            className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition"
                          >
                            Remove
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-12 text-center text-xs font-semibold text-gray-400 italic">
                  No members currently enrolled under this organization.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (Spans 4 columns) */}
        <div className="col-span-12 xl:col-span-4 space-y-6">

          {/* Metrics */}
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4 dark:border-white/5">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Organization Metrics</h3>
            </div>
            <div className="p-6 space-y-3">
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Members</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">{members?.length || 0}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Points Earned</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">0</span>
              </div>
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Redemptions Value</span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">KES 0</span>
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="bg-gradient-to-br from-gray-900 via-gray-950 to-black border border-gray-800 p-6 rounded-2xl text-white shadow-xl space-y-3 relative overflow-hidden">
            <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">Insights Telemetry</span>
            <h4 className="text-sm font-bold text-white">Engagement Tracking</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              As members earn and redeem points, this telemetry hub logs purchase patterns, top product velocity, and loyalty ROI metrics.
            </p>
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
