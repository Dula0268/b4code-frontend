"use client";

import { useState, useEffect } from "react";
import { MapPin, Home, Loader2 } from "lucide-react";
import { getFilterOptions, LocationSuggestionDTO } from "@/api/guest/search.api";

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
  const [suggestions, setSuggestions] = useState<LocationSuggestionDTO[]>([]);
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
          setSuggestions(opts.locationSuggestions || []);
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
      ? suggestions.filter((l) =>
          l.name.toLowerCase().includes(value.toLowerCase()),
        )
      : suggestions;

  const displaySuggestions = filtered.slice(0, maxSuggestions);

  return (
    <div
      className="absolute top-full left-0 mt-2 bg-white rounded-xl z-50 w-[260px] overflow-hidden
                 shadow-[0_8px_30px_rgba(0,0,0,0.15)] border border-[#f0f0f0]"
    >
      <p className="text-[10px] font-semibold text-[#828282] uppercase tracking-wide px-4 pt-3 pb-1">
        {loading ? "Loading..." : "Suggested"}
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 size={16} className="text-[var(--brand-primary)] animate-spin" />
        </div>
      ) : displaySuggestions.length === 0 ? (
        <div className="px-4 py-3 text-sm text-[#828282]">
          No locations found
        </div>
      ) : (
        displaySuggestions.map((loc, idx) => (
          <div
            key={`${loc.name}-${loc.type}-${idx}`}
            onMouseDown={(e) => {
              // Prevent the parent onBlur from firing before onSelect
              e.preventDefault();
              onSelect(loc.name);
            }}
            className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#953002]/5 cursor-pointer transition-colors"
          >
            {loc.type === "property" ? (
              <Home size={15} className="text-[#953002] flex-shrink-0" />
            ) : (
              <MapPin size={15} className="text-[#953002] flex-shrink-0" />
            )}
            <div className="flex flex-col">
              <span className="text-sm text-[#333333] leading-tight">{loc.name}</span>
              <span className="text-[10px] text-[#828282] uppercase tracking-wider">{loc.type}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
