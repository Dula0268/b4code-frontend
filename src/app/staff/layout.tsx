import type { Metadata } from "next";
import PwaRegistrar from "@/components/shared/pwa-registrar";
import StaffPageLayout from "@/components/staff/layout/staff-page-layout";

export const metadata: Metadata = {
  title: "Primestay Staff Dashboard",
  description: "Progressive Web Application for Primestay Staff",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Primestay Staff",
  },
};

export const viewport = {
  themeColor: "#C05621",
};

export default async function StaffLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <PwaRegistrar />
      <StaffPageLayout>
        {children}
      </StaffPageLayout>
    </>
  );
}