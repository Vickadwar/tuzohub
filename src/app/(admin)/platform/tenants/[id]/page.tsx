"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/form/input/InputField";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useApi, authenticatedFetch } from "@/hooks/useApi";
import { MpesaFloatCard } from "@/components/common/MpesaFloatCard";

export default function TenantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [activeTab, setActiveTab] = useState<"admins" | "profile" | "integrations">("admins");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminSubmitting, setAdminSubmitting] = useState(false);

  // New Admin Form State
  const [adminForm, setAdminForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const { data, isLoading, mutate } = useApi<any>(id ? `/system/tenants/${id}` : null);
  const tenant = data?.data || data;

  const handleStatusChange = async (newStatus: "active" | "pending" | "suspended" | "declined") => {
    if (!confirm(`Are you sure you want to set status of "${tenant?.name}" to "${newStatus.toUpperCase()}"?`)) return;
    setUpdatingStatus(true);
    try {
      const res = await authenticatedFetch(`/api/system/tenants/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        mutate();
      } else {
        alert(json.error || "Failed to update status.");
      }
    } catch {
      alert("Failed to update status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminSubmitting(true);
    try {
      const res = await authenticatedFetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...adminForm,
          tenantId: id,
          role: "TENANT_ADMIN",
        }),
      });
      const json = await res.json();
      if (json.success) {
        alert("Tenant Administrator created successfully!");
        setIsAdminModalOpen(false);
        setAdminForm({ firstName: "", lastName: "", email: "", password: "" });
        mutate();
      } else {
        alert(json.error || "Failed to create administrator.");
      }
    } catch {
      alert("Failed to create administrator.");
    } finally {
      setAdminSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === "active") return "success";
    if (status === "suspended") return "error";
    if (status === "pending") return "warning";
    return "light";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Tenant organization not found.</p>
        <Link href="/platform/tenants" className="text-brand-600 font-bold hover:underline mt-2 inline-block">
          &larr; Back to Tenants Registry
        </Link>
      </div>
    );
  }

  const admins = tenant.admins || [];
  const settings = tenant.settings || {};

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Back Link & Navigation */}
      <div>
        <Link
          href="/platform/tenants"
          className="text-xs font-bold text-gray-400 hover:text-brand-600 transition flex items-center gap-1"
        >
          &larr; Back to Tenant Registry
        </Link>
      </div>

      {/* Tenant Master Banner Card */}
      <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-white/5 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                {tenant.name}
              </h1>
              <Badge color={getStatusColor(tenant.status)} size="md">
                {tenant.status?.toUpperCase() || "ACTIVE"}
              </Badge>
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="font-mono bg-gray-100 dark:bg-white/5 px-2.5 py-1 rounded-lg text-brand-600 dark:text-brand-400 border border-gray-200 dark:border-white/10">
                https://{tenant.slug}.tuzohub.com
              </span>
              <span>ID: <code className="font-mono text-[11px]">{tenant.id}</code></span>
              <span>Joined: {tenant.createdAt ? new Date(tenant.createdAt).toLocaleDateString() : "N/A"}</span>
            </div>
          </div>

          {/* Status Action Control Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mr-1">Super Admin Controls:</span>
            {tenant.status !== "active" && (
              <button
                onClick={() => handleStatusChange("active")}
                disabled={updatingStatus}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
              >
                Approve &amp; Activate
              </button>
            )}
            {tenant.status !== "pending" && (
              <button
                onClick={() => handleStatusChange("pending")}
                disabled={updatingStatus}
                className="px-3.5 py-1.5 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border border-amber-500/20 text-xs font-bold rounded-xl transition"
              >
                Set Pending
              </button>
            )}
            {tenant.status !== "suspended" && (
              <button
                onClick={() => handleStatusChange("suspended")}
                disabled={updatingStatus}
                className="px-3.5 py-1.5 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-bold rounded-xl transition"
              >
                Suspend Node
              </button>
            )}
            {tenant.status !== "declined" && (
              <button
                onClick={() => handleStatusChange("declined")}
                disabled={updatingStatus}
                className="px-3.5 py-1.5 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 text-xs font-bold rounded-xl transition border border-gray-200 dark:border-white/10"
              >
                Disapprove / Decline
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-4 border-b border-gray-100 dark:border-white/5">
          <button
            onClick={() => setActiveTab("admins")}
            className={`pb-3 text-xs font-bold transition border-b-2 ${
              activeTab === "admins"
                ? "border-brand-500 text-brand-600 dark:text-brand-400"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Assigned Tenant Administrators ({admins.length})
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-3 text-xs font-bold transition border-b-2 ${
              activeTab === "profile"
                ? "border-brand-500 text-brand-600 dark:text-brand-400"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Organization Profile &amp; Tax PIN
          </button>
          <button
            onClick={() => setActiveTab("integrations")}
            className={`pb-3 text-xs font-bold transition border-b-2 ${
              activeTab === "integrations"
                ? "border-brand-500 text-brand-600 dark:text-brand-400"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            USSD &amp; Telco Integration Status
          </button>
        </div>

        {/* TAB 1: Assigned Tenant Administrators */}
        {activeTab === "admins" && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Organization Administrators</h3>
                <p className="text-xs text-gray-500">Primary administrators authorized to manage {tenant.name}.</p>
              </div>
              <button
                onClick={() => setIsAdminModalOpen(true)}
                className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-1.5"
              >
                + Add Tenant Administrator
              </button>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50 dark:bg-white/[0.01]">
                    <TableCell isHeader className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Administrator</TableCell>
                    <TableCell isHeader className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Login Email</TableCell>
                    <TableCell isHeader className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Role Privilege</TableCell>
                    <TableCell isHeader className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</TableCell>
                    <TableCell isHeader className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Added Date</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                  {admins.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-12 text-center text-gray-400 italic text-xs">
                        No primary tenant administrators assigned to this organization.
                      </TableCell>
                    </TableRow>
                  ) : (
                    admins.map((u: any) => (
                      <TableRow key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                        <TableCell className="py-3 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 font-bold text-xs flex items-center justify-center border border-brand-500/20">
                              {u.firstName?.charAt(0)}{u.lastName?.charAt(0)}
                            </div>
                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                              {u.firstName} {u.lastName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-6 text-xs font-mono text-gray-700 dark:text-gray-300">
                          {u.email}
                        </TableCell>
                        <TableCell className="py-3 px-6">
                          <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                            {u.role || "TENANT_ADMIN"}
                          </span>
                        </TableCell>
                        <TableCell className="py-3 px-6">
                          <Badge color={u.status === "active" ? "success" : "error"} size="sm">
                            {u.status?.toUpperCase() || "ACTIVE"}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3 px-6 text-xs text-gray-500 font-medium text-right">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* TAB 2: Organization Profile & Tax Compliance */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="p-5 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Corporate Details</h4>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between border-b border-gray-200/50 dark:border-white/5 pb-2">
                  <span className="text-gray-400">Organization Name</span>
                  <span className="font-bold text-gray-900 dark:text-white">{tenant.name}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200/50 dark:border-white/5 pb-2">
                  <span className="text-gray-400">Corporate Email</span>
                  <span className="font-bold text-gray-900 dark:text-white">{tenant.email || "N/A"}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200/50 dark:border-white/5 pb-2">
                  <span className="text-gray-400">Phone Contact</span>
                  <span className="font-bold text-gray-900 dark:text-white">{tenant.phone || "N/A"}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200/50 dark:border-white/5 pb-2">
                  <span className="text-gray-400">Tax Compliance PIN (KRA)</span>
                  <span className="font-mono font-bold text-brand-600 dark:text-brand-400">{tenant.taxPin || "N/A"}</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Currency &amp; Loyalty Configuration</h4>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between border-b border-gray-200/50 dark:border-white/5 pb-2">
                  <span className="text-gray-400">Base Currency</span>
                  <span className="font-bold text-gray-900 dark:text-white">{tenant.baseCurrency || "KES"}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200/50 dark:border-white/5 pb-2">
                  <span className="text-gray-400">Default Point Value</span>
                  <span className="font-bold text-gray-900 dark:text-white">{tenant.defaultPointValue || "1.00"}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200/50 dark:border-white/5 pb-2">
                  <span className="text-gray-400">Country Node</span>
                  <span className="font-bold text-gray-900 dark:text-white">{tenant.country?.name || "Kenya"}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Integration Credentials */}
        {activeTab === "integrations" && (
          <div className="space-y-6 pt-2">
            <MpesaFloatCard tenantId={id} />

            <div className="p-5 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">USSD &amp; Gateway Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">M-Pesa B2C Paybill / Shortcode</span>
                  <span className="text-base font-mono font-extrabold text-brand-600 dark:text-brand-400">
                    {settings.credentials?.darajaShortCode || settings.credentials?.shortCode || "Not Configured"}
                  </span>
                </div>
                <div className="p-4 bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Assigned USSD Shortcode</span>
                  <span className="text-base font-mono font-extrabold text-brand-600 dark:text-brand-400">
                    {settings.ussdServiceCode || "*453*34#"}
                  </span>
                </div>
                <div className="p-4 bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">USSD Webhook Target URL</span>
                  <span className="text-xs font-mono font-bold text-gray-800 dark:text-gray-200 break-all">
                    https://tuzohub.vercel.app/ussd?tenantSlug={tenant.slug}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Administrator Modal */}
      <Modal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} className="max-w-md p-6">
        <div className="space-y-4">
          <div className="border-b border-gray-100 dark:border-white/10 pb-3">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Add Admin to {tenant.name}</h3>
            <p className="text-xs text-gray-500">Create an authorized Tenant Administrator account for this organization.</p>
          </div>

          <form onSubmit={handleCreateAdmin} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">First Name *</label>
              <Input
                type="text"
                placeholder="Jane"
                value={adminForm.firstName}
                onChange={(e) => setAdminForm({ ...adminForm, firstName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Last Name *</label>
              <Input
                type="text"
                placeholder="Smith"
                value={adminForm.lastName}
                onChange={(e) => setAdminForm({ ...adminForm, lastName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Admin Email *</label>
              <Input
                type="email"
                placeholder="jane@organization.com"
                value={adminForm.email}
                onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Password *</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={adminForm.password}
                onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-white/10">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAdminModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={adminSubmitting}>
                {adminSubmitting ? "Adding..." : "Add Administrator"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
