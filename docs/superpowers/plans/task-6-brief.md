# Task 2: Redesign Add/Edit Room Form
1. The user hates the `OwnerRoomTypeSheet` form styling. They want it to look exactly like the existing `RoomBuilderForm` (`src/components/owner/onboarding/room-builder-form.tsx`).
2. Update `b4code-frontend/src/components/owner/properties/room-type-sheet.tsx`. 
   - Refactor the form inside the sheet to use the exact same UI elements as `RoomBuilderForm`: the white card with the `BedDouble` icon header, the same `<Select>` components for Room Type and Bed Configuration, and the identical layout for pricing, capacity, and inventory.
   - You don't need to support "Add Another Room Type" (since the sheet edits one room at a time), but the form fields and styling must match `room-builder-form.tsx`.
   - Ensure the form still functions correctly (submit calls `createRoom` or `updateRoom` from `room.api.ts`).
   - Use standard Shadcn UI imports from `@/components/ui`.
