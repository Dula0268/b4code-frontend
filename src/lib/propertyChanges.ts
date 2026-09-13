import type {
  OwnerProperty,
  OwnerPropertyUpdateRequest,
  CriticalChangeResult,
} from "@/models/owner";

/**
 * Fields that trigger a re-review when changed on an ACTIVE property.
 * These are location/category fields that the admin verified during initial approval.
 */
const CRITICAL_FIELDS: Array<{
  key: keyof OwnerPropertyUpdateRequest;
  label: string;
}> = [
  { key: "address",      label: "Address" },
  { key: "city",         label: "City" },
  { key: "country",      label: "Country" },
  { key: "propertyType", label: "Property Type" },
];

/**
 * Determines whether a set of updates to an OwnerProperty would require
 * admin re-review (i.e., the property should revert to PENDING status).
 *
 * Only relevant when the property is currently ACTIVE or APPROVED.
 * Non-critical fields (description, contact info, policies, amenities) are safe to update.
 */
export function detectCriticalChanges(
  original: OwnerProperty,
  updated: OwnerPropertyUpdateRequest
): CriticalChangeResult {
  const changedFields: string[] = [];

  for (const field of CRITICAL_FIELDS) {
    const originalValue = (original as any)[field.key];
    const updatedValue = (updated as any)[field.key];

    if (updatedValue === undefined) continue; // field not being changed

    const normalizedOriginal = (originalValue ?? "").toString().trim().toLowerCase();
    const normalizedUpdated = (updatedValue ?? "").toString().trim().toLowerCase();

    if (normalizedOriginal !== normalizedUpdated) {
      changedFields.push(field.label);
    }
  }

  return {
    requiresReview: changedFields.length > 0,
    changedFields,
  };
}
