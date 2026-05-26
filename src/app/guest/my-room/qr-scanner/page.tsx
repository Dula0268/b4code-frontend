import GuestTopbar from "@/components/shared/layout/guest-shell/guest-topbar"
import GuestFooter from "@/components/shared/layout/guest-shell/guest-footer"
import QrScannerPageClient from "@/components/guest/my-room/qr-scanner/qr-scanner-client"

export const metadata = {
    title: "Scan to Order — Prime Stay Sri Lanka",
    description: "Scan the QR code in your room to browse the digital food & beverage menu.",
}

export default function QrScannerPage() {
    return (
        <div className="min-h-screen flex flex-col bg-[var(--bg)]">
            <GuestTopbar />
            <main className="flex-1">
                <QrScannerPageClient />
            </main>
            <GuestFooter />
        </div>
    )
}
