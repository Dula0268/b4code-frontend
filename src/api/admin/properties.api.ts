import api from '@/lib/axios';

// DTOs
export interface PropertyDto {
  id: number;
  name: string;
  description?: string;
  addressLine1?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  ownerId?: number;
  ownerName?: string;
  createdAt?: string;
  status: string;
  mainImageUrl?: string;
}

export interface PropertyPageDto {
  content: PropertyDto[];
  totalElements: number;
  totalPages: number;
  pageSize: number;
  currentPage: number;
}

export interface PropertyRejectionDto {
  reason: string;
}

export const PropertyApi = {
  getAllProperties: (params: { search?: string; status?: string; page?: number; size?: number }): Promise<PropertyPageDto> =>
    api.get('/admin/properties', { params }).then((res) => res.data),

  getPropertyById: (id: string): Promise<PropertyDto> =>
    api.get(`/admin/properties/${id}`).then((res) => res.data),

  approveProperty: (id: string): Promise<PropertyDto> =>
    api.put(`/admin/properties/${id}/approve`).then((res) => res.data),

  rejectProperty: (id: string, reason: string): Promise<PropertyDto> =>
    api.put(`/admin/properties/${id}/reject`, { reason }).then((res) => res.data),

  markUnderReview: (id: string): Promise<PropertyDto> =>
    api.put(`/admin/properties/${id}/review`).then((res) => res.data),
};
