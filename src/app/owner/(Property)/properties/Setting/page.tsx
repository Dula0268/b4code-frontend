/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import Logo from "@/components/shared/branding/logo";
import {
    Bell as BellIcon,
    ChevronRight,
    MapPin,
    Bed,
    Calendar,
    Eye,
    Edit,
    Settings as SettingsIcon,
    Shield,
    CreditCard,
    BellRing,
    AlertTriangle,
    Save
} from "lucide-react";

/* ───────────────────── component ───────────────────── */

/**
 * SettingsPage Component
 *
 * Property-level settings for configuring check-in/out times,
 * house rules, cancellation policies, and tax configurations.
 */
export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("Settings");
    const tabs = ["Overview", "Rooms", "Availability", "Rates", "Reservations", "Media", "Staff", "Settings"];

    return (
        <div className="flex h-screen w-screen fixed top-0 left-0 bg-[#faf9f7] overflow-hidden font-sans">
            {/* ── Sidebar ── */}
            <aside className="w-[160px] bg-white border-r border-[#e0e0e0] py-3 shrink-0 flex flex-col">
                <div className="px-3.5">
                    <Logo width={120} height={36} />
                </div>
            </aside>

            {/* ── Main ── */}
            <main className="flex-1 flex flex-col px-9 min-w-0 overflow-hidden">
                {/* Top Bar */}
                <div className="flex justify-between items-center py-1.5">
                    <div />
                    <div className="flex items-center gap-3">
                        <a href="/owner/ownerDashboard/message" className="bg-transparent border-none cursor-pointer p-1 rounded-md flex items-center no-underline hover:bg-[#f5f5f5] transition-colors">
                            <BellIcon size={18} color="#4f4f4f" />
                        </a>
                        <div className="w-[30px] h-[30px] rounded-full overflow-hidden border-2 border-[#953002]">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=owner" alt="" className="w-full h-full rounded-full" />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 text-[12px] mb-1.5">
                    <a href="/owner/properties" className="text-[#828282] no-underline hover:text-[#953002] transition-colors">Properties</a>
                    <ChevronRight size={14} color="#b0b0b0" />
                    <span className="text-[#953002] font-semibold">Property Name</span>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto pb-4 pr-1">

                    {/* ── Property Header Card ── */}
                    <div className="bg-white border border-[#e8e8e8] rounded-[14px] py-3.5 px-5 flex items-center justify-between mb-0">
                        <div className="flex items-center gap-4 flex-1">
                            <div className="w-[80px] h-[64px] rounded-lg overflow-hidden shrink-0 border-2 border-[#953002]">
                                <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=120&h=90&fit=crop" alt="" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2.5">
                                    <h2 className="text-[20px] font-extrabold m-0 text-[#1d1d1d]">Property Name</h2>
                                    <span className="text-[9px] font-bold text-white bg-[#27ae60] rounded w-max px-[7px] py-[2px] tracking-widest">ACTIVE</span>
                                </div>
                                <div className="text-[12px] text-[#828282] mt-0.5 flex items-center gap-1">
                                    <MapPin size={12} /> 123 Coastal Way, Malibu, CA 90265
                                </div>
                                <div className="text-[12px] text-[#4f4f4f] mt-1 flex items-center gap-3">
                                    <span className="flex items-center gap-[3px]"><Bed size={12} /> 5 Rooms</span>
                                    <span className="flex items-center gap-[3px]"><Calendar size={12} /> Rs. 350,000/night</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2.5">
                            <button className="flex items-center gap-1.5 py-2 px-4 bg-white text-[#1d1d1d] border border-[#e0e0e0] rounded-lg text-[12px] font-semibold cursor-pointer hover:bg-gray-50"><Eye size={14} /> View Live</button>
                            <a href="/owner/properties/editPropertyDetails" className="no-underline">
                                <button className="flex items-center gap-1.5 py-2 px-5 bg-[#953002] text-white border-none rounded-lg text-[12px] font-semibold cursor-pointer hover:bg-[#b03a02]"><Edit size={14} /> Edit Property</button>
                            </a>
                        </div>
                    </div>

                    {/* ── Tabs ── */}
                    <div className="flex border-b border-[#e8e8e8] mb-3 mt-2">
                        {tabs.map((t) => (
                            <button
                                key={t}
                                onClick={() => {
                                    if (t === "Overview") window.location.href = "/owner/properties/propertyDetails";
                                    else if (t === "Rooms") window.location.href = "/owner/properties/propertyRoomInventry";
                                    else if (t === "Availability") window.location.href = "/owner/properties/Availability";
                                    else if (t === "Rates") window.location.href = "/owner/properties/Rate";
                                    else if (t === "Reservations") window.location.href = "/owner/properties/Reservation";
                                    else if (t === "Media") window.location.href = "/owner/properties/Media";
                                    else if (t === "Staff") window.location.href = "/owner/properties/Staff";
                                    else if (t === "Settings") setActiveTab(t);
                                    else setActiveTab(t);
                                }}
                                className={`bg-transparent py-2.5 px-4 text-[13px] cursor-pointer transition-all duration-150 relative ${
                                    activeTab === t ? "text-[#953002] font-bold border-b-2 border-[#953002]" : "text-[#828282] font-medium border-b-2 border-transparent hover:text-[#4f4f4f]"
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    {/* ── Two Column Layout ── */}
                    <div className="grid grid-cols-[1fr_300px] gap-4 items-start">
                        {/* Left Column - General Settings */}
                        <div className="flex flex-col gap-3">
                            <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <SettingsIcon size={16} color="#953002" />
                                    <span className="text-[15px] font-bold text-[#1d1d1d]">General Settings</span>
                                </div>

                                <div className="flex items-center justify-between py-3 border-b border-[#f5f5f5]">
                                    <div>
                                        <div className="text-[13px] font-semibold text-[#1d1d1d]">Instant Booking</div>
                                        <div className="text-[11px] text-[#828282] mt-0.5">Allow guests to instantly book available dates without requiring approval.</div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#27ae60]"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between py-3 border-b border-[#f5f5f5]">
                                    <div>
                                        <div className="text-[13px] font-semibold text-[#1d1d1d]">Hide Property from Search</div>
                                        <div className="text-[11px] text-[#828282] mt-0.5">Temporarily unlist this property from public search results.</div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" />
                                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#953002]"></div>
                                    </label>
                                </div>
                            </div>
                            
                            {/* Cancellation & Policies */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <Shield size={16} color="#953002" />
                                    <span className="text-[15px] font-bold text-[#1d1d1d]">Policies & Cancellation</span>
                                </div>

                                <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1.5">Standard Cancellation Policy</label>
                                <select className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] bg-[#fafafa] box-border min-h-[38px] cursor-pointer mb-4 outline-none focus:border-[#953002]">
                                    <option value="flexible">Flexible (Full refund up to 48 hours prior)</option>
                                    <option value="moderate">Moderate (Full refund up to 5 days prior)</option>
                                    <option value="strict">Strict (Partial refund up to 14 days prior)</option>
                                    <option value="non-refundable">Non-refundable</option>
                                </select>
                                
                                <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1.5">House Rules Overview</label>
                                <textarea placeholder="E.g., No parties, no pets..." className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] bg-[#fafafa] box-border min-h-[80px] outline-none focus:border-[#953002] resize-none" defaultValue={"No smoking inside.\nNo pets allowed.\nQuiet hours after 10 PM."}></textarea>

                                <div className="mt-4 flex justify-end">
                                    <button className="flex items-center gap-1.5 py-2 px-5 bg-[#953002] text-white border-none rounded-lg text-[12px] font-semibold cursor-pointer hover:bg-[#7a2702] transition-colors">
                                        <Save size={14} /> Save Policies
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Danger Zone & Notifications */}
                        <div className="flex flex-col gap-3">
                            <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <BellRing size={16} color="#953002" />
                                    <span className="text-[14px] font-bold text-[#1d1d1d]">Notifications</span>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-2">
                                        <input type="checkbox" className="mt-0.5" defaultChecked />
                                        <div className="text-[12px] text-[#4f4f4f] leading-snug">Notify me by email on new reservations</div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <input type="checkbox" className="mt-0.5" defaultChecked />
                                        <div className="text-[12px] text-[#4f4f4f] leading-snug">Notify me by SMS on immediate cancellations</div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <input type="checkbox" className="mt-0.5" />
                                        <div className="text-[12px] text-[#4f4f4f] leading-snug">Send daily summary digest</div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#fffbf5] border border-[#e8e8e8] rounded-xl py-4 px-5">
                                <div className="flex items-center gap-2 mb-2">
                                    <CreditCard size={16} color="#953002" />
                                    <span className="text-[14px] font-bold text-[#1d1d1d]">Payout Settings</span>
                                </div>
                                <div className="text-[12px] text-[#828282] mb-3 leading-snug">
                                    Current payout method is linked to Bank Account ending in ****1234.
                                </div>
                                <button className="w-full py-2 bg-white text-[#1d1d1d] border border-[#e0e0e0] rounded-lg text-[12px] font-semibold cursor-pointer hover:bg-gray-50 transition-colors">
                                    Manage Payout Methods
                                </button>
                            </div>

                            <div className="bg-[#fdedec] border border-[#fadbd8] rounded-xl py-4 px-5">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle size={16} color="#c0392b" />
                                    <span className="text-[14px] font-bold text-[#c0392b]">Danger Zone</span>
                                </div>
                                <div className="text-[11px] text-[#e74c3c] mb-3 leading-snug">
                                    Deactivating this property will completely remove it from all systems. This action cannot be undone.
                                </div>
                                <button className="w-full py-2 bg-[#c0392b] text-white border border-[#c0392b] rounded-lg text-[12px] font-semibold cursor-pointer hover:bg-[#a93226] transition-colors">
                                    Deactivate Property
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
