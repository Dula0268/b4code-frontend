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
  title: "Primestay",
  description: "A modern hospitality marketplace for property booking and F&B ordering",
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
      <body className={`${inter.variable} font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <AuthInitializer />
          {children}
          <Toaster position="top-right" />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
