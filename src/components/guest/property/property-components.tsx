import { CheckCircle2, BedDouble, Users, SquareDot } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export interface Room {
    id: string;
    name: string;
    maxGuests: number;
    bedType: string;
    sqft: number;
    pricePerNight: number;
    originalPrice?: number;
    tag?: string;
    features: string[];
    imageSrc: string;
    availableCount?: number;
}

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

    const availableCount = room.availableCount ?? 1;

    return (
        <div className="flex flex-col gap-3 p-3 border border-[#e8e8e8] rounded-2xl hover:border-[var(--brand-primary)]/30 hover:shadow-md transition-all bg-white w-[240px] flex-shrink-0 snap-start">
            <div className="relative w-full h-[140px] flex-shrink-0 rounded-xl overflow-hidden bg-[#f3ede8]">
                <Image src={room.imageSrc} alt={room.name} fill className="object-cover" sizes="240px" />
            </div>

            <div className="flex-1 flex flex-col justify-start gap-1">
                <h3 className="text-[14px] font-semibold text-[#1d1d1d] leading-snug truncate">{room.name}</h3>

                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[#828282]">
                    <span className="flex items-center gap-1"><Users size={11} /> {room.maxGuests}</span>
                    <span className="flex items-center gap-1"><BedDouble size={11} /> {room.bedType}</span>
                    <span className={`flex items-center gap-1 font-medium w-full mt-0.5 ${availableCount > 0 ? 'text-[var(--state-success)]' : 'text-red-500'}`}>
                        {availableCount > 0 ? (
                            <><CheckCircle2 size={11} /> {availableCount} {availableCount === 1 ? 'room' : 'rooms'} available</>
                        ) : (
                            <><SquareDot size={11} /> Sold Out</>
                        )}
                    </span>
                </div>
            </div>

            <div className="flex items-end justify-between gap-2 mt-auto pt-3 border-t border-[#e8e8e8]">
                <div>
                    <p className="text-[15px] font-bold text-[#1d1d1d]">{formatLKR(room.pricePerNight)}</p>
                    <p className="text-[10px] text-[#828282]">per night</p>
                </div>
                <div className="flex items-center gap-2">
                    {availableCount === 0 ? (
                        <button
                            disabled
                            className="bg-[#f0f0f0] text-[#a0a0a0] px-4 py-1.5 rounded-lg text-[13px] font-semibold cursor-not-allowed"
                        >
                            Sold Out
                        </button>
                    ) : selectedQuantity === 0 ? (
                        <button
                            onClick={() => onQuantityChange?.(1)}
                            className="bg-[var(--brand-primary)] text-white px-4 py-1.5 rounded-lg text-[13px] font-semibold hover:bg-[var(--brand-primary)]/90 transition-colors"
                        >
                            Select
                        </button>
                    ) : (
                        <select
                            value={selectedQuantity}
                            onChange={(e) => onQuantityChange?.(Number(e.target.value))}
                            className="border border-[var(--brand-primary)] bg-[var(--brand-primary)]/5 rounded-lg px-2 py-1.5 text-[13px] font-semibold text-[var(--brand-primary)] outline-none focus:ring-1 focus:ring-[var(--brand-primary)] cursor-pointer"
                        >
                            {Array.from({ length: availableCount + 1 }).map((_, i) => (
                                <option key={i} value={i}>
                                    {i === 0 ? '0 (Remove)' : `${i} Room${i > 1 ? 's' : ''}`}
                                </option>
                            ))}
                        </select>
                    )}
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
