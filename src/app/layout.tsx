import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "../components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wander Movement | Pilates, Yoga & Dance",
  description: "Pilates, yoga, and dance classes for all bodies. Virtual and in-person. Join our inclusive community!",
  openGraph: {
    title: "Wander Movement | Pilates, Yoga & Dance",
    description: "Pilates, yoga, and dance classes for all bodies. Virtual and in-person. Join our inclusive community!",
    url: "https://wandermovement.space",
    siteName: "Wander Movement",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Wander Movement | Pilates, Yoga & Dance",
    description: "Pilates, yoga, and dance classes for all bodies. Virtual and in-person. Join our inclusive community!",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <Navigation />
        {children}
      </body>
    </html>
  );
}
