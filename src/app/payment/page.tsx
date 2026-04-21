import { Metadata } from "next";
import PaymentFlow from "@/components/features/payment/payment-flow";

export const metadata: Metadata = {
    title: "Secure Payment — Prime Stay",
    description: "Complete your booking with a secure payment.",
};

export default function PaymentPage() {
    return (
        <main className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4">
            <PaymentFlow />
        </main>
    );
}
