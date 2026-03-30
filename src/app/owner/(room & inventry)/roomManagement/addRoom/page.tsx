"use client";

import { useState } from "react";
import Logo from "@/components/shared/branding/logo";
import {
    Bell,
    ChevronDown,
    Users,
    SmilePlus,
    ImagePlus,
    Save,
} from "lucide-react";

/* ───────────────────── types ───────────────────── */

type RoomStatusOption = "Active" | "Maintenance";

const roomTypes = [
    "King Suite",
    "Queen Suite",
    "Deluxe King",
    "Single Studio",
    "Double Room",
    "Family Loft",
    "Penthouse",
    "Standard Room",
];

/* ───────────────────── component ───────────────────── */

export default function AddRoomPage() {
    const [roomName, setRoomName] = useState("");
    const [roomType, setRoomType] = useState("King Suite");
    const [maxAdults, setMaxAdults] = useState("2");
    const [maxChildren, setMaxChildren] = useState("0");
    const [nightlyRate, setNightlyRate] = useState("0.00");
    const [description, setDescription] = useState("");
    const [roomStatus, setRoomStatus] = useState<RoomStatusOption>("Active");
    const [dragOver, setDragOver] = useState(false);

    return (
        <div className="flex flex-col h-screen w-screen fixed top-0 left-0 bg-[#faf9f7] overflow-hidden font-sans">
            {/* ── Top Bar ── */}
            <header className="flex items-center justify-between py-3 px-8 bg-white border-b border-[#e8e8e8] shrink-0">
                <Logo width={120} height={36} />
                <div className="flex items-center gap-3.5">
                    <button className="bg-transparent border-none cursor-pointer p-1 rounded-md flex items-center hover:bg-[#f5f5f5] transition-colors">
                        <Bell size={18} color="#4f4f4f" />
                    </button>
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#953002]">
                        <img
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=owner"
                            alt="User"
                            className="w-full h-full rounded-full"
                        />
                    </div>
                </div>
            </header>

            {/* ── Scrollable Body ── */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-[820px] mx-auto py-6 px-6">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-[11px] font-bold tracking-[0.8px] uppercase mb-6">
                        <a
                            href="/owner/properties"
                            className="text-[#828282] no-underline hover:text-[#953002] transition-colors"
                        >
                            Properties
                        </a>
                        <span className="text-[#d0d0d0]">›</span>
                        <a
                            href="/owner/properties"
                            className="text-[#828282] no-underline hover:text-[#953002] transition-colors"
                        >
                            Downtown Luxury Loft
                        </a>
                        <span className="text-[#d0d0d0]">›</span>
                        <span className="text-[#953002]">Add New Room</span>
                    </nav>

                    {/* ── Form Card ── */}
                    <div className="bg-white border border-[#e8e8e8] rounded-2xl py-8 px-10">
                        {/* Title */}
                        <h1 className="text-[24px] font-extrabold text-[#1d1d1d] m-0 leading-tight">
                            Add New Room
                        </h1>
                        <p className="text-[13px] text-[#828282] mt-1.5 mb-8">
                            Configure the details for the new inventory unit at Sunset Luxury Villa.
                        </p>

                        {/* ── Row 1: Room Name + Type ── */}
                        <div className="grid grid-cols-[1.2fr_1fr] gap-6 mb-6">
                            {/* Room Name */}
                            <div>
                                <label className="block text-[13px] font-bold text-[#1d1d1d] mb-2">
                                    Room Name
                                </label>
                                <input
                                    type="text"
                                    value={roomName}
                                    onChange={(e) => setRoomName(e.target.value)}
                                    placeholder="e.g. Garden View Suite"
                                    className="w-full py-2.5 px-3.5 border border-[#e0e0e0] rounded-lg text-[14px] text-[#1d1d1d] outline-none font-sans bg-white box-border placeholder:text-[#c0c0c0] focus:border-[#953002] transition-colors"
                                />
                            </div>

                            {/* Room Type */}
                            <div>
                                <label className="block text-[13px] font-bold text-[#1d1d1d] mb-2">
                                    Room Type
                                </label>
                                <div className="relative">
                                    <select
                                        value={roomType}
                                        onChange={(e) => setRoomType(e.target.value)}
                                        className="w-full py-2.5 pr-10 pl-3.5 border border-[#e0e0e0] rounded-lg text-[14px] text-[#1d1d1d] outline-none font-sans bg-white appearance-none cursor-pointer box-border focus:border-[#953002] transition-colors"
                                    >
                                        {roomTypes.map((t) => (
                                            <option key={t} value={t}>
                                                {t}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown
                                        size={16}
                                        color="#828282"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ── Row 2: Max Adults, Max Children, Nightly Rate ── */}
                        <div className="grid grid-cols-3 gap-6 mb-6">
                            {/* Max Adults */}
                            <div>
                                <label className="block text-[13px] font-bold text-[#1d1d1d] mb-2">
                                    Max Adults
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <Users size={16} color="#828282" />
                                    </div>
                                    <input
                                        type="number"
                                        min="1"
                                        max="20"
                                        value={maxAdults}
                                        onChange={(e) => setMaxAdults(e.target.value)}
                                        className="w-full py-2.5 pl-10 pr-3.5 border border-[#e0e0e0] rounded-lg text-[14px] text-[#1d1d1d] outline-none font-sans bg-white box-border focus:border-[#953002] transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Max Children */}
                            <div>
                                <label className="block text-[13px] font-bold text-[#1d1d1d] mb-2">
                                    Max Children
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <SmilePlus size={16} color="#828282" />
                                    </div>
                                    <input
                                        type="number"
                                        min="0"
                                        max="10"
                                        value={maxChildren}
                                        onChange={(e) => setMaxChildren(e.target.value)}
                                        className="w-full py-2.5 pl-10 pr-3.5 border border-[#e0e0e0] rounded-lg text-[14px] text-[#1d1d1d] outline-none font-sans bg-white box-border focus:border-[#953002] transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Nightly Rate */}
                            <div>
                                <label className="block text-[13px] font-bold text-[#1d1d1d] mb-2">
                                    Nightly Rate
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] font-semibold text-[#828282] pointer-events-none">
                                        Rs
                                    </span>
                                    <input
                                        type="text"
                                        value={nightlyRate}
                                        onChange={(e) => setNightlyRate(e.target.value)}
                                        className="w-full py-2.5 pl-10 pr-3.5 border border-[#e0e0e0] rounded-lg text-[14px] text-[#1d1d1d] outline-none font-sans bg-white box-border focus:border-[#953002] transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ── Room Description ── */}
                        <div className="mb-7">
                            <label className="block text-[13px] font-bold text-[#1d1d1d] mb-2">
                                Room Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe the room features, view, and unique selling points..."
                                rows={4}
                                className="w-full py-3 px-3.5 border border-[#e0e0e0] rounded-lg text-[14px] text-[#1d1d1d] outline-none font-sans bg-white box-border resize-y leading-relaxed placeholder:text-[#c0c0c0] focus:border-[#953002] transition-colors"
                            />
                        </div>

                        {/* ── Room Status ── */}
                        <div className="flex items-center justify-between mb-7 py-1">
                            <div>
                                <span className="text-[13px] font-bold text-[#1d1d1d] block">
                                    Room Status
                                </span>
                                <span className="text-[12px] text-[#b0b0b0] mt-0.5 block">
                                    Set the initial availability state of the room.
                                </span>
                            </div>
                            <div className="flex border border-[#e0e0e0] rounded-lg overflow-hidden">
                                {(["Active", "Maintenance"] as RoomStatusOption[]).map(
                                    (opt) => (
                                        <button
                                            key={opt}
                                            onClick={() => setRoomStatus(opt)}
                                            className={`py-2 px-5 text-[13px] font-semibold border-none cursor-pointer transition-all duration-150 ${
                                                roomStatus === opt
                                                    ? opt === "Active"
                                                        ? "bg-[#e8f5e9] text-[#27ae60]"
                                                        : "bg-[#fff8e1] text-[#f2994a]"
                                                    : "bg-white text-[#828282] hover:bg-[#fafafa]"
                                            }`}
                                        >
                                            {opt}
                                        </button>
                                    )
                                )}
                            </div>
                        </div>

                        {/* ── Room Photos ── */}
                        <div className="mb-8">
                            <label className="block text-[13px] font-bold text-[#1d1d1d] mb-2">
                                Room Photos
                            </label>
                            <div
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setDragOver(true);
                                }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setDragOver(false);
                                }}
                                className={`flex flex-col items-center justify-center py-10 px-6 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
                                    dragOver
                                        ? "border-[#953002] bg-[#fef5ef]"
                                        : "border-[#e0d8d0] bg-[#fef9f5] hover:border-[#d4a88c]"
                                }`}
                            >
                                <div className="w-12 h-12 rounded-full bg-[#fceede] flex items-center justify-center mb-3">
                                    <ImagePlus size={22} color="#d4915c" />
                                </div>
                                <span className="text-[13px] font-semibold text-[#1d1d1d]">
                                    Click to upload or drag and drop
                                </span>
                                <span className="text-[11px] text-[#b0b0b0] mt-1">
                                    PNG, JPG, WEBP up to 10MB each
                                </span>
                            </div>
                        </div>

                        {/* ── Divider ── */}
                        <div className="h-px bg-[#e8e8e8] mb-5" />

                        {/* ── Actions ── */}
                        <div className="flex justify-end items-center gap-4">
                            <a
                                href="/owner/roomManagement"
                                className="py-2.5 px-7 bg-white text-[#4f4f4f] border-none rounded-lg text-[13px] font-semibold cursor-pointer no-underline hover:bg-[#f5f5f5] transition-colors"
                            >
                                Cancel
                            </a>
                            <button className="flex items-center gap-2 py-2.5 px-7 bg-[#953002] text-white border-none rounded-lg text-[13px] font-bold cursor-pointer hover:bg-[#a63602] transition-colors">
                                <Save size={15} />
                                Save Room
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
