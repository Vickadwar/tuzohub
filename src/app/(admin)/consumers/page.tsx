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
import { useApi } from "@/hooks/useApi";

export default function ConsumersList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "BLOCKED">("ALL");
  const { data: consumers, isLoading, isError } = useApi<any[]>("/consumers");
  const [filteredConsumers, setFilteredConsumers] = useState<any[]>([]);

  useEffect(() => {
    if (consumers) {
      const filtered = consumers.filter((c) => {
        const fullName = `${c.firstName || ""} ${c.lastName || ""}`.toLowerCase();
        const matchesSearch =
          fullName.includes(searchTerm.toLowerCase()) ||
          (c.phoneNumber && c.phoneNumber.includes(searchTerm)) ||
          (c.loyaltyNumber && c.loyaltyNumber.includes(searchTerm)) ||
          (c.town?.name && c.town.name.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus =
          statusFilter === "ALL" ||
          (statusFilter === "ACTIVE" && c.status === "active") ||
          (statusFilter === "BLOCKED" && c.status === "blocked");

        return matchesSearch && matchesStatus;
      });
      setFilteredConsumers(filtered);
    }
  }, [searchTerm, statusFilter, consumers]);

  const activeCount = Array.isArray(consumers) ? consumers.filter((c: any) => c.status === "active").length : 0;
  const blockedCount = Array.isArray(consumers) ? consumers.filter((c: any) => c.status === "blocked").length : 0;

  if (isError) {
    return (
      <div className="w-full p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center gap-3">
        <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-xs font-semibold">Failed to load consumer directory. Please check network authentication.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-12">
      {/* ── Header Bar ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200/80 dark:border-white/[0.06] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              Consumers Directory &amp; Ledger
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-semibold border border-brand-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
              Live Directory
            </span>
          </div>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Manage program participants, phone identities, loyalty tier progress, and account statuses.
          </p>
        </div>
        <Link
          href="/consumers/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-brand-500/20 hover:bg-brand-700 transition-all shrink-0"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add New Consumer
        </Link>
      </div>

      {/* ── Overview Metrics Banner ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-4 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="p-3 bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-xl shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Directory</p>
            <p className="text-sm font-bold font-mono text-gray-900 dark:text-white">{consumers?.length || 0} Registered</p>
          </div>
        </div>

        <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-4 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Active Participants</p>
            <p className="text-sm font-bold font-mono text-emerald-500">{activeCount} Verified</p>
          </div>
        </div>

        <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-4 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="p-3 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Blocked / Flagged</p>
            <p className="text-sm font-bold font-mono text-rose-500">{blockedCount} Flagged</p>
          </div>
        </div>

        <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-4 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="p-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Channel Integration</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">USSD &amp; Web Sync</p>
          </div>
        </div>
      </div>

      {/* ── Table Card Container ────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-sm flex flex-col">

        {/* Toolbar & Search */}
        <div className="border-b border-gray-100 dark:border-white/5 p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search by name, phone (+254...), loyalty ID, or town..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Status Filter Pills */}
            <div className="flex items-center bg-gray-100 dark:bg-white/[0.03] p-1 rounded-xl">
              {(["ALL", "ACTIVE", "BLOCKED"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                    statusFilter === st
                      ? "bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-xs"
                      : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  }`}
                >
                  {st === "ALL" ? "All" : st === "ACTIVE" ? "Active" : "Blocked"}
                </button>
              ))}
            </div>

            <span className="text-xs font-semibold text-gray-400 whitespace-nowrap">
              {filteredConsumers.length} {filteredConsumers.length === 1 ? "Consumer" : "Consumers"}
            </span>
          </div>
        </div>

        {/* Table Area */}
        <div className="w-full overflow-x-auto">
          {isLoading ? (
            <div className="flex min-h-[300px] w-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
            </div>
          ) : (
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-gray-50/50 dark:bg-white/[0.01]">
                  <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Participant Profile</TableCell>
                  <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Loyalty ID</TableCell>
                  <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Region / Town</TableCell>
                  <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Tier Level</TableCell>
                  <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Status</TableCell>
                  <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 text-right">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                {filteredConsumers.length > 0 ? (
                  filteredConsumers.map((consumer) => {
                    const initials = `${consumer.firstName?.charAt(0) || ""}${consumer.lastName?.charAt(0) || ""}`.toUpperCase();

                    return (
                      <TableRow key={consumer.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                        <TableCell className="py-3.5 px-6">
                          <div className="flex items-center gap-3">
                            {/* Rounded Full Avatar */}
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold text-xs border border-brand-500/20 shadow-2xs">
                              {initials || "C"}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-gray-900 dark:text-white">
                                {consumer.firstName} {consumer.lastName}
                              </span>
                              <span className="text-[11px] font-mono text-gray-400">
                                {consumer.phoneNumber || "No phone linked"}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="py-3.5 px-6">
                          <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-white/5 font-mono text-xs font-bold text-gray-800 dark:text-gray-200">
                            {consumer.loyaltyNumber}
                          </span>
                        </TableCell>

                        <TableCell className="py-3.5 px-6">
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            {consumer.town?.name || "Unassigned"}
                          </span>
                        </TableCell>

                        <TableCell className="py-3.5 px-6">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-semibold">
                            {consumer.loyaltyTier?.name || "Standard Member"}
                          </span>
                        </TableCell>

                        <TableCell className="py-3.5 px-6">
                          <Badge
                            size="sm"
                            color={consumer.status === "active" ? "success" : consumer.status === "blocked" ? "error" : "warning"}
                          >
                            {consumer.status === "active" ? "Active" : consumer.status === "blocked" ? "Blocked" : "Suspended"}
                          </Badge>
                        </TableCell>

                        <TableCell className="py-3.5 px-6 text-right">
                          <Link
                            href={`/consumers/${consumer.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-semibold rounded-lg hover:bg-brand-500/20 transition-all"
                          >
                            Profile
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-full mb-3 text-gray-400">
                          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                          </svg>
                        </div>
                        <span className="text-xs font-semibold text-gray-900 dark:text-white">
                          {searchTerm ? "No consumers match your search" : "No Registered Consumers Found"}
                        </span>
                        <span className="text-xs text-gray-400 mt-1">
                          {searchTerm ? "Try searching with a different name or phone number." : "Get started by onboarding a new loyalty participant."}
                        </span>
                      </div>
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