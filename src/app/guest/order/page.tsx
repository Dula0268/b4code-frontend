import WelcomeModal from "@/components/features/guest/ordering/landing/welcome-modal";
import MenuClient from "@/components/guest/order/menu/menu-client";

export default function GuestOrderLanding() {
  // TEMP: later comes from QR validation API (property + room/table)
  const propertyName = "Riverside Resort";
  const locationLabel = "Room 304";

  return (
    <div className="relative">
      {/* Menu page shown behind the overlay (non-interactive) */}
      <div className="pointer-events-none select-none" aria-hidden="true">
        <MenuClient />
      </div>

      {/* Welcome overlay modal */}
      <WelcomeModal propertyName={propertyName} locationLabel={locationLabel} />
    </div>
  );
}
