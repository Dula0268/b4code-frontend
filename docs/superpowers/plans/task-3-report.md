# Task 3 Report: Upgrade the Availability Calendar UI

## Summary of Changes

1. **Updated Pricing API Interfaces**:
   - Added `availableRoomsOverride?: number | null` and `baseInventory?: number` to `AvailabilityDay` in `pricing.api.ts`.
   - Added `availableRoomsOverride?: number | null` to `BulkPriceUpdateRequest` in `pricing.api.ts`.
   - Updated `bulkUpdatePrices` in `owner-pricing.store.ts` to accept and pass the new `availableRoomsOverride` parameter.

2. **Updated Bulk Edit Price Modal**:
   - Added a new number input "Rooms Available to Book" below the price input in `bulk-edit-price-modal.tsx`.
   - Wired this input to the `bulkUpdatePrices` method in the owner pricing store, passing it down to the API request in `bulkUpdateAvailability`.
   - Included help text "Leave blank to use your standard room count."

3. **Updated Rates Calendar View**:
   - Modified `rates-calendar.tsx` to dynamically calculate and render the remaining available rooms on each day cell.
   - Handled the logic: if `availableRoomsOverride` is present, it uses that value; otherwise it falls back to `baseInventory`.
   - Displayed the string `{roomsCount} Available` cleanly beneath the custom or standard price inside the day cell (excluding blackout dates).

4. **Testing & Compilation**:
   - Successfully ran `npm run build` with no compilation errors, ensuring type safety and correct implementation of the frontend changes.
