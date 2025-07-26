"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';

export default function Navigation() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="w-full bg-gradient-to-r from-orange-400 via-orange-500 to-red-400 shadow-md">
      <nav className="max-w-4xl mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="text-2xl font-bold text-white tracking-tight">Wander Movement</Link>
        
        {/* Desktop Navigation */}
        <ul className="hidden md:flex gap-4 text-white font-semibold text-lg">
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

        {/* Mobile Hamburger Button */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden flex justify-center items-center w-8 h-8 text-white text-xl"
          aria-label="Toggle mobile menu"
        >
          <FontAwesomeIcon 
            icon={isMobileMenuOpen ? faTimes : faBars} 
            className="transition-all duration-300"
          />
        </button>
      </nav>

      {/* Mobile Navigation Menu */}
      <div className={`md:hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <ul className="bg-orange-500 text-white font-semibold text-lg px-4 pb-4 space-y-2">
          <li><Link href="/" onClick={closeMobileMenu} className="block py-2 hover:bg-orange-600 rounded px-2">Home</Link></li>
          <li><Link href="/book" onClick={closeMobileMenu} className="block py-2 hover:bg-orange-600 rounded px-2">Book</Link></li>
          <li><Link href="/waiver" onClick={closeMobileMenu} className="block py-2 hover:bg-orange-600 rounded px-2">Waiver</Link></li>
          <li><Link href="/about" onClick={closeMobileMenu} className="block py-2 hover:bg-orange-600 rounded px-2">About</Link></li>
          <li><Link href="/contact" onClick={closeMobileMenu} className="block py-2 hover:bg-orange-600 rounded px-2">Contact</Link></li>
          {isAdmin && (
            <li>
              <Link 
                href="/admin" 
                onClick={closeMobileMenu}
                className="block py-2 hover:bg-orange-600 rounded px-2 bg-white/20"
                title="Admin Dashboard"
              >
                Admin
              </Link>
            </li>
          )}
        </ul>
      </div>
    </header>
  );
} 