"use client";

import React, { useState, useEffect } from "react";
import Badge from "@/components/ui/badge/Badge";
import { useApi, authenticatedFetch } from "@/hooks/useApi";
import KenyaPhoneInput from "@/components/ui/KenyaPhoneInput";

function MetricCard({ label, value, sub }: { label: string; value: string | number; sub: string }) {
  return (
    <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-4 rounded-2xl shadow-sm space-y-1.5">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</p>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white capitalize">{value}</h3>
      <p className="text-[11px] text-gray-400">{sub}</p>
    </div>
  );
}

export default function ProfilePage() {
  const { data: userData, mutate, isLoading } = useApi<any>("/users/me");

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  // Password update state
  const [newPassword, setNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const user = userData?.data || userData || {};

  useEffect(() => {
    if (user.id || user.userId) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.metadata?.phone || user.phone || "",
      });
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    if (!profileData.firstName.trim() || !profileData.lastName.trim()) {
      setError("First and last name are required.");
      setIsSaving(false);
      return;
    }

    try {
      const res = await authenticatedFetch("/api/users/me", {
        method: "PUT",
        body: JSON.stringify({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phone: profileData.phone,
        }),
      });

      if (res.success) {
        mutate();
        setIsEditing(false);
        setSuccess("Profile updated successfully");
      } else {
        setError(res.error || "Failed to update profile");
      }
    } catch (err: any) {
      setError(err.message || "Network error occurred");
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
      const userId = user.id || user.userId;
      const res = await authenticatedFetch(`/api/users/${userId}/password`, {
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

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  const initials = `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase() || "U";

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case "SYSTEM_ADMIN":
      case "TENANT_ADMIN":
        return "error";
      case "MANAGER":
        return "warning";
      case "OPERATOR":
        return "info";
      default:
        return "light";
    }
  };

  const formatRoleLabel = (role?: string) => {
    if (!role) return "Administrator";
    return role.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-12">
      {/* Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200/80 dark:border-white/[0.06] pb-5">
        <div className="flex items-center gap-4">
          {/* Rounded Avatar Circle */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold text-base border border-brand-500/20 shadow-2xs">
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
              <Badge color={user.status === "inactive" ? "light" : "success"} size="sm">
                {user.status === "inactive" ? "Inactive" : "Active"}
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Manage your administrator identity, phone contact, and security credentials.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={() => { setIsEditing(false); setError(""); setSuccess(""); }}
                className="px-4 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-brand-500/20 transition disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save changes"}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-xl transition flex items-center gap-2 shadow-2xs"
            >
              <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
              Edit profile
            </button>
          )}
        </div>
      </div>

      {/* Top Metric Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Account Role" value={formatRoleLabel(user.role)} sub="Privilege level" />
        <MetricCard label="Account Status" value={user.status || "Active"} sub="Platform state" />
        <MetricCard label="Tenant Isolation" value="Active" sub={user.tenantId ? `${user.tenantId.slice(0, 8)}...` : "Global Scope"} />
        <MetricCard label="Security MFA" value={user.mfaEnabled ? "Enabled" : "Disabled"} sub="Two-factor status" />
      </div>

      {/* Main 12-Column Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column (8 cols): Personal Info & Password Reset */}
        <div className="col-span-12 xl:col-span-8 space-y-6">
          {/* Personal Information */}
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4 dark:border-white/5">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Personal Identity</h3>
            </div>

            <div className="p-6 space-y-4">
              {success && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                  {success}
                </div>
              )}
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                  {error}
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-1">First Name</label>
                  {isEditing ? (
                    <input
                      className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 text-xs font-medium text-gray-900 shadow-2xs dark:border-white/10 dark:bg-white/[0.03] dark:text-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    />
                  ) : (
                    <p className="text-xs font-bold text-gray-900 dark:text-white">{user.firstName || "—"}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-1">Last Name</label>
                  {isEditing ? (
                    <input
                      className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 text-xs font-medium text-gray-900 shadow-2xs dark:border-white/10 dark:bg-white/[0.03] dark:text-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    />
                  ) : (
                    <p className="text-xs font-bold text-gray-900 dark:text-white">{user.lastName || "—"}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-1">Email Address</label>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">{user.email || "—"}</p>
                  <span className="text-[11px] text-gray-400 mt-0.5 block">Email address is tied to your organization login.</span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-1">Phone Number</label>
                  {isEditing ? (
                    <KenyaPhoneInput
                      value={profileData.phone}
                      onChange={(val: string) => setProfileData({ ...profileData, phone: val })}
                      size="md"
                    />
                  ) : (
                    <p className="text-xs font-bold text-gray-900 dark:text-white">{profileData.phone || "—"}</p>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Password Management */}
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4 dark:border-white/5">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Security Credentials</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Update your administrative account password.
              </p>
            </div>

            <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
              {passwordSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                  {passwordSuccess}
                </div>
              )}
              {passwordError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
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
        </div>

        {/* Right Column (4 cols): Security & Danger Zone */}
        <div className="col-span-12 xl:col-span-4 space-y-6">
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Security Summary</h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 flex items-center justify-between">
                <span className="text-gray-500 font-medium">Last Active</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {user.lastActive ? new Date(user.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Active now"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 flex items-center justify-between">
                <span className="text-gray-500 font-medium">Role Designation</span>
                <span className="font-bold text-gray-900 dark:text-white">{formatRoleLabel(user.role)}</span>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 flex items-center justify-between">
                <span className="text-gray-500 font-medium">Password Last Set</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {user.metadata?.lastPasswordReset ? new Date(user.metadata.lastPasswordReset).toLocaleDateString() : "Default"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400">Danger Zone</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Deactivating your administrative profile will restrict access to all tenant management consoles.
            </p>
            <button
              type="button"
              className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-rose-500/20 transition"
              onClick={() => alert("Please contact your system admin to deactivate primary admin accounts.")}
            >
              Request Account Deactivation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
