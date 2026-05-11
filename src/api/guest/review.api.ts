import { apiFetch } from "@/lib/api";

interface ReviewData {
  bookingId?: number;
  propertyId?: number;
  rating: number;
  title: string;
  comment: string;
  guestName?: string;
}

export const guestReviewApi = {
  /**
   * Get paginated reviews for a property.
   */
  getPropertyReviews: async (propertyId: number, page = 0, size = 10) => {
    const response = await apiFetch(`/api/guest/reviews/property/${propertyId}?page=${page}&size=${size}`);
    if (!response.ok) throw new Error("Failed to fetch reviews");
    return response.json();
  },

  /**
   * Submit a new review for a booking.
   */
  createReview: async (reviewData: ReviewData) => {
    const response = await apiFetch("/api/guest/reviews", {
      method: "POST",
      body: JSON.stringify(reviewData),
    });
    if (!response.ok) throw new Error("Failed to submit review");
    return response.json();
  },
};
