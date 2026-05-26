import OwnerProfileLayout from "@/components/owner/profile/owner-profile-layout";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function OwnerProfileRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-[#F6F8F7]">
      {/* Basic header since Owner portal doesn't have a global topbar yet */}
      <header className="h-16 bg-white border-b border-[#e0e0e0] flex items-center px-8 z-50">
        <Link href="/owner" className="flex items-center gap-2 text-[#666] hover:text-[#111] transition-colors font-medium">
          <ChevronLeft size={20} />
          Back to Dashboard
        </Link>
      </header>
      
      <main className="flex-1 p-6 lg:p-10 w-full max-w-6xl mx-auto flex flex-col items-center">
        <OwnerProfileLayout>{children}</OwnerProfileLayout>
      </main>
    </div>
  );
}
