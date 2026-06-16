import { CheckCircle2, BedDouble, Users, SquareDot } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import type { Room } from "@/lib/mock-properties"

function formatLKR(n: number) {
    return `LKR ${n.toLocaleString("en-US")}`
}

export function RoomCard({ room, propertyId, selectedQuantity = 0, onQuantityChange }: { room: Room; propertyId: string, selectedQuantity?: number, onQuantityChange?: (qty: number) => void }) {
    const searchParams = useSearchParams()
    const query = searchParams && searchParams.toString() ? `?${searchParams.toString()}` : ""

    const handleIncrement = () => onQuantityChange && onQuantityChange(selectedQuantity + 1)
    const handleDecrement = () => onQuantityChange && onQuantityChange(Math.max(0, selectedQuantity - 1))


    return (
        <div className="flex flex-col sm:flex-row bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden hover:shadow-[var(--shadow-card)] transition-all duration-300">
            <div className="relative w-full sm:w-[35%] sm:min-w-[200px] aspect-[4/3] sm:aspect-auto bg-[#f3ede8] shrink-0">
                <Image src={room.imageSrc} alt={room.name} fill className="object-cover" sizes="(max-width: 640px) 100vw, 35vw" />
            </div>

            <div className="flex flex-col flex-1 p-5 gap-3">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="text-[18px] font-bold text-[#1d1d1d] leading-snug">{room.name}</h3>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[14px] text-[#666]">
                    <span className="flex items-center gap-1.5"><Users size={16} /> {room.maxGuests} Guests</span>
                    <span className="flex items-center gap-1.5"><BedDouble size={16} /> {room.bedType}</span>
                    <span className="flex items-center gap-1.5 text-[var(--brand-primary)] font-medium"><SquareDot size={16} /> {room.numberOfRooms} available</span>
                </div>

                <div className="mt-auto pt-4 border-t border-[var(--border)] flex items-end justify-between gap-2">
                    <div>
                        <p className="text-[20px] font-bold text-[#1d1d1d]">{formatLKR(room.pricePerNight)}</p>
                        <p className="text-[12px] text-[#828282]">per night</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {selectedQuantity > 0 ? (
                            <div className="flex items-center bg-white border border-[#e0e0e0] rounded-xl overflow-hidden shadow-sm">
                                <button onClick={handleDecrement} className="px-4 py-2 hover:bg-[#f5f5f5] text-[#1d1d1d] font-bold transition-colors cursor-pointer border-r border-[#e0e0e0]">-</button>
                                <span className="px-5 py-2 font-semibold text-[15px] min-w-[50px] text-center">{selectedQuantity}</span>
                                <button onClick={handleIncrement} disabled={selectedQuantity >= room.numberOfRooms} className="px-4 py-2 hover:bg-[#f5f5f5] text-[#1d1d1d] font-bold transition-colors cursor-pointer border-l border-[#e0e0e0] disabled:opacity-50">+</button>
                            </div>
                        ) : (
                            <button
                                onClick={() => onQuantityChange && onQuantityChange(1)}
                                disabled={room.numberOfRooms <= 0}
                                className={`px-6 py-2.5 text-white text-[14px] font-bold rounded-xl transition-colors cursor-pointer whitespace-nowrap border-none bg-[var(--brand-primary)] hover:bg-[#6d2200] disabled:opacity-50`}
                            >
                                {room.numberOfRooms > 0 ? "Select Room" : "Select"}
                            </button>
                        )}
                    </div>
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
