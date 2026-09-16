# Task A: Owner Reviews Page + Consistency + Skeleton Replacements

## A1. Create `/owner/reviews/page.tsx`
The owner has no reviews page. Create it at `src/app/owner/reviews/page.tsx`.

**What it should do:**
- Show the SAME review data as the staff reviews page (`src/app/staff/reviews/page.tsx`) — both "Food Reviews" (item reviews) and "Property Reviews" (booking reviews).
- The owner can select which property to view reviews for (fetch owner's properties list using `ownerPricingApi.getOwnerProperties()` or `ownerPropertyApi.listProperties()`).
- Use the same API endpoints: `/staff/reviews?propertyId={id}` and `/staff/reviews/booking?propertyId={id}` — these already accept `propertyId` as a param.
- Show two tabs: "Property Reviews" and "Food & Restaurant Reviews".
- Show star ratings, reviewer name, review text, date.
- Match the clean styling from the rest of the owner portal (white cards, `#953002` brand color, `rounded-2xl`, etc.).
- Use the standard `OwnerHeader` component with title "Reviews" and subtitle "See what guests are saying about your property and restaurant".
- Use Skeleton loading (no spinners!).

## A2. Add `OwnerHeader` to all pages that are missing it
These pages are currently missing the `OwnerHeader` component. Add it to each with an appropriate title/subtitle:
- `src/app/owner/bookings/page.tsx` — title: "Bookings", subtitle: "View and manage all your property reservations"
- `src/app/owner/messages/page.tsx` — title: "Messages", subtitle: "Communicate with your guests"
- `src/app/owner/payouts/page.tsx` — title: "Payouts", subtitle: "Track your earnings and payout history"
- `src/app/owner/properties/page.tsx` — title: "My Properties", subtitle: "Manage your listed properties"
- `src/app/owner/properties/new/page.tsx` — title: "Add New Property", subtitle: "List a new property on Primestay"
- `src/app/owner/properties/[id]/page.tsx` — title: "Property Details", subtitle: "Manage rooms and settings"
- `src/app/owner/properties/[id]/edit/page.tsx` — title: "Edit Property", subtitle: "Update your property information"

For the `properties/[id]` pages, the OwnerHeader may need to be placed inside the component, not the server component level. Look at how other pages do it. Ensure that the `mt-[64px]` top margin is applied to the `<main>` tag of each page.

## A3. Replace ALL loading spinners with Skeleton loading in owner pages
The following owner pages use `animate-spin`/`Loader`/`LoadingSpinner` — replace these with appropriate `<Skeleton>` components from `@/components/ui/skeleton`:
- `src/app/owner/messages/page.tsx`
- `src/app/owner/payouts/page.tsx`
- `src/app/owner/properties/page.tsx`
- `src/app/owner/properties/new/page.tsx`
- `src/app/owner/settings/page.tsx`
- `src/app/owner/staff/page.tsx`

Also replace them in staff pages:
- `src/app/staff/profile/page.tsx`
- `src/app/staff/reviews/page.tsx`

Do NOT remove the `isLoading` state. Simply replace the JSX that renders the spinner with a reasonable skeleton grid that approximates the layout of the content being loaded.

## A4. Add "Reviews" to owner sidebar
In `src/components/owner/layout/owner-sidebar.tsx`, add a new nav item in `NAV_ITEMS`:
```ts
{ label: "Reviews", href: "/owner/reviews", icon: Star }
```
`Star` is already imported.

## Constraints
- Do not break existing functionality.
- Only use existing Shadcn UI components (`@/components/ui/*`).
- Compile after making changes. Report any TypeScript errors.
