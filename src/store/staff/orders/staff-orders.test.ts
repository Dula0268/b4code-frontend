import { useOrderStore } from "../../guest/ordering/order.store";
import { useStaffOrdersStore } from "./staff-orders.store";
import api from "@/lib/axios";

// Mock the global api (axios) module to inspect outgoing HTTP requests
jest.mock("@/lib/axios", () => ({
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  defaults: {
    baseURL: "http://localhost:8080/api",
  },
}));

describe("End-to-End Guest & Staff Integration flow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useOrderStore.getState().clearOrder();
    useStaffOrdersStore.getState().reset();
  });

  it("should successfully place a guest order with 2 items & instructions, transition it as staff, and reflect on guest store", async () => {
    // ----------------------------------------------------
    // STEP 1: Guest places an order with 2 items and a custom instruction
    // ----------------------------------------------------
    const guestOrderId = 789;
    const mockPost = api.post as jest.Mock;
    
    // Mock backend order creation response
    mockPost.mockResolvedValue({
      data: {
        id: guestOrderId,
        status: "NEW",
        createdAt: new Date().toISOString(),
        roomNumber: "Room 303",
        totalAmount: 3300.0,
      },
    });

    const lines = [
      {
        item: {
          id: "mn-11",
          name: "Club Sandwich",
          title: "Club Sandwich",
          description: "Fresh sandwich with fries",
          price: 1800.0,
          priceLkr: 1800.0,
          category: "Sandwiches",
        },
        qty: 1,
      },
      {
        item: {
          id: "mn-12",
          name: "Chocolate Milkshake",
          title: "Chocolate Milkshake",
          description: "Rich creamy chocolate shake",
          price: 1500.0,
          priceLkr: 1500.0,
          category: "Beverages",
        },
        qty: 1,
      },
    ];

    const resultOrderId = await useOrderStore.getState().placeOrder({
      lines,
      subtotal: 3300.0,
      serviceCharge: 330.0,
      tax: 165.0,
      total: 3795.0,
      roomNumber: "Room 303",
      guestInstructions: "No mayonnaise in sandwich please.",
      paymentMethod: "room-charge",
      propertyId: 1,
      guestId: 10,
    });

    // Check placed order details
    expect(resultOrderId).toBe(guestOrderId);
    expect(api.post).toHaveBeenCalledWith("/orders", expect.objectContaining({
      propertyId: 1,
      guestId: 10,
      roomNumber: "Room 303",
      guestInstructions: "No mayonnaise in sandwich please.",
      items: [
        { menuItemId: 11, quantity: 1, unitPrice: 1800.0 },
        { menuItemId: 12, quantity: 1, unitPrice: 1500.0 },
      ]
    }));

    // Verify guest store state is updated with the current order
    let guestState = useOrderStore.getState();
    expect(guestState.currentOrder).not.toBeNull();
    expect(guestState.currentOrder?.id).toBe(`#ORD-${guestOrderId}`);
    expect(guestState.currentOrder?.currentStatus).toBe("Placed");

    // ----------------------------------------------------
    // STEP 2: Staff fetches orders and reviews the new order
    // ----------------------------------------------------
    const mockGet = api.get as jest.Mock;
    mockGet.mockResolvedValue({
      data: [
        {
          id: guestOrderId,
          roomNumber: "Room 303",
          guestId: 10,
          totalAmount: 3795.0,
          status: "NEW",
          createdAt: new Date().toISOString(),
        }
      ]
    });

    await useStaffOrdersStore.getState().fetchOrders(1);
    
    expect(api.get).toHaveBeenCalledWith("/staff/orders/property/1");
    const staffState = useStaffOrdersStore.getState();
    expect(staffState.orders).toHaveLength(1);
    expect(staffState.orders[0].id).toBe(`#ORD-${guestOrderId}`);
    expect(staffState.orders[0].status).toBe("placed");

    // ----------------------------------------------------
    // STEP 3: Staff accepts the order
    // ----------------------------------------------------
    const mockPatch = api.patch as jest.Mock;
    mockPatch.mockResolvedValue({ status: 200 });

    await useStaffOrdersStore.getState().acceptOrder(`#ORD-${guestOrderId}`);
    
    expect(api.patch).toHaveBeenCalledWith(`/staff/orders/${guestOrderId}/accept`);
    
    // ----------------------------------------------------
    // STEP 4: Staff advances order status (to in-progress/ready)
    // ----------------------------------------------------
    // Update the local state first to reflect accepted
    useStaffOrdersStore.setState({
      orders: [
        {
          ...staffState.orders[0],
          status: "accepted"
        }
      ]
    });

    await useStaffOrdersStore.getState().advanceStatus(`#ORD-${guestOrderId}`);
    expect(api.patch).toHaveBeenLastCalledWith(`/staff/orders/${guestOrderId}/ready`);

    // ----------------------------------------------------
    // STEP 5: Guest client observes status updates
    // ----------------------------------------------------
    // Simulating frontend response tracking (using guest store advanceStatus)
    useOrderStore.getState().advanceStatus("in-progress");
    guestState = useOrderStore.getState();
    expect(guestState.currentOrder?.currentStatus).toBe("in-progress");
    expect(guestState.currentOrder?.timeline).toHaveLength(2);
    expect(guestState.currentOrder?.timeline[1].status).toBe("in-progress");
  });
});
