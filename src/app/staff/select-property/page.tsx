"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, ChevronRight, MapPin } from "lucide-react";
import { staffApi } from "@/lib/api";

interface Property {
    id: number;
    name: string;
    location: string;
}

export default function SelectPropertyPage() {
    const router = useRouter();
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadProperties();
    }, []);

    const loadProperties = async () => {
        try {
            const data = await staffApi.getAllProperties();
            setProperties(data);
        } catch {
            // Fallback mock properties if backend unavailable
            setProperties([
                { id: 1, name: "Sunset Villa", location: "Colombo, Sri Lanka" },
                { id: 2, name: "Ocean Breeze Suite", location: "Galle, Sri Lanka" },
                { id: 3, name: "Mountain View Resort", location: "Kandy, Sri Lanka" },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = async (id: number, name: string) => {
        try {
            // Save selected property to sessionStorage
            sessionStorage.setItem("selected_property_id", String(id));
            sessionStorage.setItem("selected_property_name", name);

            // Try to notify backend (optional - don't block if fails)
            try {
                const user = JSON.parse(sessionStorage.getItem("auth_user") || "{}");
                if (user.userId) {
                    await fetch(
                        `http://localhost:8080/api/staff/select-property?staffId=${user.userId}&propertyId=${id}`,
                        { method: "POST" }
                    );
                }
            } catch {
                // Backend call failed - continue anyway
                console.log("Backend not available, continuing with local storage");
            }

            router.push("/staff/waiting");
        } catch (error) {
            console.error("Error selecting property:", error);
            router.push("/staff/waiting");
        }
    };
    return (
        <div className="min-h-screen bg-[#F6F8F7] flex items-center justify-center p-4">
            <div className="w-full max-w-[480px]">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-full bg-[rgba(149,48,2,0.1)] flex items-center justify-center mx-auto mb-4">
                        <Building2 size={32} className="text-[#953002]" />
                    </div>
                    <h1 className="text-[24px] font-bold text-[#282828]">Select Property</h1>
                    <p className="text-sm text-[#666] mt-2">
                        Choose the property you are working at today
                    </p>
                </div>

                {/* Property List */}
                {loading ? (
                    <div className="text-center text-sm text-[#666]">Loading properties...</div>
                ) : error ? (
                    <div className="text-center text-sm text-red-500">{error}</div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {properties.map((property) => (
                            <button
                                key={property.id}
                                onClick={() => handleSelect(property.id, property.name)}
                                className="flex items-center justify-between p-4 rounded-xl bg-white border border-[#e0e0e0] hover:border-[#953002] hover:bg-[rgba(149,48,2,0.02)] transition-all text-left group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-[rgba(149,48,2,0.1)] flex items-center justify-center">
                                        <Building2 size={20} className="text-[#953002]" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-[#282828]">{property.name}</p>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <MapPin size={11} className="text-[#666]" />
                                            <p className="text-xs text-[#666]">{property.location}</p>
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight size={18} className="text-[#ccc] group-hover:text-[#953002] transition-colors" />
                            </button>
                        ))}
                    </div>
                )}

                {/* Footer */}
                <p className="text-center text-xs text-[#999] mt-6">
                    Contact your administrator if your property is not listed
                </p>
            </div>
        </div>
    );
}