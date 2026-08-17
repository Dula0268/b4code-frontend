import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import MenuClient from "../menu-client";
import { useGuestMenuStore } from "@/store/guest/ordering/menu.store";
import { useCartStore } from "@/store/guest/ordering/cart.store";
import { useOrderContextStore } from "@/store/guest/ordering/order-context.store";
import { useSearchParams } from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: jest.fn(),
}));

jest.mock("@/store/guest/ordering/menu.store", () => {
  const store = jest.fn();
  (store as any).getState = () => ({});
  return { useGuestMenuStore: store };
});

jest.mock("@/store/guest/ordering/cart.store", () => {
  const store = jest.fn();
  (store as any).getState = () => ({ total: () => 0 });
  return { useCartStore: store };
});

jest.mock("@/store/guest/ordering/order-context.store", () => {
  const store = jest.fn();
  (store as any).getState = () => ({
    qrContext: { propertyId: 10, location: "Table 1" },
    reset: jest.fn(),
  });
  return { useOrderContextStore: store };
});

jest.mock("@/store/auth/auth.store", () => {
  const store = () => ({ user: null });
  (store as any).getState = () => ({ user: null });
  return { useAuthStore: store };
});

jest.mock("@/lib/axios", () => {
  return {
    __esModule: true,
    default: {
      get: jest.fn().mockResolvedValue({ data: { name: "Test QR", type: "TABLE", propertyId: 10, location: "Table 1" } })
    }
  };
});

jest.mock("@/api/properties/properties.api", () => {
  return {
    propertiesApi: {
      getPublicList: jest.fn().mockResolvedValue([{ id: 10, name: "Test Property" }])
    }
  };
});

describe("MenuClient", () => {
  const mockCategories = [
    {
      name: "Starters",
      items: [
        {
          id: 1,
          name: "Spring Rolls",
          title: "Spring Rolls",
          description: "Crispy rolls",
          price: 500,
          priceLkr: 500,
          category: "Starters",
        },
      ],
    },
    {
      name: "Mains",
      items: [
        {
          id: 2,
          name: "Fried Rice",
          title: "Fried Rice",
          description: "Chicken fried rice",
          price: 1500,
          priceLkr: 1500,
          category: "Mains",
        },
      ],
    },
  ];

  const mockAdd = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams("?qrId=123"));

    (useOrderContextStore as unknown as jest.Mock).mockImplementation((selector: any) => {
      const state = {
        qrContext: { propertyId: 10, location: "Table 1" },
        setQRContext: jest.fn(),
      };
      return selector(state);
    });

    (useGuestMenuStore as unknown as jest.Mock).mockImplementation((selector: any) => {
      const state = {
        categories: mockCategories,
        fetchMenu: jest.fn(),
        loading: false,
        error: null,
      };
      return selector(state);
    });

    (useCartStore as unknown as jest.Mock).mockImplementation((selector: any) => {
      const state = {
        add: mockAdd,
        itemCount: () => 0,
        total: () => 0,
        subtotal: () => 0,
        serviceCharge: () => 0,
        lines: {},
        items: [],
      };
      return selector(state);
    });
  });

  it("should render categories and allow browsing", async () => {
    render(<MenuClient />);
    
    // Wait for initialization to finish and content to render
    await waitFor(() => {
      expect(screen.getByText("All Items")).toBeInTheDocument();
    });

    // Check if category pills are rendered
    expect(screen.getByText("Starters")).toBeInTheDocument();
    expect(screen.getByText("Mains")).toBeInTheDocument();

    // Check if items from both categories are initially rendered
    expect(screen.getByText("Spring Rolls")).toBeInTheDocument();
    expect(screen.getByText("Fried Rice")).toBeInTheDocument();

    // Click "Starters" category
    fireEvent.click(screen.getByText("Starters"));

    // Now it should only show "Spring Rolls"
    expect(screen.getByText("Spring Rolls")).toBeInTheDocument();
    expect(screen.queryByText("Fried Rice")).not.toBeInTheDocument();
  });

  it("should allow adding items to the cart", async () => {
    render(<MenuClient />);

    await waitFor(() => {
      expect(screen.getByText("Spring Rolls")).toBeInTheDocument();
    });

    // Add "Spring Rolls" to cart
    const addButton = screen.getAllByRole("button", { name: /Add/i })[0]; // Assuming "Add" button exists in MenuItemCard
    fireEvent.click(addButton);

    expect(mockAdd).toHaveBeenCalled();
  });
});
