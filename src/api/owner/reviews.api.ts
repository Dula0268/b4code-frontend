import api from '@/lib/axios';

export const reviewsApi = {
  getPropertyReviews: async (propertyId: number, page = 0, size = 10) => {
    const response = await api.get(`/owner/reviews/property/${propertyId}?page=${page}&size=${size}`);
    return response.data;
  },

  getAllReviews: async (page = 0, size = 10) => {
    const response = await api.get(`/owner/reviews/all?page=${page}&size=${size}`);
    return response.data;
  },
};
