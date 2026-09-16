# Task: Separate Availability Calendar from Rates Calendar

The user wants a strict separation of concerns between Availability (Inventory) and Rates (Pricing). Currently, `RatesCalendar` and `BulkEditPriceModal` try to do both, which is confusing and illogical.

## 1. Store Updates (`src/store/owner/owner-pricing.store.ts`)
- Add `isBulkAvailabilityModalOpen: boolean;` to state.
- Add `setBulkAvailabilityModalOpen: (open: boolean) => void;` to actions.
- Update `bulkUpdatePrices` or add a new action `bulkUpdateAvailabilityCount(override: number | null, status: string)` to cleanly update just availability without touching customPrice.

## 2. The Rates Domain (`src/components/owner/rates/`)
- **`RatesCalendar` (`rates-calendar.tsx`)**:
  - Should ONLY show prices (Base Rate or Custom Rate).
  - Remove ALL logic/display relating to "Available Rooms" (`availableRoomsDisplay`, `baseInventory`).
  - The floating action bar should only have: "Edit Price", "Reset to Base", "Clear". (Remove "Mark Blackout" from here).
- **`BulkEditPriceModal` (`bulk-edit-price-modal.tsx`)**:
  - Completely remove the "Available Rooms" (`availableRoomsOverride`) input field.
  - This modal is now strictly for setting Custom Prices.

## 3. The Availability Domain (`src/components/owner/availability/`)
- **Create `AvailabilityCalendar` (`availability-calendar.tsx`)**:
  - Copy `rates-calendar.tsx` as a starting point.
  - Remove ALL price display logic.
  - The cell should clearly show inventory, e.g., `3 / 5 Available` (where 5 is `baseInventory` and 3 is the override or base).
  - If `isBlackout` (status is BLOCKED), show `0 / 5 (Blocked)`.
  - Floating action bar should have: "Edit Availability", "Mark Blackout", "Reset to Full Availability" (clears overrides).
  - "Edit Availability" should trigger `isBulkAvailabilityModalOpen`.
- **Create `BulkEditAvailabilityModal` (`bulk-edit-availability-modal.tsx`)**:
  - A modal specifically for editing room availability.
  - *Crucial User Request:* "checkin actual availableroom count and then allowing to edit".
  - You MUST look up the `baseInventory` of the selected room type (or the first selected day's room type) and clearly display it in the UI (e.g., "Maximum physical rooms: 5").
  - The input for "Available Rooms" must have `max={baseInventory}` to prevent the user from typing a number larger than their actual physical inventory.
  - It should not have any price inputs.

## 4. Pages Updates
- **`/owner/rate/page.tsx`**:
  - Restore the "Pricing Calendar" Tab (value="calendar", Icon: `Calendar`) that was previously removed.
  - Render `<RatesCalendar />` inside that tab.
  - Make sure `activeTab` defaults to `"calendar"`.
- **`/owner/availability/page.tsx`**:
  - Render `<AvailabilityCalendar />` instead of `RatesCalendar`.
  - Render `<BulkEditAvailabilityModal />`.

## Constraints
- Do not break existing API calls (use `ownerPricingApi.bulkUpdateAvailability`). When updating availability, pass `customPrice: undefined` so it doesn't overwrite existing prices. When updating price, pass `availableRoomsOverride: undefined` so it doesn't overwrite availability.
- Ensure the UI looks clean, professional, and uses the existing Shadcn UI components.
