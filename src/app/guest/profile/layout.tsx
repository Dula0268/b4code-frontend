import GuestTopbar from "@/components/shared/layout/guest-shell/guest-topbar";
import GuestFooter from "@/components/shared/layout/guest-shell/guest-footer";
import GuestProfileLayout from "@/components/features/guest/profile/guest-profile-layout";

export default function GuestProfileRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-[#f8f6f5]">
      <GuestTopbar />
      <main className="flex-1 mt-[80px] p-6 lg:p-10 w-full max-w-6xl mx-auto flex flex-col items-center">
        <GuestProfileLayout>{children}</GuestProfileLayout>
      </main>
      <GuestFooter />
    </div>
  );
}
