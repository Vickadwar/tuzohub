"use client";

import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { 
  Download, 
  Printer, 
  CheckCircle2, 
  Building2, 
  Receipt, 
  ShieldCheck, 
  ExternalLink
} from "lucide-react";

interface HotelReceipt {
  id: string;
  name: string;
  location: string;
  town: string;
  kraPin: string;
  cuNumber: string;
  cuSerialNumber: string;
  invoiceNo: string;
  date: string;
  time: string;
  amount: number;
  customerPin: string;
  customerPinLabel: string;
  cashierName: string;
  customerName: string;
  accommodationDesc: string;
  paymentMethod: string;
  mpesaRef: string;
}

const HOTEL_RECEIPTS: HotelReceipt[] = [
  {
    id: "wida-highway",
    name: "WIDA HIGHWAY MOTEL",
    location: "Nairobi-Nakuru Highway, Kikuyu",
    town: "Kikuyu",
    kraPin: "P051382910M",
    cuNumber: "KRA0820260722104",
    cuSerialNumber: "CU-KRA-KIKU-88219",
    invoiceNo: "ETIMS-WIDA-2026-0892",
    date: "22/07/2026",
    time: "14:35:10",
    amount: 18600,
    customerPin: "P000593540R",
    customerPinLabel: "CUST KRA PIN",
    cashierName: "Mercy W. (POS #01)",
    customerName: "VALUED GUEST",
    accommodationDesc: "Full Accommodation & Executive Bed Breakfast Package",
    paymentMethod: "M-PESA EXPRESS",
    mpesaRef: "RGK99210X4"
  },
  {
    id: "lux-suites",
    name: "LUX SUITES RACECOURSE GARDEN",
    location: "Ngong Road, Kawangware, Nairobi",
    town: "Kawangware",
    kraPin: "P051948271Z",
    cuNumber: "KRA0820260727845",
    cuSerialNumber: "CU-KRA-LUX-44912",
    invoiceNo: "ETIMS-LUX-2026-1140",
    date: "27/07/2026",
    time: "11:20:45",
    amount: 14000,
    customerPin: "P000593540R",
    customerPinLabel: "BUYER PIN",
    cashierName: "Dennis K. (Front Desk)",
    customerName: "VALUED GUEST",
    accommodationDesc: "Furnished Luxury Studio Serviced Apartment Accommodation",
    paymentMethod: "VISA CARD / M-PESA",
    mpesaRef: "TXN-LUX-77412"
  },
  {
    id: "al-rahma",
    name: "AL RAHMA HOTEL & RESTAURANT",
    location: "Kismayo Road, Garissa Town",
    town: "Garissa",
    kraPin: "P051274930Q",
    cuNumber: "KRA0820260726309",
    cuSerialNumber: "CU-KRA-GAR-10923",
    invoiceNo: "ETIMS-ALRAHMA-2026-0451",
    date: "26/07/2026",
    time: "16:50:00",
    amount: 12200,
    customerPin: "P000593540R",
    customerPinLabel: "CLIENT TAX PIN",
    cashierName: "Fatuma A. (Station #03)",
    customerName: "VALUED GUEST",
    accommodationDesc: "Accommodation Stay & Full Board Catering Services",
    paymentMethod: "M-PESA PAYBILL",
    mpesaRef: "RGK44319Z1"
  },
  {
    id: "vintex-guest",
    name: "VINTEX GUEST HOUSE",
    location: "Loitokitok Road, Kimana",
    town: "Kimana",
    kraPin: "P051639201L",
    cuNumber: "KRA0820260707512",
    cuSerialNumber: "CU-KRA-KIM-33821",
    invoiceNo: "ETIMS-VINTEX-2026-0318",
    date: "07/07/2026",
    time: "09:15:30",
    amount: 14500,
    customerPin: "P000593540R",
    customerPinLabel: "PIN OF BUYER",
    cashierName: "Peter M. (Clerk)",
    customerName: "VALUED GUEST",
    accommodationDesc: "Kimana Lodge Guest House Accommodation Package",
    paymentMethod: "M-PESA EXPRESS",
    mpesaRef: "RGJ11928K9"
  },
  {
    id: "osotua-hotel",
    name: "OSOTUA HOTEL & RESORT",
    location: "South Lake Road, Naivasha",
    town: "Naivasha",
    kraPin: "P051493018X",
    cuNumber: "KRA0820260710667",
    cuSerialNumber: "CU-KRA-NAI-99301",
    invoiceNo: "ETIMS-OSOTUA-2026-0975",
    date: "10/07/2026",
    time: "18:05:12",
    amount: 8500,
    customerPin: "P000593540R",
    customerPinLabel: "CUSTOMER PIN",
    cashierName: "Grace N. (Reception)",
    customerName: "VALUED GUEST",
    accommodationDesc: "Lake View Eco-Cottage Accommodation Stay",
    paymentMethod: "M-PESA PAYBILL",
    mpesaRef: "RGJ88412M0"
  }
];

