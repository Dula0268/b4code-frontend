/* eslint-disable @next/next/no-img-element */
"use client";

import Logo from "@/components/shared/branding/logo";
import {
    Bell as BellIcon,
    ChevronRight,
    ArrowLeft,
    Check,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Edit2,
    Shield
} from "lucide-react";

export default function ViewStaffProfilePage() {
    // Hardcoded mock mock data for display
    const staff = {
        name: "Sarah Jenkins",
        role: "Property Manager",
        email: "s.jenkins@downtownloft.com",
        phone: "+1 (555) 123-4567",
        status: "Active",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=b6e3f4",
        joined: "October 12, 2023",
        location: "New York, NY",
        perms: {
            reservations: true,
            calendar: true,
            pricing: false,
            messaging: true,
            settings: false
        }
    };

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
                    <span className="text-[#828282] font-semibold">Downtown Luxury Loft</span>
                    <ChevronRight size={14} color="#b0b0b0" />
                    <a href="/owner/properties/Staff" className="text-[#828282] no-underline hover:text-[#953002] transition-colors">Staff</a>
                    <ChevronRight size={14} color="#b0b0b0" />
                    <span className="text-[#953002] font-semibold">{staff.name}</span>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto pb-8 pr-1 mt-4">
                    <div className="flex items-center gap-3 mb-6">
                        <a href="/owner/properties/Staff" className="w-8 h-8 rounded-full border border-[#e0e0e0] bg-white flex items-center justify-center text-[#4f4f4f] hover:bg-[#f5f5f5] transition-colors cursor-pointer text-decoration-none">
                            <ArrowLeft size={14} />
                        </a>
                        <div className="flex-1">
                            <h1 className="text-[24px] font-black text-[#1d1d1d] m-0 mb-1">Staff Profile</h1>
                        </div>
                        <button className="flex items-center gap-2 py-2 px-4 bg-white border border-[#e0e0e0] rounded-lg text-[13px] font-bold text-[#1d1d1d] cursor-pointer hover:bg-[#f5f5f5] transition-colors">
                            <Edit2 size={14} />
                            Edit Profile
                        </button>
                    </div>

                    <div className="max-w-[700px]">
                        {/* Profile Header Card */}
                        <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden mb-5">
                            <div className="h-24 bg-gradient-to-r from-[#eef2f6] to-[#e1e9f0]"></div>
                            <div className="px-6 pb-6 relative">
                                <div className="absolute top-[-40px] left-6 w-[80px] h-[80px] rounded-full border-4 border-white overflow-hidden bg-white shadow-sm">
                                    <img src={staff.avatar} alt={staff.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex justify-between items-end pt-12">
                                    <div>
                                        <h2 className="text-[20px] font-bold text-[#1d1d1d] m-0 flex items-center gap-2">
                                            {staff.name}
                                            <span className="px-2 py-0.5 rounded-[4px] bg-[#eef8f1] text-[#2ebd59] text-[10px] font-bold uppercase tracking-wide border border-[#bceac9]">
                                                {staff.status}
                                            </span>
                                        </h2>
                                        <p className="text-[14px] text-[#4f4f4f] m-0 mt-1">{staff.role}</p>
                                    </div>
                                    <button className="py-2 px-5 bg-white text-[#df3737] border border-[#f5b8b8] rounded-lg text-[12px] font-bold cursor-pointer hover:bg-[#fdf4f4] transition-colors">
                                        Suspend Access
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Two Columns Details */}
                        <div className="grid grid-cols-2 gap-5">
                            {/* Contact Info */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl p-5">
                                <h3 className="text-[14px] font-bold text-[#1d1d1d] m-0 mb-4 pb-2 border-b border-[#f0f0f0]">Contact Information</h3>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[#fafafa] border border-[#e0e0e0] flex items-center justify-center text-[#828282]">
                                            <Mail size={14} />
                                        </div>
                                        <div>
                                            <div className="text-[11px] font-bold text-[#828282]">Email Address</div>
                                            <div className="text-[13px] text-[#1d1d1d] font-medium">{staff.email}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[#fafafa] border border-[#e0e0e0] flex items-center justify-center text-[#828282]">
                                            <Phone size={14} />
                                        </div>
                                        <div>
                                            <div className="text-[11px] font-bold text-[#828282]">Phone Number</div>
                                            <div className="text-[13px] text-[#1d1d1d] font-medium">{staff.phone}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[#fafafa] border border-[#e0e0e0] flex items-center justify-center text-[#828282]">
                                            <MapPin size={14} />
                                        </div>
                                        <div>
                                            <div className="text-[11px] font-bold text-[#828282]">Location</div>
                                            <div className="text-[13px] text-[#1d1d1d] font-medium">{staff.location}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[#fafafa] border border-[#e0e0e0] flex items-center justify-center text-[#828282]">
                                            <Calendar size={14} />
                                        </div>
                                        <div>
                                            <div className="text-[11px] font-bold text-[#828282]">Joined Platform</div>
                                            <div className="text-[13px] text-[#1d1d1d] font-medium">{staff.joined}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Permissions */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl p-5">
                                <h3 className="text-[14px] font-bold text-[#1d1d1d] m-0 mb-4 pb-2 border-b border-[#f0f0f0]">Assigned Permissions</h3>
                                
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className={`mt-0.5 w-[14px] h-[14px] rounded-[3px] border flex items-center justify-center ${staff.perms.reservations ? "bg-[#953002] border-[#953002]" : "border-[#e0e0e0] bg-white opacity-50"}`}>
                                            {staff.perms.reservations && <Check size={10} color="white" strokeWidth={3} />}
                                        </div>
                                        <div className={`text-[13px] font-medium ${staff.perms.reservations ? "text-[#1d1d1d]" : "text-[#b0b0b0]"}`}>Manage Reservations</div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className={`mt-0.5 w-[14px] h-[14px] rounded-[3px] border flex items-center justify-center ${staff.perms.calendar ? "bg-[#953002] border-[#953002]" : "border-[#e0e0e0] bg-white opacity-50"}`}>
                                            {staff.perms.calendar && <Check size={10} color="white" strokeWidth={3} />}
                                        </div>
                                        <div className={`text-[13px] font-medium ${staff.perms.calendar ? "text-[#1d1d1d]" : "text-[#b0b0b0]"}`}>View Availability Calendar</div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className={`mt-0.5 w-[14px] h-[14px] rounded-[3px] border flex items-center justify-center ${staff.perms.messaging ? "bg-[#953002] border-[#953002]" : "border-[#e0e0e0] bg-white opacity-50"}`}>
                                            {staff.perms.messaging && <Check size={10} color="white" strokeWidth={3} />}
                                        </div>
                                        <div className={`text-[13px] font-medium ${staff.perms.messaging ? "text-[#1d1d1d]" : "text-[#b0b0b0]"}`}>Guest Messaging</div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className={`mt-0.5 w-[14px] h-[14px] rounded-[3px] border flex items-center justify-center ${staff.perms.pricing ? "bg-[#953002] border-[#953002]" : "border-[#e0e0e0] bg-white opacity-50"}`}>
                                            {staff.perms.pricing && <Check size={10} color="white" strokeWidth={3} />}
                                        </div>
                                        <div className={`text-[13px] font-medium ${staff.perms.pricing ? "text-[#1d1d1d]" : "text-[#b0b0b0]"}`}>Manage Pricing</div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className={`mt-0.5 w-[14px] h-[14px] rounded-[3px] border flex items-center justify-center ${staff.perms.settings ? "bg-[#953002] border-[#953002]" : "border-[#e0e0e0] bg-white opacity-50"}`}>
                                            {staff.perms.settings && <Check size={10} color="white" strokeWidth={3} />}
                                        </div>
                                        <div className={`text-[13px] font-medium ${staff.perms.settings ? "text-[#1d1d1d]" : "text-[#b0b0b0]"}`}>Property Settings</div>
                                    </div>
                                </div>
                                
                                <div className="mt-5 pt-4 border-t border-[#f0f0f0] flex items-start gap-3 bg-[#fafafa] p-3 rounded-lg">
                                    <Shield size={16} className="text-[#953002] shrink-0 mt-0.5" />
                                    <p className="text-[11px] text-[#4f4f4f] m-0">
                                        Staff permissions dictate their dashboard access. Profile editing is restricted to Owner roles.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}