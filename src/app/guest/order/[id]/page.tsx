"use client";

import { useEffect, useState } from "react";
import ItemDetailsClient from "@/components/guest/order/item-details/item-details-client";
import { useGuestMenuStore } from "@/store/guest/ordering/menu.store";

export default function ItemDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [id, setId] = useState<string | null>(null);
  const { categories } = useGuestMenuStore();

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

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
