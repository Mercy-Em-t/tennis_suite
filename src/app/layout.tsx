import type { Metadata, Viewport } from "next";
import { Outfit, Inter } from "next/font/google";
import { Suspense } from 'react';
import ForbiddenAlert from '@/components/ui/ForbiddenAlert';
import { PwaRegistry } from '@/components/PwaRegistry';
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#070b10",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Tennis Suite | Elite Organizer",
  description: "The premier unified suite for niche sports tournaments and broadcasting.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Tennis Suite",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable}`}>
      <body>
        <PwaRegistry />
        <Suspense fallback={null}>
          <ForbiddenAlert />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
