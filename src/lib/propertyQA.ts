import type { OwnerProperty, PropertyQARequirement, PropertyQAResult } from "@/models/owner";

/**
 * Runs content quality checks on a property before it can be submitted/resubmitted.
 * All rules are based on actual Property entity fields — nothing is invented.
 *
 * @param property - Partial OwnerProperty object (can be form state or API response)
 * @returns PropertyQAResult with individual requirement outcomes
 */
export function runPropertyQA(property: Partial<OwnerProperty>): PropertyQAResult {
  const requirements: PropertyQARequirement[] = [
    {
      key: "name",
      label: "Property name",
      passed: Boolean(property.name && property.name.trim().length >= 3),
      message: "Property name must be at least 3 characters.",
    },
    {
      key: "description",
      label: "Description",
      passed: Boolean(property.description && property.description.trim().length >= 10),
      message: "Add a description (at least 10 characters).",
    },
    {
      key: "address",
      label: "Full address (address, city, country)",
      passed: Boolean(
        property.address && property.address.trim() &&
        property.city && property.city.trim() &&
        property.country && property.country.trim()
      ),
      message: "Address, city, and country are all required.",
    },
    {
      key: "contactInfo",
      label: "Contact info (phone or email)",
      passed: Boolean(
        (property.contactPhone && property.contactPhone.trim()) ||
        (property.contactEmail && property.contactEmail.trim())
      ),
      message: "Provide at least a contact phone or email.",
    },
    {
      key: "checkInOut",
      label: "Check-in and check-out times",
      passed: Boolean(
        property.checkIn && property.checkIn.trim() &&
        property.checkOut && property.checkOut.trim()
      ),
      message: "Both check-in and check-out times are required.",
    },
    {
      key: "houseRules",
      label: "House rules",
      passed: Boolean(property.houseRules && property.houseRules.trim().length > 0),
      message: "Add house rules for guests.",
    },
    {
      key: "rooms",
      label: "At least one room type",
      passed: typeof property.roomCount === "number" ? property.roomCount > 0 : false,
      message: "Add at least one room type via the Room Builder.",
    },
    {
      key: "amenities",
      label: "At least one amenity",
      passed: Array.isArray(property.amenities) && property.amenities.length > 0,
      message: "Select at least one amenity.",
    },
  ];

  const passedCount = requirements.filter((r) => r.passed).length;

  return {
    isValid: passedCount === requirements.length,
    requirements,
    passedCount,
    totalCount: requirements.length,
  };
}
