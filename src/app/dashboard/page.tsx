'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type User = {
  id: number;
  email: string;
  name: string;
};

type Booking = {
  id: number;
  name: string;
  email: string;
  paid: boolean;
  createdAt: string;
  class: {
    id: number;
    date: string;
    time: string;
    description: string;
    address?: string;
    isVirtual: boolean;
    virtualLink?: string;
  };
};

type PackageBooking = {
  id: number;
  customerName: string;
  customerEmail: string;
  paid: boolean;
  classesUsed: number;
  classesRemaining: number;
  expiresAt: string;
  createdAt: string;
  package: {
    id: number;
    name: string;
    description: string;
    classCount: number;
    price: number;
  };
  class?: {
    id: number;
    date: string;
    time: string;
    description: string;
    address?: string;
    isVirtual: boolean;
    virtualLink?: string;
  };
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [packageBookings, setPackageBookings] = useState<PackageBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordMessage, setPasswordMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }

    const userObj = JSON.parse(userData);
    setUser(userObj);
    fetchUserData(userObj.id);
  }, [router]);

  const fetchUserData = async (userId: number) => {
    try {
      // Fetch regular bookings
      const bookingsResponse = await fetch(`/api/users/${userId}/bookings`);
      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        setBookings(bookingsData);
      }

      // Fetch package bookings
      const packageBookingsResponse = await fetch(`/api/users/${userId}/package-bookings`);
      if (packageBookingsResponse.ok) {
        const packageBookingsData = await packageBookingsResponse.json();
        setPackageBookings(packageBookingsData);
      }
    } catch (_error) {
      console.error('Error fetching user data:', _error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage('New password must be at least 6 characters');
      return;
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        setPasswordMessage('Password updated successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordChange(false);
      } else {
        const errorData = await response.json();
        setPasswordMessage(errorData.error || 'Failed to update password');
      }
    } catch (_error) {
      setPasswordMessage('Network error. Please try again.');
    }
  };

  const formatDateTime = (date: string, time: string) => {
    try {
      // Parse the date string to extract year, month, day
      // Handle both ISO format (2025-08-31T00:00:00.000Z) and simple format (2025-08-31)
      let year: number, month: number, day: number;
      
      if (date.includes('T')) {
        // ISO format: extract date part before 'T'
        const datePart = date.split('T')[0];
        [year, month, day] = datePart.split('-').map(Number);
      } else {
        // Simple format: YYYY-MM-DD
        [year, month, day] = date.split('-').map(Number);
      }
      
      // Validate the parsed values
      if (!year || !month || !day || isNaN(year) || isNaN(month) || isNaN(day)) {
        console.error('Invalid date components:', { year, month, day, originalDate: date });
        return 'Date Error';
      }
      
      // Create a date object to get the day of the week
      const dateObj = new Date(year, month - 1, day);
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayOfWeek = dayNames[dateObj.getDay()];
      
      // Parse the time string (format: "HH:MM")
      const [hours, minutes] = time.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) {
        console.error('Invalid time components:', { hours, minutes, originalTime: time });
        return 'Time Error';
      }
      
      const hour = hours % 12 || 12;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      
      return `${dayOfWeek} ${month}/${day} ${hour}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    } catch (error) {
      console.error('Error formatting date:', error, 'Date:', date, 'Time:', time);
      return 'Date Error';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      // Parse the date string to extract year, month, day
      let year: number, month: number, day: number;
      
      if (dateString.includes('T')) {
        // ISO format: extract date part before 'T'
        const datePart = dateString.split('T')[0];
        [year, month, day] = datePart.split('-').map(Number);
      } else {
        // Simple format: YYYY-MM-DD
        [year, month, day] = dateString.split('-').map(Number);
      }
      
      // Validate the parsed values
      if (!year || !month || !day || isNaN(year) || isNaN(month) || isNaN(day)) {
        console.error('Invalid date components:', { year, month, day, originalDate: dateString });
        return 'Date Error';
      }
      
      // Create a date object to get the day of the week
      const dateObj = new Date(year, month - 1, day);
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayOfWeek = dayNames[dateObj.getDay()];
      
      return `${dayOfWeek} ${month}/${day}/${year}`;
    } catch (error) {
      console.error('Error formatting date:', error, 'Date:', dateString);
      return 'Date Error';
    }
  };

  const getRemainingClasses = (packageBooking: PackageBooking) => {
    // Use the classesRemaining field from the database
    return packageBooking.classesRemaining;
  };

  const isPackageExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <div className="text-brown-700 font-serif">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-pink-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="bg-pink-50/95 rounded-lg shadow-md p-6 mb-6 border border-pink-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-serif font-bold text-brown-800">Welcome, {user.name}!</h1>
              <p className="text-brown-600 font-serif">{user.email}</p>
            </div>
            <Link
              href="/packages"
              className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700 transition-colors font-serif"
            >
              Buy Class Package
            </Link>
          </div>
        </div>

        {/* Password Change Section */}
        <div className="bg-pink-50/95 rounded-lg shadow-md p-6 mb-6 border border-pink-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-serif font-semibold text-brown-700">Account Settings</h2>
            <button
              onClick={() => setShowPasswordChange(!showPasswordChange)}
              className="text-brown-600 hover:text-brown-800 transition-colors font-serif"
            >
              {showPasswordChange ? 'Cancel' : 'Change Password'}
            </button>
          </div>
          {showPasswordChange && (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-serif font-medium text-brown-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className="w-full border border-pink-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 font-serif"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-serif font-medium text-brown-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="w-full border border-pink-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 font-serif"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-serif font-medium text-brown-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="w-full border border-pink-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 font-serif"
                  required
                />
              </div>
              {passwordMessage && (
                <p className={`text-sm font-serif ${passwordMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
                  {passwordMessage}
                </p>
              )}
              <button
                type="submit"
                className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700 transition-colors font-serif"
              >
                Update Password
              </button>
            </form>
          )}
        </div>

        {/* Package Bookings */}
        {packageBookings.length > 0 && (
          <div className="bg-pink-50/95 rounded-lg shadow-md p-6 mb-6 border border-pink-200">
            <h2 className="text-xl font-serif font-semibold text-brown-700 mb-4">Your Class Packages</h2>
            <div className="space-y-4">
              {packageBookings.map((packageBooking) => (
                <div key={packageBooking.id} className="border border-pink-200 rounded-lg p-4 bg-white/50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-serif font-semibold text-brown-800">{packageBooking.package.name}</h3>
                      <p className="text-sm text-brown-600 font-serif">{packageBooking.package.description}</p>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-brown-600 font-serif">
                          💰 Paid: ${packageBooking.package.price}
                        </p>
                        <p className="text-sm text-brown-600 font-serif">
                          📅 Expires: {formatDate(packageBooking.expiresAt)}
                        </p>
                        <p className="text-sm text-brown-600 font-serif">
                          🎯 Remaining classes: {getRemainingClasses(packageBooking)}/{packageBooking.package.classCount}
                        </p>

                        {isPackageExpired(packageBooking.expiresAt) && (
                          <p className="text-sm text-red-600 font-serif font-semibold">
                            ⚠️ Package expired
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded text-xs font-serif font-semibold ${
                        packageBooking.paid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {packageBooking.paid ? 'Paid' : 'Pending Payment'}
                      </span>
                      {!packageBooking.paid && (
                        <p className="text-xs text-yellow-700 mt-1 font-serif">
                          Complete payment to use
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Class Bookings */}
        {bookings.filter(booking => new Date(booking.class.date) >= new Date()).length > 0 && (
          <div className="bg-pink-50/95 rounded-lg shadow-md p-6 mb-6 border border-pink-200">
            <h2 className="text-xl font-serif font-semibold text-brown-700 mb-4">Upcoming Class Bookings</h2>
            <div className="space-y-4">
              {bookings.filter(booking => new Date(booking.class.date) >= new Date()).map((booking) => (
                <div key={booking.id} className="border border-pink-200 rounded-lg p-4 bg-white/50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-serif font-semibold text-brown-800">{booking.class.description}</h3>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-brown-600 font-serif">
                          📅 {formatDateTime(booking.class.date, booking.class.time)}
                        </p>
                        {booking.class.address && (
                          <p className="text-sm text-brown-600 font-serif">
                            📍 {booking.class.address}
                          </p>
                        )}
                        {booking.class.isVirtual && booking.class.virtualLink && (
                          <p className="text-sm text-blue-600 font-serif">
                            🔗 <a href={booking.class.virtualLink} target="_blank" rel="noopener noreferrer" className="underline">
                              Join Virtual Class
                            </a>
                          </p>
                        )}
                        <p className="text-sm text-brown-600 font-serif">
                          📧 {booking.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded text-xs font-serif font-semibold ${
                        booking.paid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.paid ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Past Classes Taken */}
        {bookings.filter(booking => new Date(booking.class.date) < new Date()).length > 0 && (
          <div className="bg-pink-50/95 rounded-lg shadow-md p-6 mb-6 border border-pink-200">
            <h2 className="text-xl font-serif font-semibold text-brown-700 mb-4">Past Classes Taken</h2>
            <div className="space-y-4">
              {bookings.filter(booking => new Date(booking.class.date) < new Date()).map((booking) => (
                <div key={booking.id} className="border border-pink-200 rounded-lg p-4 bg-white/50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-serif font-semibold text-brown-800">{booking.class.description}</h3>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-brown-600 font-serif">
                          📅 {formatDateTime(booking.class.date, booking.class.time)}
                        </p>
                        {booking.class.address && (
                          <p className="text-sm text-brown-600 font-serif">
                            📍 {booking.class.address}
                          </p>
                        )}
                        <p className="text-sm text-green-600 font-serif">
                          ✅ Completed
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}



        {/* No Bookings Message */}
        {bookings.length === 0 && packageBookings.length === 0 && (
          <div className="bg-pink-50/95 rounded-lg shadow-md p-6 text-center border border-pink-200">
            <h2 className="text-xl font-serif font-semibold text-brown-700 mb-4">No Bookings Yet</h2>
            <p className="text-brown-600 mb-4 font-serif">You haven&apos;t booked any classes yet.</p>
            <div className="space-x-4">
              <Link
                href="/classes"
                className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700 transition-colors font-serif"
              >
                Browse Classes
              </Link>
              <Link
                href="/packages"
                className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 transition-colors font-serif"
              >
                Buy Package
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 