import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#0a0a0d",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Proxima Elec — Electronic & Audio Visual Products",
    template: "%s | Proxima Elec",
  },
  description:
    "Proxima Elec — premium speakers, headphones, earbuds, TVs and electronics in Algeria. Order online, pay cash on delivery, fast shipping to 100 wilayas.",
  keywords: [
    "Proxima Elec",
    "electronics Algeria",
    "speakers",
    "headphones",
    "earbuds",
    "airpods",
    "bluetooth speaker",
    "TV",
    "audio store",
  ],
  openGraph: {
    title: "Proxima Elec — Electronic & Audio Visual Products",
    description:
      "Premium speakers, headphones, earbuds and electronics. Order on WhatsApp, delivered to your door.",
    images: ["/logo.jpg"],
    type: "website",
    siteName: "Proxima Elec",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground`}
      >
        <Providers>{children}</Providers>
        <Toaster theme="dark" position="bottom-center" richColors />
      </body>
    </html>
  );
}
