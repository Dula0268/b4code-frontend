# Task C Report: Staff Orders — Auto-Cancel Orders Older Than 1 Day

**Completed At:** 2026-09-16T14:58 IST  
**Branch:** `feature/owner-room-management-and-availability`

---

## Summary

All three steps from the brief have been implemented. The TypeScript compiler reports **zero errors in the changed files** — all pre-existing errors are in unrelated files untouched by this task.

---

## C1 — `autoExpireStaleOrders()` in the store

**File:** `src/store/staff/orders/staff-orders.store.ts`

### Interface changes
- Added `autoCancelled?: boolean` to the `Order` interface.  
  This is a frontend-only flag set optimistically when auto-expiry fires, allowing the card to render the ⏰ badge immediately without waiting for the API round-trip.
- Added `autoExpireStaleOrders: () => Promise<number>` to `StaffOrdersActions`.

### Implementation (inserted between `advanceStatus` and `clearToast`)

```ts
autoExpireStaleOrders: async () => {
  const AUTO_CANCEL_REASON = "Auto-cancelled: no action taken within 24 hours";
  const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
  const now = Date.now();

  const staleOrders = get().orders.filter(
    (o) =>
      o.status === "placed" &&
      now - new Date(o.createdAt).getTime() > TWENTY_FOUR_HOURS_MS
  );

  if (staleOrders.length === 0) return 0;

  // Optimistically mark stale orders in local state (for the ⏰ badge)
  const staleIds = new Set(staleOrders.map((o) => o.id));
  set((state) => ({
    orders: state.orders.map((o) =>
      staleIds.has(o.id) ? { ...o, autoCancelled: true } : o
    ),
  }));

  // Concurrently reject all stale orders via the existing rejectOrder action
  await Promise.allSettled(
    staleOrders.map((o) => get().rejectOrder(o.id, AUTO_CANCEL_REASON))
  );

  return staleOrders.length;
},
```

**Key decisions:**
- Uses `get().orders` (the full global cache) rather than `queue.items` (one tab's page), so stale orders across all tabs are caught regardless of which page the user is on.
- Uses `Promise.allSettled` so one failed API call doesn't block the rest.
- Optimistically sets `autoCancelled: true` before API calls complete for instant UI feedback.
- Returns the cancelled count as required by the brief.

---

## C2 — Trigger on page load

**File:** `src/components/staff/orders/staff-order-queue.tsx`

```ts
const autoExpireStaleOrders = useStaffOrdersStore((s) => s.autoExpireStaleOrders);

useEffect(() => {
  fetchOrderPage(propertyId, { status: activeTab, page: 0 });
  fetchStatusCounts(propertyId);
  // Auto-cancel any placed orders older than 24 hours on every page load.
  autoExpireStaleOrders();
}, [propertyId, activeTab, fetchOrderPage, fetchStatusCounts]);
```

Fires on every mount and on tab/property change, so stale orders are cleaned up whenever the queue is viewed or refreshed.

---

## C3 — ⏰ Auto-cancelled badge (optional, implemented)

**File:** `src/components/staff/orders/staff-order-queue.tsx`

Inside `OrderCard`, a derived flag:

```ts
const isAutoCancelled = order.autoCancelled === true;
```

Badge rendering conditionally shows the ⏰ label:

```tsx
{isAutoCancelled ? (
  <>⏰ Expired (no action taken)</>
) : (
  badge.label
)}
```

Auto-expired orders display `⏰ Expired (no action taken)` in place of the generic "Rejected" label, keeping the same red badge style — visually distinct from staff-initiated rejections.

---

## Files Changed

| File | Changes |
|---|---|
| `src/store/staff/orders/staff-orders.store.ts` | Added `autoCancelled?` to `Order` interface; added `autoExpireStaleOrders` to action types and implementation |
| `src/components/staff/orders/staff-order-queue.tsx` | Subscribed to `autoExpireStaleOrders`; triggered it in the load `useEffect`; renders ⏰ badge for auto-cancelled orders |

---

## Compile Result

```
npx tsc --noEmit — exit code 1
```

All errors are **pre-existing** in unrelated files:
- `guest-message-client.tsx` — async effect return type
- `owner/properties/[id]/edit/page.tsx` — missing properties on `OwnerProperty`
- `staff/bookings/staff-bookings-client.tsx` — `createdAt` on `OwnerReservationDto`
- `BookingCalendar.tsx`, `ReservationsTable.tsx`, `notification-panel.tsx` — type mismatches

**Zero errors introduced by this task.**

---

## Constraints Respected

- ✅ Uses existing `rejectOrder` action — no new API endpoints.
- ✅ Uses existing `createdAt` field on `Order` — no schema changes.
- ✅ No new API endpoints created.
- ✅ Compiled and verified after implementation.
