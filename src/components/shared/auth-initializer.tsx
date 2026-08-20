"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth/auth.store";
import { getToken } from "@/lib/token";

export default function AuthInitializer() {
  const { restoreSession } = useAuthStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Only run once on mount
    if (initialized) return;

    const initAuth = async () => {
      try {
        const token = getToken();
        if (token) {
          const storedUserStr = sessionStorage.getItem("auth_user");
          if (storedUserStr) {
            const user = JSON.parse(storedUserStr);
            restoreSession(user);
            // Fetch latest details from backend to ensure persistence
            await useAuthStore.getState().fetchCurrentUser();
          }
        }
      } catch (e) {
        console.error("Failed to restore session from localStorage", e);
      } finally {
        setInitialized(true);
      }
    };

    initAuth();
  }, [initialized, restoreSession]);

  return null; // This component doesn't render anything
}
