# Owner Room Management & Availability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement full CRUD for Room Types in the Owner Portal with an intuitive UI, and upgrade the Availability Calendar to support setting daily room inventory overrides.

**Architecture:** 
- Frontend: Add a slide-out sheet (`RoomTypeSheet`) on the Property Details page to create/edit rooms, matching the modern UI style of the Rates page.
- Backend: Update the `Availability` entity to support `availableRoomsOverride` to allow owners to explicitly set how many rooms are available on specific dates, bridging the gap between base inventory and daily fluctuations.

**Tech Stack:** Next.js (React), Tailwind CSS, Lucide React, Spring Boot, Hibernate/JPA.

## Global Constraints
- Use common, jargon-free words (e.g., "Number of Rooms" instead of "Inventory", "Block Dates" instead of "Blackout").
- UI must match the clean, modern aesthetic of the `OwnerRatesPage` (e.g., `#953002` primary color, rounded-2xl/3xl, Lucide icons).
- Ensure backward compatibility with existing data (if `availableRoomsOverride` is null, fall back to calculating from base inventory).

---

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
Ensure `AvailabilityDayDto` (or the equivalent response DTO for the calendar) exposes `availableRoomsOverride` and the room's `baseInventory`.

- [ ] **Step 3: Update OwnerPricingServiceImpl bulkUpdate logic**
In the `bulkUpdateAvailability` method, map the `availableRoomsOverride` from the request to the `Availability` entity and save it.

- [ ] **Step 4: Commit**
Commit the backend changes.

---

### Task 2: Frontend Room API & UI Scaffolding

**Files:**
- Modify: `b4code-frontend/src/api/owner/room.api.ts`
- Create: `b4code-frontend/src/components/owner/properties/room-type-sheet.tsx`
- Modify: `b4code-frontend/src/app/owner/properties/[id]/page.tsx`

**Interfaces:**
- Consumes: Backend `/api/owner/rooms` endpoints (POST, PUT, DELETE).
- Produces: Reusable Room Management UI component.

- [ ] **Step 1: Expand room.api.ts**
Add `createRoom`, `updateRoom`, and `deleteRoom` functions matching the backend `OwnerRoomTypeController` endpoints.

- [ ] **Step 2: Create `room-type-sheet.tsx`**
Build a `Sheet` (from `components/ui/sheet`) that contains a form for creating/editing a room type.
Include fields with simple labels:
- Room Name ("What do you call this room?")
- Description
- Room Category (Dropdown: Standard, Deluxe, Suite, etc.)
- Base Price ("Standard nightly rate")
- Number of Rooms ("How many of these rooms do you have?", mapping to `inventory`)
- Capacity (Adults, Children)
- Bed Configuration

- [ ] **Step 3: Integrate Sheet into Property Page**
In `src/app/owner/properties/[id]/page.tsx`, add an "Add Room Type" button at the top of the Rooms section.
Add an "Edit" button to each existing room card.
Wire these buttons to open the `RoomTypeSheet`.

- [ ] **Step 4: Commit**
Commit the frontend room management changes.

---

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
Wire this input to send `availableRoomsOverride` in the `bulkUpdateAvailability` payload.

- [ ] **Step 3: Update Rates Calendar View**
In `rates-calendar.tsx`, render the remaining available rooms on each day cell (e.g., "2 Left").
Use `availableRoomsOverride` if present, otherwise fallback to `baseInventory`. (Note: To be perfectly accurate, it should subtract active bookings, but for now, showing the configured limit is a massive improvement).

- [ ] **Step 4: Commit**
Commit the frontend calendar enhancements.

---

### Task 4: Fix Onboarding Inventory Field

**Files:**
- Modify: `b4code-frontend/src/components/owner/onboarding/room-builder-form.tsx`

**Interfaces:**
- Consumes: Onboarding form schema.
- Produces: Updated schema capturing base inventory.

- [ ] **Step 1: Add Inventory to Form Schema**
In `room-builder-form.tsx`, add `inventory: z.number().min(1, "Minimum 1 room")` to `roomSchema`. Default it to `1`.

- [ ] **Step 2: Add Inventory Input UI**
Add a number input field labeled "Number of Rooms (How many do you have?)" inside the room card loop. 
Map it to the `inventory` property of the form.

- [ ] **Step 3: Commit**
Commit the onboarding fix.
