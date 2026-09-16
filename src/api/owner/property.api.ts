import api from "@/lib/axios";
import { OnboardingData } from "@/store/owner/onboarding.store";
import {
  OwnerProperty,
  OwnerPropertyPage,
  OwnerPropertyUpdateRequest,
} from "@/models/owner";

export interface ListPropertiesParams {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
}

export const ownerPropertyApi = {
  // ── Used by existing onboarding wizard (MediaUploader) — DO NOT CHANGE ──
  createProperty: (data: OnboardingData): Promise<OwnerProperty> =>
    api.post("/owner/properties", data).then((res) => res.data),

  // ── Lifecycle Management (new) ──────────────────────────────────────────

  listProperties: (params: ListPropertiesParams = {}): Promise<OwnerPropertyPage> =>
    api
      .get("/owner/properties", {
        params: {
          page: (params.page ?? 0) + 1, // Backend is 1-indexed (does page - 1 internally)
          size: params.size ?? 10,
          ...(params.search ? { search: params.search } : {}),
          ...(params.status ? { status: params.status } : {}),
        },
      })
      .then((res) => res.data),

  getProperty: (id: number): Promise<OwnerProperty> =>
    api.get(`/owner/properties/${id}`).then((res) => res.data),

  updateProperty: (id: number, data: OwnerPropertyUpdateRequest): Promise<OwnerProperty> =>
    api.put(`/owner/properties/${id}`, data).then((res) => res.data),

  deleteProperty: (id: number): Promise<void> =>
    api.delete(`/owner/properties/${id}`).then(() => undefined),

  toggleStatus: (id: number): Promise<OwnerProperty> =>
    api.patch(`/owner/properties/${id}/toggle-status`).then((res) => res.data),

  /** Resubmit a REJECTED property for admin review (requires backend PATCH /{id}/resubmit endpoint) */
  resubmitProperty: (id: number): Promise<OwnerProperty> =>
    api.patch(`/owner/properties/${id}/resubmit`).then((res) => res.data),
};
