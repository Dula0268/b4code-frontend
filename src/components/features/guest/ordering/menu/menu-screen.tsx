"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function MenuScreen() {
  return (
    <div className="grid grid-cols-12 gap-8">
      {/* Left: menu content */}
      <div className="col-span-8 space-y-6">
        <div className="flex gap-3">
          <Button className="rounded-full px-6">All Items</Button>
          <Button variant="outline" className="rounded-full px-6">Starters</Button>
          <Button variant="outline" className="rounded-full px-6">Mains</Button>
          <Button variant="outline" className="rounded-full px-6">Desserts</Button>
          <Button variant="outline" className="rounded-full px-6">Beverages</Button>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Popular Dishes</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="icon">🔎</Button>
            <Button variant="outline" size="icon">⚙️</Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map((i) => (
            <Card key={i} className="overflow-hidden rounded-2xl">
              <div className="h-40 bg-muted" />
              <div className="p-4 space-y-2">
                <div className="font-semibold">Dish Title</div>
                <div className="text-sm text-muted-foreground">Short description...</div>
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-primary">LKR 2,200</div>
                  <Button size="sm">+</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Right: order sidebar */}
      <div className="col-span-4">
        <Card className="sticky top-24 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">Your Order</div>
            <div className="text-sm text-muted-foreground">0 items</div>
          </div>

          <div className="text-sm text-muted-foreground">No items added yet.</div>

          <div className="pt-4 border-t space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>LKR 0</span>
            </div>
            <div className="flex justify-between font-semibold text-base">
              <span>Total</span>
              <span className="text-primary">LKR 0</span>
            </div>
          </div>

          <Button className="w-full">Go to Cart →</Button>
        </Card>
      </div>
    </div>
  );
}
