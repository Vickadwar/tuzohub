"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: userData, isLoading, isError } = useApi<any>("/users/me");

  useEffect(() => {
    if (isError) {
      // If we get an error fetching /users/me, they are likely not authenticated or token is invalid
      router.replace("/auth/login");
    } else if (userData?.success && userData?.data) {
      // If they need to change their password, enforce it
      if (userData.data.requiresPasswordChange) {
        router.replace("/auth/force-password-change");
      }
    }
  }, [isError, userData, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500"></div>
      </div>
    );
  }

  // Prevent rendering children if they need to change password or are unauthorized
  if (isError || userData?.data?.requiresPasswordChange) {
    return null; 
  }

  return <>{children}</>;
}
