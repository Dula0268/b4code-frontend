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
- `createRoom(data: OwnerRoomTypeRequest): Promise<OwnerRoomType>`
- `updateRoom(id: number, data: OwnerRoomTypeRequest): Promise<OwnerRoomType>`
- `deleteRoom(id: number): Promise<void>`

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
Wire these buttons to open the `RoomTypeSheet` and pass the propertyId/roomType data. When submitting the form, call the respective API and refresh the data. (Use `mutate` or refresh state if it uses SWR/React Query/Zustand, or simple `router.refresh()`/fetch).

- [ ] **Step 4: Commit**
Commit the frontend room management changes.
