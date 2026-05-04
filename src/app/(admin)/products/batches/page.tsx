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

interface BatchItem {
  id: string;
  batchNumber: string;
  sku: string;
  productName: string;
  produced: number;
  remaining: number;
  productionDate: string;
  status: "Active" | "Completed" | "Inactive";
}

export default function BatchesList() {
  const [searchTerm, setSearchTerm] = useState("");

  const batches: BatchItem[] = [
    { id: "b-001", batchNumber: "BCH-2026-001", sku: "TZ-50KG-CEM", productName: "Premium Cement 50kg", produced: 10000, remaining: 2500, productionDate: "2026-01-15", status: "Active" },
    { id: "b-002", batchNumber: "BCH-2026-002", sku: "TZ-50KG-CEM", productName: "Premium Cement 50kg", produced: 15000, remaining: 15000, productionDate: "2026-03-10", status: "Active" },
    { id: "b-003", batchNumber: "BCH-2025-099", sku: "TZ-PAINT-20L", productName: "WeatherGuard Paint 20L", produced: 5000, remaining: 0, productionDate: "2025-11-20", status: "Completed" },
    { id: "b-004", batchNumber: "BCH-2026-008", sku: "TZ-STEEL-12M", productName: "Rebar Steel 12M", produced: 50000, remaining: 48000, productionDate: "2026-04-01", status: "Active" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Inventory Batch Logistics
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track QR generation cycles and physically circulating product codes.
          </p>
        </div>
        
        <Link
          href="/products/batches/new"
          className="px-5 py-2.5 text-sm font-medium text-white bg-brand-500 rounded-lg shadow-theme-xs hover:bg-brand-600 transition flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Register New Batch
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-5 flex sm:items-center justify-between flex-col sm:flex-row gap-4">
          <div className="relative w-full max-w-sm">
            <input
              type="text"
              placeholder="Search by Batch or SKU..."
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
                <TableCell isHeader className="font-medium text-xs text-gray-500 uppercase tracking-wider">Batch Ref</TableCell>
                <TableCell isHeader className="font-medium text-xs text-gray-500 uppercase tracking-wider">Product Mapping</TableCell>
                <TableCell isHeader className="font-medium text-xs text-gray-500 uppercase tracking-wider">Status</TableCell>
                <TableCell isHeader className="font-medium text-xs text-gray-500 uppercase tracking-wider">Code Generation</TableCell>
                <TableCell isHeader className="font-medium text-xs text-gray-500 uppercase tracking-wider">Depletion Rate</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches
                .filter(b => b.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) || b.sku.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((batch) => {
                  const utilization = Math.round(((batch.produced - batch.remaining) / batch.produced) * 100);
                  const isLowStock = batch.remaining > 0 && utilization > 80;

                  return (
                    <TableRow key={batch.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                      
                      <TableCell className="py-4">
                         <div className="font-mono text-sm font-semibold text-gray-800 dark:text-white/90">{batch.batchNumber}</div>
                         <div className="text-xs text-gray-500 mt-1">Prod: {batch.productionDate}</div>
                      </TableCell>

                      <TableCell className="py-4">
                         <Link href="/products" className="text-xs font-mono font-medium text-brand-500 hover:underline">{batch.sku}</Link>
                         <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">{batch.productName}</div>
                      </TableCell>
                      
                      <TableCell className="py-4">
                        <Badge color={batch.status === "Active" ? "success" : batch.status === "Completed" ? "dark" : "light"} size="sm">
                          {batch.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-4">
                        <div className="flex flex-col gap-1">
                           <span className="text-xs text-gray-500">Produced: <strong className="text-gray-800 dark:text-gray-200">{batch.produced.toLocaleString()} units</strong></span>
                           <span className="text-xs text-gray-500">Remaining Tracker: <strong className={isLowStock ? 'text-error-500' : 'text-gray-800 dark:text-gray-200'}>{batch.remaining.toLocaleString()} codes</strong></span>
                        </div>
                      </TableCell>

                      <TableCell className="py-4">
                         <div className="w-full max-w-[150px]">
                            <div className="flex justify-between items-center mb-1">
                               <span className="text-xs font-medium text-gray-500">Consumed</span>
                               <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{utilization}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full dark:bg-gray-800">
                               <div 
                                 className={`h-full rounded-full ${utilization === 100 ? 'bg-gray-500' : isLowStock ? 'bg-error-500' : 'bg-brand-500'}`}
                                 style={{ width: `${utilization}%` }}
                               ></div>
                            </div>
                         </div>
                      </TableCell>

                    </TableRow>
                  );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
