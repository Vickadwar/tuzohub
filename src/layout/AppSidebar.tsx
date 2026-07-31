"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { useUser } from "../context/UserContext";
import { signOut as serverSignOut } from "@/app/auth/actions";
import { supabase } from "@/lib/supabase";
import { clearAllCookies } from "@/lib/utils";
import { Logo } from "@/components/common/Logo";
import {
  BoxCubeIcon,
  ChevronDownIcon,
  GridIcon,
  PieChartIcon,
  UserCircleIcon,
  GroupIcon,
  ShootingStarIcon,
  ListIcon,
  BoxIconLine,
  DollarLineIcon,
} from "../icons/index";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string }[];
  roles?: string[];
};

// ── SUPER ADMIN GOVERNANCE NAVIGATION ─────────────────────────────
const superAdminNavItems: NavItem[] = [
  { 
    icon: <PieChartIcon />, 
    name: "Global dashboard", 
    path: "/platform/dashboard", 
    roles: ["SYSTEM_ADMIN"] 
  },
  { 
    icon: <GridIcon />, 
    name: "Organizations & tenants", 
    path: "/platform/tenants", 
    roles: ["SYSTEM_ADMIN"] 
  },
  { 
    icon: <ShootingStarIcon />, 
    name: "Pending registrations", 
    path: "/admin/registrations", 
    roles: ["SYSTEM_ADMIN"] 
  },
  { 
    icon: <DollarLineIcon />, 
    name: "SaaS billing & invoices", 
    path: "/platform/billing", 
    roles: ["SYSTEM_ADMIN"] 
  },
  { 
    icon: <GroupIcon />, 
    name: "Super admin team", 
    path: "/platform/team", 
    roles: ["SYSTEM_ADMIN"] 
  },
  { 
    icon: <ShootingStarIcon />, 
    name: "Audit & security logs", 
    path: "/audit-logs", 
    roles: ["SYSTEM_ADMIN"] 
  },
  { 
    icon: <ListIcon />, 
    name: "User guide & docs", 
    path: "/documentation", 
    roles: ["SYSTEM_ADMIN"] 
  },
  { 
    icon: <UserCircleIcon />, 
    name: "Account profile", 
    path: "/profile", 
    roles: ["SYSTEM_ADMIN"] 
  },
];

// ── TENANT OPERATIONS NAVIGATION (Tenant Staff & Admins) ───────────
const tenantNavItems: NavItem[] = [
  { 
    icon: <GridIcon />, 
    name: "Overview", 
    path: "/overview", 
    roles: ["TENANT_ADMIN", "MANAGER", "OPERATOR", "VIEWER", "AGENT"] 
  },
  { 
    icon: <GroupIcon />, 
    name: "Consumers", 
    path: "/consumers", 
    roles: ["TENANT_ADMIN", "MANAGER", "OPERATOR"] 
  },
  {
    icon: <BoxCubeIcon />,
    name: "Campaigns & marketing",
    roles: ["TENANT_ADMIN", "MANAGER"],
    subItems: [
      { name: "Campaigns list", path: "/campaigns" },
      { name: "Promo SMS broadcast", path: "/campaigns/broadcast" },
    ],
  },
  { 
    icon: <ShootingStarIcon />, 
    name: "Rewards catalog", 
    path: "/rewards", 
    roles: ["TENANT_ADMIN", "MANAGER", "OPERATOR"] 
  },
  {
    name: "Inventory",
    icon: <BoxIconLine />,
    roles: ["TENANT_ADMIN", "MANAGER", "OPERATOR"],
    subItems: [
      { name: "Product list", path: "/products" },
      { name: "Production batches", path: "/production" },
      { name: "Voucher batches", path: "/vouchers" },
      { name: "Voucher inventory", path: "/vouchers/list" },
    ],
  },
  { 
    icon: <ListIcon />, 
    name: "Terminal", 
    path: "/terminal", 
    roles: ["TENANT_ADMIN", "MANAGER", "OPERATOR", "AGENT"] 
  },
  { 
    icon: <DollarLineIcon />, 
    name: "Transactions", 
    path: "/transactions", 
    roles: ["TENANT_ADMIN", "MANAGER", "VIEWER"] 
  },
  { 
    icon: <ShootingStarIcon />, 
    name: "Redemptions & payouts", 
    path: "/redemptions", 
    roles: ["TENANT_ADMIN", "MANAGER", "OPERATOR"] 
  },
  {
    icon: <GridIcon />,
    name: "Setup & masters",
    roles: ["TENANT_ADMIN"],
    subItems: [
      { name: "Platform settings", path: "/settings" },
      { name: "Roles & permissions", path: "/settings/roles-permissions" },
      { name: "Audit & security logs", path: "/audit-logs" },
      { name: "Notifications center", path: "/notifications" },
      { name: "Organizations", path: "/settings/organizations" },
      { name: "Regions", path: "/settings/regions" },
      { name: "Towns", path: "/settings/towns" },
      { name: "Sales hierarchy", path: "/settings/sales-hierarchy" },
    ],
  },
  { 
    icon: <GroupIcon />, 
    name: "Team management", 
    path: "/team", 
    roles: ["TENANT_ADMIN"] 
  },
  { 
    icon: <ListIcon />, 
    name: "User guide & docs", 
    path: "/documentation" 
  },
  { 
    icon: <UserCircleIcon />, 
    name: "Account profile", 
    path: "/profile" 
  },
];

