import Link from "next/link"

interface LogoProps {
  href?: string
  variant?: "default" | "white"
  width?: number
  height?: number
}

export default function Logo({
  href = "/",
  variant = "default",
  width = 160,
  height = 48
}: LogoProps) {
  const brown = variant === "white" ? "#ffffff" : "#8B3A2A"
  const gold = variant === "white" ? "#ffdd70" : "#E8C04A"

  return (
    <Link href={href} className="flex items-center no-underline">
      <svg
        width={width}
        height={height}
        viewBox="0 0 200 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ── Building 1 (tall, left) ── */}
        {/* Outline */}
        <rect x="2" y="10" width="22" height="46" stroke={brown} strokeWidth="1.6" fill="none" />
        {/* Windows row 1 */}
        <rect x="6" y="14" width="4" height="4" fill={brown} />
        <rect x="14" y="14" width="4" height="4" fill={brown} />
        {/* Windows row 2 */}
        <rect x="6" y="22" width="4" height="4" fill={brown} />
        <rect x="14" y="22" width="4" height="4" fill={brown} />
        {/* Windows row 3 */}
        <rect x="6" y="30" width="4" height="4" fill={brown} />
        <rect x="14" y="30" width="4" height="4" fill={brown} />
        {/* Vertical divider inside building */}
        <line x1="13" y1="10" x2="13" y2="56" stroke={brown} strokeWidth="1.2" />

        {/* ── Building 2 (shorter, right of building 1) ── */}
        <rect x="26" y="22" width="16" height="34" stroke={brown} strokeWidth="1.6" fill="none" />
        {/* Windows */}
        <rect x="29" y="26" width="3" height="3" fill={brown} />
        <rect x="36" y="26" width="3" height="3" fill={brown} />
        <rect x="29" y="33" width="3" height="3" fill={brown} />
        <rect x="36" y="33" width="3" height="3" fill={brown} />

        {/* ── Large "P" ── */}
        <text
          x="44"
          y="52"
          fontFamily="'Georgia', 'Times New Roman', serif"
          fontSize="44"
          fontWeight="700"
          fill={brown}
        >
          P
        </text>

        {/* ── "RIME" in gold ── */}
        <text
          x="76"
          y="40"
          fontFamily="'Georgia', 'Times New Roman', serif"
          fontSize="22"
          fontWeight="700"
          fill={gold}
          letterSpacing="1"
        >
          RIME
        </text>

        {/* ── Underline below RIME ── */}
        <rect x="76" y="43" width="58" height="2" fill={brown} />

        {/* ── "STAY" below, centered under PRIME ── */}
        <text
          x="88"
          y="56"
          fontFamily="'Georgia', 'Times New Roman', serif"
          fontSize="11"
          fontWeight="600"
          fill={brown}
          letterSpacing="4"
        >
          STAY
        </text>
      </svg>
    </Link>
  )
}