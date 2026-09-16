# Task B: Owner Dashboard Analytics

Completely rewrite `src/components/owner/dashboard/owner-dashboard.tsx` to be a rich, data-driven analytics dashboard.

## B1. KPI Cards (top row)
Fetch real data from the backend and display 6 KPI cards in a responsive grid:

1. **Total Revenue (This Month)** — sum of all bookings + food orders this month. Icon: `TrendingUp`. Color: green.
2. **Total Bookings** — total confirmed bookings. Icon: `CalendarCheck`. Color: brand `#953002`.
3. **Occupancy Rate** — avg occupancy % across all properties. Icon: `PercentSquare` or `Activity`. Color: blue.
4. **Active Properties** — count of ACTIVE properties. Icon: `Building`. Color: brand.
5. **Food Revenue (MTD)** — revenue from food/item orders. Icon: `UtensilsCrossed`. Color: amber.
6. **Avg. Guest Rating** — average review score across all properties. Icon: `Star`. Color: amber.

Use the existing API where possible:
- `GET /owner/properties` for property count.
- `GET /owner/reservations` for bookings (use `owner-reservation.api.ts`).
- If a dedicated analytics API doesn't exist, call whatever exists and derive the numbers. Fall back to `0` or `—` gracefully when the backend is unreachable.

## B2. Revenue Chart (Booking + Food Revenue, Last 6 Months)
Below the KPI cards, show a combined area/bar chart for the last 6 months.
- X-axis: month names (e.g., "Apr", "May", "Jun").
- Two data series: "Room Revenue" (from bookings) and "Food Revenue" (from orders).
- Use **Recharts** (`recharts` package — it's already used in the admin dashboard, so it's installed).
- Title: "Revenue Breakdown" with a month selector or "Last 6 Months" label.
- Style: white card, `rounded-3xl`, brand colors (`#953002` for rooms, `#f59e0b` for food).

## B3. Best Performing Property Card
A card showing the top-performing property by revenue this month.
- Property name, revenue, occupancy %, booking count.
- If only 1 property exists, show it. Show "No data" if no properties.

## B4. Top Selling Menu Items
A list/card showing the top 3–5 food menu items by order count.
- Item name, order count, revenue generated.
- Use the endpoint from `staff.api.ts` or any food/menu analytics endpoint that already exists.
- Fall back gracefully to an empty state "No food orders yet" if no data.

## B5. Seasonal Trends mini-card
A compact summary card showing peak month vs. off-peak month (based on historical booking data if available, otherwise show a hint to the user to configure seasonal rules in the Rates section).

## Layout
```
[ KPI Card ] [ KPI Card ] [ KPI Card ] [ KPI Card ] [ KPI Card ] [ KPI Card ]
[ Revenue Chart (60% width)                    ] [ Best Property + Top Items (40%) ]
[ Seasonal Trends (full width, compact)         ]
```

## Constraints
- Use `recharts` for the chart (import `AreaChart`, `Area`, `XAxis`, `YAxis`, `Tooltip`, `ResponsiveContainer`, `CartesianGrid`, `Legend`).
- Use Skeleton loading while data is being fetched — no spinners.
- All API calls should be in a `useEffect` that fires when the component mounts.
- If an API call fails, the section should degrade gracefully (show `0`, `—`, or an empty-state message).
- Look at existing API files under `src/api/owner/` and `src/api/` to find any useful analytics endpoints before adding new API calls.
- Style to match the existing owner portal aesthetic: `#F5F6F8` bg, `#953002` primary, `rounded-2xl/3xl`, `border-[#E8EAED]`, `shadow-sm`.
- Do NOT use `useTranslations` — just use plain English strings.
