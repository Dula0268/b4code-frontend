import { useGuestReviewsStore } from "./reviews.store";
import api from "@/lib/axios";

// Mock the global api (axios) module to inspect outgoing HTTP requests
jest.mock("@/lib/axios", () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

describe("Reviews Store - ID Prefix Stripping Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useGuestReviewsStore.getState().reset();
  });

  it("should strip 'mn-' prefix from menuItemId when fetching reviews", async () => {
    // Mock the backend API response to return empty reviews list
    const mockedGet = api.get as jest.Mock;
    mockedGet.mockResolvedValue({ data: [] });

    await useGuestReviewsStore.getState().fetchReviewsForItem("mn-505");

    // The backend endpoint should receive '/menu-items/505/reviews' instead of '/menu-items/mn-505/reviews'
    expect(api.get).toHaveBeenCalledWith("/menu-items/505/reviews");
  });

  it("should strip '#ORD-' prefix from orderId and 'mn-' prefix from menuItemId when submitting a review", async () => {
    // Mock the backend API response to return success status
    const mockedPost = api.post as jest.Mock;
    mockedPost.mockResolvedValue({ status: 200 });

    const reviewPayload = {
      menuItemId: "mn-707",
      rating: 5,
      comment: "Absolutely delicious!",
      guestName: "John Doe",
    };

    await useGuestReviewsStore.getState().submitReview("#ORD-909", reviewPayload);

    // The backend post should receive '/orders/909/reviews' with menuItemId as '707'
    expect(api.post).toHaveBeenCalledWith(
      "/orders/909/reviews",
      expect.objectContaining({
        menuItemId: 707,
        rating: 5,
        comment: "Absolutely delicious!",
        guestName: "John Doe",
      })
    );
  });
});
