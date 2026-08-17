import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import TrackOrderClient from "../track-order-client";
import { useOrderStore } from "@/store/guest/ordering/order.store";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("@/store/guest/ordering/order.store", () => ({
  useOrderStore: jest.fn(),
}));

class MockEventSource {
  onmessage: any = null;
  onerror: any = null;
  constructor(public url: string) {}
  addEventListener(event: string, callback: any) {}
  close() {}
}
(global as any).EventSource = MockEventSource;

describe("TrackOrderClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useOrderStore as unknown as jest.Mock).mockImplementation((selector: any) => {
      const state = {
        currentOrder: {
          id: "#ORD-123",
          location: "Table 1",
          placedAt: "2026-08-15 10:00",
          currentStatus: "in-progress",
          paymentMethod: "cash",
          subtotal: 1500,
          serviceCharge: 150,
          tax: 75,
          total: 1725,
          lines: [
            {
              item: { id: 1, title: "Burger", priceLkr: 1500 },
              qty: 1,
            }
          ],
          timeline: [
            { status: "placed", time: "10:00" },
            { status: "accepted", time: "10:05" },
            { status: "in-progress", time: "10:10" }
          ]
        },
        advanceStatus: jest.fn(),
        syncCurrentOrder: jest.fn(),
      };
      return selector(state);
    });
  });

  it("should display the current order status and timeline", async () => {
    render(<TrackOrderClient />);

    expect(screen.getByText("Order #ORD-123 • Table 1 • 2026-08-15 10:00")).toBeInTheDocument();
    
    // Status text in hero
    expect(screen.getAllByText("In Progress").length).toBeGreaterThan(0);
    expect(screen.getByText("Your order is being prepared. We’ll update you as it progresses.")).toBeInTheDocument();

    // Timeline steps
    expect(screen.getByText("Placed")).toBeInTheDocument();
    expect(screen.getByText("Accepted")).toBeInTheDocument();
    
    // Order Summary
    expect(screen.getAllByText("Order Summary").length).toBeGreaterThan(0);
    expect(screen.getByText("1x")).toBeInTheDocument();
    expect(screen.getAllByText("Burger").length).toBeGreaterThan(0);
  });
});
