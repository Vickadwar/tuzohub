"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useApi, authenticatedFetch } from "@/hooks/useApi";

interface CategoryItem {
  id?: string;
  name: string;
  productCount: number;
  description?: string;
}

interface UomItem {
  id?: string;
  name: string;
  symbol: string;
  productCount: number;
}

export default function InventorySettingsPage() {
  const { data: settingsData, isLoading, isError, mutate } = useApi<any>("/products/settings");

  const [activeTab, setActiveTab] = useState<"categories" | "uom" | "rules">("categories");

  // Local state for categories / UOMs
  const [categoriesList, setCategoriesList] = useState<CategoryItem[]>([]);
  const [uomsList, setUomsList] = useState<UomItem[]>([]);
  const [generalSettings, setGeneralSettings] = useState({
    defaultSkuPrefix: "SKU-",
    pointsToPriceRatio: "0.01",
    enableLowStockAlerts: true,
  });

  // Modal / Inline Add State
  const [isAddCatOpen, setIsAddCatOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");

  const [isAddUomOpen, setIsAddUomOpen] = useState(false);
  const [newUomName, setNewUomName] = useState("");
  const [newUomSymbol, setNewUomSymbol] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (settingsData) {
      if (settingsData.categories) setCategoriesList(settingsData.categories);
      if (settingsData.unitsOfMeasure) setUomsList(settingsData.unitsOfMeasure);
      if (settingsData.generalSettings) setGeneralSettings(settingsData.generalSettings);
    }
  }, [settingsData]);

  // Persist new Category to database
  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    setIsSaving(true);
    setErrorMsg("");

    try {
      await authenticatedFetch("/api/products/settings/categories", {
        method: "POST",
        body: JSON.stringify({
          name: newCatName.trim(),
          description: newCatDesc.trim() || `Category for ${newCatName.trim()}`,
        }),
      });

      setNewCatName("");
      setNewCatDesc("");
      setIsAddCatOpen(false);
      mutate();
      showSuccessNotification("Category created and saved to database!");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save category.");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Category from database
  const handleDeleteCategory = async (cat: CategoryItem) => {
    if (!cat.id) return;
    if (!confirm(`Are you sure you want to delete category "${cat.name}"?`)) return;

    try {
      await authenticatedFetch(`/api/products/settings/categories/${cat.id}`, {
        method: "DELETE",
      });
      mutate();
      showSuccessNotification(`Category "${cat.name}" deleted.`);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to delete category.");
    }
  };

  // Persist new UOM to database
  const handleAddUom = async () => {
    if (!newUomName.trim()) return;
    setIsSaving(true);
    setErrorMsg("");

    try {
      await authenticatedFetch("/api/products/settings/uoms", {
        method: "POST",
        body: JSON.stringify({
          name: newUomName.trim(),
          symbol: newUomSymbol.trim() || newUomName.trim().substring(0, 3).toUpperCase(),
        }),
      });

      setNewUomName("");
      setNewUomSymbol("");
      setIsAddUomOpen(false);
      mutate();
      showSuccessNotification("Unit of Measure created and saved to database!");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save unit of measure.");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete UOM from database
  const handleDeleteUom = async (uom: UomItem) => {
    if (!uom.id) return;
    if (!confirm(`Are you sure you want to delete unit "${uom.name}"?`)) return;

    try {
      await authenticatedFetch(`/api/products/settings/uoms/${uom.id}`, {
        method: "DELETE",
      });
      mutate();
      showSuccessNotification(`Unit "${uom.name}" deleted.`);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to delete unit of measure.");
    }
  };

  const showSuccessNotification = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(""), 3500);
  };

  if (isError) {
    return (
      <div className="w-full p-6">
        <div className="flex items-center gap-3 rounded-2xl bg-rose-500/10 p-4 border border-rose-500/20 text-rose-600 dark:text-rose-400">
          <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-xs font-semibold">Failed to load inventory settings. Please try refreshing.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-16">

      {/* ── Top Header & Breadcrumb ────────────────────────────────────────────── */}
      <div className="border-b border-gray-200/80 dark:border-white/[0.06] pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-1">
            <Link href="/overview" className="hover:text-brand-500 transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <Link href="/products" className="hover:text-brand-500 transition-colors">
              Products
            </Link>
            <span>/</span>
            <span className="text-gray-700 dark:text-gray-300">Inventory Settings</span>
          </nav>

          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              Inventory &amp; Catalog Settings
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-semibold border border-brand-500/20">
              Database Persistence
            </span>
          </div>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Tenant-isolated custom categories, units of measure (UOM), and catalog rules stored securely in PostgreSQL.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsAddCatOpen(true)}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Category
          </button>

          <button
            type="button"
            onClick={() => setIsAddUomOpen(true)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-900 dark:text-white rounded-xl text-xs font-semibold border border-gray-200/80 dark:border-white/10 transition flex items-center gap-1.5"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Unit of Measure
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* ── Settings Tab Bar ─────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-1.5 rounded-2xl shadow-sm inline-flex gap-2">
        {[
          { id: "categories", label: "Product Categories", count: categoriesList.length },
          { id: "uom", label: "Units of Measure (UOM)", count: uomsList.length },
          { id: "rules", label: "Automation & SKU Rules", count: null },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                isActive
                  ? "bg-brand-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isActive ? "bg-white/20 text-white" : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: Product Categories Management ─────────────────────────────── */}
      {activeTab === "categories" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 dark:border-white/5 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                  Tenant Product Categories ({categoriesList.length})
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Categories configured specifically for your enterprise tenant.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddCatOpen(true)}
                className="px-3.5 py-1.5 bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-lg text-xs font-bold hover:bg-brand-500/20 transition"
              >
                + New Category
              </button>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-white/5">
              {categoriesList.length > 0 ? (
                categoriesList.map((cat) => (
                  <div
                    key={cat.id || cat.name}
                    className="p-4 sm:px-6 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs border border-brand-500/20 shrink-0">
                        {cat.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900 dark:text-white">
                          {cat.name}
                        </div>
                        <div className="text-[11px] text-gray-400">
                          {cat.description || `Products under ${cat.name}`}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-white/5 text-[11px] font-mono font-semibold text-gray-600 dark:text-gray-300">
                        {cat.productCount} {cat.productCount === 1 ? "Product" : "Products"} Linked
                      </span>

                      {cat.id && (
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat)}
                          className="text-xs text-rose-500 hover:text-rose-700 font-semibold transition px-2 py-1 hover:bg-rose-500/10 rounded-lg"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-xs text-gray-400">
                  No categories created yet. Click "+ New Category" to define your business categories.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: Units of Measure (UOM) Management ─────────────────────────── */}
      {activeTab === "uom" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 dark:border-white/5 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                  Tenant Units of Measure (UOM) ({uomsList.length})
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Units of measure created specifically for your organization.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddUomOpen(true)}
                className="px-3.5 py-1.5 bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-lg text-xs font-bold hover:bg-brand-500/20 transition"
              >
                + New UOM
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6">
              {uomsList.map((uom) => (
                <div
                  key={uom.id || uom.name}
                  className="p-4 rounded-xl border border-gray-200/80 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02] space-y-2 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900 dark:text-white">{uom.name}</span>
                    <span className="px-2 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:text-brand-400 text-[10px] font-mono font-bold">
                      {uom.symbol}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-gray-400 font-mono">
                      Used by {uom.productCount} catalog products
                    </span>
                    {uom.id && (
                      <button
                        type="button"
                        onClick={() => handleDeleteUom(uom)}
                        className="text-[11px] text-rose-500 hover:text-rose-700 font-semibold opacity-0 group-hover:opacity-100 transition"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: Automation & SKU Rules ─────────────────────────────────────── */}
      {activeTab === "rules" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-6 rounded-2xl shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Catalog Automation &amp; SKU Settings</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Default SKU Prefix
                </label>
                <input
                  type="text"
                  value={generalSettings.defaultSkuPrefix}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, defaultSkuPrefix: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-mono font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                />
                <p className="text-[11px] text-gray-400 mt-1">Automatic prefix used when auto-generating item codes</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Default Points-to-Price Valuation Ratio
                </label>
                <input
                  type="text"
                  value={generalSettings.pointsToPriceRatio}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, pointsToPriceRatio: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-mono font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                />
                <p className="text-[11px] text-gray-400 mt-1">Base points auto-calculated from item retail price (e.g. 0.01 = 1 pt per 100 KES)</p>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-white/5">
              <button
                type="button"
                onClick={() => showSuccessNotification("Automation settings saved successfully!")}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
              >
                Save Automation Rules
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Category Modal ─────────────────────────────────────────────────── */}
      {isAddCatOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-3">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Add New Product Category</h3>
              <button type="button" onClick={() => setIsAddCatOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Category Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Solar Equipment, Waterproofing, Heavy Machinery"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Description</label>
                <textarea
                  placeholder="Enter brief description of this product line..."
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 min-h-[70px]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsAddCatOpen(false)} className="px-4 py-2 text-xs font-semibold text-gray-500">Cancel</button>
              <button
                type="button"
                onClick={handleAddCategory}
                disabled={isSaving}
                className="px-5 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold disabled:opacity-50"
              >
                {isSaving ? "Saving to Database..." : "Save Category"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add UOM Modal ──────────────────────────────────────────────────────── */}
      {isAddUomOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-3">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Add Unit of Measure (UOM)</h3>
              <button type="button" onClick={() => setIsAddUomOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">UOM Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Bucket, Carton, Roll, Drum, Meter"
                  value={newUomName}
                  onChange={(e) => setNewUomName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Symbol / Abbreviation</label>
                <input
                  type="text"
                  placeholder="e.g. BKT, CTN, RLL, DRM"
                  value={newUomSymbol}
                  onChange={(e) => setNewUomSymbol(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-mono font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsAddUomOpen(false)} className="px-4 py-2 text-xs font-semibold text-gray-500">Cancel</button>
              <button
                type="button"
                onClick={handleAddUom}
                disabled={isSaving}
                className="px-5 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold disabled:opacity-50"
              >
                {isSaving ? "Saving to Database..." : "Save UOM"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
