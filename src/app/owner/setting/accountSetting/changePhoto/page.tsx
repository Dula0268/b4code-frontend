/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import {
    Bell,
        ArrowLeft,
    UploadCloud,
    Trash2,
    Image as ImageIcon
} from "lucide-react";

/* ───────────────────── component ───────────────────── */

/**
 * ChangePhotoPage Component
 *
 * Interface for uploading or removing the owner profile photo,
 * with image preview and upload progress feedback.
 */
export default function ChangePhotoPage() {
    const [preview, setPreview] = useState<string | null>("https://api.dicebear.com/7.x/avataaars/svg?seed=kasun");
    const [isDragging, setIsDragging] = useState(false);



    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    };

    const removePhoto = () => {
        setPreview(null);
    };

    return (
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Header */}
                <div className="flex justify-end items-center py-2 px-8 shrink-0">
                    <div className="flex items-center gap-3.5">
                        <a href="/owner/message" className="bg-transparent border-none cursor-pointer p-1 rounded-md flex items-center no-underline hover:bg-[#f5f5f5] transition-colors">
                            <Bell size={18} color="#4f4f4f" />
                        </a>
                        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[var(--brand-primary)]">
                            <img src={preview || "https://api.dicebear.com/7.x/avataaars/svg?seed=owner"} alt="" className="w-full h-full rounded-full object-cover" />
                        </div>
                    </div>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto px-8 pb-10">
                    {/* Breadcrumb */}
                    <div className="flex items-center mb-1 gap-2">
                        <a href="/owner/setting/accountSetting" className="flex items-center justify-center w-6 h-6 rounded-full bg-white border border-[#e0e0e0] cursor-pointer hover:bg-[#f5f5f5] text-[#4f4f4f] transition-all duration-150">
                            <ArrowLeft size={12} />
                        </a>
                        <div className="flex items-center">
                            <a href="/owner/setting/accountSetting" className="text-[12px] font-semibold text-[#828282] no-underline hover:text-[#4f4f4f]">Settings</a>
                            <span className="text-[#b0b0b0] mx-1">/</span>
                            <a href="/owner/setting/accountSetting" className="text-[12px] font-semibold text-[#828282] no-underline hover:text-[#4f4f4f]">Account Settings</a>
                            <span className="text-[#b0b0b0] mx-1">/</span>
                            <span className="text-[12px] font-semibold text-[var(--brand-primary)]">Change Photo</span>
                        </div>
                    </div>

                    <h1 className="text-[26px] font-black text-[#1d1d1d] m-0 mb-1 mt-3">Profile Photo</h1>
                    <p className="text-[13px] text-[#828282] m-0 mb-6">Upload a professional photo so guests and hosts can recognize you.</p>

                    {/* Centered Form */}
                    <div className="max-w-[500px] mx-auto mt-8">
                        <div className="bg-white border border-[#e8e8e8] rounded-xl py-6 px-7 flex flex-col items-center">
                            
                            {/* Current / Preview Image */}
                            <div className="relative mb-6 group">
                                <div className="w-[140px] h-[140px] rounded-full overflow-hidden border-4 border-[#f0f0f0] bg-[#fafafa] flex items-center justify-center transition-all duration-300 shadow-sm">
                                    {preview ? (
                                        <img src={preview} alt="Profile preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <ImageIcon size={40} color="#d0d0d0" />
                                    )}
                                </div>
                                {preview && (
                                    <button 
                                        onClick={removePhoto}
                                        className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border border-[#e0e0e0] flex items-center justify-center cursor-pointer text-[#eb5757] hover:bg-[#fff5f5] hover:border-[#eb5757] transition-all duration-200 shadow-sm opacity-0 group-hover:opacity-100"
                                        title="Remove Photo"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>

                            {/* Dropzone */}
                            <div 
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={handleDrop}
                                className={`w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all duration-200 ${
                                    isDragging ? "border-[var(--brand-primary)] bg-[#fef5ef]" : "border-[#d0d0d0] bg-[#fafafa] hover:border-[#b0b0b0]"
                                }`}
                            >
                                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm mb-3">
                                    <UploadCloud size={20} color={isDragging ? "#953002" : "#828282"} />
                                </div>
                                <div className="text-[14px] font-bold text-[#1d1d1d] mb-1">
                                    Drag and drop your photo here
                                </div>
                                <div className="text-[12px] text-[#828282] mb-4">
                                    Supports JPG, PNG, WEBP (Max 5MB)
                                </div>
                                
                                <input 
                                    type="file" 
                                    id="photo-upload" 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                                <label 
                                    htmlFor="photo-upload"
                                    className="py-2 px-5 bg-white border border-[#e0e0e0] rounded-lg text-[12px] font-bold text-[#4f4f4f] cursor-pointer hover:bg-[#f5f5f5] transition-colors shadow-sm"
                                >
                                    Browse Files
                                </label>
                            </div>

                        </div>

                        {/* Bottom Actions */}
                        <div className="flex gap-3 pt-5 justify-center">
                            <a href="/owner/setting/accountSetting" className="no-underline">
                                <button className="py-2.5 px-6 bg-white text-[#1d1d1d] border border-[#e0e0e0] rounded-lg text-[13px] font-semibold cursor-pointer hover:bg-[#f5f5f5] transition-colors">
                                    Cancel
                                </button>
                            </a>
                            <a href="/owner/setting/accountSetting" className="no-underline">
                                <button className="py-2.5 px-6 bg-[var(--brand-primary)] text-white border-none rounded-lg text-[13px] font-bold cursor-pointer hover:bg-[var(--primary-hover)] transition-colors">
                                    Save Photo
                                </button>
                            </a>
                        </div>
                    </div>

                </div>
            </main>
    );
}
