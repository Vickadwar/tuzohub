"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Select from "@/components/form/Select";
import DatePicker from "@/components/form/date-picker";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { ChevronDownIcon } from "@/icons";
import { authenticatedFetch } from "@/hooks/useApi";
import { useRouter } from "next/navigation";

export default function NewBatch() {
  const [product, setProduct] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [quantity, setQuantity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productOptions, setProductOptions] = useState<{value: string, label: string}[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await authenticatedFetch("/api/products?limit=100");
        if (res.data) {
          setProductOptions(res.data.map((p: any) => ({
            value: p.id,
            label: `${p.name} (${p.sku})`
          })));
        }
      } catch (error) {
        console.error("Failed to load products");
      }
    }
    fetchProducts();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !batchNumber || !quantity) return alert("Fill required fields");
    setIsSubmitting(true);
    try {
      await authenticatedFetch("/api/vouchers/batches", {
        method: "POST",
        body: JSON.stringify({
          productId: product,
          batchNumber,
          quantity: parseInt(quantity)
        })
      });
      alert("Batch successfully created!");
      router.push("/products/batches");
    } catch (error: any) {
      alert(error.message || "Failed to create batch");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/products/batches"
            className="p-2 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-gray-800 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">
              Register Production Batch
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Initialize a new production run with unique loyalty code generation.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] shadow-theme-sm">
        <form className="space-y-8" onSubmit={handleGenerate}>
          
          {/* General Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3 mb-5">
              1. Batch Logistics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="md:col-span-2">
                <Label>Target Product SKU</Label>
                <div className="relative">
                  <Select 
                    options={productOptions}
                    placeholder="Search SKUs..."
                    onChange={(val) => setProduct(val)}
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                    <ChevronDownIcon/>
                  </span>
                </div>
              </div>

              <div>
                <Label>Batch Reference Number</Label>
                <Input 
                  type="text" 
                  placeholder="e.g. BCH-2026-042"
                  className="font-mono"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  required
                />
              </div>

               <div>
                <Label>Total Units / QR Codes</Label>
                <Input 
                  type="number" 
                  placeholder="25000"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Timelines */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3 mb-5">
              2. Production Timeline
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <DatePicker 
                id="productionDate"
                label="Manufacturing Date"
                placeholder="Select date..."
                mode="single"
              />

              <DatePicker 
                id="expiryDate"
                label="Expiration Date (Optional)"
                placeholder="Select date..."
                mode="single"
              />

            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
            <Link 
              href="/products/batches"
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg dark:text-gray-300 dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </Link>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 shadow-theme-xs transition px-8 disabled:opacity-50"
            >
              {isSubmitting ? "Processing..." : "Generate Batch Codes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
