"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { useApi } from "@/hooks/useApi";

function MetricCard({ label, value, sub }: { label: string; value: string | number; sub: string }) {
  return (
    <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-4 rounded-2xl shadow-sm space-y-1.5">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</p>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{value}</h3>
      <p className="text-[11px] text-gray-400">{sub}</p>
    </div>
  );
}

export default function TeamPage() {
  const { data: userData, isLoading } = useApi<any>("/users");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("ALL");

  const users: any[] = userData?.data || userData || [];

  const filteredUsers = users.filter((u) => {
    const fullName = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase();
    const email = (u.email || "").toLowerCase();
    const phone = u.metadata?.phone || "";
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm.toLowerCase()) ||
      phone.includes(searchTerm);

    const matchesRole = selectedRole === "ALL" || u.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const totalMembers = users.length;
  const activeAdmins = users.filter(u => u.role === "TENANT_ADMIN" || u.role === "SYSTEM_ADMIN").length;
  const activeManagers = users.filter(u => u.role === "MANAGER").length;
  const activeOperators = users.filter(u => u.role === "OPERATOR" || u.role === "VIEWER").length;

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "SYSTEM_ADMIN":
      case "TENANT_ADMIN":
        return "error";
      case "MANAGER":
        return "warning";
      case "OPERATOR":
        return "info";
      case "VIEWER":
        return "light";
      default:
        return "light";
    }
  };

  const formatRoleLabel = (role: string) => {
    if (!role) return "Member";
    return role.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-12">
      {/* Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200/80 dark:border-white/[0.06] pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            Team Management
          </h1>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Manage administrative personnel, assign role designations, and configure security parameters.
          </p>
        </div>
        <Link
          href="/team/new"
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-brand-500/20 transition flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create new member
        </Link>
      </div>

      {/* Metric summary bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Total Team" value={totalMembers} sub="Registered users" />
        <MetricCard label="Administrators" value={activeAdmins} sub="Tenant & System Admins" />
        <MetricCard label="Managers" value={activeManagers} sub="Operations managers" />
        <MetricCard label="Operators & Viewers" value={activeOperators} sub="Field & support staff" />
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-3 rounded-2xl shadow-2xs">
        <div className="relative w-full sm:w-80">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-white/[0.03] border border-gray-200/80 dark:border-white/10 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {["ALL", "TENANT_ADMIN", "MANAGER", "OPERATOR", "VIEWER"].map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedRole === role
                  ? "bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold border border-brand-500/20"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
              }`}
            >
              {role === "ALL" ? "All roles" : formatRoleLabel(role)}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-sm">
        <div className="w-full overflow-x-auto">
          {isLoading ? (
            <div className="flex min-h-[300px] w-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
            </div>
          ) : (
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-gray-50/50 dark:bg-white/[0.01]">
                  <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Team Member</TableCell>
                  <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Role Designation</TableCell>
                  <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Status</TableCell>
                  <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Date Added</TableCell>
                  <TableCell isHeader className="py-3.5 px-6 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user: any) => {
                    const initials = `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase() || "U";
                    const phone = user.metadata?.phone || user.phone;

                    return (
                      <TableRow key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                        <TableCell className="py-3.5 px-6">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold text-xs border border-brand-500/20 shadow-2xs">
                              {initials}
                            </div>
                            <div className="flex flex-col">
                              <Link href={`/team/${user.id}`} className="text-xs font-bold text-gray-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition">
                                {user.firstName} {user.lastName}
                              </Link>
                              <span className="text-[11px] text-gray-400 font-medium">{user.email} {phone ? `· ${phone}` : ""}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3.5 px-6">
                          <Badge size="sm" color={getRoleBadgeColor(user.role) as any}>
                            {formatRoleLabel(user.role)}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3.5 px-6">
                          <Badge size="sm" color={user.status === "active" ? "success" : "light"}>
                            {user.status === "active" ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3.5 px-6 text-xs text-gray-500 font-medium">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                        </TableCell>
                        <TableCell className="py-3.5 px-6 text-right">
                          <Link
                            href={`/team/${user.id}`}
                            className="inline-flex items-center text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 transition gap-1"
                          >
                            View details
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center text-xs font-semibold text-gray-400 italic">
                      No team members found matching your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
