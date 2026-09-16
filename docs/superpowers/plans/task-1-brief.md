### Task 1: Backend Availability Model Update

**Files:**
- Modify: `b4code-backend/src/main/java/com/b4code/backend/models/Availability.java`
- Modify: `b4code-backend/src/main/java/com/b4code/backend/dto/owner/BulkPriceUpdateRequest.java`
- Modify: `b4code-backend/src/main/java/com/b4code/backend/service/impl/OwnerPricingServiceImpl.java`
- Modify: `b4code-backend/src/main/java/com/b4code/backend/dto/owner/AvailabilityDayDto.java` (or wherever `AvailabilityDay` is mapped for `getMonthlyCalendar`)

**Interfaces:**
- Consumes: Existing DB Schema
- Produces: Updated `/owner/availability/bulk-update` accepting `availableRoomsOverride` and updated `/owner/availability/monthly` returning `availableRoomsOverride` and `baseInventory`.

- [ ] **Step 1: Update the Availability entity**
Add `private Integer availableRoomsOverride;` to `Availability.java` with a new column `available_rooms_override`.

- [ ] **Step 2: Update DTOs**
Add `private Integer availableRoomsOverride;` to `BulkPriceUpdateRequest.java`.
Ensure `AvailabilityDayDto` (or the equivalent response DTO for the calendar) exposes `availableRoomsOverride` and the room's `baseInventory`. (Usually `baseInventory` comes from `RoomType.inventory`).

- [ ] **Step 3: Update OwnerPricingServiceImpl bulkUpdate logic**
In the `bulkUpdateAvailability` method, map the `availableRoomsOverride` from the request to the `Availability` entity and save it.

- [ ] **Step 4: Commit**
Commit the backend changes.
