"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth/auth.store";

export type GuardStatus = "loading" | "unauthenticated" | "unauthorized" | "ready";

/**
 * useGuestGuard — Protects guest-only pages.
 *
 * Returns { status, ready }
 * - status: "loading" | "unauthenticated" | "unauthorized" | "ready"
 * - ready: boolean (shorthand for status === "ready")
 */
export function useGuestGuard() {
  const { isAuthenticated, user, isRestoring } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || isRestoring) return;

    // 1. If not logged in at all, redirect to login
    if (!isAuthenticated) {
      const redirect = encodeURIComponent(window.location.pathname + window.location.search);
      router.replace(`/auth/login?redirect=${redirect}`);
      return;
    }
  }, [mounted, isRestoring, isAuthenticated, router]);

  // Determine final status
  let status: GuardStatus = "loading";
  
  if (mounted && !isRestoring) {
    if (!isAuthenticated) {
      status = "unauthenticated";
    } else if (user?.role?.toLowerCase() !== "guest") {
      status = "unauthorized";
    } else {
      status = "ready";
    }
  }

  return { 
    status,
    ready: status === "ready",
    userRole: user?.role?.toLowerCase()
  };
}
