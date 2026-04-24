import GuestTopbar from "@/components/shared/layout/guest-shell/guest-topbar"
import QrScannerPage from "@/components/features/guest/my-room/qr-scanner-page"

export const metadata = {
    title: "Scan to Order — Prime Stay Sri Lanka",
    description: "Scan the QR code in your room to browse the digital food & beverage menu.",
}

import GuestFooter from "@/components/shared/layout/guest-shell/guest-footer"

export default function QrScannerRoute() {
    return (
        <div className="min-h-screen flex flex-col bg-[var(--bg)]">
            <GuestTopbar />
            <main className="flex-1">
                <QrScannerPage />
            </main>
            <GuestFooter />
        </div>
    )
}
