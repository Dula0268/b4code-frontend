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
    <div className="flex items-center justify-between px-5 py-[18px]">
      {/* Left: label + description */}
      <div className="flex-1 pr-8">
        <p className="m-0 text-[14px] font-semibold text-[var(--black-2)]">
          {label}
        </p>
        <p className="m-0 mt-1 text-[12.5px] text-[var(--gray-3)] leading-snug">
          {description}
        </p>
      </div>

      {/* Toggle switch — iOS style */}
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative w-[50px] h-[28px] rounded-full border-none outline-none cursor-pointer p-0 flex-shrink-0 transition-colors duration-250 ${
          enabled
            ? "bg-[#27ae60] shadow-[inset_0_1px_2px_rgba(0,0,0,0.10)]"
            : "bg-[#cbd5e0] shadow-[inset_0_1px_3px_rgba(0,0,0,0.15)]"
        }`}
      >
        {/* Knob */}
        <span
          className={`absolute top-[3px] w-[22px] h-[22px] rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.25),_0_1px_2px_rgba(0,0,0,0.12)] transition-[left] duration-250 block ${
            enabled ? "left-[23px]" : "left-[3px]"
          }`}
        />
      </button>
    </div>
  );
}
