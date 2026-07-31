"use client";

import React, { useState } from "react";
import Link from "next/link";
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

export default function TenantManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State for New Tenant
  const [formData, setFormData] = useState({
    tenantName: "",
    orgEmail: "",
    orgPhone: "",
    taxPin: "",
    adminEmail: "",
    adminPassword: "",
    firstName: "",
    lastName: "",
    countryId: "kenya-default-uuid-001",
  });

  const { data, isLoading, mutate } = useApi<any>("/system/tenants");
  const tenants: any[] = data?.data || data || [];

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/public/register-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (json.success) {
        alert("Tenant application created successfully! Status is set to Pending Review.");
        setIsModalOpen(false);
        setFormData({
          tenantName: "",
          orgEmail: "",
          orgPhone: "",
          taxPin: "",
          adminEmail: "",
          adminPassword: "",
          firstName: "",
          lastName: "",
          countryId: "kenya-default-uuid-001",
        });
        mutate();
      } else {
        alert(json.error || "Failed to create tenant.");
      }
    } catch {
      alert("Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = tenants.filter(
    (t) =>
      t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    if (status === "active") return "success";
    if (status === "suspended") return "error";
    if (status === "pending") return "warning";
    return "light";
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200/80 dark:border-white/[0.06] pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            Organizations &amp; Tenant Registry
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Global governance directory of all onboarded enterprise loyalty organizations and active node profiles.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-brand-500/20 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            + Provision New Tenant
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Filter by organization name, slug, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
            <svg
              className="w-4 h-4 absolute left-3.5 top-3 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <span className="text-xs text-gray-400 font-medium">Showing {filtered.length} of {tenants.length} tenants</span>
        </div>

        {/* Tenants Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 dark:bg-white/[0.01]">
                  <TableCell isHeader className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Organization</TableCell>
                  <TableCell isHeader className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Subdomain Access</TableCell>
                  <TableCell isHeader className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Compliance PIN</TableCell>
                  <TableCell isHeader className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</TableCell>
                  <TableCell isHeader className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Created Date</TableCell>
                  <TableCell isHeader className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-16 text-center text-gray-400 italic text-sm">
                      {searchTerm ? "No tenants match your search filter." : "No tenants found in system."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((t) => (
                    <TableRow key={t.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                      <TableCell className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{t.name}</span>
                          <span className="text-xs text-gray-400">{t.email || "No contact email"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <span className="px-2.5 py-1 bg-gray-100 dark:bg-white/5 rounded-lg text-xs font-mono text-brand-600 dark:text-brand-400 border border-gray-200 dark:border-white/10">
                          {t.slug}.tuzohub.com
                        </span>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <span className="text-xs font-mono font-bold text-gray-800 dark:text-gray-200">
                          {t.taxPin || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <Badge color={getStatusColor(t.status)} size="sm">
                          {t.status?.toUpperCase() || "ACTIVE"}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-xs text-gray-500 font-medium">
                        {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "N/A"}
                      </TableCell>
                      <TableCell className="py-4 px-6 text-right">
                        <Link
                          href={`/platform/tenants/${t.id}`}
                          className="px-3.5 py-1.5 rounded-xl bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400 text-xs font-bold hover:bg-brand-500/20 transition border border-brand-500/20 inline-flex items-center gap-1.5"
                        >
                          View Details &amp; Admins &rarr;
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Provision New Tenant Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-xl p-6">
        <div className="space-y-4">
          <div className="border-b border-gray-100 dark:border-white/10 pb-3">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Provision New Organization Tenant</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Fill in corporate details and assign initial Tenant Administrator credentials.</p>
          </div>

          <form onSubmit={handleCreateTenant} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Organization Name *</label>
                <Input
                  type="text"
                  placeholder="e.g. Gamma Paints Ltd"
                  value={formData.tenantName}
                  onChange={(e) => setFormData({ ...formData, tenantName: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Corporate Email *</label>
                <Input
                  type="email"
                  placeholder="info@gammapaints.com"
                  value={formData.orgEmail}
                  onChange={(e) => setFormData({ ...formData, orgEmail: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                <Input
                  type="text"
                  placeholder="+254 700 000 000"
                  value={formData.orgPhone}
                  onChange={(e) => setFormData({ ...formData, orgPhone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Tax PIN (KRA)</label>
                <Input
                  type="text"
                  placeholder="P051234567A"
                  value={formData.taxPin}
                  onChange={(e) => setFormData({ ...formData, taxPin: e.target.value })}
                />
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-white/10 pt-3">
              <p className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-2">Primary Tenant Administrator</p>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">First Name *</label>
                  <Input
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Last Name *</label>
                  <Input
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Admin Login Email *</label>
                  <Input
                    type="email"
                    placeholder="admin@gammapaints.com"
                    value={formData.adminEmail}
                    onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Temporary Password *</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={formData.adminPassword}
                    onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-white/10">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={submitting}>
                {submitting ? "Submitting..." : "Create Tenant Application"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
