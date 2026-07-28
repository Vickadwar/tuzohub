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
import { BoxCubeIcon, PieChartIcon } from "@/icons";

export default function ProductsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: result, isLoading, isError } = useApi<any>("/products");
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);

  useEffect(() => {
    if (result) {
      const filtered = result.filter((p: any) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, result]);

  if (isError) {
    return (
      <div className="w-full p-6">
        <div className="flex items-center gap-3 rounded-2xl bg-rose-500/10 p-4 border border-rose-500/20 text-rose-600 dark:text-rose-400">
          <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-xs font-semibold">
            Failed to load product catalog. Please check your connection or permissions.
          </p>
        </div>
      </div>
    );
  }

  const activeCount = filteredProducts.filter((p) => p.isActive).length;

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-12">

      {/* ── Page Header Bar ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200/80 dark:border-white/[0.06] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              Product &amp; SKU Catalog
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-semibold border border-brand-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
              Live Inventory
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Manage product items, reward point multipliers, unit pricing, and inventory telemetry.
          </p>
        </div>
        <Link
          href="/products/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-brand-500/20 hover:bg-brand-700 transition-all shrink-0"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add New Product
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-4 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 border border-brand-500/20 shadow-2xs">
            <BoxCubeIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Catalog SKUs</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{filteredProducts.length} Items</p>
          </div>
        </div>

        <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-4 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-2xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Active SKUs</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{activeCount} Products</p>
          </div>
        </div>

        <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-4 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20 shadow-2xs">
            <PieChartIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Point Allocation</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">Live Multipliers</p>
          </div>
        </div>
      </div>

      {/* ── Data Grid Card ───────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-sm flex flex-col">

        {/* Search Toolbar */}
        <div className="border-b border-gray-100 p-4 dark:border-white/5 sm:px-6 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search by product name, SKU, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            />
          </div>
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
            {filteredProducts.length} {filteredProducts.length === 1 ? "Product" : "Products"} Cataloged
          </span>
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
                  <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Product Details</TableCell>
                  <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Category &amp; Unit</TableCell>
                  <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 text-right">Points per Unit</TableCell>
                  <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 text-right">Price (KES)</TableCell>
                  <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Status</TableCell>
                  <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 text-right">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">

                      <TableCell className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          {/* Rounded Full Avatar Badge */}
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold text-xs border border-brand-500/20 shadow-2xs">
                            {product.name?.charAt(0) || "P"}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
                              {product.name}
                            </span>
                            <span className="text-[11px] text-gray-400 mt-0.5 font-mono">
                              {product.sku}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3.5 px-6">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 capitalize">
                            {product.category?.replace(/_/g, " ").toLowerCase() || "General"}
                          </span>
                          <span className="text-[11px] text-gray-400 capitalize">
                            {product.unitOfMeasure?.toLowerCase() || "Unit"}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="py-3.5 px-6 text-right">
                        <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">
                          {product.pointsPerUnit?.toLocaleString() || "0"} <span className="text-[10px] text-gray-400 font-sans">PTS</span>
                        </span>
                      </TableCell>

                      <TableCell className="py-3.5 px-6 text-right">
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-300 font-mono">
                          {product.price ? parseFloat(product.price).toLocaleString() : "—"}
                        </span>
                      </TableCell>

                      <TableCell className="py-3.5 px-6">
                        <Badge
                          size="sm"
                          color={product.isActive ? "success" : "warning"}
                        >
                          {product.isActive ? "Active" : "Archived"}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-3.5 px-6 text-right">
                        <Link
                          href={`/products/${product.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
                        >
                          Details
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
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
                        <svg className="h-8 w-8 text-gray-300 dark:text-gray-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <span className="text-xs font-semibold text-gray-900 dark:text-white">
                          {searchTerm ? "No products found" : "No products available"}
                        </span>
                        <span className="text-[11px] text-gray-400 mt-0.5">
                          {searchTerm ? "Try adjusting your search terms." : "Get started by adding items to your catalog."}
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