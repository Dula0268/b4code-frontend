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
         return;
      }
      
      try {
        // Use a lightweight fetch with no-cors to bypass CORS issues.
        // If the server is offline, fetch will throw a network error.
        // If it's online, it will resolve with an opaque response (status 0).
        const res = await fetch(`${BASE_URL}/`, { 
          method: 'GET', 
          mode: 'no-cors', 
          cache: 'no-store' 
        });
          
        if (res) {
          // Promise resolved, meaning TCP connection was successful
          setIsOnline(true);
          const store = useOfflineSyncStore.getState();
          if (store.setBackendOnline) {
             const wasOffline = !store.isBackendOnline;
             store.setBackendOnline(true);
             if (wasOffline) store.syncAll();
          }
        }
      } catch (error) {
        setIsOnline(false);
        useOfflineSyncStore.getState().setBackendOnline?.(false);
      }
    };

    checkBackendStatus();
    const intervalId: NodeJS.Timeout = setInterval(checkBackendStatus, 5000);

    return () => {
      window.removeEventListener("online", handleBrowserOnline);
      window.removeEventListener("offline", handleBrowserOffline);
      clearInterval(intervalId);
    };
  }, []);

  return isOnline;
}
