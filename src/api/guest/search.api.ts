/**
 * Search API Service
 * All search page data comes from the backend — zero hardcoded values.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PropertyListing {
  id: number;
  title: string;
  location: string;
  propertyType: string;
  pricePerNight: number;
  maxGuests: number;
  baseGuests: number;
  extraGuestFee: number;
  rating: number;
  reviewCount: number;
  badge?: string;
  imageSrc: string;
  amenities: string[];
  lat?: number;
  lng?: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface PropertyTypeOption {
  value: string;
  label: string;
  icon: string;
  count: number;
}

export interface RatingOption {
  label: string;
  value: string;
}

export interface PriceRangeOption {
  min: number;
  max: number;
  currency: string;
}

export interface SortOption {
  value: string;
  label: string;
}

export interface FilterOptionsResponse {
  propertyTypes: PropertyTypeOption[];
  amenities: string[];
  ratingOptions: RatingOption[];
  priceRange: PriceRangeOption;
  sortOptions: SortOption[];
  locations: string[];
}

export interface SearchParams {
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  propertyTypes?: string[];
  amenities?: string[];
  sortBy?: string;
  page?: number;
  size?: number;
}

// ─── API Functions ───────────────────────────────────────────────────────────

async function apiFetch<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    let errMsg = `API error ${res.status}: ${res.statusText}`;
    try {
      const errData = await res.json();
      if (errData && errData.message) errMsg = errData.message;
    } catch (_) {}
    throw new Error(errMsg);
  }
  return res.json();
}

/**
 * Search properties with pagination and filters.
 */
export async function searchProperties(
  params: SearchParams
): Promise<PaginatedResponse<PropertyListing>> {
  const query = new URLSearchParams();

  if (params.destination) query.set("destination", params.destination);
  if (params.checkIn) query.set("checkIn", params.checkIn);
  if (params.checkOut) query.set("checkOut", params.checkOut);
  if (params.guests) query.set("guests", String(params.guests));
  if (params.minPrice != null) query.set("minPrice", String(params.minPrice));
  if (params.maxPrice != null) query.set("maxPrice", String(params.maxPrice));
  if (params.minRating != null) query.set("minRating", String(params.minRating));
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.page != null) query.set("page", String(params.page));
  if (params.size != null) query.set("size", String(params.size));

  params.propertyTypes?.forEach((t) => query.append("propertyTypes", t));
  params.amenities?.forEach((a) => query.append("amenities", a));

  const qs = query.toString();
  return apiFetch<PaginatedResponse<PropertyListing>>(
    `/api/guest/properties${qs ? `?${qs}` : ""}`
  );
}

/**
 * Fetch dynamic filter options from backend.
 */
export async function getFilterOptions(): Promise<FilterOptionsResponse> {
  return apiFetch<FilterOptionsResponse>("/api/guest/search/filters");
}
