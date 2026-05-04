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

export default function CampaignsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: result, isLoading, isError } = useApi<any>("/campaigns");
  const [filteredCampaigns, setFilteredCampaigns] = useState<any[]>([]);

  useEffect(() => {
    if (result) {
      // Result is already unwrapped by fetcher
      const filtered = result.filter((c: any) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.campaignType && c.campaignType.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredCampaigns(filtered);
    }
  }, [searchTerm, result]);

  if (isError) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-3 rounded-md bg-error-50 p-4 border border-error-200 dark:bg-error-500/10 dark:border-error-500/20">
          <svg className="h-5 w-5 shrink-0 text-error-600 dark:text-error-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm font-medium text-error-800 dark:text-error-300">
            Failed to load campaigns. Please check your connection or authentication.
          </p>
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
            Marketing campaigns
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Orchestrate points, multipliers, and engagement flows.
          </p>
        </div>
        <Link
          href="/campaigns/new"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create campaign
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
              placeholder="Search by campaign name or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-full rounded-md border border-gray-300 bg-white pl-9 pr-4 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500"
            />
          </div>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
            {filteredCampaigns.length} {filteredCampaigns.length === 1 ? "campaign" : "campaigns"}
          </span>
        </div>

        {/* Table Area */}
        <div className="w-full overflow-x-auto">
          {isLoading ? (
            <div className="flex min-h-[300px] w-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500 dark:border-white/10 dark:border-t-brand-400"></div>
            </div>
          ) : (
            <Table className="w-full">
              <TableHeader className="bg-gray-50/50 dark:bg-white/5">
                <TableRow className="border-b border-gray-100 dark:border-white/5">
                  <TableCell isHeader className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Campaign name</TableCell>
                  <TableCell isHeader className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Type</TableCell>
                  <TableCell isHeader className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Duration</TableCell>
                  <TableCell isHeader className="py-3 px-6 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Multiplier</TableCell>
                  <TableCell isHeader className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Status</TableCell>
                  <TableCell isHeader className="py-3 px-6 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.length > 0 ? (
                  filteredCampaigns.map((campaign) => (
                    <TableRow key={campaign.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">

                      <TableCell className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-semibold text-purple-700 dark:bg-purple-500/20 dark:text-purple-400">
                            {campaign.name?.charAt(0) || "C"}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900 dark:text-white leading-tight">
                              {campaign.name}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1 max-w-[200px]">
                              {campaign.description || "No description provided"}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-4 px-6">
                        <span className="inline-flex items-center px-2 py-1 rounded bg-gray-50 text-xs font-medium text-gray-600 dark:bg-white/5 dark:text-gray-300 capitalize">
                          {campaign.campaignType?.replace(/_/g, " ").toLowerCase() || "Standard"}
                        </span>
                      </TableCell>

                      <TableCell className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {new Date(campaign.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="text-xs text-gray-400 mt-0.5">
                            to {campaign.endDate ? new Date(campaign.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "Ongoing"}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="py-4 px-6 text-right">
                        <span className="font-mono text-sm font-semibold text-gray-900 dark:text-gray-200">
                          {campaign.pointsMultiplier}x
                        </span>
                      </TableCell>

                      <TableCell className="py-4 px-6">
                        <Badge
                          size="sm"
                          color={campaign.isActive ? "success" : "warning"}
                        >
                          {campaign.isActive ? "Active" : "Paused"}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-4 px-6 text-right">
                        <Link
                          href={`/campaigns/${campaign.id}`}
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
                    <TableCell colSpan={6} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {searchTerm ? "No campaigns found" : "No marketing campaigns yet"}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {searchTerm ? "Try adjusting your search query." : "Get started by creating your first campaign."}
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