"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import Badge from "@/components/ui/badge/Badge";
import { useApi, authenticatedFetch } from "@/hooks/useApi";
import ModernSelect from "@/components/ui/ModernSelect";
import KenyaPhoneInput from "@/components/ui/KenyaPhoneInput";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function TeamMemberDetail({ params }: PageProps) {
  const resolvedParams = use(params as any) as any;
  const id = resolvedParams?.id;

  const { data: userData, isLoading, isError, mutate } = useApi<any>(`/users/${id}`);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const [editData, setEditData] = useState<any>({});

  // Password management state
  const [newPassword, setNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (userData?.data || userData) {
      const user = userData.data || userData;
      setEditData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.metadata?.phone || user.phone || "",
        role: user.role || "OPERATOR",
        status: user.status || "active",
      });
    }
  }, [userData]);

  if (isError) {
    return (
      <div className="w-full p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold animate-fadeIn">
        Failed to load team member details. Please refresh or try again.
      </div>
    );
  }

  if (isLoading || !userData) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  const user = userData.data || userData;
  const initials = `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase() || "U";
  const userPhone = editData.phone || user.metadata?.phone || user.phone || "—";

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setError("");

    if (!editData.firstName?.trim() || !editData.lastName?.trim()) {
      setError("First and last name are required.");
      setIsSaving(false);
      return;
    }

    try {
      const res = await authenticatedFetch(`/api/users/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          firstName: editData.firstName,
          lastName: editData.lastName,
          phone: editData.phone,
          role: editData.role,
          status: editData.status,
        }),
      });

      if (res.success) {
        setIsEditing(false);
        mutate();
      } else {
        setError(res.error || "Update failed");
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGeneratePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let pass = "";
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pass);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingPassword(true);
    setPasswordSuccess("");
    setPasswordError("");

    if (!newPassword || newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      setIsChangingPassword(false);
      return;
    }

    try {
      const res = await authenticatedFetch(`/api/users/${id}/password`, {
        method: "POST",
        body: JSON.stringify({ password: newPassword }),
      });

      if (res.success) {
        setPasswordSuccess("Password updated successfully.");
        setNewPassword("");
        mutate();
      } else {
        setPasswordError(res.error || "Failed to update password");
      }
    } catch (err: any) {
      setPasswordError(err.message || "Network error");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const toggleAccountStatus = async () => {
    const newStatus = user.status === "active" ? "inactive" : "active";
    try {
      if (newStatus === "inactive") {
        await authenticatedFetch(`/api/users/${id}`, { method: "DELETE" });
      } else {
        await authenticatedFetch(`/api/users/${id}`, {
          method: "PUT",
          body: JSON.stringify({ status: "active" }),
        });
      }
      mutate();
    } catch (err: any) {
      console.error(err);
    }
  };

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

  const formatRoleLabel = (role?: string) => {
    if (!role) return "Member";
    return role.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200/80 dark:border-white/[0.06] pb-5">
        <div className="flex items-center gap-4">
          <Link
            href="/team"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>

          {/* Rounded Avatar Circle */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold text-sm border border-brand-500/20 shadow-2xs">
            {initials}
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                {user.firstName} {user.lastName}
              </h1>
              <Badge color={getRoleBadgeColor(user.role) as any} size="sm">
                {formatRoleLabel(user.role)}
              </Badge>
              <Badge color={user.status === "active" ? "success" : "light"} size="sm">
                {user.status === "active" ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              {user.email} {userPhone !== "—" ? `· ${userPhone}` : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button
                onClick={() => { setIsEditing(false); setError(""); }}
                className="px-4 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-brand-500/20 transition disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save changes"}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-xl transition flex items-center gap-2 shadow-2xs"
            >
              <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
              Edit details
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Main Details & Password Management */}
        <div className="col-span-12 xl:col-span-8 space-y-6">
          {/* Member Profile Details */}
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4 dark:border-white/5">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Member Information</h3>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">First Name</label>
                {isEditing ? (
                  <input
                    className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 text-xs font-medium text-gray-900 shadow-2xs dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                    value={editData.firstName}
                    onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                  />
                ) : (
                  <p className="text-xs font-bold text-gray-900 dark:text-white">{user.firstName}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Last Name</label>
                {isEditing ? (
                  <input
                    className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 text-xs font-medium text-gray-900 shadow-2xs dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                    value={editData.lastName}
                    onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                  />
                ) : (
                  <p className="text-xs font-bold text-gray-900 dark:text-white">{user.lastName}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Email Address</label>
                <p className="text-xs font-bold text-gray-900 dark:text-white">{user.email}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Phone Number</label>
                {isEditing ? (
                  <KenyaPhoneInput
                    value={editData.phone}
                    onChange={(val: string) => setEditData({ ...editData, phone: val })}
                    size="md"
                  />
                ) : (
                  <p className="text-xs font-bold text-gray-900 dark:text-white">{userPhone}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Role Designation</label>
                {isEditing ? (
                  <ModernSelect
                    options={[
                      { value: "TENANT_ADMIN", label: "Tenant Admin" },
                      { value: "MANAGER", label: "Operations Manager" },
                      { value: "OPERATOR", label: "Standard Operator" },
                      { value: "VIEWER", label: "Read-Only Viewer" },
                    ]}
                    value={editData.role}
                    onChange={(val) => setEditData({ ...editData, role: val })}
                  />
                ) : (
                  <p className="text-xs font-bold text-gray-900 dark:text-white">{formatRoleLabel(user.role)}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Status</label>
                {isEditing ? (
                  <ModernSelect
                    options={[
                      { value: "active", label: "Active" },
                      { value: "inactive", label: "Inactive" },
                    ]}
                    value={editData.status}
                    onChange={(val) => setEditData({ ...editData, status: val })}
                  />
                ) : (
                  <p className="text-xs font-bold text-gray-900 dark:text-white capitalize">{user.status}</p>
                )}
              </div>
            </div>
          </div>

          {/* Password Management Card */}
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4 dark:border-white/5">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Password Management</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Set a new password or reset security credentials for this member.
              </p>
            </div>

            <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
              {passwordSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                  {passwordSuccess}
                </div>
              )}
              {passwordError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                  {passwordError}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    New Password
                  </label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline"
                  >
                    Generate random password
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Enter or generate new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 text-xs font-mono font-medium text-gray-900 shadow-2xs dark:border-white/10 dark:bg-white/[0.03] dark:text-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
              </div>

              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  disabled={!newPassword || isChangingPassword}
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-brand-500/20 transition disabled:opacity-50"
                >
                  {isChangingPassword ? "Updating password..." : "Update password"}
                </button>
              </div>
            </form>
          </div>

          {/* Security & Access Audit */}
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Security & Audit Log</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5">
                <span className="text-[11px] font-semibold text-gray-400 block">Date Added</span>
                <span className="font-bold text-gray-900 dark:text-white mt-0.5 block">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5">
                <span className="text-[11px] font-semibold text-gray-400 block">MFA Status</span>
                <span className="font-bold text-gray-900 dark:text-white mt-0.5 block">
                  {user.mfaEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5">
                <span className="text-[11px] font-semibold text-gray-400 block">Last Password Update</span>
                <span className="font-bold text-gray-900 dark:text-white mt-0.5 block">
                  {user.metadata?.lastPasswordReset ? new Date(user.metadata.lastPasswordReset).toLocaleDateString() : "Initial setup"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Role Capability & Quick Actions */}
        <div className="col-span-12 xl:col-span-4 space-y-6">
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Role Scope</h3>
            <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/20 space-y-2">
              <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                {formatRoleLabel(user.role)}
              </span>
              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                {user.role === "TENANT_ADMIN" && "Full administrative authorization across all system models and configurations."}
                {user.role === "MANAGER" && "Operations management scope over rewards, campaigns, inventory, and transactions."}
                {user.role === "OPERATOR" && "Standard execution access for customer onboarding and card validation."}
                {user.role === "VIEWER" && "Read-only access for data verification and telemetry overview."}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Account Actions</h3>
            
            <button
              onClick={toggleAccountStatus}
              className={`w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-xs font-semibold ${
                user.status === "active" ? "text-rose-600" : "text-emerald-600"
              }`}
            >
              {user.status === "active" ? "Deactivate team member" : "Re-activate team member"}
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
