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
Map it to the `inventory` property of the form. Use the exact same input logic developed in Task 2 to handle `""` to `0` cleanly.

- [ ] **Step 3: Commit**
Commit the onboarding fix.