export default function AppSidebar() {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, toggleMobileSidebar } = useSidebar();
  const { user, loading } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const isOpen = isExpanded || isHovered || isMobileOpen;

  const isSuperAdmin = user?.role === "SYSTEM_ADMIN";
  const activeNavItems = isSuperAdmin ? superAdminNavItems : tenantNavItems;

  const filteredNavItems = activeNavItems.filter(item => {
    if (loading) return true;
    if (!item.roles) return true;
    return user?.role && item.roles.includes(user.role);
  });

  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback((path: string) => path === pathname, [pathname]);
  const isParentActive = useCallback(
    (item: NavItem) => item.subItems?.some((sub) => isActive(sub.path)) ?? false,
    [isActive]
  );

  const handleNavClick = () => {
    if (isMobileOpen) {
      toggleMobileSidebar();
    }
  };

  useEffect(() => {
    activeNavItems.forEach((nav) => {
      if (nav.subItems?.some((sub) => isActive(sub.path))) {
        setOpenSubmenu(nav.name);
      }
    });
  }, [pathname, isActive, activeNavItems]);

  useEffect(() => {
    if (openSubmenu !== null && subMenuRefs.current[openSubmenu]) {
      setSubMenuHeight((prev) => ({
        ...prev,
        [openSubmenu]: subMenuRefs.current[openSubmenu]?.scrollHeight || 0,
      }));
    }
  }, [openSubmenu]);

  const toggleSubmenu = (name: string) => {
    setOpenSubmenu((prev) => (prev === name ? null : name));
  };

  const handleLogout = async () => {
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

  const userInitials = `${user?.firstName?.charAt(0) || ""}${user?.lastName?.charAt(0) || ""}`.toUpperCase() || "U";
  const defaultHomePath = isSuperAdmin ? "/platform/dashboard" : "/overview";

  return (
    <aside
      className={`fixed flex flex-col top-0 left-0 h-screen bg-white dark:bg-gray-950 border-r border-gray-100 dark:border-white/[0.06] transition-all duration-250 ease-in-out z-50 overflow-hidden
        ${isOpen ? "w-[260px]" : "w-[68px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 shadow-md lg:shadow-none`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo Section */}
      <div className={`flex items-center h-[56px] px-4 border-b border-gray-100 dark:border-white/[0.06] shrink-0 ${isOpen ? "" : "justify-center"}`}>
        <Link href={defaultHomePath} onClick={handleNavClick} className="focus:outline-none">
          <Logo
            size="sm"
            collapsed={!isOpen}
            showSubtitle={isOpen}
            subtitleText={isSuperAdmin ? "Super Admin Portal" : "Enterprise Loyalty Engine"}
          />
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        {isOpen && (
          <p className="px-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/20">
            {isSuperAdmin ? "Platform Governance" : "Main Navigation"}
          </p>
        )}
        <ul className="flex flex-col gap-1 px-2.5">
          {filteredNavItems.map((nav) => (
            <li key={nav.name}>
              {nav.subItems ? (
                <>
                  <button
                    onClick={() => toggleSubmenu(nav.name)}
                    title={!isOpen ? nav.name : undefined}
                    className={`light-sidebar-item w-full ${
                      isParentActive(nav) ? "light-sidebar-item-active" : "light-sidebar-item-inactive"
                    } ${!isOpen ? "justify-center px-0" : ""}`}
                  >
                    <span className={`w-4 h-4 shrink-0 ${isParentActive(nav) ? "text-brand-500" : "text-gray-400"}`}>{nav.icon}</span>
                    {isOpen && (
                      <>
                        <span className="flex-1 text-left text-xs font-semibold truncate">{nav.name}</span>
                        <ChevronDownIcon
                          className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
                            openSubmenu === nav.name ? "rotate-180 text-brand-500" : "text-gray-300"
                          }`}
                        />
                      </>
                    )}
                  </button>
                  {isOpen && (
                    <div
                      ref={(el) => { subMenuRefs.current[nav.name] = el; }}
                      className="overflow-hidden transition-all duration-200"
                      style={{ height: openSubmenu === nav.name ? `${subMenuHeight[nav.name]}px` : "0px" }}
                    >
                      <ul className="ml-5 mt-1 border-l-2 border-gray-100 dark:border-white/[0.06] pl-3 pb-1 space-y-1">
                        {nav.subItems.map((sub) => (
                          <li key={sub.name}>
                            <Link
                              href={sub.path}
                              onClick={handleNavClick}
                              className={`light-sidebar-sub-item text-xs font-medium ${
                                isActive(sub.path)
                                  ? "light-sidebar-sub-item-active font-semibold"
                                  : "light-sidebar-sub-item-inactive"
                              }`}
                            >
                              {isActive(sub.path) && (
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
                              )}
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                nav.path && (
                  <Link
                    href={nav.path}
                    onClick={handleNavClick}
                    title={!isOpen ? nav.name : undefined}
                    className={`light-sidebar-item text-xs font-semibold ${
                      isActive(nav.path) ? "light-sidebar-item-active" : "light-sidebar-item-inactive"
                    } ${!isOpen ? "justify-center px-0" : ""}`}
                  >
                    <span className={`w-4 h-4 shrink-0 ${isActive(nav.path) ? "text-brand-500" : "text-gray-400"}`}>{nav.icon}</span>
                    {isOpen && <span className="truncate">{nav.name}</span>}
                  </Link>
                )
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer Profile Section */}
      <div className={`border-t border-gray-100 dark:border-white/[0.06] p-3.5 shrink-0 ${!isOpen ? "flex items-center justify-center" : ""}`}>
        <div className={`flex items-center gap-3 ${!isOpen ? "justify-center" : ""}`}>
          <div className="w-8 h-8 rounded-full bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400 flex items-center justify-center shrink-0 border border-brand-500/20 font-bold text-xs shadow-2xs">
            {userInitials}
          </div>
          {isOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-900 dark:text-white truncate leading-tight">
                {user ? `${user.firstName} ${user.lastName}` : "User"}
              </p>
              <p className="text-[11px] text-gray-400 font-medium truncate leading-tight capitalize">
                {user?.role?.replace("_", " ").toLowerCase() || "Operator"}
              </p>
            </div>
          )}
          {isOpen && (
            <button 
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
              title="Sign out"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l3 3m0 0l-3 3m3-3H2.25" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
