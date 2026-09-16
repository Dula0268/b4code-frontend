# Task B Report: Owner Dashboard Analytics

**Branch:** `feature/owner-room-management-and-availability`  
**File rewritten:** `src/components/owner/dashboard/owner-dashboard.tsx`  
**Completed:** 2026-09-16

---

## Summary

Completely rewrote the owner dashboard from a static placeholder (4 hardcoded zero-value KPI cards + a welcome banner) into a fully data-driven analytics dashboard with 6 live KPI cards, a dual-series revenue area chart, a best-performing property card, a top menu items list, and a seasonal trends summary.

---

## Implementation per Brief Section

### B1 — KPI Cards ✅

Six KPI cards rendered in a responsive `sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6` grid:

| # | Card | Data source | Icon | Color |
|---|------|-------------|------|-------|
| 1 | Total Revenue (MTD) | Summed from confirmed reservations `totalAmount` + food `totalRevenue` | `TrendingUp` | Green (`#10B981`) |
| 2 | Total Bookings | Count of `CONFIRMED / CHECKED_IN / CHECKED_OUT` reservations | `CalendarCheck` | Brand (`#953002`) |
| 3 | Occupancy Rate | Derived: `totalBookings / (activeProperties × 30)` | `Activity` | Blue (`#3B82F6`) |
| 4 | Active Properties | Properties with `status === "ACTIVE"` | `Building` | Brand (`#953002`) |
| 5 | Food Revenue (MTD) | `analyticsApi.getOrderSummary()` per property, summed | `UtensilsCrossed` | Amber (`#F59E0B`) |
| 6 | Avg. Guest Rating | Avg of `rating` field on `OwnerProperty` objects | `Star` | Amber (`#F59E0B`) |

Skeleton loading is shown while data is fetched. Falls back to `0` / `—` gracefully on API failure.

---

### B2 — Revenue Chart ✅

- **Library:** Recharts `AreaChart` with `Area`, `XAxis`, `YAxis`, `Tooltip`, `ResponsiveContainer`, `CartesianGrid`, `Legend` (as required)
- **X-axis:** Last 6 month labels (e.g., Apr → Sep)
- **Series 1:** Room Revenue — `#953002` brand color, filled area gradient
- **Series 2:** Food Revenue — `#f59e0b` amber, filled area gradient
- **Title:** "Revenue Breakdown" with "Last 6 months" subtitle
- **Style:** White card, `rounded-3xl`, `border-[#E8EAED]`, `shadow-sm`
- **Custom tooltip:** Shows formatted `LKR` values per series
- Skeleton shown during load (no spinner)

**Data derivation:**
- Room revenue bucketed from `ownerReservationApi.getAllReservations()` by month of `createdAt`
- Food revenue for the current month populated from `analyticsApi.getOrderSummary()` — historical food data by month is not available from the current backend, so food revenue for prior months defaults to `0` (graceful degradation as required)

---

### B3 — Best Performing Property ✅

- Aggregates confirmed reservations for the current month, groups by `propertyId` / `propertyName`
- Picks the property with highest `totalAmount` sum
- Displays: property name, revenue, booking count, and rating (if available)
- Shows "No booking data available yet." if no MTD bookings

---

### B4 — Top Selling Menu Items ✅

- Calls `analyticsApi.getTopMenuItems(propertyId, startDate, endDate, 5)` for every owned property in parallel via `Promise.allSettled`
- Aggregates results by item name across all properties
- Displays: rank badge, item name, order count, revenue
- Empty state: icon + "No food orders yet." message

**API used:** `GET /staff/analytics/menu/top-items` (existing endpoint in `src/api/staff/analytics.api.ts`)

---

### B5 — Seasonal Trends ✅

- Derived from the last 6 months of room revenue bucketed from reservations
- If any month has revenue > 0: shows "Peak Month" (highest revenue month) and "Off-Peak Month" (lowest) plus a tip card recommending configuration in the Rates section
- If no data: shows single informational callout card

---

## Layout

Matches the brief specification:

```
[ KPI ] [ KPI ] [ KPI ] [ KPI ] [ KPI ] [ KPI ]   ← 6-col grid (responsive)
[ Revenue Area Chart (flex-[3])     ] [ Best Property + Top Items (flex-[2]) ]
[ Seasonal Trends (full width, compact)                                       ]
```

---

## APIs Used

| API | Endpoint | Purpose |
|-----|----------|---------|
| `ownerReservationApi.getAllReservations()` | `GET /owner/reservations` | Bookings, revenue, best property |
| `ownerPropertyApi.listProperties()` | `GET /owner/properties` | Active property count, avg rating |
| `analyticsApi.getOrderSummary()` | `GET /staff/analytics/orders/summary` | Food revenue MTD |
| `analyticsApi.getTopMenuItems()` | `GET /staff/analytics/menu/top-items` | Top menu items |

No new API endpoints were created — all data is derived from existing endpoints.

---

## Constraints Met

- ✅ `recharts` used (AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend)
- ✅ Skeleton loading (no spinners)
- ✅ All fetches in a single `useEffect` on mount
- ✅ Graceful degradation on API failure (shows `0`, `—`, or empty-state message)
- ✅ No `useTranslations` — plain English strings throughout
- ✅ Styling: `#F5F6F8` bg, `#953002` primary, `rounded-2xl/3xl`, `border-[#E8EAED]`, `shadow-sm`

---

## TypeScript

The only errors found during `tsc --noEmit` were **pre-existing** in other files (unrelated to this task):

- `.next/types/validator.ts` — `/owner/reviews` route type mismatch (pre-existing)
- `guest-message-client.tsx` — async effect callback (pre-existing)
- `properties/[id]/edit/page.tsx` — missing `addressLine1`, `latitude`, `longitude`, `mainImageUrl` (pre-existing)
- `staff-bookings-client.tsx` — `createdAt` field issue (pre-existing)
- `BookingCalendar.tsx`, `ReservationsTable.tsx` — status type issues (pre-existing)
- `notification-panel.tsx` — `updatePreferences` missing (pre-existing)

**Zero new TypeScript errors introduced** by this task.

---

## Notes / Known Limitations

1. **Food revenue by month in the chart**: The `staff/analytics` API only provides a summary, not a month-by-month breakdown. Food revenue is therefore only shown for the current month. If the backend exposes a `/owner/analytics/food-monthly` endpoint in the future, the chart can be enhanced to show historical food data.

2. **Occupancy Rate**: Calculated as a proxy (`bookings / (activeProperties × days)`). A dedicated backend endpoint returning true room-night occupancy would produce a more accurate figure.

3. **Food analytics API scope**: The existing food analytics endpoints are under `/staff/` namespace and require a `propertyId` parameter. The dashboard calls them for each owned property and aggregates — this works but generates N parallel requests (where N = number of properties). If a dedicated owner-scoped analytics endpoint is added later, it can replace these calls.
