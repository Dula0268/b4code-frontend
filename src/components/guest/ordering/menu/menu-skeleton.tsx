"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export function MenuSkeleton() {
  return (
    <div className="ps-container pb-24 min-h-screen bg-gray-50 flex flex-col pt-safe-top animate-pulse">
      {/* Header Skeleton */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[var(--gray-5)]">
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <div className="h-6 w-32 bg-gray-200 rounded-md mb-2"></div>
            <div className="h-4 w-48 bg-gray-200 rounded-md"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
            <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
          </div>
        </div>

        {/* Categories Skeleton */}
        <div className="px-5 pb-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 w-24 bg-gray-200 rounded-full shrink-0"></div>
            ))}
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 px-5 pt-6 pb-6">
        {/* Category Title Skeleton */}
        <div className="h-7 w-40 bg-gray-200 rounded-md mb-4"></div>

        {/* Menu Items Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="bg-white rounded-[16px] shadow-sm border border-[var(--gray-5)] overflow-hidden flex flex-col">
              <div className="w-full h-32 md:h-40 bg-gray-200 shrink-0"></div>
              <div className="p-3 md:p-4 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="h-5 w-3/4 bg-gray-200 rounded-md"></div>
                </div>
                <div className="h-3 w-full bg-gray-200 rounded-md mb-1"></div>
                <div className="h-3 w-5/6 bg-gray-200 rounded-md mb-3"></div>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <div className="h-5 w-16 bg-gray-200 rounded-md"></div>
                  <div className="h-8 w-8 bg-gray-200 rounded-md"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
