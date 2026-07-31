"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  href?: string;
  time: string;
  unread: boolean;
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-01",
    title: "Production Activation Ready",
    message: "Factory Batch #PRD-2026-001 completed. Click to review manufacturing run & vouchers.",
    href: "/production",
    time: "10 mins ago",
    unread: true,
  },
  {
    id: "notif-02",
    title: "Commercial Press Dispatch",
    message: "Scratch-card Batch BHT2026-01 marked as IN_TRANSIT to factory warehouse.",
    href: "/vouchers",
    time: "1 hr ago",
    unread: false,
  },
];

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [hasUnread, setHasUnread] = useState(false);

  const loadNotifications = () => {
    try {
      const stored = localStorage.getItem("tuzohub_notifications");
      if (stored) {
        const parsed = JSON.parse(stored);
        setNotifications(parsed);
        setHasUnread(parsed.some((n: any) => n.unread));
      } else {
        setNotifications(DEFAULT_NOTIFICATIONS);
        localStorage.setItem("tuzohub_notifications", JSON.stringify(DEFAULT_NOTIFICATIONS));
        setHasUnread(true);
      }
    } catch {
      setNotifications(DEFAULT_NOTIFICATIONS);
    }
  };

  useEffect(() => {
    loadNotifications();

    const handleUpdate = () => loadNotifications();
    window.addEventListener("tuzohub_notification_updated", handleUpdate);
    return () => window.removeEventListener("tuzohub_notification_updated", handleUpdate);
  }, []);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleNotificationClick = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    setHasUnread(updated.some((n) => n.unread));
    try {
      localStorage.setItem("tuzohub_notifications", JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to update notifications", err);
    }
    closeDropdown();
  };

  const handleClearAll = () => {
    setNotifications([]);
    setHasUnread(false);
    try {
      localStorage.setItem("tuzohub_notifications", JSON.stringify([]));
    } catch (err) {
      console.error("Failed to clear notifications", err);
    }
  };

  return (
    <div className="relative">
      <button
        className="relative dropdown-toggle flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all bg-gray-100/60 hover:bg-gray-200/70 dark:bg-white/[0.06] dark:hover:bg-white/10 border border-gray-200/50 dark:border-white/[0.08] rounded-full h-8.5 w-8.5 shadow-2xs backdrop-blur-xs shrink-0"
        onClick={toggleDropdown}
      >
        {hasUnread && (
          <span className="absolute right-0 top-0.5 z-10 h-2.5 w-2.5 rounded-full bg-orange-500 flex">
            <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
          </span>
        )}
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[240px] mt-[17px] flex h-[440px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-2xl dark:border-gray-800 dark:bg-[#18181b] sm:w-[361px] lg:right-0 z-50"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-white/5">
          <h5 className="text-sm font-bold text-gray-900 dark:text-white">
            System Alerts
          </h5>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold text-brand-600 bg-brand-500/10 px-2 py-0.5 rounded-full">
              {notifications.length} Alerts
            </span>
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-[10px] text-gray-400 hover:text-rose-500 font-semibold transition"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        <ul className="flex flex-col h-auto overflow-y-auto custom-scrollbar divide-y divide-gray-100 dark:divide-white/5">
          {notifications.length > 0 ? (
            notifications.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href || "#"}
                  onClick={() => handleNotificationClick(item.id)}
                  className="flex items-start gap-3 rounded-xl p-3 hover:bg-gray-50 dark:hover:bg-white/5 transition group"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    🔔
                  </div>

                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-brand-500 transition">
                        {item.title}
                      </p>
                      {item.unread && (
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2">
                      {item.message}
                    </p>
                    <p className="text-[10px] text-gray-400 font-mono pt-1">
                      {item.time}
                    </p>
                  </div>
                </Link>
              </li>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center p-6 space-y-2">
              <span className="text-2xl">🎉</span>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">All caught up!</p>
              <p className="text-[10px] text-gray-400">No unread production alerts.</p>
            </div>
          )}
        </ul>

        <div className="p-2 border-t border-gray-100 dark:border-white/5 text-center">
          <Link
            href="/notifications"
            onClick={closeDropdown}
            className="block py-2 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
          >
            View All Notifications Center &rarr;
          </Link>
        </div>
      </Dropdown>
    </div>
  );
}
