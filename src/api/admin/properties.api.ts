import api from '@/lib/axios';

// DTOs
export interface PropertyDto {
  id: string;
  name: string;
  location: string;
  hostName: string;
  hostEmail: string;
  status: string;
  submissionDate: string;
  verificationId?: string;
  rejectionReason?: string;
  documentUrl?: string;
}

export interface PropertyPageDto {
  content: PropertyDto[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
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
