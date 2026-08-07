"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { authenticatedFetch } from "@/hooks/useApi";

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await authenticatedFetch("/api/organizations");
        const list = Array.isArray(res) ? res : (res?.data || []);
        setOrganizations(list);
      } catch (err: any) {
        setError(err.message || "Failed to load organizations.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filteredOrgs = organizations.filter((o) =>
    o.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  if (error) {
    return (
      <div className="w-full p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold animate-fadeIn">
        {error}
      </div>
    );
  }

  const dealerCount = organizations.filter(o => o.type === "DEALER").length;
  const distributorCount = organizations.filter(o => o.type === "DISTRIBUTOR").length;
  const contractorCount = organizations.filter(o => o.type === "CONTRACTOR").length;

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-12">

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200/80 dark:border-white/[0.06] pb-5">
        <div className="flex items-center gap-4">
          <Link
            href="/settings"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                Organizations &amp; Partners
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-semibold border border-brand-500/20">
                Network Master
              </span>
            </div>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Manage registered dealers, distributors, and contractors in your loyalty ecosystem.
            </p>
          </div>
        </div>

        <Link
          href="/settings/organizations/new"
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-brand-500/20 transition flex items-center justify-center gap-2"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New organization
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard label="Total Organizations" value={organizations.length} sub="Registered network partners" />
        <MetricCard label="Distributors" value={distributorCount} sub="Primary wholesale hubs" />
        <MetricCard label="Dealers &amp; Outlets" value={dealerCount} sub="Retail partner network" />
        <MetricCard label="Contractors" value={contractorCount} sub="Enterprise service accounts" />
      </div>

      {/* ── Data Grid Card ───────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-sm flex flex-col">

        {/* Search Toolbar */}
        <div className="border-b border-gray-100 p-4 dark:border-white/5 sm:px-6 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by organization name or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            />
          </div>
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
            {filteredOrgs.length} {filteredOrgs.length === 1 ? "organization" : "organizations"}
          </span>
        </div>

        {/* Table Area */}
        <div className="w-full overflow-x-auto">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
            </div>
          ) : (
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-gray-50/50 dark:bg-white/[0.01]">
                  <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Organization name</TableCell>
                  <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Type</TableCell>
                  <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Phone</TableCell>
                  <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Registration number</TableCell>
                  <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 text-right">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                {filteredOrgs.length > 0 ? (
                  filteredOrgs.map((org) => (
                    <TableRow key={org.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                      <TableCell className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          {/* Rounded Avatar Circle */}
                          <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 border border-amber-500/20 shadow-2xs">
                            {org.name?.charAt(0) || "O"}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
                              {org.name}
                            </span>
                            <span className="text-[11px] text-gray-400 mt-0.5">
                              {org.email || "No email provided"}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3.5 px-6">
                        <Badge size="sm" color={getTypeBadgeColor(org.type) as any}>
                          {formatTypeLabel(org.type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3.5 px-6 text-xs text-gray-500 font-medium">
                        {org.phone || "—"}
                      </TableCell>
                      <TableCell className="py-3.5 px-6 text-xs font-mono text-gray-500">
                        {org.registrationNumber || "—"}
                      </TableCell>
                      <TableCell className="py-3.5 px-6 text-right">
                        <Link
                          href={`/settings/organizations/${org.id}`}
                          className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 transition"
                        >
                          View details →
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center text-xs font-semibold text-gray-400 italic">
                      {searchTerm ? "No organizations matching search filter." : "No registered organizations found."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub }: any) {
  return (
    <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-4 rounded-2xl shadow-sm space-y-1.5">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</p>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{value}</h3>
      <p className="text-[11px] text-gray-400">{sub}</p>
    </div>
  );
}
