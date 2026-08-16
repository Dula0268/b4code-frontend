"use client";

import { useState, useEffect } from "react";
import { useOfflineSyncStore } from "@/store/staff/offline-sync.store";
import { BASE_URL } from "@/lib/axios";

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);

  useEffect(() => {

    const handleBrowserOnline = () => {
      checkBackendStatus();
    };
    
    const handleBrowserOffline = () => {
      setIsOnline(false);
      useOfflineSyncStore.getState().setBackendOnline?.(false);
    };

    window.addEventListener("online", handleBrowserOnline);
    window.addEventListener("offline", handleBrowserOffline);

    // Interval is declared below

    const checkBackendStatus = async () => {
      if (!navigator.onLine) {
         setIsOnline(false);
         useOfflineSyncStore.getState().setBackendOnline?.(false);
         return;
      }
      setIsOnline(true);
      const store = useOfflineSyncStore.getState();
      if (store.setBackendOnline) {
         store.setBackendOnline(true);
      }
    };

    checkBackendStatus();

    return () => {
      window.removeEventListener("online", handleBrowserOnline);
      window.removeEventListener("offline", handleBrowserOffline);
    };
  }, []);

  return isOnline;
}
