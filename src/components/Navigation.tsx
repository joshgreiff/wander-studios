"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Navigation() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is logged in as admin
    if (typeof window !== 'undefined') {
      const adminStatus = localStorage.getItem('isAdmin') === 'true';
      setIsAdmin(adminStatus);

      // Listen for admin login status changes
      const handleAdminStatusChange = (event: CustomEvent) => {
        setIsAdmin(event.detail.isAdmin);
      };

      window.addEventListener('adminLoginStatusChanged', handleAdminStatusChange as EventListener);

      // Cleanup event listener
      return () => {
        window.removeEventListener('adminLoginStatusChanged', handleAdminStatusChange as EventListener);
      };
    }
  }, []);

  return (
    <header className="w-full bg-gradient-to-r from-orange-400 via-orange-500 to-red-400 shadow-md">
      <nav className="max-w-4xl mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="text-2xl font-bold text-white tracking-tight">Wander Movement</Link>
        <ul className="flex gap-4 text-white font-semibold text-lg">
          <li><Link href="/" className="hover:underline">Home</Link></li>
          <li><Link href="/book" className="hover:underline">Book</Link></li>
          <li><Link href="/waiver" className="hover:underline">Waiver</Link></li>
          <li><Link href="/about" className="hover:underline">About</Link></li>
          <li><Link href="/contact" className="hover:underline">Contact</Link></li>
          {isAdmin && (
            <li>
              <Link 
                href="/admin" 
                className="hover:underline bg-white/20 px-2 py-1 rounded text-sm"
                title="Admin Dashboard"
              >
                Admin
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
} 