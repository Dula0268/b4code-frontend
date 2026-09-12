import { create } from "zustand";
import {
  ownerPricingApi,
  AvailabilityDay,
  RateOverview,
  SeasonalRule,
} from "@/api/owner/pricing.api";
import { formatApiError } from "@/lib/error-formatter";

interface OwnerPricingState {
  propertyId: number | null;
  selectedRoomId: number | "ALL";
  currentMonth: number; // 1-12
  currentYear: number;
  calendarDays: AvailabilityDay[];
  rateOverview: RateOverview | null;
  seasonalRules: SeasonalRule[];
  selectedDates: string[]; // ['2026-10-01', '2026-10-02']
  isBulkModalOpen: boolean;
  isSeasonalModalOpen: boolean;
  loading: boolean;
  actionLoading: boolean;
  applyingRuleId: string | null;
  actionSuccess: string | null;
  error: string | null;
  appliedRules: Record<number, string[]>;

  // Actions
  setPropertyId: (id: number) => void;
  setSelectedRoomId: (roomId: number | "ALL") => void;
  setMonth: (year: number, month: number) => void;
  nextMonth: () => void;
  prevMonth: () => void;
  fetchCalendar: () => Promise<void>;
  fetchRateOverview: () => Promise<void>;

  // Selection
  toggleDateSelection: (dateStr: string) => void;
  selectDateRange: (startStr: string, endStr: string) => void;
  clearSelection: () => void;
  setBulkModalOpen: (open: boolean) => void;
  setSeasonalModalOpen: (open: boolean) => void;

  // Updates
  bulkUpdatePrices: (
    customPrice: number | null,
    status?: "AVAILABLE" | "BLOCKED",
    notes?: string
  ) => Promise<void>;
  applyBlackoutDates: (dates: string[], notes?: string) => Promise<void>;
  clearPriceOverrides: (dates: string[]) => Promise<void>;

  // Seasonal Rules
  addSeasonalRule: (rule: Omit<SeasonalRule, "id">) => Promise<void>;
  deleteSeasonalRule: (id: string) => void;
  applySeasonalRuleToCalendar: (ruleId: string) => Promise<void>;
  revertSeasonalRuleFromCalendar: (ruleId: string) => Promise<void>;
}

