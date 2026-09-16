# Task 1: Separate Rates & Availability
1. Update `b4code-frontend/src/components/owner/layout/owner-sidebar.tsx`. In `NAV_ITEMS`, replace "Rates & Pricing" (which currently points to `/owner/rate`) with two separate items:
   - "Rates & Pricing" -> `/owner/rate` (Icon: DollarSign)
   - "Availability" -> `/owner/availability` (Icon: CalendarDays or CalendarRange)
2. Create the `b4code-frontend/src/app/owner/availability/page.tsx` page.
   - It should have the `OwnerHeader` with title "Availability Calendar".
   - It should fetch owner properties and allow property selection (just like how `src/app/owner/rate/page.tsx` does it).
   - It should render the `<RatesCalendar />` component (`@/components/owner/rates/rates-calendar`). 
   - Note: The `RatesCalendar` component triggers `BulkEditPriceModal` and `SeasonalPricingModal`, so make sure you also render them in this page so the calendar's buttons actually open the modals.
   - Currently, `RatesCalendar` exists but isn't rendered anywhere. This new page will be its new home.
