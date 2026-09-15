// ─── Owner Domain Models ─────────────────────────────────────────────────────

/**
 * Maps exactly to the backend PropertyStatus enum.
 * DO NOT rename — must match what the Spring Boot API returns.
 */
export type BackendPropertyStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "ACTIVE"
  | "INACTIVE"
  | "MAINTENANCE";

/** Human-readable display labels for each backend status */
export const PROPERTY_STATUS_LABELS: Record<BackendPropertyStatus, string> = {
  PENDING: "Pending Review",
  UNDER_REVIEW: "Under Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  MAINTENANCE: "Maintenance",
};

/** Tailwind color tokens for status badges */
export const PROPERTY_STATUS_COLORS: Record<
  BackendPropertyStatus,
  { text: string; bg: string; dot: string; border: string }
> = {
  PENDING:      { text: "text-[#D97706]", bg: "bg-[#FEF3C7]", dot: "bg-[#D97706]", border: "border-[#FDE68A]" },
  UNDER_REVIEW: { text: "text-[#2563EB]", bg: "bg-[#EFF6FF]", dot: "bg-[#2563EB]", border: "border-[#BFDBFE]" },
  APPROVED:     { text: "text-[#059669]", bg: "bg-[#ECFDF5]", dot: "bg-[#059669]", border: "border-[#A7F3D0]" },
  REJECTED:     { text: "text-[#DC2626]", bg: "bg-[#FEF2F2]", dot: "bg-[#DC2626]", border: "border-[#FECACA]" },
  ACTIVE:       { text: "text-[#059669]", bg: "bg-[#ECFDF5]", dot: "bg-[#059669]", border: "border-[#A7F3D0]" },
  INACTIVE:     { text: "text-[#6B7280]", bg: "bg-[#F9FAFB]", dot: "bg-[#6B7280]", border: "border-[#E5E7EB]" },
  MAINTENANCE:  { text: "text-[#D97706]", bg: "bg-[#FFFBEB]", dot: "bg-[#D97706]", border: "border-[#FDE68A]" },
};

/** Statuses where owner cannot edit (admin is reviewing) */
export const READ_ONLY_STATUSES: BackendPropertyStatus[] = ["PENDING", "UNDER_REVIEW"];

/** Statuses where the owner can toggle visibility */
export const TOGGLEABLE_STATUSES: BackendPropertyStatus[] = ["ACTIVE", "INACTIVE"];

// ── Owner Property ────────────────────────────────────────────────────────────

export interface OwnerProperty {
  id: number;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  country?: string;
  image?: string;
  rate?: string;
  rating?: number;
  reviews?: number;
  status: BackendPropertyStatus;
  statusOn?: boolean;
  checkIn?: string;
  checkOut?: string;
  houseRules?: string;
  cancellationPolicy?: string;
  contactPhone?: string;
  contactEmail?: string;
  propertyType?: string;
  amenities?: string[];
  roomCount?: number;
  /** Populated after backend adds rejectionReason field */
  rejectionReason?: string;
  submittedAt?: string;

  grossRevenue?: number;
  platformCommission?: number;
  availableBalance?: number;
}

export interface OwnerPropertyPage {
  properties: OwnerProperty[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

export interface OwnerPropertyCreateRequest {
  name: string;
  description?: string;
  address?: string;
  city?: string;
  country?: string;
  contactPhone?: string;
  contactEmail?: string;
  checkIn?: string;
  checkOut?: string;
  houseRules?: string;
  cancellationPolicy?: string;
  propertyType?: string;
  amenities?: string[];
}

export type OwnerPropertyUpdateRequest = Partial<OwnerPropertyCreateRequest>;

// ── QA Engine ─────────────────────────────────────────────────────────────────

export interface PropertyQARequirement {
  key: string;
  label: string;
  passed: boolean;
  message?: string;
}

export interface PropertyQAResult {
  isValid: boolean;
  requirements: PropertyQARequirement[];
  passedCount: number;
  totalCount: number;
}

// ── Change Detection ──────────────────────────────────────────────────────────

export interface CriticalChangeResult {
  requiresReview: boolean;
  changedFields: string[];
}
