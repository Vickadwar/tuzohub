"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { useUser } from "../context/UserContext";
import { signOut as serverSignOut } from "@/app/auth/actions";
import { supabase } from "@/lib/supabase";
import { clearAllCookies } from "@/lib/utils";
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

const navItems: NavItem[] = [
  // ── PLATFORM SECTION (Super Admins Only) ───────────────────────
  {
    icon: <PieChartIcon />,
    name: "Platform",
    roles: ["SYSTEM_ADMIN"],
    subItems: [
      { name: "Global Dashboard", path: "/platform/dashboard" },
      { name: "Manage Tenants", path: "/platform/tenants" },
      { name: "Pending Registrations", path: "/admin/registrations" },
      { name: "System Billing", path: "/platform/billing" },
    ],
  },
  
  // ── TENANT OPERATIONS (Tenant Admins & Staff) ──────────────────
  { 
    icon: <GridIcon />, 
    name: "Overview", 
    path: "/overview", 
    roles: ["TENANT_ADMIN", "MANAGER", "OPERATOR", "VIEWER", "AGENT", "SYSTEM_ADMIN"] 
  },
  { 
    icon: <GroupIcon />, 
    name: "Consumers", 
    path: "/consumers", 
    roles: ["TENANT_ADMIN", "MANAGER", "OPERATOR", "SYSTEM_ADMIN"] 
  },
  { 
    icon: <BoxCubeIcon />, 
    name: "Campaigns", 
    path: "/campaigns", 
    roles: ["TENANT_ADMIN", "MANAGER", "SYSTEM_ADMIN"] 
  },
  { 
    icon: <ShootingStarIcon />, 
    name: "Rewards Catalog", 
    path: "/rewards", 
    roles: ["TENANT_ADMIN", "MANAGER", "OPERATOR", "SYSTEM_ADMIN"] 
  },

  // ── INVENTORY & LOGISTICS ──────────────────────────────────────
  {
    name: "Inventory",
    icon: <BoxIconLine />,
    roles: ["TENANT_ADMIN", "MANAGER", "OPERATOR", "SYSTEM_ADMIN"],
    subItems: [
      { name: "Product List", path: "/products" },
      { name: "Production Batches", path: "/production" },
      { name: "Voucher Batches", path: "/vouchers" },
      { name: "Voucher Inventory", path: "/vouchers/list" },
    ],
  },

  // ── TOOLS & TRANSACTIONS ───────────────────────────────────────
  { 
    icon: <ListIcon />, 
    name: "Terminal", 
    path: "/terminal", 
    roles: ["TENANT_ADMIN", "MANAGER", "OPERATOR", "AGENT", "SYSTEM_ADMIN"] 
  },
  { 
    icon: <DollarLineIcon />, 
    name: "Transactions", 
    path: "/transactions", 
    roles: ["TENANT_ADMIN", "MANAGER", "VIEWER", "SYSTEM_ADMIN"] 
  },

  // ── SETUP & TEAM ───────────────────────────────────────────────
  {
    icon: <GridIcon />,
    name: "Setup & Masters",
    roles: ["TENANT_ADMIN", "SYSTEM_ADMIN"],
    subItems: [
      { name: "Platform Settings", path: "/settings" },
      { name: "Organizations", path: "/settings/organizations" },
      { name: "Regions", path: "/settings/regions" },
      { name: "Towns", path: "/settings/towns" },
      { name: "Sales Hierarchy", path: "/settings/sales-hierarchy" },
    ],
  },
  { icon: <GroupIcon />, name: "Our Team", path: "/team", roles: ["TENANT_ADMIN", "SYSTEM_ADMIN"] },
  { icon: <UserCircleIcon />, name: "Profile", path: "/profile" },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { user, loading } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const isOpen = isExpanded || isHovered || isMobileOpen;

  const filteredNavItems = navItems.filter(item => {
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

  useEffect(() => {
    navItems.forEach((nav) => {
      if (nav.subItems?.some((sub) => isActive(sub.path))) {
        setOpenSubmenu(nav.name);
      }
    });
  }, [pathname, isActive]);

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

  return (
    <aside
      className={`fixed flex flex-col top-0 left-0 h-screen bg-white dark:bg-gray-950 border-r border-gray-100 dark:border-white/[0.06] transition-all duration-250 ease-in-out z-50 overflow-hidden
        ${isOpen ? "w-[260px]" : "w-[68px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 shadow-sm`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <div className={`flex items-center h-[56px] px-4 border-b border-gray-100 dark:border-white/[0.06] shrink-0 ${isOpen ? "gap-3" : "justify-center"}`}>
        <Link href="/" className="flex items-center gap-3 group min-w-0">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shrink-0 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all">
            <span className="text-white font-black text-sm leading-none tracking-tight">TZ</span>
          </div>
          {isOpen && (
            <div className="flex flex-col min-w-0">
              <span className="text-[15px] font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
                TuZo<span className="text-brand-500">Hub</span>
              </span>
              <span className="text-[10px] text-gray-400 font-medium tracking-wide leading-tight">Loyalty Platform</span>
            </div>
          )}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 no-scrollbar">
        {isOpen && (
          <p className="px-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/20">
            Main Menu
          </p>
        )}
        <ul className="flex flex-col gap-0.5 px-2.5">
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
                    <span className={`w-[18px] h-[18px] shrink-0 ${isParentActive(nav) ? "text-brand-500" : "text-gray-400"}`}>{nav.icon}</span>
                    {isOpen && (
                      <>
                        <span className="flex-1 text-left truncate">{nav.name}</span>
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
                      <ul className="ml-5 mt-0.5 border-l-2 border-gray-100 dark:border-white/[0.06] pl-3 pb-1 space-y-0.5">
                        {nav.subItems.map((sub) => (
                          <li key={sub.name}>
                            <Link
                              href={sub.path}
                              className={`light-sidebar-sub-item ${
                                isActive(sub.path)
                                  ? "light-sidebar-sub-item-active"
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
                    title={!isOpen ? nav.name : undefined}
                    className={`light-sidebar-item ${
                      isActive(nav.path) ? "light-sidebar-item-active" : "light-sidebar-item-inactive"
                    } ${!isOpen ? "justify-center px-0" : ""}`}
                  >
                    <span className={`w-[18px] h-[18px] shrink-0 ${isActive(nav.path) ? "text-brand-500" : "text-gray-400"}`}>{nav.icon}</span>
                    {isOpen && <span className="truncate">{nav.name}</span>}
                  </Link>
                )
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className={`border-t border-gray-100 dark:border-white/[0.06] p-3.5 shrink-0 ${!isOpen ? "flex items-center justify-center" : ""}`}>
        <div className={`flex items-center gap-3 ${!isOpen ? "justify-center" : ""}`}>
          <div className="w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-500/20 flex items-center justify-center shrink-0 border border-brand-100 dark:border-brand-500/30">
            <span className="text-brand-500 font-bold text-xs">
              {user?.role?.charAt(0) || "U"}
            </span>
          </div>
          {isOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-gray-800 dark:text-white/80 truncate leading-tight">
                {user ? `${user.firstName} ${user.lastName}` : "Guest"}
              </p>
              <p className="text-[11px] text-gray-400 truncate leading-tight">
                {user?.role?.replace("_", " ") || "Visitor"}
              </p>
            </div>
          )}
          {isOpen && (
            <button 
              onClick={handleLogout}
              className="p-1.5 rounded-md text-gray-400 hover:text-error-500 hover:bg-error-50 transition-colors"
              title="Logout"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          )}
        </div>
        {!isOpen && (
          <button 
            onClick={handleLogout}
            className="mt-2 p-1.5 rounded-md text-gray-400 hover:text-error-500 hover:bg-error-50 transition-colors"
            title="Logout"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        )}
      </div>
    </aside>
  );
};

export default AppSidebar;
