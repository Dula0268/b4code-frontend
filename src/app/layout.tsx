import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AuthInitializer from "@/components/shared/auth-initializer";
import PwaRegistrar from "@/components/shared/pwa-registrar";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Primestay Staff Dashboard",
  description: "A modern hospitality marketplace for property booking and F&B ordering",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Primestay",
  },
};

export const viewport = {
  themeColor: "#C05621",
};

import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <PwaRegistrar />
          <AuthInitializer />
          {children}
          <Toaster position="top-right" />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
