"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface NotificationItem {
  id: string;
  type: "PRODUCTION_READY" | "VOUCHER_DISPATCH" | "SECURITY_ALERT" | "CAMPAIGN_UPDATE" | string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  linkUrl?: string;
  linkLabel?: string;
  batchId?: string;
}

export default function NotificationsCenterPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<"ALL" | "UNREAD" | "PRODUCTION" | "SECURITY">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem("tuzohub_notifications");
      if (stored) {
        setNotifications(JSON.parse(stored));
      } else {
        // Default seed notifications if empty
        const defaults: NotificationItem[] = [
          {
            id: "notif-1",
            type: "PRODUCTION_READY",
            title: "Factory Production Run Pending Activation",
            message: "Batch #VB-893102 is marked In Stock in factory warehouse and ready for packaging insertion.",
            timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
            read: false,
            linkUrl: "/production",
            linkLabel: "Load in Factory Packaging Run →",
          },
          {
            id: "notif-2",
            type: "VOUCHER_DISPATCH",
            title: "Voucher Batch Dispatched to Printer",
            message: "Batch #VB-401928 transitioned to 'At Printer Press'. Printer CSV manifest downloaded.",
            timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
            read: false,
            linkUrl: "/vouchers",
            linkLabel: "View Batch Details →",
          },
          {
            id: "notif-3",
            type: "SECURITY_ALERT",
            title: "Secret Scratch-Code Manifest Decrypted",
            message: "Commercial printing CSV manifest exported by Administrator. Password key verified.",
            timestamp: new Date(Date.now() - 1000 * 60 * 600).toISOString(),
            read: true,
            linkUrl: "/audit-logs",
            linkLabel: "View Security Audit Trail →",
          },
        ];
        localStorage.setItem("tuzohub_notifications", JSON.stringify(defaults));
        setNotifications(defaults);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const saveNotifications = (items: NotificationItem[]) => {
    setNotifications(items);
    if (typeof window !== "undefined") {
      localStorage.setItem("tuzohub_notifications", JSON.stringify(items));
    }
  };

  const toggleRead = (id: string) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, read: !n.read } : n
    );
    saveNotifications(updated);
  };

  const markAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    saveNotifications(updated);
  };

  const clearRead = () => {
    const updated = notifications.filter((n) => !n.read);
    saveNotifications(updated);
  };

  const deleteNotification = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    saveNotifications(updated);
  };

  const filteredNotifications = notifications.filter((n) => {
    const nType = (n.type || "").toUpperCase();
    if (filter === "UNREAD" && n.read) return false;
    if (filter === "PRODUCTION" && !nType.includes("PRODUCTION")) return false;
    if (filter === "SECURITY" && !nType.includes("SECURITY")) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (n.title || "").toLowerCase().includes(q) || (n.message || "").toLowerCase().includes(q);
    }
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-12">
      {/* ── Header Banner ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200/80 dark:border-white/[0.06] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              Notifications &amp; Alert Center
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Real-time supply chain prompts, factory packaging alerts, and audit security events.
          </p>
        </div>

        {/* Action controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="px-3.5 py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white text-xs font-semibold rounded-xl border border-gray-200/80 dark:border-white/10 transition disabled:opacity-50"
          >
            Mark All as Read
          </button>
          <button
            onClick={clearRead}
            className="px-3.5 py-2 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-xl border border-rose-200/50 dark:border-rose-500/20 transition"
          >
            Clear Read Notifications
          </button>
        </div>
      </div>

      {/* ── Filters & Search Bar ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-4 rounded-2xl shadow-sm">
        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {[
            { key: "ALL", label: `All (${notifications.length})` },
            { key: "UNREAD", label: `Unread (${unreadCount})` },
            { key: "PRODUCTION", label: "Production Runs" },
            { key: "SECURITY", label: "Security & Audit" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                filter === tab.key
                  ? "bg-brand-500 text-white shadow-sm"
                  : "bg-gray-50 dark:bg-white/[0.03] text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="w-full md:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search alerts..."
            className="w-full px-3.5 py-1.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
          />
        </div>
      </div>

      {/* ── Notifications List ─────────────────────────────────────────── */}
      <div className="space-y-3">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((n) => (
            <div
              key={n.id}
              className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                !n.read
                  ? "bg-white dark:bg-[#18181b] border-brand-500/30 dark:border-brand-500/40 shadow-sm ring-1 ring-brand-500/10"
                  : "bg-gray-50/60 dark:bg-white/[0.01] border-gray-200/80 dark:border-white/[0.04] opacity-80"
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Type Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base shrink-0 shadow-2xs ${
                  (n.type || "").toUpperCase().includes("PRODUCTION")
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    : (n.type || "").toUpperCase().includes("SECURITY")
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                    : "bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20"
                }`}>
                  {(n.type || "").toUpperCase().includes("PRODUCTION") ? "🏭" : (n.type || "").toUpperCase().includes("SECURITY") ? "🔒" : "📦"}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xs font-bold text-gray-900 dark:text-white">{n.title}</h3>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300">{n.message}</p>
                  <p className="text-[11px] text-gray-400 font-medium">
                    {new Date(n.timestamp).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
              </div>

              {/* Controls & Deep-link */}
              <div className="flex items-center gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-white/5 shrink-0">
                {n.linkUrl && (
                  <Link
                    href={n.linkUrl}
                    onClick={() => toggleRead(n.id)}
                    className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center gap-1"
                  >
                    {n.linkLabel || "Take Action →"}
                  </Link>
                )}
                <button
                  onClick={() => toggleRead(n.id)}
                  title={n.read ? "Mark as unread" : "Mark as read"}
                  className="px-2.5 py-1.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 text-xs font-medium rounded-xl transition"
                >
                  {n.read ? "Unread" : "Read"}
                </button>
                <button
                  onClick={() => deleteNotification(n.id)}
                  title="Dismiss notification"
                  className="p-1.5 text-gray-400 hover:text-rose-500 transition"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl space-y-2">
            <span className="text-3xl">🔔</span>
            <p className="text-xs font-bold text-gray-900 dark:text-white">No notifications found</p>
            <p className="text-xs text-gray-400">All system alerts and tasks are up to date.</p>
          </div>
        )}
      </div>
    </div>
  );
}
