import { Suspense } from "react";
import MenuClient from "@/components/guest/ordering/menu/menu-client";
import { MenuSkeleton } from "@/components/guest/ordering/menu/menu-skeleton";

export default function MenuPage() {
  return (
    <Suspense fallback={<MenuSkeleton />}>
      <MenuClient />
    </Suspense>
  );
}
