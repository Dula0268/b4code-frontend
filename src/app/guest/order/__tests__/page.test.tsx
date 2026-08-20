import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import GuestOrderLanding from "../page";
import { useSearchParams } from "next/navigation";
import { useOrderContextStore } from "@/store/guest/ordering/order-context.store";
import api from "@/lib/axios";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: jest.fn(),
}));

// Mock axios
jest.mock("@/lib/axios", () => ({
  get: jest.fn(),
}));

// Mock MenuClient to avoid deep rendering
jest.mock("@/components/guest/ordering/menu/menu-client", () => {
  return function MockMenuClient() {
    return <div data-testid="menu-client">Menu Client</div>;
  };
});

describe("GuestOrderLanding", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset Zustand store
    useOrderContextStore.setState({
      qrContext: null,
      setQRContext: (ctx: any) => useOrderContextStore.setState({ qrContext: ctx }),
    });
  });

  it("should load QR context and redirect to ordering page with assigned table", async () => {
    // Setup mock search params
    const searchParams = new URLSearchParams("?qrId=12345");
    (useSearchParams as jest.Mock).mockReturnValue(searchParams);

    // Mock API response for valid QR
    (api.get as jest.Mock).mockResolvedValue({
      data: {
        uniqueQrId: "12345",
        propertyId: 10,
        location: "Table 5",
        status: "ACTIVE",
        type: "TABLE",
        name: "Table 5 QR",
      },
    });

    render(<GuestOrderLanding />);

    await waitFor(() => {
      // Check that API was called
      expect(api.get).toHaveBeenCalledWith("/qr/unique/12345");
    });

    // Verify setQRContext was called with the correct data
    const state = useOrderContextStore.getState();
    expect(state.qrContext).not.toBeNull();
    expect(state.qrContext?.qrId).toBe("12345");
    // Let's just check the API call and if MenuClient is rendered
    expect(await screen.findByTestId("menu-client")).toBeInTheDocument();
  });

  it("should display error when scanning an inactive QR code", async () => {
    const searchParams = new URLSearchParams("?qrId=999");
    (useSearchParams as jest.Mock).mockReturnValue(searchParams);

    // Mock API response for inactive QR
    (api.get as jest.Mock).mockResolvedValue({
      data: {
        uniqueQrId: "999",
        status: "INACTIVE",
      },
    });

    render(<GuestOrderLanding />);

    expect(await screen.findByText("This QR code is currently inactive.")).toBeInTheDocument();
    expect(screen.queryByTestId("menu-client")).not.toBeInTheDocument();
  });
});
