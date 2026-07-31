"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authenticatedFetch } from "@/hooks/useApi";

// Premium UI Components
import DatePicker from "@/components/ui/DatePicker";

// ─── Blueprint Interface & Options ───────────────────────────────────────────
interface BlueprintOption {
  id: string;
  title: string;
  badge: string;
  description: string;
  icon: React.ReactNode;
  fulfillmentMode: "POINTS_ACCUMULATION" | "INSTANT_PAYOUT" | "VOUCHER_GENERATE";
  payoutRewardType: "MOBILE_MONEY" | "AIRTIME" | "CATALOG_POINTS" | "SHOPPING_VOUCHER";
  defaultValuationStrategy: "PRODUCT_BASE_MULTIPLIER" | "FLAT_FIXED_REWARD";
  defaultMultiplier: string;
  defaultCashAmount: number;
  defaultPoints: number;
}

const BLUEPRINTS: BlueprintOption[] = [
  {
    id: "INSTANT_MPESA",
    title: "Instant B2C Payout (M-Pesa / Mobile Cash)",
    badge: "INSTANT AUTOMATED B2C",
    description: "Instant gratification: Participant receives immediate M-Pesa cash payout. Payout is dynamically calculated based on product base value multiplied by your custom campaign multiplier.",
    fulfillmentMode: "INSTANT_PAYOUT",
    payoutRewardType: "MOBILE_MONEY",
    defaultValuationStrategy: "PRODUCT_BASE_MULTIPLIER",
    defaultMultiplier: "2.0",
    defaultCashAmount: 100,
    defaultPoints: 0,
    icon: (
      <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    id: "BANKED_POINTS",
    title: "In-Tin Scratch Code (Banked Points)",
    badge: "CATALOG ACCUMULATION",
    description: "Contractors scan codes inside packaging via USSD/SMS and accumulate points to redeem catalog gifts or tier bonuses later.",
    fulfillmentMode: "POINTS_ACCUMULATION",
    payoutRewardType: "CATALOG_POINTS",
    defaultValuationStrategy: "PRODUCT_BASE_MULTIPLIER",
    defaultMultiplier: "1.0",
    defaultCashAmount: 0,
    defaultPoints: 50,
    icon: (
      <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: "INSTANT_AIRTIME",
    title: "Instant Mobile Airtime Topup",
    badge: "TELECOM REWARD",
    description: "Scanning scratch codes immediately dispatches airtime balance directly to the customer's mobile line.",
    fulfillmentMode: "INSTANT_PAYOUT",
    payoutRewardType: "AIRTIME",
    defaultValuationStrategy: "FLAT_FIXED_REWARD",
    defaultMultiplier: "1.0",
    defaultCashAmount: 50,
    defaultPoints: 0,
    icon: (
      <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: "POS_SPEND",
    title: "Digital Receipt & POS / ERP Spend Ingestion",
    badge: "POS / ERP API INTEGRATED",
    description: "100% digital flow: Enterprise POS or ERP checkout sends purchase data via REST API to reward customers automatically.",
    fulfillmentMode: "POINTS_ACCUMULATION",
    payoutRewardType: "CATALOG_POINTS",
    defaultValuationStrategy: "PRODUCT_BASE_MULTIPLIER",
    defaultMultiplier: "2.0",
    defaultCashAmount: 0,
    defaultPoints: 100,
    icon: (
      <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
];

interface ChannelConfig {
  id: string;
  type: string;
  value: string;
  description: string;
  isActive: boolean;
}

interface ProductItem {
  id: string;
  name: string;
  sku: string;
  category?: string;
  unitOfMeasure?: string;
  pointsPerUnit?: string | number;
  price?: string | number;
}

export default function EnterpriseCampaignWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [highestStepReached, setHighestStepReached] = useState(1);
  const [selectedBlueprint, setSelectedBlueprint] = useState<string>("INSTANT_MPESA");

  // Real Master Catalog State
  const [tenantChannels, setTenantChannels] = useState<ChannelConfig[]>([]);
  const [masterProducts, setMasterProducts] = useState<ProductItem[]>([]);
  const [loadingMasterData, setLoadingMasterData] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "Enterprise Multi-Product Reward Campaign",
    description: "Dynamic product-level B2C payout campaign with custom prerequisites and auto-calculated rewards.",
    campaignType: "CASHBACK",
    pointsMultiplier: "2.0",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    isRecurring: false,
    // Valuation & Rules
    valuationStrategy: "PRODUCT_BASE_MULTIPLIER" as "PRODUCT_BASE_MULTIPLIER" | "FLAT_FIXED_REWARD",
    fulfillmentMode: "INSTANT_PAYOUT" as "POINTS_ACCUMULATION" | "INSTANT_PAYOUT" | "VOUCHER_GENERATE",
    payoutRewardType: "MOBILE_MONEY" as "MOBILE_MONEY" | "AIRTIME" | "CATALOG_POINTS" | "SHOPPING_VOUCHER",
    instantCashAmount: 100,
    pointsPerScan: 50,
    selectedProductIds: [] as string[],
    // Broad Prerequisites & Eligibility Criteria
    targetTiers: ["ALL"] as string[],
    minOrderValue: 0,
    firstScanBonusPoints: 0,
    categoryFilter: "ALL",
    // Safety & Budget
    dailyScanLimit: 10,
    totalBudgetCap: 500000,
    // Channels & POS / ERP
    selectedChannels: ["USSD", "SMS", "WEB_APP", "POS_API"] as string[],
    webhookUrl: "https://erp.tenant.com/api/tuzohub-callbacks",
  });

  // Product Catalog Picker Modal State
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerCategory, setPickerCategory] = useState("ALL");
  const [tempSelectedIds, setTempSelectedIds] = useState<string[]>([]);

  const [activeCodeTab, setActiveCodeTab] = useState<"curl" | "fetch" | "python" | "node">("curl");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stepError, setStepError] = useState("");

  const activeBlueprint = BLUEPRINTS.find((b) => b.id === selectedBlueprint) || BLUEPRINTS[0];

  // Fetch real channels & catalog products from database on mount
  useEffect(() => {
    async function loadMasterData() {
      setLoadingMasterData(true);
      try {
        const [chanRes, prodRes] = await Promise.all([
          authenticatedFetch("/api/tenants/channels").catch(() => null),
          authenticatedFetch("/api/products?limit=200").catch(() => null),
        ]);

        if (chanRes && chanRes.ok) {
          const json = await chanRes.json();
          if (json.success && Array.isArray(json.data)) {
            setTenantChannels(json.data);
          }
        }

        if (prodRes && prodRes.ok) {
          const json = await prodRes.json();
          if (json.success && Array.isArray(json.data)) {
            setMasterProducts(json.data);
            // Default select all catalog items initially
            setFormData((prev) => ({
              ...prev,
              selectedProductIds: json.data.map((p: any) => p.id),
            }));
          }
        }
      } catch (err) {
        console.warn("Could not load master channels/products", err);
      } finally {
        setLoadingMasterData(false);
      }
    }
    loadMasterData();
  }, []);

  // Blueprint change handler
  const handleSelectBlueprint = (bp: BlueprintOption) => {
    setSelectedBlueprint(bp.id);
    setFormData((prev) => ({
      ...prev,
      fulfillmentMode: bp.fulfillmentMode,
      payoutRewardType: bp.payoutRewardType,
      valuationStrategy: bp.defaultValuationStrategy,
      pointsMultiplier: bp.defaultMultiplier,
      instantCashAmount: bp.defaultCashAmount,
      pointsPerScan: bp.defaultPoints,
      campaignType: bp.fulfillmentMode === "INSTANT_PAYOUT" ? "CASHBACK" : "EARNING",
    }));
  };

  // Step Validation Logic
  const validateStep = (step: number): boolean => {
    setStepError("");
    if (step === 1) {
      if (!formData.name.trim()) {
        setStepError("Campaign name is required to proceed.");
        return false;
      }
      return true;
    }
    if (step === 2) {
      if (!formData.startDate) {
        setStepError("Campaign Launch Start Date is required.");
        return false;
      }
      if (formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
        setStepError("Expiry Date cannot be prior to Start Date.");
        return false;
      }
      const mult = parseFloat(formData.pointsMultiplier);
      if (isNaN(mult) || mult <= 0) {
        setStepError("Please enter a valid positive multiplier factor (e.g. 1.5, 2.0).");
        return false;
      }
      if (formData.selectedProductIds.length === 0) {
        setStepError("Please select at least one product from your catalog to link to this campaign.");
        return false;
      }
      return true;
    }
    if (step === 3) {
      if (formData.dailyScanLimit <= 0) {
        setStepError("Daily scan limit per user must be at least 1.");
        return false;
      }
      if (formData.totalBudgetCap <= 0) {
        setStepError("Financial budget cap must be greater than KES 0.");
        return false;
      }
      return true;
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      const next = currentStep + 1;
      setCurrentStep(next);
      if (next > highestStepReached) {
        setHighestStepReached(next);
      }
    }
  };

  const handleStepClick = (stepTarget: number) => {
    if (stepTarget < currentStep) {
      setCurrentStep(stepTarget);
      setStepError("");
    } else if (stepTarget > currentStep) {
      if (validateStep(currentStep)) {
        if (stepTarget <= highestStepReached + 1) {
          setCurrentStep(stepTarget);
          if (stepTarget > highestStepReached) {
            setHighestStepReached(stepTarget);
          }
        }
      }
    }
  };

  const handleChannelToggle = (channelType: string) => {
    setFormData((prev) => {
      const exists = prev.selectedChannels.includes(channelType);
      const updated = exists
        ? prev.selectedChannels.filter((c) => c !== channelType)
        : [...prev.selectedChannels, channelType];
      return { ...prev, selectedChannels: updated };
    });
  };

  const handleRemoveProductFromCampaign = (productId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedProductIds: prev.selectedProductIds.filter((id) => id !== productId),
    }));
  };

  const handleTierToggle = (tier: string) => {
    setFormData((prev) => {
      if (tier === "ALL") return { ...prev, targetTiers: ["ALL"] };
      const filtered = prev.targetTiers.filter((t) => t !== "ALL");
      const exists = filtered.includes(tier);
      const updated = exists ? filtered.filter((t) => t !== tier) : [...filtered, tier];
      return { ...prev, targetTiers: updated.length === 0 ? ["ALL"] : updated };
    });
  };

  // Open Catalog Picker Modal
  const openProductPicker = () => {
    setTempSelectedIds([...formData.selectedProductIds]);
    setPickerSearch("");
    setPickerCategory("ALL");
    setIsPickerOpen(true);
  };

  const togglePickerTempId = (id: string) => {
    setTempSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const applyPickerSelection = () => {
    setFormData((prev) => ({
      ...prev,
      selectedProductIds: [...tempSelectedIds],
    }));
    setIsPickerOpen(false);
  };

  // Dynamic Filtering for Catalog Picker Modal
  const uniqueCategories = Array.from(
    new Set(masterProducts.map((p) => p.category).filter(Boolean))
  );

  const filteredMasterProducts = masterProducts.filter((p) => {
    const matchesSearch =
      !pickerSearch.trim() ||
      p.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(pickerSearch.toLowerCase());
    const matchesCategory =
      pickerCategory === "ALL" || p.category === pickerCategory;
    return matchesSearch && matchesCategory;
  });

  // Submit Handler
  const handleSubmit = async () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) return;

    setIsSubmitting(true);
    setStepError("");

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        campaignType: formData.campaignType,
        pointsMultiplier: formData.pointsMultiplier,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        isRecurring: formData.isRecurring,
        isActive: true,
        ruleConfig: {
          fulfillmentMode: formData.fulfillmentMode,
          payoutRewardType: formData.payoutRewardType,
          valuationStrategy: formData.valuationStrategy,
          instantCashAmount: formData.instantCashAmount,
          pointsPerScan: formData.pointsPerScan,
          dailyScanLimit: formData.dailyScanLimit,
          totalBudgetCap: formData.totalBudgetCap,
          channels: formData.selectedChannels,
          productIds: formData.selectedProductIds,
          webhookUrl: formData.webhookUrl,
          entryRules: {
            targetTiers: formData.targetTiers,
            minOrderValue: formData.minOrderValue,
            firstScanBonusPoints: formData.firstScanBonusPoints,
            categoryFilter: formData.categoryFilter,
          },
        },
      };

      const res = await authenticatedFetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => res);

      if (data.success || res.ok) {
        router.push("/campaigns");
      } else {
        setStepError(data.error || "Failed to launch campaign.");
      }
    } catch (err: any) {
      setStepError(err.message || "Network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const multiplierFactor = parseFloat(formData.pointsMultiplier) || 1.0;
  const linkedProductsList = masterProducts.filter((p) =>
    formData.selectedProductIds.includes(p.id)
  );

  return (
    <div className="w-full pb-20 animate-fadeIn space-y-6">

      {/* ── Breadcrumb & Top Bar Controls ──────────────────────────────────────── */}
      <div className="border-b border-gray-200/80 dark:border-white/[0.06] pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-1">
            <Link href="/overview" className="hover:text-brand-500 transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <Link href="/campaigns" className="hover:text-brand-500 transition-colors">
              Campaigns
            </Link>
            <span>/</span>
            <span className="text-gray-700 dark:text-gray-300">Campaign Wizard</span>
          </nav>

          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              Enterprise Campaign Builder
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold border border-brand-500/20">
              Catalog Integrated
            </span>
          </div>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Select products directly from your master catalog with dynamic search, custom multipliers, and prerequisites.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/campaigns"
            className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
          >
            Cancel
          </Link>

          {currentStep > 1 && (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="px-4 py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-xl transition"
            >
              Previous
            </button>
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl transition shadow-md shadow-brand-500/20 flex items-center gap-2"
            >
              Next: {currentStep === 1 ? "Rules & Catalog Products" : currentStep === 2 ? "Safety & Budget" : "Channels & Launch"}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-emerald-500/20 disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Deploying Engine...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Deploy Campaign Engine
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* ── Stepwise Wizard Navigation Bar ──────────────────────────────────────── */}
      <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-4 rounded-2xl shadow-sm">
        <div className="grid grid-cols-4 gap-2">
          {[
            { step: 1, title: "1. Blueprint", sub: "Model & Basic Details" },
            { step: 2, title: "2. Products & Rules", sub: "Catalog Picker & Multipliers" },
            { step: 3, title: "3. Safety & Circuit Breakers", sub: "Velocity Limits & Budget" },
            { step: 4, title: "4. Channels & POS", sub: "Shortcodes & Integration" },
          ].map((item) => {
            const isActive = currentStep === item.step;
            const isCompleted = currentStep > item.step;
            const isAccessible = item.step <= highestStepReached + 1;

            return (
              <button
                key={item.step}
                type="button"
                onClick={() => handleStepClick(item.step)}
                disabled={!isAccessible}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isActive
                    ? "bg-brand-500/10 border-brand-500 text-brand-600 dark:text-brand-400 ring-2 ring-brand-500/20"
                    : isCompleted
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 cursor-pointer"
                    : isAccessible
                    ? "bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/5 text-gray-700 dark:text-gray-300 hover:border-brand-500/40"
                    : "bg-gray-50/50 dark:bg-white/[0.01] border-gray-200/50 dark:border-white/5 text-gray-400 opacity-50 cursor-not-allowed"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{item.title}</span>
                  {isCompleted && (
                    <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </span>
                  )}
                </div>
                <p className="text-[10px] opacity-80 mt-0.5">{item.sub}</p>
              </button>
            );
          })}
        </div>
      </div>

      {stepError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-semibold flex items-center gap-2.5">
          <svg className="w-4 h-4 shrink-0 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{stepError}</span>
        </div>
      )}

      {/* ── Main Layout: 2-Column Grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-6">

        {/* Left 8 Columns: Step Form Content */}
        <div className="col-span-12 xl:col-span-8 space-y-6">

          {/* STEP 1: Campaign Blueprint & Basic Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-6 rounded-2xl shadow-sm space-y-4">
                <div>
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white">1. Select Campaign Blueprint Model</h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Select how customer transactions, scratch code scans, or POS receipts trigger rewards.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3.5">
                  {BLUEPRINTS.map((bp) => {
                    const isSelected = selectedBlueprint === bp.id;
                    return (
                      <div
                        key={bp.id}
                        onClick={() => handleSelectBlueprint(bp)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-4 ${
                          isSelected
                            ? "bg-brand-500/10 border-brand-500 text-gray-900 dark:text-white shadow-sm ring-1 ring-brand-500/30"
                            : "bg-gray-50/50 dark:bg-white/[0.02] border-gray-200 dark:border-white/10 hover:border-brand-500/40"
                        }`}
                      >
                        <div className="p-2.5 rounded-xl bg-white dark:bg-white/10 shadow-xs shrink-0">
                          {bp.icon}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-gray-900 dark:text-white">{bp.title}</h3>
                            <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-brand-500/20 text-brand-600 dark:text-brand-400">
                              {bp.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                            {bp.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-6 rounded-2xl shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">Campaign Basic Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                      Campaign Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Q3 Multi-Product Cash Payout & Banked Points Promo"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                      Description / Terms
                    </label>
                    <textarea
                      placeholder="Enter promotional terms, contractor requirements, or scratch code instructions..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full p-3 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 min-h-[80px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Products Selection via Catalog Picker Modal & Custom Multipliers */}
          {currentStep === 2 && (
            <div className="space-y-6">

              {/* Valuation Strategy & Unconstrained Multiplier Input */}
              <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-6 rounded-2xl shadow-sm space-y-4">
                <div>
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white">2. Valuation Strategy &amp; Custom Multiplier</h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Define how customer rewards are calculated across your catalog products.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div
                    onClick={() => setFormData({ ...formData, valuationStrategy: "PRODUCT_BASE_MULTIPLIER" })}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      formData.valuationStrategy === "PRODUCT_BASE_MULTIPLIER"
                        ? "bg-brand-500/10 border-brand-500 text-brand-600 dark:text-brand-400 ring-1 ring-brand-500/20"
                        : "bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/5 text-gray-500"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">Dynamic Product Base × Custom Multiplier</span>
                      {formData.valuationStrategy === "PRODUCT_BASE_MULTIPLIER" && (
                        <span className="text-emerald-500 font-bold text-xs">✓ Active</span>
                      )}
                    </div>
                    <p className="text-[11px] opacity-80 leading-relaxed">
                      Auto-calculate payout per product: <strong className="font-mono">Product Base Value × Campaign Multiplier</strong>.
                    </p>
                  </div>

                  <div
                    onClick={() => setFormData({ ...formData, valuationStrategy: "FLAT_FIXED_REWARD" })}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      formData.valuationStrategy === "FLAT_FIXED_REWARD"
                        ? "bg-brand-500/10 border-brand-500 text-brand-600 dark:text-brand-400 ring-1 ring-brand-500/20"
                        : "bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/5 text-gray-500"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">Flat Uniform Reward Amount</span>
                      {formData.valuationStrategy === "FLAT_FIXED_REWARD" && (
                        <span className="text-emerald-500 font-bold text-xs">✓ Active</span>
                      )}
                    </div>
                    <p className="text-[11px] opacity-80 leading-relaxed">
                      Every scan pays a fixed uniform amount regardless of which product is scanned.
                    </p>
                  </div>
                </div>

                {/* Unconstrained Multiplier Input */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-gray-100 dark:border-white/5">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                      Campaign Points / Payout Multiplier Factor (Custom)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1.75, 2.5, 3.0"
                      value={formData.pointsMultiplier}
                      onChange={(e) => setFormData({ ...formData, pointsMultiplier: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-bold font-mono text-purple-600 dark:text-purple-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">Enter any numeric multiplier factor to scale base product values</p>
                  </div>

                  {formData.valuationStrategy === "FLAT_FIXED_REWARD" && (
                    <div>
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                        Flat Payout Amount (KES / Points)
                      </label>
                      <input
                        type="number"
                        value={formData.instantCashAmount}
                        onChange={(e) => setFormData({ ...formData, instantCashAmount: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                      />
                      <p className="text-[11px] text-gray-400 mt-1">Uniform reward amount paid out per code scan</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Campaign Linked Products Table + Open Catalog Picker Button */}
              <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-6 rounded-2xl shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                        Campaign Included Products
                      </h2>
                      <span className="px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-mono font-bold">
                        {linkedProductsList.length} Selected
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Select existing items from your catalog to include in this campaign.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={openProductPicker}
                      className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      Select Products from Catalog
                    </button>
                  </div>
                </div>

                {linkedProductsList.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-gray-200 dark:border-white/10 rounded-xl space-y-2">
                    <p className="text-xs text-gray-400">No products currently added to campaign.</p>
                    <button
                      type="button"
                      onClick={openProductPicker}
                      className="px-4 py-2 bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-lg text-xs font-bold"
                    >
                      + Browse Catalog Items
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-gray-200/80 dark:border-white/10 rounded-xl">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-white/[0.03] border-b border-gray-200/80 dark:border-white/10 text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">
                          <th className="p-3">Product Name</th>
                          <th className="p-3">SKU / Code</th>
                          <th className="p-3">Category</th>
                          <th className="p-3 text-right">Base Value</th>
                          <th className="p-3 text-right font-bold text-brand-600 dark:text-brand-400">
                            Calculated Reward ({formData.pointsMultiplier}x)
                          </th>
                          <th className="p-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                        {linkedProductsList.map((prod) => {
                          const basePoints = Number(prod.pointsPerUnit || 0);
                          const calculatedPayout = formData.valuationStrategy === "PRODUCT_BASE_MULTIPLIER"
                            ? basePoints * multiplierFactor
                            : formData.instantCashAmount;

                          return (
                            <tr key={prod.id} className="hover:bg-gray-50/80 dark:hover:bg-white/[0.02] transition">
                              <td className="p-3 font-semibold text-gray-900 dark:text-white">
                                {prod.name}
                              </td>
                              <td className="p-3 font-mono text-[11px] text-gray-500 dark:text-gray-400">
                                {prod.sku}
                              </td>
                              <td className="p-3 text-gray-500 dark:text-gray-400">
                                <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-white/5 text-[10px] font-mono">
                                  {prod.category || "General"}
                                </span>
                              </td>
                              <td className="p-3 text-right font-mono font-semibold text-gray-700 dark:text-gray-300">
                                {basePoints} PTS / KES
                              </td>
                              <td className="p-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                {formData.fulfillmentMode === "INSTANT_PAYOUT"
                                  ? `KES ${calculatedPayout.toLocaleString()} Cash`
                                  : `${calculatedPayout.toLocaleString()} PTS`}
                              </td>
                              <td className="p-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveProductFromCampaign(prod.id)}
                                  className="text-rose-500 hover:text-rose-700 text-xs font-bold"
                                  title="Remove from campaign"
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Broad Prerequisites & Eligibility Criteria */}
              <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-6 rounded-2xl shadow-sm space-y-4">
                <div>
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                    Campaign Prerequisites &amp; Eligibility Criteria
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Configure prerequisite criteria that participants or transactions must satisfy to qualify.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Customer Tier Eligibility */}
                  <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                      Eligible Customer Tiers
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "ALL", label: "All Customers" },
                        { id: "PLATINUM", label: "Platinum Tier" },
                        { id: "GOLD", label: "Gold Tier" },
                        { id: "SILVER", label: "Silver Tier" },
                      ].map((t) => {
                        const isChecked = formData.targetTiers.includes(t.id);
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => handleTierToggle(t.id)}
                            className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition ${
                              isChecked
                                ? "bg-brand-500/10 border-brand-500 text-brand-600 dark:text-brand-400"
                                : "bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/5 text-gray-400"
                            }`}
                          >
                            {isChecked ? "✓ " : "+ "} {t.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Minimum Transaction Spend Threshold */}
                  <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                      Minimum Basket / Invoice Value (KES)
                    </label>
                    <input
                      type="number"
                      placeholder="0 for all purchases"
                      value={formData.minOrderValue}
                      onChange={(e) => setFormData({ ...formData, minOrderValue: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-mono font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">Minimum invoice spend required before rewards kick in</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-white/5">
                  {/* First Scan Bonus Points */}
                  <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                      First-Time Participant Welcome Bonus (PTS / KES)
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={formData.firstScanBonusPoints}
                      onChange={(e) => setFormData({ ...formData, firstScanBonusPoints: parseInt(e.target.value) || 0 })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-mono font-bold text-brand-600 dark:text-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">One-time extra bonus credited on first scan in this campaign</p>
                  </div>

                  {/* Active Validity Window */}
                  <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                      Campaign Launch Start Date *
                    </label>
                    <DatePicker
                      value={formData.startDate}
                      onChange={(val) => setFormData({ ...formData, startDate: val })}
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* STEP 3: Velocity, Security & Financial Circuit Breaker */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-6 rounded-2xl shadow-sm space-y-4">
                <div>
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white">3. Velocity Protection &amp; Financial Budget Cap</h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Prevent automated code-guessing scripts and set financial safety circuit breakers.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                      Daily Max Scans Per Participant Phone *
                    </label>
                    <input
                      type="number"
                      value={formData.dailyScanLimit}
                      onChange={(e) => setFormData({ ...formData, dailyScanLimit: parseInt(e.target.value) || 1 })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-mono font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">Excess scan attempts trigger automatic fraud alerts</p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                      Total Campaign Financial Budget Cap (KES) *
                    </label>
                    <input
                      type="number"
                      value={formData.totalBudgetCap}
                      onChange={(e) => setFormData({ ...formData, totalBudgetCap: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">Engine pauses automatically once cumulative payouts hit budget cap</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Channels, Real Shortcodes & POS Integration */}
          {currentStep === 4 && (
            <div className="space-y-6">

              {/* Real Deployed Channels Selector */}
              <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-6 rounded-2xl shadow-sm space-y-4">
                <div>
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white">4. Deployed Channels &amp; Real Shortcodes</h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Select participant submission entry points configured for your organization.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: "USSD", name: "Official Bonga USSD Gateway", code: "*483*55#", badge: "USSD REAL SHORTCODE" },
                    { id: "SMS", name: "Olive Tree Media SMS", code: "22384", badge: "SMS SHORTCODE" },
                    { id: "WEB_APP", name: "Web & PWA Scanner Portal", code: "/p/scan", badge: "QR SCANNER" },
                    { id: "POS_API", name: "POS / ERP Ingestion API", code: "/api/public/scan", badge: "ENTERPRISE REST API" },
                  ].map((ch) => {
                    const isChecked = formData.selectedChannels.includes(ch.id);
                    return (
                      <div
                        key={ch.id}
                        onClick={() => handleChannelToggle(ch.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                          isChecked
                            ? "bg-brand-500/10 border-brand-500 text-brand-600 dark:text-brand-400 ring-1 ring-brand-500/20"
                            : "bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/5 text-gray-500"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-900 dark:text-white">{ch.name}</span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-brand-500/20 text-brand-600 dark:text-brand-400">
                              {ch.badge}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono font-semibold text-brand-500">{ch.code}</div>
                        </div>
                        <span className="text-xs font-bold">{isChecked ? "✓ Enabled" : "+ Enable"}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* POS / ERP Integration & Developer REST API Panel */}
              <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-6 rounded-2xl shadow-sm space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                      Enterprise POS / ERP REST API Integration
                    </h2>
                    <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-mono font-bold border border-purple-500/20">
                      REST API v1
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Connect POS terminals or custom ERP systems (SAP, Odoo, custom software) to process sales events in real-time.
                  </p>
                </div>

                {/* API Code Tabs */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden text-xs">
                  <div className="flex items-center justify-between bg-gray-950 px-4 py-2 border-b border-gray-800">
                    <div className="flex gap-2">
                      {(["curl", "fetch", "python", "node"] as const).map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setActiveCodeTab(tab)}
                          className={`px-3 py-1 rounded text-xs font-mono font-semibold transition ${
                            activeCodeTab === tab
                              ? "bg-brand-600 text-white"
                              : "text-gray-400 hover:text-white"
                          }`}
                        >
                          {tab === "curl" ? "cURL" : tab === "fetch" ? "JavaScript" : tab === "python" ? "Python" : "Node.js"}
                        </button>
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono">POST /api/public/scan</span>
                  </div>

                  <div className="p-4 font-mono text-[11px] text-emerald-400 overflow-x-auto">
                    {activeCodeTab === "curl" && (
                      <pre>{`curl -X POST https://tuzohub.co.ke/api/public/scan \\
  -H "Content-Type: application/json" \\
  -H "X-Tenant-Api-Key: tsk_live_YOUR_API_KEY" \\
  -d '{
    "sku": "${linkedProductsList[0]?.sku || "PNT-4L-GLOSS"}",
    "secureCode": "SCR-9812-4421",
    "customerPhone": "+254712345678",
    "channel": "POS_API"
  }'`}</pre>
                    )}

                    {activeCodeTab === "fetch" && (
                      <pre>{`await fetch("https://tuzohub.co.ke/api/public/scan", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Tenant-Api-Key": "tsk_live_YOUR_API_KEY"
  },
  body: JSON.stringify({
    sku: "${linkedProductsList[0]?.sku || "PNT-4L-GLOSS"}",
    secureCode: "SCR-9812-4421",
    customerPhone: "+254712345678",
    channel: "POS_API"
  })
});`}</pre>
                    )}

                    {activeCodeTab === "python" && (
                      <pre>{`import requests

response = requests.post(
    "https://tuzohub.co.ke/api/public/scan",
    headers={"X-Tenant-Api-Key": "tsk_live_YOUR_API_KEY"},
    json={
        "sku": "${linkedProductsList[0]?.sku || "PNT-4L-GLOSS"}",
        "secureCode": "SCR-9812-4421",
        "customerPhone": "+254712345678",
        "channel": "POS_API"
    }
)`}</pre>
                    )}

                    {activeCodeTab === "node" && (
                      <pre>{`const { TuzohubClient } = require("@tuzohub/sdk");
const client = new TuzohubClient({ apiKey: "tsk_live_YOUR_API_KEY" });

const result = await client.scans.process({
  sku: "${linkedProductsList[0]?.sku || "PNT-4L-GLOSS"}",
  secureCode: "SCR-9812-4421",
  customerPhone: "+254712345678"
});`}</pre>
                    )}
                  </div>
                </div>

                {/* ERP Webhook Endpoint Input */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                    Real-time POS/ERP Webhook Callback URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://erp.tenant.com/api/tuzohub-callbacks"
                    value={formData.webhookUrl}
                    onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-mono text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Receive instant POST notifications whenever a payout is dispatched</p>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Right 4 Columns: Live Engine Simulation Panel */}
        <div className="col-span-12 xl:col-span-4 space-y-6">
          <div className="bg-gradient-to-br from-gray-900 via-gray-950 to-black border border-gray-800 p-6 rounded-2xl text-white shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <span className="text-xs font-semibold text-brand-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Engine Simulation
              </span>
              <span className="text-[10px] font-mono text-gray-500">Real-time Calculation</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Model Blueprint:</span>
                <span className="font-mono text-white font-bold">{activeBlueprint.badge}</span>
              </div>

              <div className="flex justify-between text-gray-400">
                <span>Valuation Model:</span>
                <span className="font-mono text-brand-300 font-bold">
                  {formData.valuationStrategy === "PRODUCT_BASE_MULTIPLIER" ? "Base × Multiplier" : "Flat Reward"}
                </span>
              </div>

              <div className="flex justify-between text-gray-400">
                <span>Applied Multiplier:</span>
                <span className="font-mono text-purple-400 font-bold">{formData.pointsMultiplier}x</span>
              </div>

              <div className="flex justify-between text-gray-400">
                <span>Included Products:</span>
                <span className="font-mono text-emerald-400 font-bold">{linkedProductsList.length} Items</span>
              </div>

              {/* Dynamic Catalog Product Calculations */}
              <div className="pt-2 border-t border-gray-800 space-y-2">
                <div className="text-[11px] font-semibold text-gray-400">Campaign Payout Sample:</div>
                {linkedProductsList.slice(0, 3).map((prod) => {
                  const base = Number(prod.pointsPerUnit || 0);
                  const calc = formData.valuationStrategy === "PRODUCT_BASE_MULTIPLIER"
                    ? base * multiplierFactor
                    : formData.instantCashAmount;
                  return (
                    <div key={prod.id} className="flex justify-between items-center text-xs">
                      <span className="text-gray-300 truncate max-w-[150px]">{prod.name}:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {formData.fulfillmentMode === "INSTANT_PAYOUT"
                          ? `KES ${calc.toLocaleString()}`
                          : `${calc.toLocaleString()} PTS`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Safety & Prerequisite Summary Card */}
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-6 rounded-2xl shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Prerequisite &amp; Safety Summary
            </h3>
            <div className="space-y-2.5 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Eligible Tiers:</span>
                <strong className="text-brand-500 font-mono">{formData.targetTiers.join(", ")}</strong>
              </div>
              <div className="flex justify-between">
                <span>Min Order Spend:</span>
                <strong className="text-gray-900 dark:text-white font-mono">KES {formData.minOrderValue}</strong>
              </div>
              <div className="flex justify-between">
                <span>Daily User Limit:</span>
                <strong className="text-gray-900 dark:text-white">{formData.dailyScanLimit} scans/day</strong>
              </div>
              <div className="flex justify-between">
                <span>Financial Budget Cap:</span>
                <strong className="text-emerald-600 dark:text-emerald-400 font-mono">KES {formData.totalBudgetCap.toLocaleString()}</strong>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── Dynamic Product Catalog Picker Modal ───────────────────────────────── */}
      {isPickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-3 shrink-0">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Select Products from Master Catalog
                </h3>
                <p className="text-xs text-gray-400">
                  Search and pick items from your company's product management database.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {/* Dynamic Search & Filter Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0">
              <div className="sm:col-span-2 relative">
                <input
                  type="text"
                  placeholder="Search by Product Name or SKU..."
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                />
                <svg
                  className="w-4 h-4 text-gray-400 absolute left-3 top-2.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <div>
                <select
                  value={pickerCategory}
                  onChange={(e) => setPickerCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                >
                  <option value="ALL">All Categories</option>
                  {uniqueCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selection Bar: Bulk Actions */}
            <div className="flex items-center justify-between text-xs bg-gray-50 dark:bg-white/[0.02] p-2.5 rounded-xl border border-gray-200/60 dark:border-white/5 shrink-0">
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                {tempSelectedIds.length} of {masterProducts.length} Products Selected
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setTempSelectedIds(filteredMasterProducts.map((p) => p.id))
                  }
                  className="text-brand-600 dark:text-brand-400 font-bold hover:underline"
                >
                  Select All Filtered
                </button>
                <span>|</span>
                <button
                  type="button"
                  onClick={() => setTempSelectedIds([])}
                  className="text-gray-500 hover:underline"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Scrollable Catalog Item List */}
            <div className="overflow-y-auto flex-1 border border-gray-200/80 dark:border-white/10 rounded-xl divide-y divide-gray-100 dark:divide-white/5">
              {filteredMasterProducts.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400">
                  No products matched your search "{pickerSearch}".
                </div>
              ) : (
                filteredMasterProducts.map((prod) => {
                  const isChecked = tempSelectedIds.includes(prod.id);
                  const basePoints = Number(prod.pointsPerUnit || 0);

                  return (
                    <div
                      key={prod.id}
                      onClick={() => togglePickerTempId(prod.id)}
                      className={`p-3.5 flex items-center justify-between cursor-pointer transition hover:bg-gray-50 dark:hover:bg-white/[0.02] ${
                        isChecked ? "bg-brand-500/[0.04]" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                        />
                        <div>
                          <div className="text-xs font-bold text-gray-900 dark:text-white">
                            {prod.name}
                          </div>
                          <div className="text-[10px] font-mono text-gray-400 flex items-center gap-2">
                            <span>SKU: {prod.sku}</span>
                            <span>•</span>
                            <span className="px-1.5 py-0.2 rounded bg-gray-100 dark:bg-white/5 text-[9px]">
                              {prod.category || "General"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right font-mono text-xs">
                        <div className="font-bold text-gray-900 dark:text-white">
                          {basePoints} Base PTS/KES
                        </div>
                        <div className="text-[10px] text-gray-400">
                          Retail KES {prod.price || "N/A"}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/10 shrink-0">
              <span className="text-xs text-gray-400 font-mono">
                {tempSelectedIds.length} items ready to add
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPickerOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyPickerSelection}
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  Add {tempSelectedIds.length} Selected Products
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}