import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import CheckoutClient from "../checkout-client";
import { useCartStore } from "@/store/guest/ordering/cart.store";
import { useOrderStore } from "@/store/guest/ordering/order.store";
import { useAuthStore } from "@/store/auth/auth.store";
import { useOrderContextStore } from "@/store/guest/ordering/order-context.store";
import { useGuestSessionStore } from "@/store/guest/ordering/guest-session.store";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/store/guest/ordering/cart.store", () => ({
  useCartStore: jest.fn(),
  getLineUnitPrice: jest.fn((line: any) => line.item.priceLkr ?? line.item.price ?? 0),
}));

jest.mock("@/store/guest/ordering/order.store", () => ({
  useOrderStore: jest.fn(),
}));

jest.mock("@/store/auth/auth.store", () => {
  const store = jest.fn();
  (store as any).getState = () => ({ user: null });
  return { useAuthStore: store };
});

jest.mock("@/store/guest/ordering/order-context.store", () => ({
  useOrderContextStore: jest.fn(),
}));

jest.mock("@/store/guest/ordering/guest-session.store", () => {
  const store = jest.fn();
  (store as any).getState = () => ({ sessionId: "123" });
  return { useGuestSessionStore: store };
});

jest.mock("@/api/payment/payment.api", () => ({
  paymentApi: {
    initiatePayment: jest.fn(),
  }
}));

describe("CheckoutClient", () => {
  const mockPlaceOrder = jest.fn();
  const mockClearCart = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useOrderContextStore as unknown as jest.Mock).mockImplementation((selector: any) => {
      return selector({
        qrContext: { propertyId: 10, location: "Table 1", type: "TABLE" }
      });
    });

    (useAuthStore as unknown as jest.Mock).mockImplementation((selector: any) => {
      return selector({ user: null });
    });

    (useGuestSessionStore as unknown as jest.Mock).mockImplementation((selector: any) => {
      return selector({
        guestName: "John Doe",
        guestPhone: "0771234567",
        setGuestDetails: jest.fn()
      });
    });

    (useCartStore as unknown as jest.Mock).mockImplementation((selector: any) => {
      return selector({
        lines: {
          "item-1": {
            item: { id: 1, title: "Burger", priceLkr: 1500, price: 1500 },
            qty: 1,
          }
        },
        clear: mockClearCart,
        subtotal: () => 1500,
        serviceCharge: () => 150,
        total: () => 1650,
        serviceChargeRate: 0.1,
      });
    });

    (useOrderStore as unknown as jest.Mock).mockImplementation((selector: any) => {
      return selector({
        placeOrder: mockPlaceOrder,
      });
    });
  });

  it("should place an order successfully and clear the cart", async () => {
    mockPlaceOrder.mockResolvedValue("ORDER123");

    render(<CheckoutClient />);

    // Since we selected TABLE, we are walking in. Payment method defaults to 'cash'.
    const placeOrderBtn = screen.getByRole("button", { name: /Confirm & Place Order/i });
    fireEvent.click(placeOrderBtn);

    await waitFor(() => {
      expect(mockPlaceOrder).toHaveBeenCalled();
    });

    expect(mockClearCart).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/guest/order/confirmation");
  });
});
