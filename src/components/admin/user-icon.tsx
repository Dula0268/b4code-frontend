interface UserIconProps {
    size?: number
    className?: string
}

export default function UserIcon({ size = 42, className = "" }: UserIconProps) {
    return (
        <div
            style={{ width: size, height: size }}
            className={`relative rounded-full bg-[#4A90D9] overflow-hidden flex items-end justify-center ${className}`}
        >
            {/* ── Body / Shoulders ── */}
            <div className="absolute bottom-0 w-[80%] h-[38%] bg-[#2C2C3E] rounded-t-[50%]" />

            {/* ── White collar ── */}
            <div className="absolute bottom-[33%] left-1/2 -translate-x-1/2 w-[22%] h-[12%] bg-white rounded-b-full" />

            {/* ── Neck ── */}
            <div className="absolute bottom-[34%] left-1/2 -translate-x-1/2 w-[18%] h-[14%] bg-[#F5C5A3] rounded-full" />

            {/* ── Head ── */}
            <div className="absolute bottom-[38%] left-1/2 -translate-x-1/2 w-[52%] h-[52%] bg-[#F5C5A3] rounded-full" />

            {/* ── Hair (top cap) ── */}
            <div className="absolute bottom-[60%] left-1/2 -translate-x-1/2 w-[52%] h-[28%] bg-[#5C2E0E] rounded-t-full" />
            {/* Hair sides */}
            <div className="absolute bottom-[50%] left-[22%] w-[10%] h-[22%] bg-[#5C2E0E] rounded-full" />
            <div className="absolute bottom-[50%] right-[22%] w-[10%] h-[22%] bg-[#5C2E0E] rounded-full" />

            {/* ── Ears ── */}
            <div className="absolute bottom-[48%] left-[21%] w-[9%] h-[14%] bg-[#F5C5A3] rounded-full" />
            <div className="absolute bottom-[48%] right-[21%] w-[9%] h-[14%] bg-[#F5C5A3] rounded-full" />

            {/* ── Glasses ── left lens ── */}
            <div className="absolute bottom-[51%] left-[27%] w-[20%] h-[17%] rounded-full border-[2px] border-[#2C1A0E] bg-[rgba(200,230,255,0.3)]" />
            {/* right lens */}
            <div className="absolute bottom-[51%] right-[27%] w-[20%] h-[17%] rounded-full border-[2px] border-[#2C1A0E] bg-[rgba(200,230,255,0.3)]" />
            {/* bridge */}
            <div className="absolute bottom-[57%] left-1/2 -translate-x-1/2 w-[6%] h-[2px] bg-[#2C1A0E]" />

            {/* ── Eyes ── */}
            <div className="absolute bottom-[55%] left-[34%] w-[6%] h-[6%] rounded-full bg-[#2C1A0E]" />
            <div className="absolute bottom-[55%] right-[34%] w-[6%] h-[6%] rounded-full bg-[#2C1A0E]" />

            {/* ── Nose ── */}
            <div className="absolute bottom-[45%] left-1/2 -translate-x-1/2 w-[6%] h-[7%] bg-[#E8A882] rounded-full" />

            {/* ── Mouth ── */}
            <div className="absolute bottom-[40%] left-1/2 -translate-x-1/2 w-[24%] h-[4%] bg-[#C07050] rounded-full" />
        </div>
    )
}