export const useOwnerPricingStore = create<OwnerPricingState>((set, get) => ({
  propertyId: null,
  selectedRoomId: "ALL",
  appliedRules: { 82: ["season-3"] },
  currentMonth: new Date().getMonth() + 1,
  currentYear: new Date().getFullYear(),
  calendarDays: [],
  rateOverview: null,
  seasonalRules: [
    {
      id: "season-1",
      name: "Summer Peak Season",
      startDate: `${new Date().getFullYear()}-06-01`,
      endDate: `${new Date().getFullYear()}-08-31`,
      priceAdjustmentPercent: 20,
      description: "High occupancy peak summer surcharge (+20%)",
    },
    {
      id: "season-2",
      name: "Monsoon / Rainy Off-Peak",
      startDate: `${new Date().getFullYear()}-10-01`,
      endDate: `${new Date().getFullYear()}-11-15`,
      priceAdjustmentPercent: -15,
      description: "Low season occupancy promotion discount (-15%)",
    },
    {
      id: "season-3",
      name: "Year-End Holiday Surge",
      startDate: `${new Date().getFullYear()}-12-20`,
      endDate: `${new Date().getFullYear()}-12-31`,
      priceAdjustmentPercent: 35,
      description: "Christmas & New Year surge pricing (+35%)",
    },
  ],
  selectedDates: [],
  isBulkModalOpen: false,
  isSeasonalModalOpen: false,
  loading: false,
  actionLoading: false,
  applyingRuleId: null,
  actionSuccess: null,
  error: null,

  setPropertyId: (id: number) => {
    set({
      propertyId: id,
      selectedRoomId: "ALL",
      calendarDays: [],
      selectedDates: [],
      actionSuccess: null,
      error: null,
    });
    get().fetchCalendar();
    get().fetchRateOverview();
  },

  setSelectedRoomId: (roomId) => {
    set({ selectedRoomId: roomId });
  },

  setMonth: (year, month) => {
    set({ currentYear: year, currentMonth: month, calendarDays: [], selectedDates: [] });
    get().fetchCalendar();
  },

  nextMonth: () => {
    const { currentMonth, currentYear } = get();
    if (currentMonth === 12) {
      set({ currentMonth: 1, currentYear: currentYear + 1, calendarDays: [], selectedDates: [] });
    } else {
      set({ currentMonth: currentMonth + 1, calendarDays: [], selectedDates: [] });
    }
    get().fetchCalendar();
  },

  prevMonth: () => {
    const { currentMonth, currentYear } = get();
    if (currentMonth === 1) {
      set({ currentMonth: 12, currentYear: currentYear - 1, calendarDays: [], selectedDates: [] });
    } else {
      set({ currentMonth: currentMonth - 1, calendarDays: [], selectedDates: [] });
    }
    get().fetchCalendar();
  },

  fetchCalendar: async () => {
    const { propertyId, currentYear, currentMonth } = get();
    if (!propertyId) return;
    set({ loading: true, error: null });
    try {
      const data = await ownerPricingApi.getMonthlyCalendar(
        propertyId,
        currentYear,
        currentMonth
      );
      set({ calendarDays: data, loading: false });
    } catch (err: unknown) {
      set({
        error: formatApiError(err, "Failed to load pricing calendar"),
        loading: false,
      });
    }
  },

  fetchRateOverview: async () => {
    const { propertyId } = get();
    if (!propertyId) return;
    try {
      const overview = await ownerPricingApi.getRateOverview(propertyId);
      set({ rateOverview: overview });
    } catch (err: unknown) {
      console.warn("Could not load rate overview:", err);
    }
  },

  toggleDateSelection: (dateStr: string) => {
    const { selectedDates } = get();
    if (selectedDates.includes(dateStr)) {
      set({ selectedDates: selectedDates.filter((d) => d !== dateStr) });
    } else {
      set({ selectedDates: [...selectedDates, dateStr].sort() });
    }
  },

  selectDateRange: (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const min = start < end ? start : end;
    const max = start < end ? end : start;

    const dates: string[] = [];
    const cur = new Date(min);
    while (cur <= max) {
      dates.push(cur.toISOString().split("T")[0]);
      cur.setDate(cur.getDate() + 1);
    }
    set({ selectedDates: dates });
  },

  clearSelection: () => {
    set({ selectedDates: [] });
  },

  setBulkModalOpen: (open: boolean) => {
    set({ isBulkModalOpen: open });
  },

  setSeasonalModalOpen: (open: boolean) => {
    set({ isSeasonalModalOpen: open });
  },

  bulkUpdatePrices: async (
    customPrice: number | null,
    status: "AVAILABLE" | "BLOCKED" = "AVAILABLE",
    notes?: string
  ) => {
    const { propertyId, selectedRoomId, selectedDates } = get();
    if (!propertyId || selectedDates.length === 0) return;

    set({ actionLoading: true, error: null });
    try {
      await ownerPricingApi.bulkUpdateAvailability({
        propertyId,
        roomId: selectedRoomId === "ALL" ? null : selectedRoomId,
        dates: selectedDates,
        newStatus: status,
        customPrice: customPrice,
        notes: notes || undefined,
      });
      set({ isBulkModalOpen: false, selectedDates: [], actionLoading: false });
      await get().fetchCalendar();
    } catch (err: unknown) {
      set({
        error: formatApiError(err, "Failed to apply bulk pricing"),
        actionLoading: false,
      });
      throw err;
    }
  },

  applyBlackoutDates: async (dates: string[], notes = "Owner Blackout") => {
    const { propertyId, selectedRoomId } = get();
    if (!propertyId || dates.length === 0) return;

    set({ actionLoading: true, error: null });
    try {
      await ownerPricingApi.bulkUpdateAvailability({
        propertyId,
        roomId: selectedRoomId === "ALL" ? null : selectedRoomId,
        dates,
        newStatus: "BLOCKED",
        notes,
      });
      set({ actionLoading: false, selectedDates: [] });
      await get().fetchCalendar();
    } catch (err: unknown) {
      set({
        error: formatApiError(err, "Failed to blackout dates"),
        actionLoading: false,
      });
      throw err;
    }
  },

  clearPriceOverrides: async (dates: string[]) => {
    const { propertyId, selectedRoomId } = get();
    if (!propertyId || dates.length === 0) return;

    set({ actionLoading: true, error: null });
    try {
      await ownerPricingApi.bulkUpdateAvailability({
        propertyId,
        roomId: selectedRoomId === "ALL" ? null : selectedRoomId,
        dates,
        newStatus: "AVAILABLE",
        customPrice: null,
        notes: "Reset to standard base rate",
      });
      set({ actionLoading: false, selectedDates: [] });
      await get().fetchCalendar();
    } catch (err: unknown) {
      set({
        error: formatApiError(err, "Failed to reset price overrides"),
        actionLoading: false,
      });
      throw err;
    }
  },

  addSeasonalRule: async (rule: Omit<SeasonalRule, "id">) => {
    const newRule: SeasonalRule = {
      ...rule,
      id: `season-${Date.now()}`,
    };
    set((state) => ({
      seasonalRules: [...state.seasonalRules, newRule],
      isSeasonalModalOpen: false,
    }));
  },

  deleteSeasonalRule: (id: string) => {
    set((state) => ({
      seasonalRules: state.seasonalRules.filter((r) => r.id !== id),
    }));
  },

  applySeasonalRuleToCalendar: async (ruleId: string) => {
    const { propertyId, seasonalRules, calendarDays } = get();
    const rule = seasonalRules.find((r) => r.id === ruleId);
    if (!propertyId || !rule) return;

    // Generate dates between rule.startDate and rule.endDate
    const dates: string[] = [];
    const cur = new Date(rule.startDate);
    const end = new Date(rule.endDate);
    while (cur <= end) {
      dates.push(cur.toISOString().split("T")[0]);
      cur.setDate(cur.getDate() + 1);
    }

    if (dates.length === 0) return;

    set({ applyingRuleId: ruleId, error: null, actionSuccess: null });
    try {
      // Find average or base price to compute the adjustment
      const sampleDay = calendarDays.find((d) => d.basePrice);
      const base = sampleDay?.basePrice ? Number(sampleDay.basePrice) : 10000;
      const adjustedPrice = Math.round(base * (1 + rule.priceAdjustmentPercent / 100));

      await ownerPricingApi.bulkUpdateAvailability({
        propertyId,
        roomId: rule.roomId || null,
        dates,
        newStatus: "AVAILABLE",
        customPrice: adjustedPrice,
        notes: `${rule.name} (${rule.priceAdjustmentPercent > 0 ? "+" : ""}${rule.priceAdjustmentPercent}%)`,
      });

      const currentList = get().appliedRules[propertyId] || [];
      const updatedList = currentList.includes(ruleId) ? currentList : [...currentList, ruleId];

      set({
        applyingRuleId: null,
        appliedRules: { ...get().appliedRules, [propertyId]: updatedList },
        actionSuccess: `Successfully applied "${rule.name}" (${rule.priceAdjustmentPercent > 0 ? "+" : ""}${rule.priceAdjustmentPercent}%) to pricing calendar!`,
      });
      await get().fetchCalendar();
    } catch (err: unknown) {
      set({
        error: formatApiError(err, "Failed to apply seasonal pricing to calendar"),
        applyingRuleId: null,
      });
      throw err;
    }
  },

  revertSeasonalRuleFromCalendar: async (ruleId: string) => {
    const { propertyId, seasonalRules, appliedRules } = get();
    const rule = seasonalRules.find((r) => r.id === ruleId);
    if (!propertyId || !rule) return;

    const dates: string[] = [];
    const cur = new Date(rule.startDate);
    const end = new Date(rule.endDate);
    while (cur <= end) {
      dates.push(cur.toISOString().split("T")[0]);
      cur.setDate(cur.getDate() + 1);
    }
    if (dates.length === 0) return;

    set({ applyingRuleId: ruleId, error: null, actionSuccess: null });
    try {
      await ownerPricingApi.bulkUpdateAvailability({
        propertyId,
        roomId: rule.roomId || null,
        dates,
        newStatus: "AVAILABLE",
        customPrice: null,
        notes: "Reverted to standard base rate",
      });

      const currentList = appliedRules[propertyId] || [];
      const updatedList = currentList.filter((id) => id !== ruleId);

      set({
        applyingRuleId: null,
        appliedRules: { ...appliedRules, [propertyId]: updatedList },
        actionSuccess: `Reverted "${rule.name}" back to standard base price on calendar!`,
      });
      await get().fetchCalendar();
    } catch (err: unknown) {
      set({
        error: formatApiError(err, "Failed to revert seasonal rule"),
        applyingRuleId: null,
      });
      throw err;
    }
  },
}));
