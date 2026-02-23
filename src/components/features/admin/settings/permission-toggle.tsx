"use client";

// ─── Props ────────────────────────────────────────────────────────────────────
interface PermissionToggleProps {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function PermissionToggle({
  label,
  description,
  enabled,
  onChange,
}: PermissionToggleProps) {
  return (
    <div className="flex items-center justify-between px-5 py-4.5">
      {/* Left: label + description */}
      <div className="flex-1 pr-8">
        <p className="m-0 text-[14px] font-semibold text-(--black-2)">
          {label}
        </p>
        <p className="m-0 mt-1 text-[12.5px] text-(--gray-3) leading-snug">
          {description}
        </p>
      </div>

      {/* Toggle switch — iOS style */}
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative w-12.5 h-7 rounded-full border-none outline-none cursor-pointer p-0 shrink-0 transition-colors duration-250 ${
          enabled
            ? "bg-[#27ae60] shadow-[inset_0_1px_2px_rgba(0,0,0,0.10)]"
            : "bg-[#cbd5e0] shadow-[inset_0_1px_3px_rgba(0,0,0,0.15)]"
        }`}
      >
        {/* Knob */}
        <span
          className={`absolute top-0.75 w-5.5 h-5.5 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.25),0_1px_2px_rgba(0,0,0,0.12)] transition-[left] duration-250 block ${
            enabled ? "left-5.75" : "left-0.75"
          }`}
        />
      </button>
    </div>
  );
}
