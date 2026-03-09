import BookingTopbar from "@/components/shared/layout/guest-shell/booking-topbar"
import QrScannerPage from "@/components/features/guest/my-room/qr-scanner-page"

export const metadata = {
    title: "Scan to Order — Prime Stay Sri Lanka",
    description: "Scan the QR code in your room to browse the digital food & beverage menu.",
}

export default function QrScannerRoute() {
    return (
        <div className="min-h-screen flex flex-col bg-[#f7f5f2]">
            <BookingTopbar />
            <main className="flex-1">
                <QrScannerPage />
            </main>
            <footer className="bg-[#e9e6e0] py-5 text-center text-[13px] text-[#6b6762]">
                © 2026 PRIME STAY. All Rights Reserved.
            </footer>
        </div>
    )
}
