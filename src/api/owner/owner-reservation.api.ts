import api from '@/lib/axios';

export interface OwnerReservationDto {
  id: number;
  confirmationCode: string;
  guestName: string;
  guestEmail: string;
  nicNumber: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  roomId: number;
  roomName: string;
  roomQuantity: number;
  roomNumber: string;
  propertyId: number;
  propertyName: string;
  status: string;
  paymentMethod: string;
  isPaid: boolean;
  lateArrivalAllowed: boolean;
  totalAmount: string;
  taxAmount: string;
  discountAmount: string;
  createdAt: string;
  isManual: boolean;
}

export const ownerReservationApi = {
  getAllReservations: async (search?: string, status?: string): Promise<OwnerReservationDto[]> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    
    const response = await api.get(`/owner/reservations?${params.toString()}`);
    return response.data;
  },

  getReservation: async (id: number): Promise<OwnerReservationDto> => {
    const response = await api.get(`/owner/reservations/${id}`);
    return response.data;
  },

  checkIn: async (id: number): Promise<OwnerReservationDto> => {
    const response = await api.patch(`/owner/reservations/${id}/check-in`);
    return response.data;
  },

  checkOut: async (id: number): Promise<OwnerReservationDto> => {
    const response = await api.patch(`/owner/reservations/${id}/check-out`);
    return response.data;
  },

  cancel: async (id: number): Promise<OwnerReservationDto> => {
    const response = await api.patch(`/owner/reservations/${id}/cancel`);
    return response.data;
  },

  toggleLateArrival: async (id: number, allowed: boolean): Promise<OwnerReservationDto> => {
    const response = await api.patch(`/owner/reservations/${id}/late-arrival?allowed=${allowed}`);
    return response.data;
  },

  exportReservationsPdf: async (search?: string, status?: string): Promise<Blob> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    const response = await api.get(`/owner/reservations/export/pdf?${params.toString()}`, { responseType: 'blob' });
    return response.data;
  }
};
