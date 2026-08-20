"use client";

import { useAuthStore } from "@/store/auth/auth.store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: string[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
    const { user, isAuthenticated, isRestoring } = useAuthStore();
    const router = useRouter();
    const [isUnauthorized, setIsUnauthorized] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted || isRestoring) return;

        if (!isAuthenticated || !user) {
            const redirectPath = encodeURIComponent(window.location.pathname + window.location.search);
            router.replace(`/auth/login?redirect=${redirectPath}`);
            return;
        }

        const userRole = user.role.toLowerCase();
        if (!allowedRoles.includes(userRole)) {
            setIsUnauthorized(true);
        } else {
            setIsUnauthorized(false);
        }
    }, [isAuthenticated, user, isRestoring, allowedRoles, router, mounted]);

    // Show Access Denied UI
    if (isUnauthorized && user) {
        const userRole = user.role.toLowerCase();
        const homePath = 
            userRole === "admin" || userRole === "owner" ? "/owner" :
            userRole === "staff" ? "/staff" :
            "/guest/booking";

        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#fcfaf9] p-6 text-center">
                <div className="w-20 h-20 bg-[#953002]/10 rounded-full flex items-center justify-center mb-6 text-[#953002]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </div>
                <h1 className="text-3xl font-extrabold text-[#282828] mb-3">Access Denied</h1>
                <p className="text-neutral-500 max-w-md mb-8 leading-relaxed font-medium">
                    Sorry, your account role (<span className="text-[#953002] font-bold uppercase">{userRole}</span>) 
                    does not have permission to view the <span className="text-[#282828] font-bold uppercase">{allowedRoles.join(" & ")}</span> section.
                </p>
                <div className="flex gap-4">
                    <button 
                        onClick={() => router.back()}
                        className="px-6 h-12 rounded-full border-2 border-neutral-200 text-neutral-600 font-bold hover:bg-neutral-50 transition-all"
                    >
                        Go Back
                    </button>
                    <button 
                        onClick={() => router.push(homePath)}
                        className="px-6 h-12 rounded-full bg-[#953002] text-white font-bold hover:bg-[#7a2600] transition-all shadow-md"
                    >
                        Return to My Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // Don't render children until we're sure they have access
    if (!mounted || isRestoring || !isAuthenticated || !user || !allowedRoles.includes(user.role.toLowerCase())) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-8 h-8 border-4 border-t-[#9a3300] border-neutral-200 rounded-full animate-spin" />
            </div>
        );
    }

    return <>{children}</>;
}
