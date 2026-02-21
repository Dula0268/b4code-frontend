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
                style={{
                    width: 50,
                    height: 28,
                    borderRadius: 999,
                    border: "none",
                    outline: "none",
                    cursor: "pointer",
                    padding: 0,
                    position: "relative",
                    flexShrink: 0,
                    backgroundColor: enabled ? "#27ae60" : "#cbd5e0",
                    transition: "background-color 0.25s ease",
                    boxShadow: enabled
                        ? "inset 0 1px 2px rgba(0,0,0,0.10)"
                        : "inset 0 1px 3px rgba(0,0,0,0.15)",
                }}
            >
                {/* Knob */}
                <span
                    style={{
                        position: "absolute",
                        top: 3,
                        left: enabled ? 23 : 3,
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        backgroundColor: "white",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.25), 0 1px 2px rgba(0,0,0,0.12)",
                        transition: "left 0.25s ease",
                        display: "block",
                    }}
                />
            </button>
        </div>
    );
}
