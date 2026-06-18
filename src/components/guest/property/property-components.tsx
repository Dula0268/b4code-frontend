import { CheckCircle2, BedDouble, Users, SquareDot } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import type { Room } from "@/lib/mock-properties"

function formatLKR(n: number) {
    return `LKR ${n.toLocaleString("en-US")}`
}

export function RoomCard({ room, propertyId, selectedQuantity = 0, onQuantityChange }: { room: Room; propertyId: string; selectedQuantity?: number; onQuantityChange?: (qty: number) => void }) {
    const searchParams = useSearchParams()
    const query = searchParams && searchParams.toString() ? `?${searchParams.toString()}` : ""

    const tagStyle =
        room.tag === "Refundable"
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : room.tag === "Popular"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-red-50 text-red-700 border-red-200"

    return (
        <div className="flex flex-col sm:flex-row gap-4 p-4 border border-[#e8e8e8] rounded-2xl hover:border-[var(--brand-primary)]/30 hover:shadow-md transition-all bg-white">
            <div className="relative w-full sm:w-[140px] h-[180px] sm:h-[100px] flex-shrink-0 rounded-xl overflow-hidden bg-[#f3ede8]">
                <Image src={room.imageSrc} alt={room.name} fill className="object-cover" sizes="140px" />
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="text-[15px] font-semibold text-[#1d1d1d] leading-snug">{room.name}</h3>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[#828282]">
                    <span className="flex items-center gap-1"><Users size={12} /> {room.maxGuests} Guests</span>
                    <span className="flex items-center gap-1"><BedDouble size={12} /> {room.bedType}</span>
                </div>
            </div>

            <div className="flex-shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-2 mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#e8e8e8]">
                <div className="text-left sm:text-right">
                    <p className="text-[18px] font-bold text-[#1d1d1d]">{formatLKR(room.pricePerNight)}</p>
                    <p className="text-[11px] text-[#828282]">per night</p>
                </div>
                <select
                    value={selectedQuantity}
                    onChange={(e) => onQuantityChange?.(Number(e.target.value))}
                    className="px-4 py-2 border border-[#e8e8e8] text-[13px] font-semibold rounded-xl focus:outline-none focus:border-[var(--brand-primary)] bg-white cursor-pointer"
                >
                    {[0, 1, 2, 3, 4, 5].map((num) => (
                        <option key={num} value={num}>
                            {num === 0 ? "Select Rooms" : `${num} ${num === 1 ? 'Room' : 'Rooms'}`}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    )
}

export function RatingBar({ label, score }: { label: string; score: number }) {
    return (
        <div className="flex items-center gap-3">
            <span className="text-[13px] text-[#555] w-28 flex-shrink-0">{label}</span>
            <div className="flex-1 h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                <div
                    className="h-full bg-[var(--brand-primary)] rounded-full transition-all"
                    style={{ width: `${(score / 5) * 100}%` }}
                />
            </div>
            <span className="text-[13px] font-semibold text-[#1d1d1d] w-8 text-right">{score.toFixed(1)}</span>
        </div>
    )
}
