"use client";

import React, { useState } from "react";
import Badge from "@/components/ui/badge/Badge";
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
  const { data, isLoading, mutate } = useApi<any>("/system/tenants");
  const tenants: any[] = data?.data || data || [];

  const handleSuspend = async (id: string, currentStatus: string) => {
    const action = currentStatus === "suspended" ? "activate" : "suspend";
    if (!confirm(`Are you sure you want to ${action} this tenant?`)) return;
    try {
      await authenticatedFetch(`/api/system/registrations/${id}/${action}`, { method: "POST" });
      mutate();
    } catch {
      alert(`Failed to ${action} tenant.`);
    }
  };

  const filtered = tenants.filter(
    (t) =>
      t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.slug?.includes(searchTerm.toLowerCase())
  );

  const getPlanColor = (plan: string) => {
    if (plan === "GOLD") return "success";
    if (plan === "SILVER") return "primary";
    return "light";
  };

  const getStatusColor = (status: string) => {
    if (status === "active") return "success";
    if (status === "suspended") return "error";
    if (status === "pending") return "warning";
    return "light";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Tenant Management
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Global registry of all organizations onboarded onto the TuzoHub Platform.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-5">
          <input
            type="text"
            placeholder="Filter by name or slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-sm rounded-lg border border-gray-200 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-800 dark:text-white/90"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell isHeader className="font-medium text-xs text-gray-500 uppercase tracking-wider">Organization</TableCell>
                  <TableCell isHeader className="font-medium text-xs text-gray-500 uppercase tracking-wider">Access Slug</TableCell>
                  <TableCell isHeader className="font-medium text-xs text-gray-500 uppercase tracking-wider">Subscription</TableCell>
                  <TableCell isHeader className="font-medium text-xs text-gray-500 uppercase tracking-wider">Status</TableCell>
                  <TableCell isHeader className="font-medium text-xs text-gray-500 uppercase tracking-wider">Join Date</TableCell>
                  <TableCell isHeader className="font-medium text-xs text-gray-500 uppercase tracking-wider text-right pr-5">Control</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-16 text-center text-gray-400 text-sm italic">
                      {searchTerm ? "No tenants match your filter." : "No tenants registered yet."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((t) => (
                    <TableRow key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                      <TableCell className="py-4">
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{t.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{t.id}</p>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">
                          {t.slug}.tuzohub.com
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge color={getPlanColor(t.subscriptionPlan)} size="sm">
                          {t.subscriptionPlan || "BASIC"}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge color={getStatusColor(t.status)} size="sm">
                          {t.status?.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 text-sm text-gray-500">
                        {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "N/A"}
                      </TableCell>
                      <TableCell className="py-4 text-right pr-5">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => handleSuspend(t.id, t.status)}
                            className={`text-xs font-bold hover:underline transition ${
                              t.status === "suspended"
                                ? "text-success-500 hover:text-success-600"
                                : "text-error-500 hover:text-error-600"
                            }`}
                          >
                            {t.status === "suspended" ? "Activate" : "Suspend"}
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
