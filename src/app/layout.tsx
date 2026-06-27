import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AuthInitializer from "@/components/shared/auth-initializer";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hospitality Booking Platform",
  description: "A modern hospitality marketplace for property booking and F&B ordering",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthInitializer />
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
