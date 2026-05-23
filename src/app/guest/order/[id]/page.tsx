"use client";

import { useEffect, useState } from "react";
import ItemDetailsClient from "@/components/guest/ordering/item-details/item-details-client";
import { useGuestMenuStore } from "@/store/guest/ordering/menu.store";
import { useGuestGuard } from "@/hooks/use-guest-guard";

export default function ItemDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { ready } = useGuestGuard();
  const [id, setId] = useState<string | null>(null);
  const { categories } = useGuestMenuStore();

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);
  
  if (!ready) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-4 border-t-[#9a3300] border-neutral-200 rounded-full animate-spin" />
    </div>
  )

  // Find item from menu store
  const item = id
    ? categories.flatMap((cat) => cat.items).find((item) => item.id === id)
    : null;

  if (!item) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-center text-gray-600">Item not found. Please go back to the menu.</p>
      </div>
    );
  }

  return <ItemDetailsClient item={item} />;
}
