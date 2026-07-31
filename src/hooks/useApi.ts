import { useEffect } from "react";
import useSWR, { SWRConfiguration } from "swr";
import { supabase } from "@/lib/supabase";

// Generic fetcher that works with our Hono API structure.
export const fetcher = async (url: string) => {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(url, {
      credentials: "omit",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const error = new Error(`API Error: ${res.status}`);
      const info = await res.json().catch(() => ({}));
      console.error(`[API Fetch Error] ${url}`, { status: res.status, info });
      (error as any).info = info;
      (error as any).status = res.status;
      throw error;
    }

    const json = await res.json();
    
    // Hono API responses often wrap data in { success: true, data: ... }
    if (json.success !== undefined) {
      if (!json.success) {
        throw new Error(json.error || "API returned failure");
      }
      return json.data;
    }

    return json;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error("Request timed out after 15 seconds");
    }
    throw error;
  }
};

/**
 * Standardized hook for getting generic API resources with optional auto-refresh.
 */
export function useApi<T = any>(endpoint: string | null, options?: SWRConfiguration) {
  const { data, error, mutate, isValidating } = useSWR<T>(
    endpoint ? `/api${endpoint}` : null,
    fetcher,
    {
      revalidateOnFocus: true,
      errorRetryCount: 2,
      dedupingInterval: 2000,
      keepPreviousData: true,
      ...options,
    }
  );

  useEffect(() => {
    const handleUpdate = () => {
      mutate();
    };
    window.addEventListener("tuzohub_metrics_updated", handleUpdate);
    return () => window.removeEventListener("tuzohub_metrics_updated", handleUpdate);
  }, [mutate]);

  return {
    data,
    isLoading: !error && data === undefined,
    isError: error,
    mutate,
    isValidating
  };
}

/**
 * Perform an authenticated mutation (POST, PATCH, DELETE, etc.)
 */
export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const res = await fetch(url, {
    ...options,
    credentials: "omit",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = new Error(`API Error: ${res.status}`);
    const info = await res.json().catch(() => ({}));
    (error as any).info = info;
    (error as any).status = res.status;
    throw error;
  }

  const json = await res.json();
  if (json.success !== undefined) {
    if (!json.success) {
      throw new Error(json.error || "API returned failure");
    }
    return json.data;
  }

  return json;
}
