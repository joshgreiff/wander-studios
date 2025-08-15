"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';

type User = {
  id: number;
  email: string;
  name: string;
  isAdmin?: boolean;
};

export default function Navigation() {
  const [user, setUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check for user on initial load
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Listen for storage changes (when user logs in/out)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user') {
        if (e.newValue) {
          setUser(JSON.parse(e.newValue));
        } else {
          setUser(null);
        }
      }
    };

    // Listen for custom events (for same-tab login/logout)
    const handleUserChange = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      } else {
        setUser(null);
      }
      };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLogin', handleUserChange);
    window.addEventListener('userLogout', handleUserChange);

      return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogin', handleUserChange);
      window.removeEventListener('userLogout', handleUserChange);
      };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    closeMobileMenu();
    // Dispatch custom event for same-tab logout
    window.dispatchEvent(new Event('userLogout'));
    window.location.href = '/';
  };

  return (
    <header className="w-full bg-gradient-to-r from-orange-400 via-orange-500 to-red-400 shadow-md relative">
      <nav className="max-w-4xl mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="text-2xl font-bold text-white tracking-tight">Wander Movement</Link>
        
        {/* Desktop Navigation - Show on medium screens and larger */}
        <ul className="hidden md:flex gap-4 text-white font-semibold text-lg">
          <li><Link href="/classes" className="hover:underline">Classes</Link></li>
          <li><Link href="/about" className="hover:underline">About</Link></li>
          <li><Link href="/contact" className="hover:underline">Contact</Link></li>
          <li><Link href="/waiver" className="hover:underline">Waiver</Link></li>
          
          {user ? (
            <>
              <li><Link href="/packages" className="hover:underline">Packages</Link></li>
              <li><Link href="/dashboard" className="hover:underline">Dashboard</Link></li>
              {user.isAdmin && (
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
              <li>
                <button onClick={handleLogout} className="hover:underline">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li><Link href="/login" className="hover:underline">Login</Link></li>
          )}
        </ul>

        {/* Mobile Hamburger Button - Only show on small screens */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden flex justify-center items-center w-8 h-8 text-white hamburger-button"
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? (
            // X icon
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            // Hamburger icon
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-orange-500 shadow-lg z-50">
          <ul className="text-white font-semibold text-lg px-4 pb-4 space-y-2">
            <li><Link href="/classes" onClick={closeMobileMenu} className="block py-2 hover:bg-orange-600 rounded px-2">Classes</Link></li>
            <li><Link href="/about" onClick={closeMobileMenu} className="block py-2 hover:bg-orange-600 rounded px-2">About</Link></li>
            <li><Link href="/contact" onClick={closeMobileMenu} className="block py-2 hover:bg-orange-600 rounded px-2">Contact</Link></li>
            <li><Link href="/waiver" onClick={closeMobileMenu} className="block py-2 hover:bg-orange-600 rounded px-2">Waiver</Link></li>
            
            {user ? (
              <>
                <li><Link href="/packages" onClick={closeMobileMenu} className="block py-2 hover:bg-orange-600 rounded px-2">Packages</Link></li>
                <li><Link href="/dashboard" onClick={closeMobileMenu} className="block py-2 hover:bg-orange-600 rounded px-2">Dashboard</Link></li>
                {user.isAdmin && (
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
                <li>
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left py-2 hover:bg-orange-600 rounded px-2"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li><Link href="/login" onClick={closeMobileMenu} className="block py-2 hover:bg-orange-600 rounded px-2">Login</Link></li>
            )}
          </ul>
        </div>
      )}
    </header>
  );
} 