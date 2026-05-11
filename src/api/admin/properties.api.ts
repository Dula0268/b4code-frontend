import api from '@/lib/axios';

// DTOs — exactly match what backend PropertyDto sends
export interface PropertyDto {
  id: number;            // Long in backend
  name: string;
  pvId: string;
  imageUrl?: string;     // Cloudinary URL from infrastructure
  ownerId: number;
  ownerName: string;
  ownerRole?: string;
  ownerInitial?: string;
  ownerColor?: string;
  status: string;        // PropertyStatus enum string: PENDING|UNDER_REVIEW|APPROVED|REJECTED
  rejectionReason?: string;
  submittedDate?: string;  // formatted "May 10, 2024" string
  submittedTime?: string;  // formatted "09:30 AM" string
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

  getPropertyById: (id: number): Promise<PropertyDto> =>
    api.get(`/admin/properties/${id}`).then((res) => res.data),

  approveProperty: (id: number): Promise<PropertyDto> =>
    api.put(`/admin/properties/${id}/approve`).then((res) => res.data),

  rejectProperty: (id: number, reason: string): Promise<PropertyDto> =>
    api.put(`/admin/properties/${id}/reject`, { reason }).then((res) => res.data),

  markUnderReview: (id: number): Promise<PropertyDto> =>
    api.put(`/admin/properties/${id}/review`).then((res) => res.data),
};
