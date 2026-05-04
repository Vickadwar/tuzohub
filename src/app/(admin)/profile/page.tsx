"use client";

import React, { useState, useEffect } from "react";
import { useApi, authenticatedFetch } from "@/hooks/useApi";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Badge from "@/components/ui/badge/Badge";

export default function ProfilePage() {
  const { data: userData, mutate, isLoading } = useApi<any>("/users/me");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: ""
  });

  const user = userData?.data || {};

  useEffect(() => {
    if (user.id) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || ""
      });
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await authenticatedFetch(`/api/users/me`, {
        method: "PUT",
        body: JSON.stringify(profileData)
      });
      if (res.success) {
        mutate();
        setIsEditing(false);
        setSuccess("Profile updated successfully");
      } else {
        setError(res.error || "Failed to update profile");
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Account Workspace</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage your administrator identity and security preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Overview */}
        <div className="space-y-6">
           <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18181b] text-center">
              <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 p-1 mb-4">
                 <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-3xl font-bold text-brand-600 dark:bg-[#18181b]">
                    {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                 </div>
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{user.firstName} {user.lastName}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{user.email}</p>
              <div className="mt-4 flex justify-center">
                 <Badge color="primary">{user.role}</Badge>
              </div>
           </div>

           <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18181b]">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">System Context</h3>
              <div className="space-y-4">
                 <div>
                    <p className="text-xs text-gray-400">Status</p>
                    <p className="text-sm font-medium dark:text-white capitalize">{user.status}</p>
                 </div>
                 <div>
                    <p className="text-xs text-gray-400">Security MFA</p>
                    <p className="text-sm font-medium dark:text-white text-error-500">Disabled</p>
                 </div>
                 <div>
                    <p className="text-xs text-gray-400">Last Active</p>
                    <p className="text-sm font-medium dark:text-white">
                       {user.lastActive ? new Date(user.lastActive).toLocaleString() : "Recently"}
                    </p>
                 </div>
              </div>
           </div>
        </div>

        {/* Right Column: Form */}
        <div className="md:col-span-2">
           <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#18181b] overflow-hidden">
              <div className="border-b border-gray-100 p-6 dark:border-white/5 flex items-center justify-between">
                 <h3 className="text-base font-bold text-gray-900 dark:text-white">Personal Information</h3>
                 {!isEditing && (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
                    >
                       Edit Profile
                    </button>
                 )}
              </div>
              <div className="p-6">
                 {success && (
                    <div className="mb-6 rounded-lg bg-success-50 p-3 text-sm text-success-700 dark:bg-success-500/10 dark:text-success-400">
                       {success}
                    </div>
                 )}
                 {error && (
                    <div className="mb-6 rounded-lg bg-error-50 p-3 text-sm text-error-700 dark:bg-error-500/10 dark:text-error-400">
                       {error}
                    </div>
                 )}

                 <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                       <div>
                          <Label className="mb-1.5">First Name</Label>
                          <Input 
                            value={profileData.firstName} 
                            onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                            disabled={!isEditing}
                          />
                       </div>
                       <div>
                          <Label className="mb-1.5">Last Name</Label>
                          <Input 
                            value={profileData.lastName} 
                            onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                            disabled={!isEditing}
                          />
                       </div>
                    </div>
                    <div>
                       <Label className="mb-1.5">Email Address</Label>
                       <Input 
                          value={profileData.email} 
                          onChange={() => {}}
                          disabled={true} 
                          hint="Your email is tied to your tenant account and cannot be changed here."
                       />
                    </div>

                    {isEditing && (
                       <div className="pt-6 border-t dark:border-white/5 flex justify-end gap-3">
                          <button 
                            type="button" 
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
                          >
                             Cancel
                          </button>
                          <button 
                            type="submit" 
                            disabled={isSaving}
                            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 disabled:opacity-50"
                          >
                             {isSaving ? "Saving..." : "Save Changes"}
                          </button>
                       </div>
                    )}
                 </form>
              </div>
           </div>

           <div className="mt-8 rounded-2xl border border-error-100 bg-error-50/30 p-6 dark:border-error-500/20 dark:bg-error-500/5">
              <h3 className="text-base font-bold text-error-900 dark:text-error-400">Danger Zone</h3>
              <p className="mt-1 text-sm text-error-700 dark:text-error-400/80">
                 Deleting your administrator account is irreversible. All your logs and assignments will be orphaned.
              </p>
              <button className="mt-4 rounded-md bg-error-600 px-4 py-2 text-sm font-medium text-white hover:bg-error-700 shadow-sm transition">
                 Terminate Account
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