// Calculate exact Kenyan Tax & Catering Levy breakdown out of inclusive total
// Gross Total = Net + VAT (16%) + Catering Levy (2%)
// Total Tax Multiplier = 1 + 0.16 + 0.02 = 1.18
function calculateTaxBreakdown(totalAmount: number) {
  const netAmount = totalAmount / 1.18;
  const cateringLevy = netAmount * 0.02; // 2% Catering Levy
  const vatAmount = netAmount * 0.16; // 16% VAT
  
  return {
    netAmount: Number(netAmount.toFixed(2)),
    cateringLevy: Number(cateringLevy.toFixed(2)),
    vatAmount: Number(vatAmount.toFixed(2)),
    totalAmount: Number(totalAmount.toFixed(2))
  };
}

export default function ETRReceiptsPage() {
  const [selectedHotelId, setSelectedHotelId] = useState<string>("all");
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Compute metrics across all receipts
  const metrics = HOTEL_RECEIPTS.reduce((acc, item) => {
    const tax = calculateTaxBreakdown(item.amount);
    return {
      totalGross: acc.totalGross + tax.totalAmount,
      totalNet: acc.totalNet + tax.netAmount,
      totalVat: acc.totalVat + tax.vatAmount,
      totalCateringLevy: acc.totalCateringLevy + tax.cateringLevy,
      count: acc.count + 1
    };
  }, { totalGross: 0, totalNet: 0, totalVat: 0, totalCateringLevy: 0, count: 0 });

  const filteredReceipts = selectedHotelId === "all" 
    ? HOTEL_RECEIPTS 
    : HOTEL_RECEIPTS.filter(r => r.id === selectedHotelId);

  // Clean html2canvas capturing without lab() color parsing error
  const captureCanvas = async (receiptId: string) => {
    const element = document.getElementById(`receipt-${receiptId}`);
    if (!element) throw new Error("Receipt element not found");

    const html2canvas = (await import("html2canvas")).default;

    return await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      onclone: (clonedDoc) => {
        // Reset document body to prevent Tailwind v4 lab()/oklch() color errors
        clonedDoc.body.className = "";
        clonedDoc.body.style.cssText = "background-color: #ffffff !important; color: #000000 !important; margin: 0; padding: 0;";
        
        const clonedEl = clonedDoc.getElementById(`receipt-${receiptId}`);
        if (clonedEl) {
          clonedEl.style.boxShadow = "none";
          clonedEl.style.backgroundColor = "#ffffff";
          clonedEl.style.color = "#000000";
        }
      }
    });
  };

  // Download PDF functionality
  const handleDownloadPDF = async (receiptId: string, hotelName: string) => {
    try {
      setIsExporting(true);
      const canvas = await captureCanvas(receiptId);
      const { jsPDF } = await import("jspdf");

      const imgData = canvas.toDataURL("image/png");
      const pdfWidth = 80; // 80mm thermal receipt width
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [pdfWidth, pdfHeight]
      });

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${hotelName.replace(/[^a-zA-Z0-9]/g, "_")}_ETR.pdf`);
    } catch (err) {
      console.error("Failed to export PDF:", err);
      alert("Failed to download PDF. You can also print directly using Ctrl+P.");
    } finally {
      setIsExporting(false);
    }
  };

  // Download PNG image functionality
  const handleDownloadPNG = async (receiptId: string, hotelName: string) => {
    try {
      setIsExporting(true);
      const canvas = await captureCanvas(receiptId);

      const imgData = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `${hotelName.replace(/[^a-zA-Z0-9]/g, "_")}_ETR.png`;
      link.href = imgData;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to export PNG:", err);
      alert("Failed to download PNG image.");
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const copyEtimsUrl = (receipt: HotelReceipt) => {
    const url = `https://etims.kra.go.ke/common/invoiceVerify?tin=${receipt.kraPin}&cuNum=${receipt.cuNumber}&invNum=${receipt.invoiceNo}&date=${receipt.date}&amt=${receipt.amount}`;
    navigator.clipboard.writeText(url);
    setCopiedId(receipt.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 md:p-10 font-sans print:bg-white print:p-0 print:text-black">
      
      {/* Hide non-receipt elements in browser print */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 0;
            size: auto;
          }
          body {
            background: #ffffff !important;
            color: #000000 !important;
            padding: 0 !important;
          }
          .no-print, header, footer, button {
            display: none !important;
          }
        }
      `}</style>

      {/* ================= HEADER & DASHBOARD (Hidden in Print) ================= */}
      <header className="max-w-7xl mx-auto mb-8 no-print">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-300" />
                100% Black & White Thermal Receipt Standard
              </span>
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-slate-300" />
                80mm Thermal Printer Compliant
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Building2 className="w-8 h-8 text-slate-300 shrink-0" />
              Kenya Hotel Thermal ETR Receipts
            </h1>
            <p className="text-slate-400 text-sm md:text-base mt-1 max-w-3xl">
              Authentic monochrome 80mm thermal receipt designs for Kenyan hotels. Features bundled accommodation charges, 16% VAT, 2% Catering Levy, cashier designations, customer PIN variations, and scannable KRA eTIMS QR verification.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={() => handlePrint()}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium text-sm border border-slate-700 transition flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              Print All Receipts
            </button>
          </div>
        </div>

        {/* METRICS STATS BAR */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Accommodation</p>
            <p className="text-xl sm:text-2xl font-bold text-white mt-1">
              KES {metrics.totalGross.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
            </p>
            <span className="text-xs text-slate-400 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" /> 5 Hotel Receipts
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Customer KRA PIN</p>
            <p className="text-lg sm:text-xl font-mono font-bold text-slate-200 mt-1 tracking-wider">
              P000593540R
            </p>
            <span className="text-xs text-slate-400 mt-1 block">Varied PIN Field Labels</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total VAT (16%)</p>
            <p className="text-xl sm:text-2xl font-bold text-slate-200 mt-1">
              KES {metrics.totalVat.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
            </p>
            <span className="text-xs text-slate-400 mt-1 block">Calculated out of total</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Catering Levy (2%)</p>
            <p className="text-xl sm:text-2xl font-bold text-slate-200 mt-1">
              KES {metrics.totalCateringLevy.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
            </p>
            <span className="text-xs text-slate-400 mt-1 block">Tourism Fund Tax</span>
          </div>
        </div>

        {/* HOTEL FILTER TABS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mt-8 bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800 scrollbar-none">
          <button
            onClick={() => setSelectedHotelId("all")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              selectedHotelId === "all"
                ? "bg-white text-black font-bold shadow-md"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            All 5 Hotels
          </button>
          {HOTEL_RECEIPTS.map(h => (
            <button
              key={h.id}
              onClick={() => setSelectedHotelId(h.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedHotelId === h.id
                  ? "bg-white text-black font-bold shadow-md"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {h.name}
            </button>
          ))}
        </div>
      </header>

      {/* ================= MAIN RECEIPTS DISPLAY GRID ================= */}
      <main className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 justify-items-center print:block print:grid-cols-1 print:gap-0">
          {filteredReceipts.map((receipt) => {
            const tax = calculateTaxBreakdown(receipt.amount);
            const etimsVerificationUrl = `https://etims.kra.go.ke/common/invoiceVerify?tin=${receipt.kraPin}&cuNum=${receipt.cuNumber}&invNum=${receipt.invoiceNo}&date=${receipt.date}&amt=${receipt.amount}`;

            return (
              <div 
                key={receipt.id}
                className="w-full flex flex-col items-center print:mb-8 print:break-inside-avoid"
              >
                {/* RECEIPT CONTROLS BAR (Hidden when printing) */}
                <div className="w-[340px] max-w-full flex items-center justify-between gap-2 mb-3 no-print">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-300 truncate max-w-[170px]">{receipt.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDownloadPDF(receipt.id, receipt.name)}
                      disabled={isExporting}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 border border-slate-700"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>
                    <button
                      onClick={() => handleDownloadPNG(receipt.id, receipt.name)}
                      disabled={isExporting}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 border border-slate-700"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PNG</span>
                    </button>
                  </div>
                </div>

                {/* ========================================================================= */}
                {/* 1. DESIGN #1: WIDA HIGHWAY MOTEL - Dot-Matrix Heavy Border Thermal      */}
                {/* ========================================================================= */}
                {receipt.id === "wida-highway" && (
                  <div
                    id={`receipt-${receipt.id}`}
                    className="w-[340px] max-w-full bg-white text-black p-5 shadow-2xl rounded-none border-4 border-black relative font-mono text-xs select-text print:w-[80mm] print:shadow-none print:p-2"
                    style={{ backgroundColor: "#ffffff", color: "#000000" }}
                  >
                    {/* Header */}
                    <div className="text-center pb-3 border-b-2 border-black" style={{ borderBottomColor: "#000000" }}>
                      <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "#000000" }}>★ HIGHWAY INN MOTEL ★</p>
                      <h2 className="text-base font-black tracking-tight uppercase mt-0.5" style={{ color: "#000000" }}>
                        {receipt.name}
                      </h2>
                      <p className="text-[10px] font-semibold" style={{ color: "#000000" }}>{receipt.location}</p>
                      <p className="text-[9px] italic mt-0.5" style={{ color: "#000000" }}>Kikuyu Highway Accommodation</p>
                    </div>

                    {/* Taxpayer & Cashier Info */}
                    <div className="py-2 border-b border-dashed text-[10px] space-y-0.5" style={{ borderBottomColor: "#000000" }}>
                      <div className="flex justify-between">
                        <span>KRA PIN (HOTEL):</span>
                        <span className="font-bold">{receipt.kraPin}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{receipt.customerPinLabel}:</span>
                        <span className="font-bold">{receipt.customerPin}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>CASHIER:</span>
                        <span className="font-semibold">{receipt.cashierName}</span>
                      </div>
                    </div>

                    {/* Transaction Metadata */}
                    <div className="py-2 border-b border-dashed text-[9px] space-y-0.5" style={{ borderBottomColor: "#000000" }}>
                      <div className="flex justify-between">
                        <span>DATE: <strong>{receipt.date}</strong></span>
                        <span>TIME: <strong>{receipt.time}</strong></span>
                      </div>
                      <div className="flex justify-between">
                        <span>INVOICE NO: <strong>{receipt.invoiceNo}</strong></span>
                      </div>
                      <div className="flex justify-between">
                        <span>CU SERIAL: <span>{receipt.cuSerialNumber}</span></span>
                      </div>
                    </div>

                    {/* Bundled Item */}
                    <div className="py-3 border-b-2" style={{ borderBottomColor: "#000000" }}>
                      <p className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: "#000000" }}>SERVICE DESCRIPTION</p>
                      <p className="font-bold leading-snug" style={{ color: "#000000" }}>{receipt.accommodationDesc}</p>
                      <div className="mt-2 pt-1 border-t border-dotted flex justify-between items-baseline" style={{ borderTopColor: "#000000" }}>
                        <span className="font-bold">AMOUNT:</span>
                        <span className="font-extrabold text-sm">
                          KES {receipt.amount.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    {/* Tax Breakdown */}
                    <div className="py-2.5 border-b-2 text-[10px] space-y-1" style={{ borderBottomColor: "#000000" }}>
                      <div className="flex justify-between">
                        <span>NET AMOUNT (EXCL. TAX):</span>
                        <span>KES {tax.netAmount.toLocaleString("en-KE", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>CATERING LEVY (2%):</span>
                        <span>KES {tax.cateringLevy.toLocaleString("en-KE", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>VAT (16% RATE A):</span>
                        <span>KES {tax.vatAmount.toLocaleString("en-KE", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="pt-1 border-t flex justify-between font-black text-xs" style={{ borderTopColor: "#000000" }}>
                        <span>TOTAL INCLUSIVE:</span>
                        <span>KES {tax.totalAmount.toLocaleString("en-KE", { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div className="py-1.5 text-[9px] flex justify-between border-b border-dashed" style={{ borderBottomColor: "#000000" }}>
                      <span>PAYMENT: {receipt.paymentMethod}</span>
                      <span>REF: {receipt.mpesaRef}</span>
                    </div>

                    {/* QR Verification */}
                    <div className="pt-3 text-center flex flex-col items-center">
                      <div className="p-1 bg-white border-2 border-black rounded-none">
                        <QRCodeSVG value={etimsVerificationUrl} size={105} level="M" />
                      </div>
                      <p className="text-[8px] font-bold uppercase mt-1" style={{ color: "#000000" }}>KRA eTIMS VERIFIED CODE</p>
                      <p className="text-[7px] font-mono" style={{ color: "#000000" }}>{receipt.cuNumber}</p>
                      <p className="text-[8px] font-bold mt-1" style={{ color: "#000000" }}>DRIVE SAFE & THANK YOU FOR YOUR VISIT</p>
                    </div>
                  </div>
                )}

                {/* ========================================================================= */}
                {/* 2. DESIGN #2: LUX SUITES - Corporate Modern Black-Header Thermal         */}
                {/* ========================================================================= */}
                {receipt.id === "lux-suites" && (
                  <div
                    id={`receipt-${receipt.id}`}
                    className="w-[340px] max-w-full bg-white text-black p-0 shadow-2xl rounded-none border border-black relative font-sans text-xs select-text print:w-[80mm] print:shadow-none"
                    style={{ backgroundColor: "#ffffff", color: "#000000", borderColor: "#000000" }}
                  >
                    {/* Inverted Black Header Box */}
                    <div className="bg-black text-white p-4 text-center" style={{ backgroundColor: "#000000", color: "#ffffff" }}>
                      <p className="text-[9px] font-bold tracking-widest uppercase" style={{ color: "#cccccc" }}>LUXURY APARTMENT STAY</p>
                      <h2 className="text-base font-black tracking-tight uppercase mt-0.5 leading-tight" style={{ color: "#ffffff" }}>
                        {receipt.name}
                      </h2>
                      <p className="text-[10px] mt-0.5" style={{ color: "#cccccc" }}>{receipt.location}</p>
                    </div>

                    <div className="p-4 space-y-3">
                      {/* Customer & Taxpayer Grid */}
                      <div className="border border-black p-2.5 text-[10px] space-y-1" style={{ borderColor: "#000000" }}>
                        <div className="flex justify-between">
                          <span className="font-semibold" style={{ color: "#333333" }}>HOTEL KRA PIN:</span>
                          <span className="font-mono font-bold" style={{ color: "#000000" }}>{receipt.kraPin}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold" style={{ color: "#333333" }}>{receipt.customerPinLabel}:</span>
                          <span className="font-mono font-bold" style={{ color: "#000000" }}>{receipt.customerPin}</span>
                        </div>
                        <div className="flex justify-between border-t border-black pt-1" style={{ borderTopColor: "#000000" }}>
                          <span className="font-semibold" style={{ color: "#333333" }}>FRONT DESK:</span>
                          <span className="font-semibold" style={{ color: "#000000" }}>{receipt.cashierName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold" style={{ color: "#333333" }}>INVOICE NO:</span>
                          <span className="font-bold" style={{ color: "#000000" }}>{receipt.invoiceNo}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold" style={{ color: "#333333" }}>DATE & TIME:</span>
                          <span style={{ color: "#000000" }}>{receipt.date} • {receipt.time}</span>
                        </div>
                      </div>

                      {/* Accommodation Item */}
                      <div className="border-t-2 border-black pt-2" style={{ borderTopColor: "#000000" }}>
                        <span className="text-[9px] font-bold uppercase tracking-widest block mb-1" style={{ color: "#000000" }}>ACCOMMODATION DETAILS</span>
                        <p className="font-bold text-xs leading-snug" style={{ color: "#000000" }}>{receipt.accommodationDesc}</p>
                        <div className="mt-2 flex justify-between items-center text-xs border-t border-black pt-1.5" style={{ borderTopColor: "#000000" }}>
                          <span className="font-semibold">TOTAL CHARGE:</span>
                          <span className="font-black text-sm">
                            KES {receipt.amount.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      {/* Tax Breakdown Table */}
                      <div className="border-t-2 border-b-2 border-black py-2.5 text-[10px] space-y-1" style={{ borderColor: "#000000" }}>
                        <div className="flex justify-between">
                          <span>Net Amount (Excl. Tax)</span>
                          <span className="font-mono">KES {tax.netAmount.toLocaleString("en-KE", { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Catering Levy (2% Tourism Fund)</span>
                          <span className="font-mono">KES {tax.cateringLevy.toLocaleString("en-KE", { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>VAT (16% Standard)</span>
                          <span className="font-mono">KES {tax.vatAmount.toLocaleString("en-KE", { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between font-black text-xs pt-1 border-t border-black" style={{ borderTopColor: "#000000" }}>
                          <span>GROSS TOTAL</span>
                          <span className="font-mono text-sm">KES {tax.totalAmount.toLocaleString("en-KE", { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>

                      {/* QR Verification */}
                      <div className="flex items-center gap-3 border border-black p-2.5" style={{ borderColor: "#000000" }}>
                        <div className="bg-white p-1 border border-black shrink-0" style={{ borderColor: "#000000" }}>
                          <QRCodeSVG value={etimsVerificationUrl} size={64} level="M" />
                        </div>
                        <div className="text-[9px] space-y-0.5">
                          <p className="font-bold uppercase" style={{ color: "#000000" }}>KRA eTIMS VERIFIED</p>
                          <p className="font-mono text-[8px] break-all" style={{ color: "#333333" }}>CU: {receipt.cuNumber}</p>
                          <p style={{ color: "#333333" }}>Ref: {receipt.mpesaRef}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ========================================================================= */}
                {/* 3. DESIGN #3: AL RAHMA HOTEL - Double Frame Swahili Thermal               */}
                {/* ========================================================================= */}
                {receipt.id === "al-rahma" && (
                  <div
                    id={`receipt-${receipt.id}`}
                    className="w-[340px] max-w-full bg-white text-black p-5 shadow-2xl rounded-none border-4 border-double border-black relative font-serif text-xs select-text print:w-[80mm] print:shadow-none print:p-2"
                    style={{ backgroundColor: "#ffffff", color: "#000000", borderColor: "#000000" }}
                  >
                    {/* Header */}
                    <div className="text-center pb-3 border-b-2 border-black" style={{ borderBottomColor: "#000000" }}>
                      <span className="font-bold text-[11px] block italic" style={{ color: "#000000" }}>
                        ✦ KARIBU AL RAHMA HOTEL ✦
                      </span>
                      <h2 className="text-base font-black uppercase tracking-tight mt-0.5 leading-tight" style={{ color: "#000000" }}>
                        {receipt.name}
                      </h2>
                      <p className="text-[10px] font-sans" style={{ color: "#333333" }}>{receipt.location}</p>
                      <p className="text-[9px] font-sans italic mt-0.5" style={{ color: "#333333" }}>Garissa Accommodation & Catering</p>
                    </div>

                    {/* Tax & Guest Identity */}
                    <div className="py-2 font-sans text-[10px] space-y-1 border-b border-black" style={{ borderBottomColor: "#000000" }}>
                      <div className="flex justify-between">
                        <span>HOTEL KRA PIN:</span>
                        <span className="font-mono font-bold">{receipt.kraPin}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{receipt.customerPinLabel}:</span>
                        <span className="font-mono font-bold">{receipt.customerPin}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SERVER/CASHIER:</span>
                        <span className="font-semibold">{receipt.cashierName}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-dashed border-black" style={{ borderTopColor: "#000000" }}>
                        <span>INVOICE NUMBER:</span>
                        <span className="font-bold">{receipt.invoiceNo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>DATE & TIME:</span>
                        <span>{receipt.date} AT {receipt.time}</span>
                      </div>
                    </div>

                    {/* Bundled Stay */}
                    <div className="py-3 border-b-2 border-black font-sans" style={{ borderBottomColor: "#000000" }}>
                      <span className="text-[9px] font-bold uppercase tracking-wider block mb-1">ACCOMMODATION CHARGE</span>
                      <p className="font-bold text-xs leading-snug">{receipt.accommodationDesc}</p>
                      <p className="text-right font-black text-sm mt-1.5">
                        KES {receipt.amount.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                      </p>
                    </div>

                    {/* Tax & Catering Levy */}
                    <div className="py-2.5 font-sans text-[10px] space-y-1 border-b-2 border-black" style={{ borderBottomColor: "#000000" }}>
                      <div className="flex justify-between">
                        <span>Net Amount Excl. Tax</span>
                        <span className="font-mono">KES {tax.netAmount.toLocaleString("en-KE", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Catering Levy (2% Tourism Fund)</span>
                        <span className="font-mono">KES {tax.cateringLevy.toLocaleString("en-KE", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>VAT (16% Tax Rate A)</span>
                        <span className="font-mono">KES {tax.vatAmount.toLocaleString("en-KE", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between font-black text-xs pt-1.5 border-t border-black" style={{ borderTopColor: "#000000" }}>
                        <span>TOTAL PAID (INCLUSIVE)</span>
                        <span className="font-mono text-sm">KES {tax.totalAmount.toLocaleString("en-KE", { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>

                    {/* QR Code Section */}
                    <div className="pt-3 text-center flex flex-col items-center font-sans">
                      <div className="p-1 bg-white border border-black" style={{ borderColor: "#000000" }}>
                        <QRCodeSVG value={etimsVerificationUrl} size={100} level="M" />
                      </div>
                      <p className="text-[8px] font-bold uppercase mt-1" style={{ color: "#000000" }}>VERIFIED KRA eTIMS ETR</p>
                      <p className="text-[7px] font-mono" style={{ color: "#333333" }}>CU SERIAL: {receipt.cuSerialNumber}</p>
                      <p className="text-[9px] font-serif italic mt-1" style={{ color: "#000000" }}>ASANTE SANA - WELCOME AGAIN</p>
                    </div>
                  </div>
                )}

                {/* ========================================================================= */}
                {/* 4. DESIGN #4: VINTEX GUEST HOUSE - Minimalist Dashed Border Slip          */}
                {/* ========================================================================= */}
                {receipt.id === "vintex-guest" && (
                  <div
                    id={`receipt-${receipt.id}`}
                    className="w-[340px] max-w-full bg-white text-black p-5 shadow-2xl rounded-none border-2 border-dashed border-black relative font-sans text-xs select-text print:w-[80mm] print:shadow-none print:p-2"
                    style={{ backgroundColor: "#ffffff", color: "#000000", borderColor: "#000000" }}
                  >
                    {/* Header */}
                    <div className="pb-3 border-b-2 border-black text-center" style={{ borderBottomColor: "#000000" }}>
                      <span className="font-black text-xs uppercase border border-black px-2 py-0.5 inline-block mb-1" style={{ borderColor: "#000000" }}>
                        [ VINTEX GUEST HOUSE ]
                      </span>
                      <h2 className="text-sm font-black uppercase tracking-tight leading-tight mt-1" style={{ color: "#000000" }}>
                        {receipt.name}
                      </h2>
                      <p className="text-[10px] font-medium" style={{ color: "#333333" }}>{receipt.location}</p>
                    </div>

                    {/* Tax & Registration Meta */}
                    <div className="py-2.5 border-b border-black text-[10px] space-y-1" style={{ borderBottomColor: "#000000" }}>
                      <div className="grid grid-cols-2 gap-2 border border-black p-2" style={{ borderColor: "#000000" }}>
                        <div>
                          <span className="text-[8px] font-bold block uppercase" style={{ color: "#555555" }}>HOTEL KRA PIN</span>
                          <span className="font-mono font-bold" style={{ color: "#000000" }}>{receipt.kraPin}</span>
                        </div>
                        <div>
                          <span className="text-[8px] font-bold block uppercase" style={{ color: "#555555" }}>{receipt.customerPinLabel}</span>
                          <span className="font-mono font-bold" style={{ color: "#000000" }}>{receipt.customerPin}</span>
                        </div>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span>CLERK: <strong className="font-semibold">{receipt.cashierName}</strong></span>
                        <span>Date: <strong>{receipt.date}</strong></span>
                      </div>
                      <div className="flex justify-between">
                        <span>Invoice: <strong>{receipt.invoiceNo}</strong></span>
                        <span>Time: <strong>{receipt.time}</strong></span>
                      </div>
                    </div>

                    {/* Bundled Stay */}
                    <div className="py-3 border-b border-black" style={{ borderBottomColor: "#000000" }}>
                      <span className="text-[9px] font-bold uppercase tracking-wider block mb-1">LODGING ACCOMMODATION</span>
                      <p className="font-bold text-xs leading-snug">{receipt.accommodationDesc}</p>
                      <div className="mt-2 flex justify-between items-baseline border border-black p-2" style={{ borderColor: "#000000" }}>
                        <span className="text-[10px] font-bold">Total Charge:</span>
                        <span className="font-black text-sm">
                          KES {receipt.amount.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    {/* Tax Breakdown */}
                    <div className="py-2.5 border-b-2 border-black text-[10px] space-y-1" style={{ borderBottomColor: "#000000" }}>
                      <div className="flex justify-between">
                        <span>Net Base Amount</span>
                        <span className="font-mono font-semibold">KES {tax.netAmount.toLocaleString("en-KE", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Catering Levy (2%)</span>
                        <span className="font-mono font-semibold">KES {tax.cateringLevy.toLocaleString("en-KE", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>VAT (16% Rate A)</span>
                        <span className="font-mono font-semibold">KES {tax.vatAmount.toLocaleString("en-KE", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between font-black text-xs pt-1 border-t border-black" style={{ borderTopColor: "#000000" }}>
                        <span>TOTAL INCLUSIVE</span>
                        <span className="font-mono text-sm">KES {tax.totalAmount.toLocaleString("en-KE", { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>

                    {/* QR Code */}
                    <div className="pt-3 text-center flex flex-col items-center">
                      <div className="p-1 bg-white border border-black" style={{ borderColor: "#000000" }}>
                        <QRCodeSVG value={etimsVerificationUrl} size={95} level="M" />
                      </div>
                      <p className="text-[8px] font-bold uppercase mt-1" style={{ color: "#000000" }}>KRA eTIMS VERIFIED RECEIPT</p>
                      <p className="text-[7px] font-mono" style={{ color: "#555555" }}>CU: {receipt.cuNumber}</p>
                    </div>
                  </div>
                )}

                {/* ========================================================================= */}
                {/* 5. DESIGN #5: OSOTUA HOTEL - Premium Resort Statement Slip               */}
                {/* ========================================================================= */}
                {receipt.id === "osotua-hotel" && (
                  <div
                    id={`receipt-${receipt.id}`}
                    className="w-[340px] max-w-full bg-white text-black p-5 shadow-2xl rounded-none border-2 border-black relative font-sans text-xs select-text print:w-[80mm] print:shadow-none print:p-2"
                    style={{ backgroundColor: "#ffffff", color: "#000000", borderColor: "#000000" }}
                  >
                    {/* Header Top Solid Bar */}
                    <div className="bg-black text-white text-[8px] font-bold text-center py-1 uppercase tracking-widest -mx-5 -mt-5 mb-3" style={{ backgroundColor: "#000000", color: "#ffffff" }}>
                      OFFICIAL TAX INVOICE RECEIPT
                    </div>

                    {/* Header */}
                    <div className="text-center pb-3 border-b-2 border-black" style={{ borderBottomColor: "#000000" }}>
                      <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "#000000" }}>NAIVASHA ECO RESORT</p>
                      <h2 className="text-lg font-black uppercase tracking-tight leading-tight mt-0.5" style={{ color: "#000000" }}>
                        {receipt.name}
                      </h2>
                      <p className="text-[10px] font-medium" style={{ color: "#333333" }}>{receipt.location}</p>
                    </div>

                    {/* Taxpayer Meta */}
                    <div className="py-2.5 border-b border-black text-[10px] space-y-1" style={{ borderBottomColor: "#000000" }}>
                      <div className="flex justify-between">
                        <span>HOTEL KRA PIN:</span>
                        <span className="font-mono font-bold">{receipt.kraPin}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{receipt.customerPinLabel}:</span>
                        <span className="font-mono font-bold">{receipt.customerPin}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>RECEPTIONIST:</span>
                        <span className="font-semibold">{receipt.cashierName}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-dashed border-black" style={{ borderTopColor: "#000000" }}>
                        <span>INVOICE NO:</span>
                        <span className="font-bold">{receipt.invoiceNo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>DATE & TIME:</span>
                        <span>{receipt.date} • {receipt.time}</span>
                      </div>
                    </div>

                    {/* Accommodation Package */}
                    <div className="py-3 border-b-2 border-black" style={{ borderBottomColor: "#000000" }}>
                      <span className="text-[9px] font-bold uppercase tracking-wider block mb-1">RESORT ACCOMMODATION</span>
                      <p className="font-bold text-xs leading-snug">{receipt.accommodationDesc}</p>
                      <div className="mt-2 p-2 border-2 border-black bg-white flex justify-between items-center" style={{ borderColor: "#000000", backgroundColor: "#ffffff" }}>
                        <span className="text-[10px] font-bold uppercase">Resort Stay Total:</span>
                        <span className="font-black text-sm">
                          KES {receipt.amount.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    {/* Tax Breakdown */}
                    <div className="py-2.5 border-b-2 border-black text-[10px] space-y-1" style={{ borderBottomColor: "#000000" }}>
                      <div className="flex justify-between">
                        <span>Net Base Amount</span>
                        <span className="font-mono">KES {tax.netAmount.toLocaleString("en-KE", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Catering Levy (2% Tourism Fund)</span>
                        <span className="font-mono">KES {tax.cateringLevy.toLocaleString("en-KE", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>VAT (16% Rate A)</span>
                        <span className="font-mono">KES {tax.vatAmount.toLocaleString("en-KE", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between font-black text-xs pt-1.5 border-t border-black" style={{ borderTopColor: "#000000" }}>
                        <span>TOTAL INCLUSIVE</span>
                        <span className="font-mono text-sm">KES {tax.totalAmount.toLocaleString("en-KE", { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>

                    {/* QR Code */}
                    <div className="pt-3 text-center flex flex-col items-center">
                      <div className="p-1 bg-white border border-black" style={{ borderColor: "#000000" }}>
                        <QRCodeSVG value={etimsVerificationUrl} size={100} level="M" />
                      </div>
                      <p className="text-[8px] font-bold uppercase mt-1" style={{ color: "#000000" }}>KRA eTIMS VERIFIED RESORT RECEIPT</p>
                      <p className="text-[7px] font-mono" style={{ color: "#555555" }}>CU SERIAL: {receipt.cuSerialNumber}</p>
                    </div>

                    {/* Bottom Solid Bar */}
                    <div className="bg-black text-white text-[8px] font-bold text-center py-1 uppercase tracking-widest -mx-5 -mb-5 mt-3" style={{ backgroundColor: "#000000", color: "#ffffff" }}>
                      *** THANK YOU FOR STAYING WITH US ***
                    </div>
                  </div>
                )}

                {/* VERIFICATION LINK QUICK ACTION (Hidden in print) */}
                <div className="w-[340px] max-w-full mt-3 flex items-center justify-between text-xs text-slate-400 bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 no-print">
                  <span className="truncate max-w-[190px] text-[11px] font-mono text-slate-400">
                    CU: {receipt.cuNumber}
                  </span>
                  <button
                    onClick={() => copyEtimsUrl(receipt)}
                    className="text-slate-200 hover:text-white font-medium text-xs flex items-center gap-1 cursor-pointer"
                  >
                    {copiedId === receipt.id ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Copied Link!
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        Copy eTIMS Link
                      </>
                    )}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </main>

      {/* FOOTER NOTICE */}
      <footer className="max-w-7xl mx-auto mt-16 text-center text-xs text-slate-500 border-t border-slate-800 pt-6 no-print">
        <p className="flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-slate-400" />
          Generated strictly in accordance with Section 23A of the Kenya Tax Procedures Act (eTIMS ETR Regulation).
        </p>
        <p className="mt-1 text-slate-600">
          Customer PIN: <code className="text-slate-400 font-mono">P000593540R</code> | Taxes: 16% VAT + 2% Catering Levy
        </p>
      </footer>
    </div>
  );
}
