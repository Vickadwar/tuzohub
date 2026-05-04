"use client";

import React, { useState } from "react";
import Link from "next/link";
import Badge from "@/components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CardBatchItem {
  id: string;
  batchNumber: string;
  description: string;
  vendor: string;
  basePointValue: number;
  totalCards: number;
  status: "PRINTED" | "ACTIVATED" | "SUSPENDED" | "RETIRED";
  createdAt: string;
}

export default function CardBatchesList() {
  const [searchTerm, setSearchTerm] = useState("");

  const cardBatches: CardBatchItem[] = [
    { id: "cb-001", batchNumber: "CB-2026-041", description: "Standard PVC Loyalty Cards", vendor: "Zebra Cards Ltd", basePointValue: 100, totalCards: 5000, status: "ACTIVATED", createdAt: "2026-03-12" },
    { id: "cb-002", batchNumber: "CB-2026-042", description: "Premium Gold Metal Cards", vendor: "Asset Printing", basePointValue: 1000, totalCards: 500, status: "PRINTED", createdAt: "2026-04-01" },
    { id: "cb-003", batchNumber: "CB-2025-088", description: "Promotional Paper Cards", vendor: "Local Print Shop", basePointValue: 50, totalCards: 10000, status: "RETIRED", createdAt: "2025-11-20" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVATED": return "success";
      case "PRINTED": return "warning";
      case "RETIRED": return "dark";
      case "SUSPENDED": return "error";
      default: return "light";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Loyalty Card Batches
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage the lifecycle of physical loyalty assets and secure card production.
          </p>
        </div>
        
        <button
          className="px-5 py-2.5 text-sm font-medium text-white bg-brand-500 rounded-lg shadow-theme-xs hover:bg-brand-600 transition flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Order Card Batch
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-5 flex sm:items-center justify-between flex-col sm:flex-row gap-4">
          <div className="relative w-full max-w-sm">
            <input
              type="text"
              placeholder="Search by Batch # or Vendor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-transparent px-4 py-2.5 pl-10 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-800 dark:text-white/90"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell isHeader className="font-medium text-xs text-gray-500 uppercase tracking-wider">Batch #</TableCell>
                <TableCell isHeader className="font-medium text-xs text-gray-500 uppercase tracking-wider">Description & Vendor</TableCell>
                <TableCell isHeader className="font-medium text-xs text-gray-500 uppercase tracking-wider">Base Value</TableCell>
                <TableCell isHeader className="font-medium text-xs text-gray-500 uppercase tracking-wider">Quantity</TableCell>
                <TableCell isHeader className="font-medium text-xs text-gray-500 uppercase tracking-wider">Status</TableCell>
                <TableCell isHeader className="font-medium text-xs text-gray-500 uppercase tracking-wider">Created</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cardBatches
                .filter(cb => cb.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) || cb.vendor.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((cb) => (
                <TableRow key={cb.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                  <TableCell className="py-4 font-mono text-sm font-semibold text-gray-800 dark:text-white/90">
                    {cb.batchNumber}
                  </TableCell>
                  <TableCell className="py-4">
                     <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{cb.description}</p>
                     <p className="text-xs text-gray-500 italic mt-0.5">{cb.vendor}</p>
                  </TableCell>
                  <TableCell className="py-4 text-sm font-bold text-brand-600 dark:text-brand-400">
                    {cb.basePointValue} <span className="text-xs font-normal">pts/card</span>
                  </TableCell>
                  <TableCell className="py-4 text-sm font-medium text-gray-800 dark:text-gray-200">
                    {cb.totalCards.toLocaleString()} <span className="text-xs text-gray-400 font-normal">units</span>
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge color={getStatusColor(cb.status)} size="sm">
                      {cb.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 text-sm text-gray-500 dark:text-gray-400">
                    {cb.createdAt}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
