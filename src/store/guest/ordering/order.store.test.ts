import { useOrderStore } from "./order.store";
import api from "@/lib/axios";

// Mock the global api (axios) module to inspect outgoing HTTP requests
jest.mock("@/lib/axios", () => ({
  post: jest.fn(),
  defaults: {
    baseURL: "http://localhost:8080/api",
  },
}));

describe("Order Store - Prefix Stripping Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should successfully strip prefixes (mn- and vn-) from menuItemId and convert to number when placing an order", async () => {
    // Mock the backend API response to return a mock order ID
    const mockedPost = api.post as jest.Mock;
    mockedPost.mockResolvedValue({
      data: {
        id: 42,
        status: "NEW",
      },
    });

    const lines = [
      {
        item: {
          id: "mn-101",
          name: "Test Pizza",
          title: "Test Pizza",
          description: "A yummy pizza to test",
          price: 1500,
          priceLkr: 1500,
          category: "Pizza",
        },
        qty: 2,
      },
      {
        item: {
          id: "vn-202",
          name: "Test Burger",
          title: "Test Burger",
          description: "A yummy burger to test",
          price: 1200,
          priceLkr: 1200,
          category: "Burgers",
        },
        qty: 1,
      },
    ];

    // Call the placeOrder action
    const result = await useOrderStore.getState().placeOrder({
      lines,
      subtotal: 4200,
      serviceCharge: 420,
      tax: 210,
      total: 4830,
      location: "Room 101",
      paymentMethod: "room-charge",
      propertyId: 1,
      guestId: 5,
    });

    // Check that placeOrder returned the backend's ID (42)
    expect(result).toBe(42);

    // Verify api.post was called with the correctly formatted request payload
    expect(api.post).toHaveBeenCalledWith("/orders", expect.objectContaining({
      items: [
        expect.objectContaining({
          menuItemId: 101, // 'mn-101' -> 101
          quantity: 2,
          priceAtOrder: 1500,
        }),
        expect.objectContaining({
          menuItemId: 202, // 'vn-202' -> 202
          quantity: 1,
          priceAtOrder: 1200,
        }),
      ]
    }));
  });
});
