import type { Metadata } from "next";
import OwnerPageLayout from "@/components/owner/layout/owner-page-layout";

export const metadata: Metadata = {
  title: "Primestay Owner Dashboard",
  description: "Progressive Web Application for Primestay Property Owners",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Primestay Owner",
  },
};

export const viewport = {
  themeColor: "#C05621",
};

export default async function OwnerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <OwnerPageLayout>
      {children}
    </OwnerPageLayout>
  );
}
