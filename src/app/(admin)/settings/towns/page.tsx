"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { authenticatedFetch } from "@/hooks/useApi";

export default function TownsPage() {
  const [towns, setTowns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTowns();
  }, []);

  const fetchTowns = async () => {
    try {
      const { data, success, error: msg } = await authenticatedFetch("/api/locations/towns");
      if (success) {
        setTowns(data);
      } else {
        setError(typeof msg === "string" ? msg : JSON.stringify(msg));
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch towns");
    } finally {
      setLoading(false);
    }
  };

  const filteredTowns = towns.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.regionName && t.regionName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (error) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-3 rounded-md bg-error-50 p-4 border border-error-200 dark:bg-error-500/10 dark:border-error-500/20">
          <svg className="h-5 w-5 shrink-0 text-error-600 dark:text-error-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm font-medium text-error-800 dark:text-error-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
            Towns
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage local districts and towns within a region.
          </p>
        </div>
        <Link
          href="/settings/towns/new"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add town
        </Link>
      </div>

      {/* ── Data Grid Card ───────────────────────────────────────────────────── */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#18181b] overflow-hidden flex flex-col">

        {/* Search Toolbar */}
        <div className="border-b border-gray-100 p-4 dark:border-white/5 sm:px-6 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search by town or region name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-full rounded-md border border-gray-300 bg-white pl-9 pr-4 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500"
            />
          </div>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
            {filteredTowns.length} {filteredTowns.length === 1 ? "town" : "towns"}
          </span>
        </div>

        {/* Table Area */}
        <div className="w-full overflow-x-auto">
          {loading ? (
            <div className="flex min-h-[300px] w-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500 dark:border-white/10 dark:border-t-brand-400"></div>
            </div>
          ) : (
            <Table className="w-full">
              <TableHeader className="bg-gray-50/50 dark:bg-white/5">
                <TableRow className="border-b border-gray-100 dark:border-white/5">
                  <TableCell isHeader className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Town name</TableCell>
                  <TableCell isHeader className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Region</TableCell>
                  <TableCell isHeader className="py-3 px-6 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTowns.length > 0 ? (
                  filteredTowns.map((town) => (
                    <TableRow key={town.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700 dark:bg-sky-500/20 dark:text-sky-400">
                            {town.name?.charAt(0) || "T"}
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{town.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <span className="inline-flex items-center px-2 py-1 rounded bg-gray-50 text-xs font-medium text-gray-600 dark:bg-white/5 dark:text-gray-300">
                          {town.regionName || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-right">
                        <Link
                          href={`/settings/towns/${town.id}`}
                          className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
                        >
                          View details
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 7.5h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {searchTerm ? "No towns found" : "No towns registered yet"}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {searchTerm ? "Try adjusting your search query." : "Get started by adding your first town."}
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
