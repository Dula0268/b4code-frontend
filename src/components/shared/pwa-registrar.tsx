"use client";

import { useEffect } from "react";

export default function PwaRegistrar() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").then(
          (registration) => {
            console.log("Service Worker registration successful with scope: ", registration.scope);
          },
          (err) => {
            console.log("Service Worker registration failed: ", err);
          }
        );
      });
    }
  }, []);

  return null;
}
