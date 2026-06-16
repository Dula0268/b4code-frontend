import { Suspense } from "react";
import MenuClient from "@/components/guest/ordering/menu/menu-client";

export default function MenuPage() {
  return (
    <Suspense fallback={
      <div className="ps-container flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-[var(--gray-5)] border-t-[var(--brand-primary)]" />
          <p className="text-sm text-[var(--gray-3)] mt-4">Loading menu...</p>
        </div>
      </div>
    }>
      <MenuClient />
    </Suspense>
  );
}
