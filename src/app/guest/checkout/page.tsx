"use client"

import { Suspense } from "react"
import CheckoutPage from "@/components/features/guest/checkout/checkout-page"

export default function CheckoutRoute() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading checkout...</div>}>
            <CheckoutPage />
        </Suspense>
    )
}
