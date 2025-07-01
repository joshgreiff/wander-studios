import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from 'next/link';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wander Studios | Pilates, Yoga & Wellness",
  description: "Pilates, yoga, and wellness classes for all bodies. Virtual and in-person. Join our inclusive community!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 72 72'%3E%3Ctext y='60' font-size='60'%3E%F0%9F%92%8C%3C/text%3E%3C/svg%3E" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="w-full bg-gradient-to-r from-orange-400 via-orange-500 to-red-400 shadow-md">
          <nav className="max-w-4xl mx-auto flex items-center justify-between px-4 py-3">
            <Link href="/" className="text-2xl font-bold text-white tracking-tight">Wander Studios</Link>
            <ul className="flex gap-4 text-white font-semibold text-lg">
              <li><Link href="/" className="hover:underline">Home</Link></li>
              <li><Link href="/book" className="hover:underline">Book</Link></li>
              <li><Link href="/waiver" className="hover:underline">Waiver</Link></li>
              <li><Link href="/about" className="hover:underline">About</Link></li>
              <li><Link href="/contact" className="hover:underline">Contact</Link></li>
              {/* <li><Link href="/thank-you" className="hover:underline">Thank You</Link></li> */}
            </ul>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
