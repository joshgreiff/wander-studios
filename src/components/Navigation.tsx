"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Navigation() {
  const [user, setUser] = useState<any>(null);

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

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    // Dispatch custom event for same-tab logout
    window.dispatchEvent(new Event('userLogout'));
    window.location.href = '/';
  };

  return (
    <nav className="bg-orange-600 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-xl font-bold hover:text-orange-200 transition-colors">
            Wander Studios
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link href="/classes" className="hover:text-orange-200 transition-colors">
              Classes
            </Link>
            <Link href="/about" className="hover:text-orange-200 transition-colors">
              About
            </Link>
            <Link href="/contact" className="hover:text-orange-200 transition-colors">
              Contact
            </Link>
            <Link href="/waiver" className="hover:text-orange-200 transition-colors">
              Waiver
            </Link>
            
            {user ? (
              <>
                <Link href="/packages" className="hover:text-orange-200 transition-colors">
                  Packages
                </Link>
                <Link href="/dashboard" className="hover:text-orange-200 transition-colors">
                  Dashboard
                </Link>
                {user.isAdmin && (
                  <Link href="/admin" className="hover:text-orange-200 transition-colors">
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="hover:text-orange-200 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" className="hover:text-orange-200 transition-colors">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 