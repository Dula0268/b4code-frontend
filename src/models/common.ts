// ─── Common / Shared Models ───────────────────────────────────────────────────

/** Generic paginated API response wrapper */
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

/** Generic paginated response with named current page */
export interface PagedResult<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  pageSize: number;
}

/** API error shape */
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}
