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
import { useApi, authenticatedFetch } from "@/hooks/useApi";
import { BoxCubeIcon, PieChartIcon } from "@/icons";
import SearchableSelect from "@/components/ui/select/SearchableSelect";

export default function ProductsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("ALL");
  const [categoriesList, setCategoriesList] = useState<string[]>([]);

  // Fetch product catalog
  const { data: rawResult, isLoading, isError, mutate } = useApi<any>("/products");

  // Extract products list robustly
  const allProducts: any[] = React.useMemo(() => {
    if (!rawResult) return [];
    if (Array.isArray(rawResult)) return rawResult;
    if (Array.isArray(rawResult.data)) return rawResult.data;
    if (Array.isArray(rawResult.items)) return rawResult.items;
    return [];
  }, [rawResult]);

  // Fetch dynamic categories metadata
  useEffect(() => {
    async function loadMeta() {
      try {
        const data = await authenticatedFetch("/api/products/meta/categories-uom");
        if (data) {
          const cats = data.categories || data.data?.categories || [];
          setCategoriesList(cats);
        }
      } catch (err) {
        console.warn("Could not fetch categories meta", err);
      }
    }
    loadMeta();
  }, []);

  // Filter products by search term and selected category
  const filteredProducts = React.useMemo(() => {
    return allProducts.filter((p: any) => {
      const matchesSearch =
        !searchTerm.trim() ||
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.unitOfMeasure?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategoryFilter === "ALL" ||
        p.category?.toLowerCase() === selectedCategoryFilter.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [allProducts, searchTerm, selectedCategoryFilter]);

  const activeCount = allProducts.filter((p) => p.isActive).length;

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-12">

      {/* ── Page Header Bar ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200/80 dark:border-white/[0.06] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              Product &amp; SKU Master Catalog
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-semibold border border-brand-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
              Master Catalog
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Manage product items, custom categories, units of measure (UOM), and reward point valuations.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/products/settings"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 px-4 py-2.5 text-xs font-semibold text-gray-900 dark:text-white border border-gray-200/80 dark:border-white/10 transition-all"
          >
            <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Inventory Settings
          </Link>
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
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-4 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 border border-brand-500/20 shadow-2xs">
            <BoxCubeIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Catalog SKUs</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{allProducts.length} Items</p>
          </div>
        </div>

        <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-4 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-2xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
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
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Registered Categories</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{categoriesList.length} Categories</p>
          </div>
        </div>
      </div>

      {isError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Failed to load product catalog. Please refresh the page or verify your authentication.</span>
        </div>
      )}

      {/* ── Data Grid Card ───────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-sm flex flex-col">

        {/* Search & Category Filter Bar */}
        <div className="border-b border-gray-100 p-4 dark:border-white/5 sm:px-6 sm:py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:max-w-2xl">
            {/* Search Input */}
            <div className="relative w-full">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search by product name, SKU, category, or UOM..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              />
            </div>

            {/* Dynamic Searchable Category Filter */}
            <div className="w-full sm:w-64 shrink-0">
              <SearchableSelect
                value={selectedCategoryFilter === "ALL" ? "" : selectedCategoryFilter}
                onChange={(val) => setSelectedCategoryFilter(val || "ALL")}
                options={["ALL", ...categoriesList]}
                placeholder="Filter by Category..."
                settingsUrl="/products/settings"
                settingsLabel="+ Manage Categories in Settings"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 justify-between sm:justify-end">
            {/* Quick Category Reset Button */}
            {selectedCategoryFilter !== "ALL" && (
              <button
                type="button"
                onClick={() => setSelectedCategoryFilter("ALL")}
                className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline"
              >
                Clear Category Filter ({selectedCategoryFilter})
              </button>
            )}

            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
              Showing {filteredProducts.length} {filteredProducts.length === 1 ? "Product" : "Products"}
            </span>
          </div>
        </div>

        {/* Category Pill Tabs Bar (For Quick Access) */}
        {categoriesList.length > 0 && (
          <div className="px-6 py-2.5 bg-gray-50/50 dark:bg-white/[0.01] border-b border-gray-100 dark:border-white/5 flex items-center gap-2 overflow-x-auto custom-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedCategoryFilter("ALL")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                selectedCategoryFilter === "ALL"
                  ? "bg-brand-600 text-white shadow-xs"
                  : "bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200/60 dark:border-white/10"
              }`}
            >
              All Categories ({allProducts.length})
            </button>

            {categoriesList.map((cat) => {
              const count = allProducts.filter((p) => p.category?.toLowerCase() === cat.toLowerCase()).length;
              const isSelected = selectedCategoryFilter.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-brand-600 text-white shadow-xs font-bold"
                      : "bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200/60 dark:border-white/10"
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono ${isSelected ? "bg-white/20 text-white" : "bg-gray-100 dark:bg-white/10 text-gray-500"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Table Area (Always Renders Headers) */}
        <div className="w-full overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-gray-50/50 dark:bg-white/[0.01]">
                <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Product Details</TableCell>
                <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Category &amp; UOM</TableCell>
                <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 text-right">Base Points</TableCell>
                <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 text-right">Price (KES)</TableCell>
                <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Status</TableCell>
                <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 text-right">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-7 w-7 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
                      <span className="text-xs font-medium text-gray-400">Loading catalog items...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <TableRow key={product.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">

                    <TableCell className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold text-xs border border-brand-500/20 shadow-2xs">
                          {product.name?.charAt(0)?.toUpperCase() || "P"}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
                            {product.name}
                          </span>
                          <span className="text-[11px] text-gray-400 mt-0.5 font-mono">
                            SKU: {product.sku}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-3.5 px-6">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          {product.category || "General"}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          UOM: {product.unitOfMeasure || "Unit"}
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
                        {searchTerm || selectedCategoryFilter !== "ALL" ? "No matching products found" : "No products in catalog yet"}
                      </span>
                      <span className="text-[11px] text-gray-400 mt-0.5 mb-3">
                        {searchTerm || selectedCategoryFilter !== "ALL"
                          ? "Try adjusting your search terms or clearing the category filter."
                          : "Create your first product to populate your master catalog."}
                      </span>

                      {!searchTerm && selectedCategoryFilter === "ALL" && (
                        <Link
                          href="/products/new"
                          className="px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-brand-700 transition"
                        >
                          + Create Product Now
                        </Link>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}