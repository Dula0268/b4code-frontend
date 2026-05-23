import { Metadata } from "next";
import { Suspense } from "react";
import PaymentFlow from "@/components/payment/payment-flow";

export const metadata: Metadata = {
    title: "Secure Payment — Prime Stay",
    description: "Complete your booking with a secure payment.",
};

export default function PaymentPage() {
    return (
        <main className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4">
            <Suspense fallback={<div className="text-white">Loading payment portal...</div>}>
                <PaymentFlow />
            </Suspense>
        </main>
    );
}
