/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import Logo from "@/components/shared/branding/logo";
import {
    Bell as BellIcon,
    ChevronRight,
    ArrowLeft,
    Check,
    Upload
} from "lucide-react";

/**
 * AddStaffPage Component
 *
 * Form for adding a new staff member to a property, including
 * personal details, role assignment, and access permissions.
 */
export default function AddStaffPage() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [role, setRole] = useState("Property Manager");
    const [status, setStatus] = useState("Active");

    const [perms, setPerms] = useState({
        reservations: true,
        calendar: true,
        pricing: false,
        messaging: true,
        settings: false
    });

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
                        <a href="/owner/message" className="bg-transparent border-none cursor-pointer p-1 rounded-md flex items-center no-underline hover:bg-[#f5f5f5] transition-colors">
                            <BellIcon size={18} color="#4f4f4f" />
                        </a>
                        <a href="/owner/profile" className="block w-[30px] h-[30px] rounded-full overflow-hidden border-2 border-[#953002] hover:opacity-80 transition-opacity">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=owner" alt="" className="w-full h-full rounded-full" />
                        </a>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 text-[12px] mb-1.5">
                    <a href="/owner/properties" className="text-[#828282] no-underline hover:text-[#953002] transition-colors">Properties</a>
                    <ChevronRight size={14} color="#b0b0b0" />
                    <span className="text-[#828282] font-semibold">Property Name</span>
                    <ChevronRight size={14} color="#b0b0b0" />
                    <a href="/owner/properties/Staff" className="text-[#828282] no-underline hover:text-[#953002] transition-colors">Staff</a>
                    <ChevronRight size={14} color="#b0b0b0" />
                    <span className="text-[#953002] font-semibold">Add New Staff</span>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto pb-8 pr-1 mt-4">
                    <div className="flex items-center gap-3 mb-6">
                        <a href="/owner/properties/Staff" className="w-8 h-8 rounded-full border border-[#e0e0e0] bg-white flex items-center justify-center text-[#4f4f4f] hover:bg-[#f5f5f5] transition-colors cursor-pointer text-decoration-none">
                            <ArrowLeft size={14} />
                        </a>
                        <div>
                            <h1 className="text-[24px] font-black text-[#1d1d1d] m-0 mb-1">Add New Staff</h1>
                            <p className="text-[13px] text-[#828282] m-0">Create a new staff profile and assign their roles and permissions.</p>
                        </div>
                    </div>

                    <div className="max-w-[700px] bg-white border border-[#e8e8e8] rounded-xl overflow-hidden text-[#1d1d1d]">
                        {/* Two Columns Layout for form */}
                        <div className="grid grid-cols-[1fr_300px] divide-x divide-[#f0f0f0]">
                            {/* Left Side - Details */}
                            <div className="p-6">
                                <h3 className="text-[15px] font-bold m-0 mb-4">Personal Information</h3>
                                
                                <div className="flex items-center gap-4 mb-5">
                                    <div className="w-[70px] h-[70px] rounded-full bg-[#f5f5f5] border border-[#e0e0e0] border-dashed flex flex-col items-center justify-center text-[#828282] cursor-pointer hover:bg-[#fafafa]">
                                        <Upload size={16} className="mb-1" />
                                        <span className="text-[9px] font-medium">Avatar</span>
                                    </div>
                                    <div className="flex-1 text-[11px] text-[#828282]">
                                        Upload a profile picture. <br/> Recommended size: 200x200px.
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="flex flex-col">
                                        <label className="text-[11px] font-bold text-[#4f4f4f] mb-1.5">First Name</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. John"
                                            value={firstName} 
                                            onChange={(e) => setFirstName(e.target.value)} 
                                            className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] outline-none font-sans box-border focus:border-[#953002] transition-colors" 
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-[11px] font-bold text-[#4f4f4f] mb-1.5">Last Name</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. Doe"
                                            value={lastName} 
                                            onChange={(e) => setLastName(e.target.value)} 
                                            className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] outline-none font-sans box-border focus:border-[#953002] transition-colors" 
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col mb-4">
                                    <label className="text-[11px] font-bold text-[#4f4f4f] mb-1.5">Email Address</label>
                                    <input 
                                        type="email" 
                                        placeholder="john.doe@example.com"
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)} 
                                        className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] outline-none font-sans box-border focus:border-[#953002] transition-colors" 
                                    />
                                </div>

                                <div className="flex flex-col mb-6">
                                    <label className="text-[11px] font-bold text-[#4f4f4f] mb-1.5">Phone Number</label>
                                    <input 
                                        type="tel" 
                                        placeholder="+1 (555) 000-0000"
                                        value={phone} 
                                        onChange={(e) => setPhone(e.target.value)} 
                                        className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] outline-none font-sans box-border focus:border-[#953002] transition-colors" 
                                    />
                                </div>

                                <div className="p-4 bg-[#fffbf5] border border-[#fde8df] rounded-lg">
                                    <h4 className="text-[12px] font-bold text-[#953002] m-0 mb-1">Invitation Link</h4>
                                    <p className="text-[11px] text-[#4f4f4f] m-0">An invitation email will be sent to this staff member with a link to set their password.</p>
                                </div>
                            </div>

                            {/* Right Side - Roles & Permissions */}
                            <div className="p-6 bg-[#fafafa]">
                                <h3 className="text-[15px] font-bold m-0 mb-4">Role & Status</h3>

                                <div className="flex flex-col mb-4">
                                    <label className="text-[11px] font-bold text-[#4f4f4f] mb-1.5">Assigned Role</label>
                                    <select 
                                        value={role} 
                                        onChange={(e) => setRole(e.target.value)} 
                                        className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] outline-none font-sans bg-white box-border focus:border-[#953002] transition-colors"
                                    >
                                        <option value="Property Manager">Property Manager</option>
                                        <option value="Maintenance Supervisor">Maintenance Supervisor</option>
                                        <option value="Housekeeping Lead">Housekeeping Lead</option>
                                        <option value="Front Desk Agent">Front Desk Agent</option>
                                    </select>
                                </div>

                                <div className="flex flex-col mb-6">
                                    <label className="text-[11px] font-bold text-[#4f4f4f] mb-1.5">Status</label>
                                    <select 
                                        value={status} 
                                        onChange={(e) => setStatus(e.target.value)} 
                                        className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] outline-none font-sans bg-white box-border focus:border-[#953002] transition-colors"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>

                                <h4 className="text-[12px] font-bold text-[#1d1d1d] m-0 mb-3">Permissions</h4>

                                <div className="space-y-3">
                                    <label className="flex items-start gap-2 cursor-pointer group">
                                        <div className={`mt-0.5 w-[14px] h-[14px] rounded-[3px] border flex items-center justify-center transition-colors ${perms.reservations ? "bg-[#953002] border-[#953002]" : "border-[#b0b0b0] bg-white group-hover:border-[#953002]"}`}>
                                            {perms.reservations && <Check size={10} color="white" strokeWidth={3} />}
                                        </div>
                                        <input type="checkbox" className="hidden" checked={perms.reservations} onChange={(e) => setPerms({...perms, reservations: e.target.checked})} />
                                        <div className="flex-1">
                                            <div className="text-[12px] font-medium text-[#4f4f4f]">Manage Reservations</div>
                                        </div>
                                    </label>

                                    <label className="flex items-start gap-2 cursor-pointer group">
                                        <div className={`mt-0.5 w-[14px] h-[14px] rounded-[3px] border flex items-center justify-center transition-colors ${perms.calendar ? "bg-[#953002] border-[#953002]" : "border-[#b0b0b0] bg-white group-hover:border-[#953002]"}`}>
                                            {perms.calendar && <Check size={10} color="white" strokeWidth={3} />}
                                        </div>
                                        <input type="checkbox" className="hidden" checked={perms.calendar} onChange={(e) => setPerms({...perms, calendar: e.target.checked})} />
                                        <div className="flex-1">
                                            <div className="text-[12px] font-medium text-[#4f4f4f]">View Availability Calendar</div>
                                        </div>
                                    </label>

                                    <label className="flex items-start gap-2 cursor-pointer group">
                                        <div className={`mt-0.5 w-[14px] h-[14px] rounded-[3px] border flex items-center justify-center transition-colors ${perms.messaging ? "bg-[#953002] border-[#953002]" : "border-[#b0b0b0] bg-white group-hover:border-[#953002]"}`}>
                                            {perms.messaging && <Check size={10} color="white" strokeWidth={3} />}
                                        </div>
                                        <input type="checkbox" className="hidden" checked={perms.messaging} onChange={(e) => setPerms({...perms, messaging: e.target.checked})} />
                                        <div className="flex-1">
                                            <div className="text-[12px] font-medium text-[#4f4f4f]">Guest Messaging</div>
                                        </div>
                                    </label>

                                    <label className="flex items-start gap-2 cursor-pointer group">
                                        <div className={`mt-0.5 w-[14px] h-[14px] rounded-[3px] border flex items-center justify-center transition-colors ${perms.pricing ? "bg-[#953002] border-[#953002]" : "border-[#b0b0b0] bg-white group-hover:border-[#953002]"}`}>
                                            {perms.pricing && <Check size={10} color="white" strokeWidth={3} />}
                                        </div>
                                        <input type="checkbox" className="hidden" checked={perms.pricing} onChange={(e) => setPerms({...perms, pricing: e.target.checked})} />
                                        <div className="flex-1">
                                            <div className="text-[12px] font-medium text-[#4f4f4f]">Manage Pricing</div>
                                        </div>
                                    </label>

                                    <label className="flex items-start gap-2 cursor-pointer group">
                                        <div className={`mt-0.5 w-[14px] h-[14px] rounded-[3px] border flex items-center justify-center transition-colors ${perms.settings ? "bg-[#953002] border-[#953002]" : "border-[#b0b0b0] bg-white group-hover:border-[#953002]"}`}>
                                            {perms.settings && <Check size={10} color="white" strokeWidth={3} />}
                                        </div>
                                        <input type="checkbox" className="hidden" checked={perms.settings} onChange={(e) => setPerms({...perms, settings: e.target.checked})} />
                                        <div className="flex-1">
                                            <div className="text-[12px] font-medium text-[#4f4f4f]">Property Settings</div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Actions */}
                        <div className="flex justify-end gap-3 p-5 bg-[#fafafa] border-t border-[#f0f0f0]">
                            <a href="/owner/properties/Staff" className="no-underline">
                                <button className="py-2 px-5 bg-white text-[#1d1d1d] border border-[#e0e0e0] rounded-lg text-[12px] font-semibold cursor-pointer hover:bg-[#f5f5f5] transition-colors">
                                    Cancel
                                </button>
                            </a>
                            <a href="/owner/properties/Staff" className="no-underline">
                                <button 
                                    disabled={!firstName || !lastName || !email}
                                    className={`py-2 px-6 text-white border-none rounded-lg text-[12px] font-bold cursor-pointer transition-colors ${
                                        !firstName || !lastName || !email
                                            ? "bg-[#d0d0d0] pointer-events-none"
                                            : "bg-[#953002] hover:bg-[#b03a02]"
                                    }`}
                                >
                                    Add Staff
                                </button>
                            </a>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}