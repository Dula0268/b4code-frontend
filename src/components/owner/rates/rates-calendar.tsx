"use client";

import { useState, useEffect } from "react";
import { useOwnerPricingStore } from "@/store/owner/owner-pricing.store";
import { AvailabilityDay } from "@/api/owner/pricing.api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  DollarSign,
  ShieldAlert,
  RotateCcw,
  Sparkles,
  SlidersHorizontal,
  Layers,
} from "lucide-react";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function RatesCalendar() {
  const {
    currentYear,
    currentMonth,
    calendarDays,
    selectedRoomId,
    setSelectedRoomId,
    selectedDates,
    toggleDateSelection,
    selectDateRange,
    clearSelection,
    nextMonth,
    prevMonth,
    setMonth,
    setBulkModalOpen,
    setSeasonalModalOpen,
    clearPriceOverrides,
    applyBlackoutDates,
    loading,
    actionLoading,
  } = useOwnerPricingStore();

  const [dragStart, setDragStart] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Extract unique rooms for the room filter
  const uniqueRooms = Array.from(
    new Map(
      calendarDays.map((d) => [d.roomId, { id: d.roomId, name: d.roomName }])
    ).values()
  );

  // Filter calendar days by selectedRoomId
  const displayedDays =
    selectedRoomId === "ALL"
      ? calendarDays
      : calendarDays.filter((d) => d.roomId === selectedRoomId);

  // Group by date (so each cell shows consolidated or primary room price)
  const daysByDate = new Map<string, AvailabilityDay[]>();
  displayedDays.forEach((day) => {
    const arr = daysByDate.get(day.date) || [];
    arr.push(day);
    daysByDate.set(day.date, arr);
  });

  // Calculate calendar month grid layout
  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const prevMonthDays = new Date(currentYear, currentMonth - 1, 0).getDate();

  // Drag selection handlers
  const handleMouseDown = (dateStr: string) => {
    setDragStart(dateStr);
    setIsDragging(true);
    toggleDateSelection(dateStr);
  };

  const handleMouseEnter = (dateStr: string) => {
    if (isDragging && dragStart) {
      selectDateRange(dragStart, dateStr);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, []);

  return (
    <div className="bg-white rounded-3xl border border-[#E8EAED] shadow-sm p-6 flex flex-col gap-6">
      {/* Calendar Top Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Month Navigator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-gray-200 rounded-2xl p-1 bg-[#F9FAFB]">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevMonth}
              className="h-8 w-8 rounded-xl text-gray-700 hover:bg-white hover:shadow-xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-bold text-sm text-[#1A1A1A] px-3 min-w-[140px] text-center select-none">
              {MONTH_NAMES[currentMonth - 1]} {currentYear}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextMonth}
              className="h-8 w-8 rounded-xl text-gray-700 hover:bg-white hover:shadow-xs"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const now = new Date();
              setMonth(now.getFullYear(), now.getMonth() + 1);
            }}
            className="rounded-xl text-xs h-9 border-gray-200 hover:border-[#953002] hover:text-[#953002]"
          >
            Today
          </Button>
        </div>

        {/* Right: Room Filter & Quick Modal Triggers */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Room Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#F9FAFB] border border-gray-200 rounded-xl px-2.5 py-1 text-xs">
            <Layers className="w-3.5 h-3.5 text-[#953002]" />
            <select
              value={selectedRoomId}
              onChange={(e) =>
                setSelectedRoomId(
                  e.target.value === "ALL" ? "ALL" : Number(e.target.value)
                )
              }
              aria-label="Filter room pricing by type"
              className="bg-transparent font-semibold text-gray-700 outline-none cursor-pointer py-1"
            >
              <option value="ALL">All Room Types</option>
              {uniqueRooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSeasonalModalOpen(true)}
            className="rounded-xl text-xs h-9 border-amber-200 bg-amber-50/50 text-amber-800 hover:bg-amber-100/60 font-semibold gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Seasonal Rule
          </Button>
        </div>
      </div>

      {/* Legend & Instructions */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-gray-500 bg-[#F9FAFB] border border-gray-100 rounded-2xl px-4 py-2.5 gap-3">
        <div className="flex items-center flex-wrap gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-emerald-50 border border-emerald-300 inline-block" />
            <span className="font-medium text-gray-700">Standard Base Rate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-amber-50 border border-amber-400 inline-block" />
            <span className="font-medium text-gray-700">Custom Rate Override</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-red-50 border border-red-300 inline-block" />
            <span className="font-medium text-gray-700">Blackout / Blocked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-[#953002] inline-block" />
            <span className="font-medium text-gray-700">Selected Days</span>
          </div>
        </div>
        <p className="text-gray-400 italic">
          💡 Click or drag across days to edit prices in bulk.
        </p>
      </div>

      {/* Monthly Grid */}
      <div className="select-none">
        {/* Day Header */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center">
          {DAYS_OF_WEEK.map((d) => (
            <span
              key={d}
              className="text-xs font-bold text-gray-400 uppercase tracking-wider py-1"
            >
              {d}
            </span>
          ))}
        </div>

        {/* Day Cells Grid */}
        {loading ? (
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton
                key={`skel-${i}`}
                className="min-h-[102px] rounded-2xl bg-gray-100/80 animate-pulse border border-gray-100"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {/* Previous Month Blank Days */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => {
            const prevDayNum = prevMonthDays - firstDayOfMonth + i + 1;
            return (
              <div
                key={`prev-${i}`}
                className="min-h-[96px] p-2.5 rounded-2xl border border-gray-100/60 bg-gray-50/40 opacity-40 flex flex-col justify-between"
              >
                <span className="text-xs font-semibold text-gray-400">
                  {prevDayNum}
                </span>
              </div>
            );
          })}

          {/* Current Month Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${currentYear}-${String(currentMonth).padStart(
              2,
              "0"
            )}-${String(dayNum).padStart(2, "0")}`;

            const recordsForDay = daysByDate.get(dateStr) || [];
            const isSelected = selectedDates.includes(dateStr);

            // Determine if any record has custom price or blackout
            const isBlackout = recordsForDay.some((r) => r.status === "BLOCKED");
            const hasCustomPrice = recordsForDay.some(
              (r) => r.customPrice !== null && r.customPrice !== undefined
            );

            // Calculate displayed price
            let displayPrice: string = "—";
            if (recordsForDay.length > 0) {
              const firstRecord = recordsForDay[0];
              if (firstRecord.customPrice) {
                displayPrice = `LKR ${Number(firstRecord.customPrice).toLocaleString()}`;
              } else if (firstRecord.basePrice) {
                displayPrice = `LKR ${Number(firstRecord.basePrice).toLocaleString()}`;
              } else {
                displayPrice = "LKR 10,000";
              }
            } else {
              displayPrice = "LKR 10,000";
            }

            // Calculate available rooms
            let availableRoomsDisplay: string | null = null;
            if (recordsForDay.length > 0 && !isBlackout) {
              const firstRecord = recordsForDay[0];
              const roomsCount = firstRecord.availableRoomsOverride !== undefined && firstRecord.availableRoomsOverride !== null
                ? firstRecord.availableRoomsOverride
                : firstRecord.baseInventory;
              if (roomsCount !== undefined) {
                availableRoomsDisplay = `${roomsCount} Available`;
              }
            }

            // Cell color scheme
            let cellBg = "bg-white hover:bg-gray-50/80 border-gray-200";
            let priceColor = "text-emerald-700 bg-emerald-50 border-emerald-200";

            if (isBlackout) {
              cellBg = "bg-red-50/40 border-red-200 hover:bg-red-50/60";
              priceColor = "text-red-700 bg-red-100/80 border-red-300";
            } else if (hasCustomPrice) {
              cellBg = "bg-amber-50/30 border-amber-200 hover:bg-amber-50/50";
              priceColor = "text-amber-800 bg-amber-100/90 border-amber-300";
            }

            if (isSelected) {
              cellBg =
                "bg-[#953002]/5 border-[#953002] ring-2 ring-[#953002]/20 shadow-sm";
            }

            return (
              <div
                key={dateStr}
                onMouseDown={() => handleMouseDown(dateStr)}
                onMouseEnter={() => handleMouseEnter(dateStr)}
                className={`min-h-[102px] p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${cellBg}`}
              >
                {/* Day Number and Status Badge */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold ${
                      isSelected ? "text-[#953002]" : "text-[#1A1A1A]"
                    }`}
                  >
                    {dayNum}
                  </span>
                  {isBlackout ? (
                    <Badge className="bg-red-500 hover:bg-red-600 text-white text-[9px] px-1.5 py-0 rounded-md font-bold">
                      Blackout
                    </Badge>
                  ) : hasCustomPrice ? (
                    <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1 py-0.2 rounded">
                      Custom
                    </span>
                  ) : null}
                </div>

                {/* Price Display */}
                <div className="my-auto text-center py-1">
                  {isBlackout ? (
                    <div className="flex items-center justify-center gap-1 text-red-600 text-xs font-bold">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Blocked</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={`inline-block px-2.5 py-1 rounded-xl text-xs font-bold border shadow-2xs ${priceColor}`}
                      >
                        {displayPrice}
                      </div>
                      {availableRoomsDisplay && (
                        <span className="text-[10px] font-medium text-gray-500">
                          {availableRoomsDisplay}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Room indicator or small note */}
                <div className="text-[10px] text-gray-400 truncate flex items-center justify-between">
                  <span>
                    {recordsForDay.length > 1
                      ? `${recordsForDay.length} Room Types`
                      : recordsForDay[0]?.roomName || "Standard"}
                  </span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-[#953002]" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>

      {/* Floating Action Bar when dates are selected */}
      {selectedDates.length > 0 && (
        <div className="sticky bottom-4 z-30 bg-[#1A1A1A] text-white p-4 rounded-2xl shadow-2xl flex flex-wrap items-center justify-between gap-4 border border-white/10 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-3">
            <Badge className="bg-[#953002] text-white text-xs px-3 py-1 rounded-full font-bold">
              {selectedDates.length} Dates Selected
            </Badge>
            <span className="text-xs text-gray-300 hidden sm:inline">
              {selectedDates[0]} {selectedDates.length > 1 ? `to ${selectedDates[selectedDates.length - 1]}` : ""}
            </span>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => setBulkModalOpen(true)}
              className="bg-[#953002] hover:bg-[#b03903] text-white rounded-xl text-xs font-bold h-9 px-4 gap-1.5 shadow-sm"
            >
              <DollarSign className="w-4 h-4" />
              Edit Price
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => applyBlackoutDates(selectedDates)}
              disabled={actionLoading}
              className="border-red-500/50 bg-red-950/30 text-red-300 hover:bg-red-900/50 hover:text-white rounded-xl text-xs font-bold h-9 px-3 gap-1.5"
            >
              <ShieldAlert className="w-4 h-4 text-red-400" />
              Mark Blackout
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => clearPriceOverrides(selectedDates)}
              disabled={actionLoading}
              className="border-white/20 bg-white/5 text-gray-200 hover:bg-white/10 rounded-xl text-xs font-bold h-9 px-3 gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset to Base
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={clearSelection}
              className="text-gray-400 hover:text-white rounded-xl text-xs h-9 px-3"
            >
              Clear
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
