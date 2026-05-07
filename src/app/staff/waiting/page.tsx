"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock, Loader2 } from "lucide-react";

export default function WaitingPage() {
    const router = useRouter();

    const checkStatus = async () => {
        try {
            const user = JSON.parse(localStorage.getItem("auth_user") || "{}");
            const propertyId = localStorage.getItem("selected_property_id");

            if (!user.userId || !propertyId) return;

            const res = await fetch(
                `http://localhost:8080/api/staff/status?staffId=${user.userId}&propertyId=${propertyId}`
            );

            if (!res.ok) return; // don't crash if 500

            const data = await res.json();
            console.log("Status:", data);

            if (data === "APPROVED") {
                router.push("/staff");
            }
        } catch (err) {
            console.error("Status check failed", err);
        }
    };

    useEffect(() => {
        // check immediately
        checkStatus();

        // then check every 3 seconds
        const interval = setInterval(checkStatus, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-[#F6F8F7] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center border border-[#eee]">

                <div className="w-16 h-16 mx-auto rounded-full bg-[rgba(149,48,2,0.1)] flex items-center justify-center mb-5">
                    <Clock size={30} className="text-[#953002]" />
                </div>

                <h1 className="text-xl font-bold text-[#282828]">
                    Waiting for owner approval
                </h1>

                <p className="text-sm text-[#666] mt-2">
                    Your property selection has been sent. Please wait while the owner approves your request.
                </p>

                <div className="mt-6 flex justify-center">
                    <Loader2 className="animate-spin text-[#953002]" size={28} />
                </div>

                <div className="mt-6 inline-flex items-center px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">
                    Pending Approval
                </div>

                <p className="text-xs text-[#999] mt-6">
                    You will be automatically redirected once approved
                </p>

            </div>
        </div>
    );
}