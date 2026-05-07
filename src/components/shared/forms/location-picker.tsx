"use client";

import { useState, useEffect } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { getFilterOptions } from "@/services/guest/searchApi";

// ─── Props ────────────────────────────────────────────────────────────────
export interface LocationPickerProps {
  /** Current controlled value of the text input */
  value: string;
  /** Called when the input value changes (optional) */
  onChange?: (value: string) => void;
  /** Called when the user picks a suggestion */
  onSelect: (location: string) => void;
  /** Whether the suggestions dropdown is visible */
  open: boolean;
  /** Max number of suggestions to show */
  maxSuggestions?: number;
}

// ─── Component ────────────────────────────────────────────────────────────
// Locations are fetched from backend API (no hardcoded list).
export default function LocationPicker({
  value,
  onSelect,
  open,
  maxSuggestions = 7,
}: LocationPickerProps) {
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Fetch locations from backend when dropdown opens for the first time
  useEffect(() => {
    if (!open || loaded) return;

    let active = true;
    setLoading(true);

    getFilterOptions()
      .then((opts) => {
        if (active) {
          setLocations(opts.locations || []);
          setLoaded(true);
        }
      })
      .catch((err) => {
        console.error("Failed to load locations:", err);
        if (active) setLoaded(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [open, loaded]);

  if (!open) return null;

  // Filter locations based on user input
  const filtered =
    value.trim().length > 0
      ? locations.filter((l) =>
          l.toLowerCase().includes(value.toLowerCase()),
        )
      : locations;

  const suggestions = filtered.slice(0, maxSuggestions);

  return (
    <div
      className="absolute top-full left-0 mt-2 bg-white rounded-xl z-50 w-[220px] overflow-hidden
                 shadow-[0_8px_30px_rgba(0,0,0,0.15)] border border-[#f0f0f0]"
    >
      <p className="text-[10px] font-semibold text-[#828282] uppercase tracking-wide px-4 pt-3 pb-1">
        {loading ? "Loading..." : "Suggested"}
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 size={16} className="text-[var(--brand-primary)] animate-spin" />
        </div>
      ) : suggestions.length === 0 ? (
        <div className="px-4 py-3 text-sm text-[#828282]">
          No locations found
        </div>
      ) : (
        suggestions.map((loc) => (
          <div
            key={loc}
            onMouseDown={(e) => {
              // Prevent the parent onBlur from firing before onSelect
              e.preventDefault();
              onSelect(loc);
            }}
            className="flex items-center gap-2 px-4 py-2.5 hover:bg-[#953002]/5 cursor-pointer transition-colors"
          >
            <MapPin size={13} className="text-[#953002] flex-shrink-0" />
            <span className="text-sm text-[#333333]">{loc}</span>
          </div>
        ))
      )}
    </div>
  );
}
