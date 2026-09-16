import type { Metadata } from "next";
import PwaRegistrar from "@/components/shared/pwa-registrar";
import OwnerPageLayout from "@/components/owner/layout/owner-page-layout";

export const metadata: Metadata = {
  title: "Primestay Owner Portal",
  description: "Progressive Web Application for Primestay Property Owners",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Primestay Owner",
  },
};

export const viewport = {
  themeColor: "#953002",
};

export default async function OwnerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <PwaRegistrar />
      <OwnerPageLayout>
        {children}
      </OwnerPageLayout>
    </>
  );
}
