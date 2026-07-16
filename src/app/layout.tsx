import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import { Suspense } from 'react';
import ForbiddenAlert from '@/components/ui/ForbiddenAlert';
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

export const metadata: Metadata = {
  title: "Tennis Suite | Elite Organizer",
  description: "The premier unified suite for niche sports tournaments and broadcasting.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable}`}>
      <body>
        <Suspense fallback={null}>
          <ForbiddenAlert />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
