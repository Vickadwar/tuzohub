"use client";
import React, { useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Badge } from "@/components/ui/badge";
import Button from "@/components/ui/button/Button";

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRegistrations = async () => {
    try {
      const res = await fetch("/api/system/registrations");
      const result = await res.json();
      if (result.success) setRegistrations(result.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleAction = async (id: string, action: "approve" | "decline") => {
    if (!confirm(`Are you sure you want to ${action} this tenant?`)) return;

    try {
      const res = await fetch(`/api/system/registrations/${id}/${action}`, {
        method: "POST",
      });
      const result = await res.json();
      if (result.success) {
        fetchRegistrations();
      } else {
        alert(result.error);
      }
    } catch (err) {
      alert("Action failed.");
    }
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Tenant Registrations" />

      <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.1] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/[0.05]">
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider">Organization</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider">Compliance</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider">Admin</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">Loading registrations...</td></tr>
              ) : registrations.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">No registrations found.</td></tr>
              ) : (
                registrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 dark:text-white">{reg.name}</div>
                      <div className="text-xs text-gray-500">{reg.email}</div>
                      <div className="text-[10px] text-gray-400 mt-1">{reg.country?.name || "Global"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400">PIN: {reg.taxPin || "N/A"}</div>
                      <div className="text-xs text-gray-500">{reg.phone || "No phone"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Admin User</div>
                      <div className="text-xs text-gray-500">{reg.createdAt ? new Date(reg.createdAt).toLocaleDateString() : "N/A"}</div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {reg.status === "pending" && (
                        <>
                          <Button 
                            size="sm" 
                            variant="primary"
                            onClick={() => handleAction(reg.id, "approve")}
                          >
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-error-600 hover:text-error-700"
                            onClick={() => handleAction(reg.id, "decline")}
                          >
                            Decline
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
