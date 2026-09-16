# Task C: Staff Orders — Auto-Cancel Orders Older Than 1 Day

## Goal
In the staff order system, any order that has been in the `"placed"` status for more than **1 day (24 hours)** should automatically be moved to the `"cancelled"` state.

This should be handled on the **frontend** (in the store), since it's a display/UX concern — stale unactioned orders should be marked as cancelled. 

## Implementation

### C1. In `src/store/staff/orders/staff-orders.store.ts`
Add a function `autoExpireStaleOrders()` that:
1. Iterates over all orders in the queue.
2. For any order where `status === "placed"` AND `createdAt` is older than 24 hours:
   - Calls `rejectOrder(orderId, "Auto-cancelled: no action taken within 24 hours")` to update the backend status.
   - Or if the backend call is expensive, optimistically moves the order to `"cancelled"` locally and triggers the API in the background.
3. Returns a count of how many orders were auto-cancelled.

Note: `createdAt` is already on the `Order` interface (line 55 of the store file). It is an ISO 8601 string from the backend. Compare with `Date.now()`.

### C2. Trigger auto-expiry on page load
In `src/components/staff/orders/staff-order-queue.tsx`:
- After orders are fetched (in the `useEffect` that calls `fetchOrderPage`), call `autoExpireStaleOrders()`.
- This ensures stale orders are cleaned up every time the page loads or refreshes.

### C3. (Optional but nice) Show a subtle "Auto-cancelled" note on the order card
In `staff-order-queue.tsx`, in the cancelled tab, if the order has a cancellation reason containing "Auto-cancelled", show a small `Badge` like:
```
⏰ Expired (no action taken)
```
in place of the usual "Rejected" label.

## Constraints
- The `rejectOrder` action already exists in the store — use it.
- The `createdAt` field already exists on the `Order` type — use it.
- Do NOT create new API endpoints — use what already exists.
- Compile and test after implementation.
