"use client";

import { useEffect } from "react";

/**
 * Scope the service worker is registered with.
 *
 * - No trailing slash: scope "/staff/" would NOT control the dashboard root
 *   "/staff" itself, only its sub-paths. Scope "/staff" controls both.
 * - sw.js is emitted to the public root ("/sw.js"), so its maximum allowed
 *   scope is "/" and narrowing to "/staff" requires no Service-Worker-Allowed
 *   response header.
 * - Must match `scope` in next.config.ts and `scope` in public/manifest.json.
 */
const SW_SCOPE = "/staff";
const SW_URL = "/sw.js";

export default function PwaRegistrar() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    // Register directly. The previous version deferred registration to the
    // window "load" event, but this effect runs after hydration -- by which
    // point "load" has already fired -- so the listener never ran and no
    // service worker was ever registered, breaking every offline feature.
    let cancelled = false;

    navigator.serviceWorker
      .register(SW_URL, { scope: SW_SCOPE })
      .then((registration) => {
        if (cancelled) return;

        // Verify the scope the browser actually resolved covers this page.
        // A mismatch here (e.g. a stale registration from an older scope) is
        // the difference between "offline works" and "offline silently does
        // nothing", so make it loud rather than assuming success.
        const resolved = new URL(registration.scope);
        const covered = window.location.pathname.startsWith(resolved.pathname);
        if (!covered) {
          console.warn(
            `[pwa] Service worker scope "${resolved.pathname}" does not cover ` +
              `"${window.location.pathname}" - offline support is inactive here.`
          );
        }

        // `clientsClaim` is enabled in the generated worker, but on the very
        // first load the page can still be uncontrolled until the worker
        // activates. Log it so a "no offline data" report is diagnosable.
        if (!navigator.serviceWorker.controller) {
          navigator.serviceWorker.addEventListener(
            "controllerchange",
            () => console.info("[pwa] Service worker now controlling this page."),
            { once: true }
          );
        }

        // Pick up a newly deployed worker without waiting for every tab to close.
        registration.addEventListener("updatefound", () => {
          const installing = registration.installing;
          if (!installing) return;
          installing.addEventListener("statechange", () => {
            if (installing.state === "installed" && navigator.serviceWorker.controller) {
              console.info("[pwa] Updated service worker installed.");
            }
          });
        });

        void registration.update();
      })
      .catch((err) => {
        // In development the plugin is disabled and /sw.js does not exist, so a
        // 404 here is expected and not worth alarming about.
        console.warn("[pwa] Service worker registration failed:", err);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
