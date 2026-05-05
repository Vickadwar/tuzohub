"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface UserProfile {
  userId: string;
  tenantId: string | null;
  email: string;
  firstName: string;
  lastName: string;
  role: "SYSTEM_ADMIN" | "TENANT_ADMIN" | "MANAGER" | "OPERATOR" | "VIEWER" | "AGENT" | null;
}

interface UserContextType {
  user: UserProfile | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setUser(null);
        setLoading(false);
        return;
      }

      const response = await fetch("/api/users/me", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        credentials: "omit", // Fix for 431: Don't send cookies when manual Auth header is present
      });

      if (response.ok) {
        const result = await response.json();
        const userData = result.data || result.user || result;
        setUser(userData);
      } else {
        const errorText = await response.text().catch(() => "Unknown error");
        console.error(`[UserContext] Profile fetch failed (${response.status}):`, errorText);
        setUser(null);
      }
    } catch (error) {
      console.error("[UserContext] Error in fetchProfile:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchProfile();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, refresh: fetchProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
