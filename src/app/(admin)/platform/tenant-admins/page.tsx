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
import { useApi } from "@/hooks/useApi";

export default function TenantAdminsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data, isLoading } = useApi<any>("/system/tenant-admins");
  const tenantAdmins: any[] = data?.data || data || [];

  const filtered = tenantAdmins.filter(
    (u) =>
      u.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.tenant?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200/80 dark:border-white/[0.06] pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            Tenant Administrators Management
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Global directory of primary tenant admin accounts assigned to oversee enterprise organizations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold rounded-full border border-brand-500/20">
            {tenantAdmins.length} Organization Administrators
          </span>
        </div>
      </div>

      {/* Filter & Table Container */}
      <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Filter by admin name, email, or organization..."
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
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 dark:bg-white/[0.01]">
                  <TableCell isHeader className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Administrator</TableCell>
                  <TableCell isHeader className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Assigned Organization</TableCell>
                  <TableCell isHeader className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Role Privilege</TableCell>
                  <TableCell isHeader className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</TableCell>
                  <TableCell isHeader className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Joined Date</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-16 text-center text-gray-400 italic text-sm">
                      {searchTerm ? "No tenant administrators match your search filter." : "No tenant administrators registered."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((u) => (
                    <TableRow key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400 font-bold text-xs flex items-center justify-center border border-brand-500/20">
                            {u.firstName?.charAt(0)}{u.lastName?.charAt(0)}
                          </div>
                          <div>
                            <span className="text-sm font-bold text-gray-900 dark:text-white block">
                              {u.firstName} {u.lastName}
                            </span>
                            <span className="text-xs text-gray-400">{u.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                            {u.tenant?.name || "Unassigned / Master"}
                          </span>
                          <span className="text-[10px] font-mono text-gray-400">
                            {u.tenant?.slug ? `${u.tenant.slug}.tuzohub.com` : "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                          TENANT_ADMIN
                        </span>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <Badge color={u.status === "active" ? "success" : "error"} size="sm">
                          {u.status?.toUpperCase() || "ACTIVE"}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-xs text-gray-500 font-medium text-right">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
