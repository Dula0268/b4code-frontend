import { CheckCircle2, BedDouble, Users, SquareDot } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import type { Room } from "@/lib/mock-properties"

function formatLKR(n: number) {
    return `LKR ${n.toLocaleString("en-US")}`
}

export function RoomCard({ room, propertyId, isSelected, onSelect }: { room: Room; propertyId: string, isSelected?: boolean, onSelect?: (room: Room) => void }) {
    const searchParams = useSearchParams()
    const query = searchParams && searchParams.toString() ? `?${searchParams.toString()}` : ""


    return (
        <div className="flex flex-col bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden hover:shadow-[var(--shadow-card)] transition-all duration-300">
            <div className="relative w-full aspect-[4/3] bg-[#f3ede8]">
                <Image src={room.imageSrc} alt={room.name} fill className="object-cover" sizes="(max-width: 640px) 100vw, 50vw" />
            </div>

            <div className="flex flex-col flex-1 p-4 gap-2">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="text-[16px] font-bold text-[#1d1d1d] leading-snug">{room.name}</h3>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[#828282]">
                    <span className="flex items-center gap-1"><Users size={13} /> {room.maxGuests} Guests</span>
                    <span className="flex items-center gap-1"><BedDouble size={13} /> {room.bedType}</span>
                    <span className="flex items-center gap-1"><SquareDot size={13} /> {room.sqft} sq ft</span>
                </div>

                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 mb-2">
                    {room.features.map(f => (
                        <span key={f} className="text-[12px] text-[#555] flex items-center gap-1">
                            <CheckCircle2 size={12} className="text-[var(--brand-primary)]" /> {f}
                        </span>
                    ))}
                </div>

                <div className="mt-auto pt-3 border-t border-[var(--border)] flex items-end justify-between gap-2">
                    <div>
                        {room.originalPrice && (
                            <p className="text-[12px] text-[#aaa] line-through">{formatLKR(room.originalPrice)}</p>
                        )}
                        <p className="text-[18px] font-bold text-[#1d1d1d]">{formatLKR(room.pricePerNight)}</p>
                        <p className="text-[11px] text-[#828282]">per night</p>
                    </div>
                    <button
                        onClick={() => onSelect && onSelect(room)}
                        id={`select-room-${room.id}`}
                        className={`px-4 py-2 text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap border-none ${isSelected ? 'bg-red-600 hover:bg-red-700' : 'bg-[var(--brand-primary)] hover:bg-[#6d2200]'}`}
                    >
                        {isSelected ? 'Remove' : 'Select Room'}
                    </button>
                </div>
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
