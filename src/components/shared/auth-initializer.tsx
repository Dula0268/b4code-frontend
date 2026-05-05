"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth/auth.store";
import { getToken } from "@/lib/api";

export default function AuthInitializer() {
  const { restoreSession } = useAuthStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Only run once on mount
    if (initialized) return;

    try {
      const token = getToken();
      if (token) {
        const storedUserStr = localStorage.getItem("auth_user");
        if (storedUserStr) {
          const user = JSON.parse(storedUserStr);
          restoreSession(user);
        }
      }
    } catch (e) {
      console.error("Failed to restore session from localStorage", e);
    } finally {
      setInitialized(true);
    }
  }, [initialized, restoreSession]);

  return null; // This component doesn't render anything
}
