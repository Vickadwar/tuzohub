"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { authenticatedFetch, useApi } from "@/hooks/useApi";
import { Modal } from "@/components/ui/modal/index";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";

export default function TeamPage() {
  const { data: userData, mutate, isLoading } = useApi<any>("/users");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const [inviteData, setInviteData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    role: "OPERATOR"
  });

  const users = userData?.data || [];

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      const res = await authenticatedFetch("/api/users/invite", {
        method: "POST",
        body: JSON.stringify(inviteData)
      });
      if (res.success) {
        mutate();
        setIsInviteModalOpen(false);
        setInviteData({ email: "", firstName: "", lastName: "", role: "OPERATOR" });
      } else {
        setError(res.error || "Failed to invite user");
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async (userId: string) => {
    if (!confirm("Are you sure you want to deactivate this user?")) return;
    try {
      const res = await authenticatedFetch(`/api/users/${userId}`, {
        method: "DELETE"
      });
      if (res.success) {
        mutate();
      } else {
        alert(res.error || "Failed to deactivate user");
      }
    } catch (err: any) {
      alert(err.message || "Network error");
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "SYSTEM_ADMIN": return "error";
      case "TENANT_ADMIN": return "primary";
      case "MANAGER": return "success";
      case "OPERATOR": return "info";
      case "VIEWER": return "light";
      default: return "light";
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
            Team Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your administrative team, invite new members, and assign roles.
          </p>
        </div>
        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-700 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Invite member
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#18181b] overflow-hidden">
        <div className="w-full overflow-x-auto">
          {isLoading ? (
            <div className="flex min-h-[300px] w-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500"></div>
            </div>
          ) : (
            <Table className="w-full">
              <TableHeader className="bg-gray-50/50 dark:bg-white/5">
                <TableRow>
                  <TableCell isHeader className="py-3 px-6 text-left text-xs text-gray-500 uppercase">Name</TableCell>
                  <TableCell isHeader className="py-3 px-6 text-left text-xs text-gray-500 uppercase">Role</TableCell>
                  <TableCell isHeader className="py-3 px-6 text-left text-xs text-gray-500 uppercase">Status</TableCell>
                  <TableCell isHeader className="py-3 px-6 text-left text-xs text-gray-500 uppercase">Joined</TableCell>
                  <TableCell isHeader className="py-3 px-6 text-right text-xs text-gray-500 uppercase">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user: any) => (
                  <TableRow key={user.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center gap-3">
                         <div className="h-9 w-9 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 font-bold text-sm dark:bg-brand-500/10">
                            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                         </div>
                         <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{user.firstName} {user.lastName}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{user.email}</span>
                         </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                       <Badge size="sm" color={getRoleBadgeColor(user.role) as any}>{user.role}</Badge>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                       <Badge size="sm" color={user.status === 'active' ? 'success' : 'light'}>{user.status}</Badge>
                    </TableCell>
                    <TableCell className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400">
                       {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-right">
                       <button 
                         onClick={() => handleDeactivate(user.id)}
                         disabled={user.status === 'inactive'}
                         className="text-error-600 hover:text-error-700 disabled:opacity-30 disabled:cursor-not-allowed"
                       >
                          Deactivate
                       </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <Modal 
        isOpen={isInviteModalOpen} 
        onClose={() => setIsInviteModalOpen(false)}
      >
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Invite team member</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Send an invitation to join your administrative portal.</p>
          </div>

          <form onSubmit={handleInvite} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <Label>First name</Label>
                  <Input 
                    value={inviteData.firstName} 
                    onChange={(e) => setInviteData({...inviteData, firstName: e.target.value})} 
                    required 
                  />
               </div>
               <div>
                  <Label>Last name</Label>
                  <Input 
                    value={inviteData.lastName} 
                    onChange={(e) => setInviteData({...inviteData, lastName: e.target.value})} 
                    required 
                  />
               </div>
            </div>
            <div>
              <Label>Email address</Label>
              <Input 
                 type="email" 
                 value={inviteData.email} 
                 onChange={(e) => setInviteData({...inviteData, email: e.target.value})} 
                 required 
              />
            </div>
            <Select 
               label="Assignment Role" 
               options={[
                 { label: "Manager", value: "MANAGER" },
                 { label: "Operator", value: "OPERATOR" },
                 { label: "Viewer", value: "VIEWER" }
               ]} 
               value={inviteData.role} 
               onChange={(val: string) => setInviteData({...inviteData, role: val})} 
            />
            
            {error && <p className="text-xs text-error-600 font-medium">{error}</p>}

            <div className="flex justify-end gap-3 pt-6 border-t dark:border-white/10 mt-6">
               <button 
                 type="button" 
                 onClick={() => setIsInviteModalOpen(false)}
                 className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5 transition"
               >
                  Cancel
               </button>
               <button 
                 type="submit" 
                 disabled={isSubmitting}
                 className="bg-brand-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-700 disabled:opacity-50 transition shadow-sm"
               >
                  {isSubmitting ? "Sending invite..." : "Send invitation"}
               </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
