"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Search, Settings } from "lucide-react";
import { useGuestMenuStore } from "@/store/guest/ordering/menu.store";
import { useCartStore } from "@/store/guest/order/cart-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function MenuScreen() {
  const { categories, loading, error, fetchMenu } = useGuestMenuStore();
  const { add: addToCart, itemCount } = useCartStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch menu on mount (assuming property ID 1 - adjust as needed)
  useEffect(() => {
    const propertyId = 1; // TODO: Get from context/URL
    fetchMenu(propertyId);
  }, [fetchMenu]);

  // Set first category as selected when categories load
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].name);
    }
  }, [categories, selectedCategory]);

  // Get items to display based on category and search
  const displayItems = selectedCategory
    ? categories
        .find((c) => c.name === selectedCategory)
        ?.items.filter(
          (item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase())
        ) || []
    : [];

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[var(--brand-primary)]"></div>
          <p className="text-sm text-gray-500 mt-3">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm font-semibold text-red-600">Error loading menu</p>
          <p className="text-xs text-gray-500 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-8 h-full">
      {/* Left: menu content */}
      <div className="col-span-8 space-y-4 overflow-y-auto pr-4">
        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`rounded-full px-6 whitespace-nowrap ${
                selectedCategory === cat.name
                  ? "bg-[var(--brand-primary)] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {cat.name}
            </Button>
          ))}
        </div>

        {/* Search and settings */}
        <div className="flex items-center justify-between sticky top-0 bg-white py-2 z-10">
          <h2 className="text-2xl font-semibold text-gray-800">{selectedCategory || "Menu"}</h2>
          <div className="flex gap-2 items-center">
            <div className="relative">
              <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border-gray-300 focus:border-[var(--brand-primary)]"
              />
            </div>
            <Button variant="outline" size="icon">
              <Settings size={16} />
            </Button>
          </div>
        </div>

        {/* Menu items grid */}
        {displayItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm">No items found in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {displayItems.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden rounded-xl border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="aspect-square bg-gray-200 relative overflow-hidden">
                  {item.imageUrl && (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      sizes="(max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  )}
                  {item.tag && (
                    <Badge className="absolute top-2 left-2 bg-[var(--brand-primary)] text-white text-[10px]">
                      {item.tag}
                    </Badge>
                  )}
                </div>
                <CardContent className="p-3 space-y-2">
                  <div>
                    <h3 className="font-semibold text-sm text-gray-800 line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-bold text-[var(--brand-primary)] text-sm">LKR {item.price.toLocaleString()}</span>
                    <Button
                      size="sm"
                      onClick={() => addToCart(item)}
                      className="bg-[var(--brand-primary)] text-white text-xs h-6 w-6 rounded-full p-0 flex items-center justify-center"
                    >
                      +
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Right: order sidebar - placeholder for now */}
      <div className="col-span-4 h-full overflow-hidden">
        <Card className="rounded-xl p-4 h-full flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b">
            <h3 className="font-semibold text-gray-800">Your Order</h3>
            <Badge variant="outline" className="bg-[var(--brand-primary)] text-white">
              {itemCount()} items
            </Badge>
          </div>
          <div className="flex-1 overflow-y-auto py-4">
            <p className="text-xs text-gray-500 text-center">Items will appear here</p>
          </div>
          <Button className="w-full bg-[var(--brand-primary)] text-white mt-auto">
            Continue to Checkout
          </Button>
        </Card>
      </div>
    </div>
  );
}
