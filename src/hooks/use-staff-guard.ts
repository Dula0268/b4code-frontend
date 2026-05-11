"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth/auth.store";

export type GuardStatus = "loading" | "unauthenticated" | "unauthorized" | "ready";

/**
 * useStaffGuard — Protects staff-only pages.
 */
export function useStaffGuard() {
  const { isAuthenticated, user, isRestoring } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || isRestoring) return;

    if (!isAuthenticated) {
      const redirect = encodeURIComponent(window.location.pathname + window.location.search);
      router.replace(`/auth/login?redirect=${redirect}`);
      return;
    }
  }, [mounted, isRestoring, isAuthenticated, router]);

  let status: GuardStatus = "loading";
  
  if (mounted && !isRestoring) {
    if (!isAuthenticated) {
      status = "unauthenticated";
    } else if (user?.role?.toLowerCase() !== "staff") {
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
