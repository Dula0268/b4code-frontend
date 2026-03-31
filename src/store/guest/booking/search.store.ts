import { create } from "zustand";

export interface FilterState {
  priceMin: number;
  priceMax: number;
  amenities: string[];
  propertyTypes: string[];
  guestRating: string | null;
}

export const DEFAULT_FILTERS: FilterState = {
  priceMin: 10_000,
  priceMax: 500_000,
  amenities: [],
  propertyTypes: [],
  guestRating: null,
};

type GuestBookingSearchState = {
  loading: boolean;
  error: string | null;
  filters: FilterState;
  sortBy: string;
  page: number;
  mapOpen: boolean;
  mobileFiltersOpen: boolean;
  hoveredId: string | null;
};

type GuestBookingSearchActions = {
  setLoading: (value: boolean) => void;
  setError: (message: string | null) => void;
  setFilters: (filters: FilterState | ((prev: FilterState) => FilterState)) => void;
  setSortBy: (sortBy: string) => void;
  setPage: (page: number | ((prev: number) => number)) => void;
  setMapOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  setMobileFiltersOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  setHoveredId: (id: string | null) => void;
  clearFilters: () => void;
  removeFilter: (id: string) => void;
  reset: () => void;
};

export const useGuestBookingSearchStore = create<
  GuestBookingSearchState & GuestBookingSearchActions
>((set) => ({
  loading: false,
  error: null,
  filters: DEFAULT_FILTERS,
  sortBy: "recommended",
  page: 1,
  mapOpen: false,
  mobileFiltersOpen: false,
  hoveredId: null,

  setLoading: (value) => set({ loading: value }),
  setError: (message) => set({ error: message }),
  setFilters: (filters) =>
    set((state) => ({
      filters: typeof filters === "function" ? filters(state.filters) : filters,
      page: 1, // reset page on filter change
    })),
  setSortBy: (sortBy) => set({ sortBy }),
  setPage: (page) =>
    set((state) => ({
      page: typeof page === "function" ? page(state.page) : page,
    })),
  setMapOpen: (open) =>
    set((state) => ({
      mapOpen: typeof open === "function" ? open(state.mapOpen) : open,
    })),
  setMobileFiltersOpen: (open) =>
    set((state) => ({
      mobileFiltersOpen: typeof open === "function" ? open(state.mobileFiltersOpen) : open,
    })),
  setHoveredId: (id) => set({ hoveredId: id }),
  clearFilters: () => set({ filters: DEFAULT_FILTERS, page: 1 }),
  removeFilter: (id) =>
    set((state) => {
      const { filters } = state;
      let newFilters = { ...filters };
      if (id === "price") {
        newFilters.priceMin = 10_000;
        newFilters.priceMax = 500_000;
      } else if (id.startsWith("type-")) {
        const pt = id.replace("type-", "");
        newFilters.propertyTypes = filters.propertyTypes.filter((t) => t !== pt);
      } else if (id === "amenity-kitchen") {
        newFilters.amenities = filters.amenities.filter((a) => a !== "Kitchen");
      }
      return { filters: newFilters, page: 1 };
    }),
  reset: () =>
    set({
      loading: false,
      error: null,
      filters: DEFAULT_FILTERS,
      sortBy: "recommended",
      page: 1,
      mapOpen: false,
      mobileFiltersOpen: false,
      hoveredId: null,
    }),
}));
