### Task 3: Upgrade the Availability Calendar UI

**Files:**
- Modify: `b4code-frontend/src/api/owner/pricing.api.ts`
- Modify: `b4code-frontend/src/components/owner/rates/bulk-edit-price-modal.tsx`
- Modify: `b4code-frontend/src/components/owner/rates/rates-calendar.tsx`

**Interfaces:**
- Consumes: Updated `/owner/availability/bulk-update` from Task 1.
- Produces: Enhanced Bulk Edit Modal and Calendar cells displaying available rooms.

- [ ] **Step 1: Update Pricing API Interfaces**
Add `availableRoomsOverride?: number | null` to `AvailabilityDay` and `BulkPriceUpdateRequest` in `pricing.api.ts`. Add `baseInventory?: number` to `AvailabilityDay`.

- [ ] **Step 2: Update Bulk Edit Price Modal**
Add a new number input to the modal: "Rooms Available to Book". 
Help text: "Leave blank to use your standard room count."
Wire this input to send `availableRoomsOverride` in the `bulkUpdateAvailability` payload. (Make sure if it's empty, it sends undefined/null).

- [ ] **Step 3: Update Rates Calendar View**
In `rates-calendar.tsx`, render the remaining available rooms on each day cell (e.g., "2 Left" or "3 Available").
Use `availableRoomsOverride` if present, otherwise fallback to `baseInventory`. 

- [ ] **Step 4: Commit**
Commit the frontend calendar enhancements.
