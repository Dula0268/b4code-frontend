import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import CartClient from "../cart-client";
import { useCartStore } from "@/store/guest/ordering/cart.store";
import { useOrderContextStore } from "@/store/guest/ordering/order-context.store";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("@/store/guest/ordering/cart.store", () => ({
  useCartStore: jest.fn(),
}));

jest.mock("@/store/guest/ordering/order-context.store", () => ({
  useOrderContextStore: jest.fn(),
}));

describe("CartClient", () => {
  const mockSetQty = jest.fn();
  const mockRemove = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useOrderContextStore as unknown as jest.Mock).mockImplementation((selector: any) => {
      const state = {
        qrContext: { propertyId: 10, location: "Table 1", type: "TABLE" },
      };
      return selector(state);
    });

    (useCartStore as unknown as jest.Mock).mockImplementation((selector: any) => {
      const state = {
        lines: {
          "item-1": {
            item: { id: 1, title: "Burger", priceLkr: 1500, description: "Beef Burger" },
            qty: 2,
          }
        },
        setQty: mockSetQty,
        remove: mockRemove,
        subtotal: () => 3000,
        serviceCharge: () => 300,
        tax: () => 150,
        total: () => 3450,
        itemCount: () => 2,
      };
      return selector(state);
    });
  });

  it("should display cart items and allow modifying quantities", () => {
    render(<CartClient />);

    expect(screen.getByText("Burger")).toBeInTheDocument();
    
    const decreaseBtn = screen.getByRole("button", { name: /Decrease quantity/i });
    const increaseBtn = screen.getByRole("button", { name: /Increase quantity/i });

    fireEvent.click(decreaseBtn);
    expect(mockSetQty).toHaveBeenCalledWith("item-1", 1);

    fireEvent.click(increaseBtn);
    expect(mockSetQty).toHaveBeenCalledWith("item-1", 3);
  });
});
