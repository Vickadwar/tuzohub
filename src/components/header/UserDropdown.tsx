"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useUser } from "@/context/UserContext";
import { signOut as serverSignOut } from "@/app/auth/actions";
import { supabase } from "@/lib/supabase";
import { clearAllCookies } from "@/lib/utils";

export default function UserDropdown() {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  function toggleDropdown(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U";
    const f = firstName ? firstName.charAt(0).toUpperCase() : "";
    const l = lastName ? lastName.charAt(0).toUpperCase() : "";
    return `${f}${l}` || "U";
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      clearAllCookies();
      await serverSignOut().catch(() => {});
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout failed:", error);
      window.location.href = "/auth/login";
    }
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown} 
        className="flex items-center gap-2 p-1 pr-2.5 text-gray-700 dark:text-gray-300 dropdown-toggle focus:outline-none bg-gray-100/60 hover:bg-gray-200/70 dark:bg-white/[0.06] dark:hover:bg-white/10 border border-gray-200/50 dark:border-white/[0.08] rounded-full transition-all shadow-2xs backdrop-blur-xs"
      >
        <span className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white font-black text-[11px] shadow-2xs">
          {getInitials(user?.firstName, user?.lastName)}
        </span>

        <span className="hidden sm:block font-bold text-xs text-gray-900 dark:text-white">
          {user?.firstName || "User"}
        </span>

        <svg
          className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          width="14"
          height="14"
          viewBox="0 0 20 20"
          fill="none"
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-2 flex w-[240px] flex-col rounded-2xl border border-gray-200/80 bg-white p-3 shadow-lg dark:border-white/[0.08] dark:bg-gray-900 animate-fadeIn"
      >
        <div className="px-3 py-2 border-b border-gray-100 dark:border-white/5 pb-3">
          <span className="block font-bold text-xs text-gray-900 dark:text-white">
            {user ? `${user.firstName} ${user.lastName}` : "Administrator"}
          </span>
          <span className="mt-0.5 block text-[11px] font-medium text-gray-400 truncate">
            {user?.email || "User account"}
          </span>
        </div>

        <ul className="flex flex-col gap-0.5 pt-2 pb-2 border-b border-gray-100 dark:border-white/5">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              href="/profile"
              className="flex items-center gap-2.5 px-3 py-2 font-semibold text-xs text-gray-700 rounded-xl hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              Edit profile
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              href="/settings"
              className="flex items-center gap-2.5 px-3 py-2 font-semibold text-xs text-gray-700 rounded-xl hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Account settings
            </DropdownItem>
          </li>
        </ul>

        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-2.5 px-3 py-2 mt-1 font-semibold text-xs text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l3 3m0 0l-3 3m3-3H2.25" />
          </svg>
          Sign out
        </button>
      </Dropdown>
    </div>
  );
}
