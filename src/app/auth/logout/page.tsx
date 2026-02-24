"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, UserCircle2, HelpCircle, LifeBuoy } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/shared/branding/logo";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth/auth.store";

export default function LogoutPage() {
    const router = useRouter();
    const logout = useAuthStore((state) => state.logout);
    const [countdown, setCountdown] = useState(2);

    useEffect(() => {
        // Perform logout immediately when page loads
        logout();

        // Setup countdown timer
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [logout]);

    // Separate effect for navigation to avoid side-effect in state updater
    useEffect(() => {
        if (countdown === 0) {
            router.push("/auth/login");
        }
    }, [countdown, router]);

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col font-sans">
            {/* Header */}
            <header className="bg-white border-b border-neutral-100 px-6 py-3 flex items-center justify-between">
                <Logo href="/" width={120} height={36} />

                <div className="flex items-center gap-2 sm:gap-4 text-neutral-600">
                    <Link href="/help" className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-neutral-200 text-sm font-semibold hover:bg-neutral-50 transition-colors">
                        Help Center
                    </Link>
                    <Link href="/support" className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-neutral-200 text-sm font-semibold hover:bg-neutral-50 transition-colors">
                        Support
                    </Link>
                    <div className="ml-2 bg-[#fbd9cc] p-1.5 rounded-full text-[#953002]">
                        <UserCircle2 className="w-6 h-6" />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-md bg-white rounded-[32px] p-10 shadow-sm border border-neutral-100 flex flex-col items-center text-center">
                    {/* Success Icon */}
                    <div className="mb-6 bg-emerald-50 p-3 rounded-full">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </div>

                    <h1 className="text-3xl font-extrabold text-[#282828] mb-2">
                        Logged Out Successfully
                    </h1>
                    <p className="text-neutral-500 mb-8 max-w-[280px]">
                        You have been securely logged out. Thank you for using our platform.
                    </p>

                    {/* Redirect indicator */}
                    <div className="w-full mb-8 bg-[#fdf2ee] rounded-2xl p-4 relative overflow-hidden">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-neutral-600 text-[14px] font-medium flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></span>
                                Redirecting to login...
                            </span>
                            <span className="text-neutral-400 text-xs font-bold">{countdown}s</span>
                        </div>
                        {/* Progress Bar Background */}
                        <div className="h-1.5 w-full bg-neutral-200/50 rounded-full overflow-hidden">
                            {/* Progress Bar Fill */}
                            <div
                                className="h-full bg-[#953002] transition-all duration-1000 ease-linear rounded-full"
                                style={{ width: `${(1 - (countdown / 2)) * 100}%` }}
                            />
                        </div>
                    </div>

                    <Button
                        asChild
                        className="w-full h-14 rounded-full bg-[#953002] hover:bg-[#7a2600] text-lg font-extrabold mb-6 transition-all shadow-md shadow-orange-900/10"
                    >
                        <Link href="/auth/login">Go to Login Now</Link>
                    </Button>

                    <p className="text-neutral-400 text-xs">
                        If you are not redirected,{" "}
                        <Link href="/auth/login" className="text-[#953002] font-bold hover:underline">
                            click here
                        </Link>
                    </p>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-6 border-t border-neutral-100 bg-neutral-50 text-center">
                <p className="text-neutral-400 text-[13px] font-medium tracking-tight">
                    © 2026 PRIME STAY. All Rights Reserved.
                </p>
            </footer>
        </div>
    );
}
