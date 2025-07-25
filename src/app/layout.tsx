import type { Metadata } from "next";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navigation />
        {children}
      </body>
    </html>
  );
}
