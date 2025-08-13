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
  redeemed: boolean;
  redeemedAt?: string;
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
    } catch (error) {
      console.error('Error fetching user data:', error);
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
    } catch (error) {
      setPasswordMessage('Network error. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    // Create a date object and format it in the local timezone
    const date = new Date(dateString);
    // Use toLocaleDateString without explicit timezone to use local timezone
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    // Convert 24-hour format to 12-hour format with AM/PM
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getRemainingClasses = (packageBooking: PackageBooking) => {
    // This would need to be calculated based on how many classes have been redeemed
    // For now, we'll show a simple count
    return packageBooking.package.classCount - (packageBooking.redeemed ? 1 : 0);
  };

  const isPackageExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-orange-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-orange-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-orange-900">Welcome, {user.name}!</h1>
              <p className="text-orange-600">{user.email}</p>
            </div>
            <Link
              href="/packages"
              className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition-colors"
            >
              Buy Class Package
            </Link>
          </div>
        </div>

        {/* Password Change Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-orange-800">Account Settings</h2>
            <button
              onClick={() => setShowPasswordChange(!showPasswordChange)}
              className="text-orange-600 hover:text-orange-800 transition-colors"
            >
              {showPasswordChange ? 'Cancel' : 'Change Password'}
            </button>
          </div>
          {showPasswordChange && (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-orange-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className="w-full border border-orange-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-orange-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="w-full border border-orange-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-orange-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="w-full border border-orange-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              {passwordMessage && (
                <p className={`text-sm ${passwordMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
                  {passwordMessage}
                </p>
              )}
              <button
                type="submit"
                className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition-colors"
              >
                Update Password
              </button>
            </form>
          )}
        </div>

        {/* Package Bookings */}
        {packageBookings.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-orange-800 mb-4">Your Class Packages</h2>
            <div className="space-y-4">
              {packageBookings.map((packageBooking) => (
                <div key={packageBooking.id} className="border border-orange-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-orange-900">{packageBooking.package.name}</h3>
                      <p className="text-sm text-orange-600">{packageBooking.package.description}</p>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-orange-600">
                          💰 Paid: ${packageBooking.package.price}
                        </p>
                        <p className="text-sm text-orange-600">
                          📅 Expires: {formatDate(packageBooking.expiresAt)}
                        </p>
                        <p className="text-sm text-orange-600">
                          🎯 Remaining classes: {getRemainingClasses(packageBooking)}/{packageBooking.package.classCount}
                        </p>
                        {packageBooking.redeemed && packageBooking.class && (
                          <p className="text-sm text-green-600">
                            ✅ Used for: {packageBooking.class.description} on {formatDate(packageBooking.class.date)}
                          </p>
                        )}
                        {isPackageExpired(packageBooking.expiresAt) && (
                          <p className="text-sm text-red-600 font-semibold">
                            ⚠️ Package expired
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        packageBooking.paid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {packageBooking.paid ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Individual Class Bookings */}
        {bookings.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-orange-800 mb-4">Your Class Bookings</h2>
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="border border-orange-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-orange-900">{booking.class.description}</h3>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-orange-600">
                          📅 {formatDate(booking.class.date)} at {formatTime(booking.class.time)}
                        </p>
                        {booking.class.address && (
                          <p className="text-sm text-orange-600">
                            📍 {booking.class.address}
                          </p>
                        )}
                        {booking.class.isVirtual && booking.class.virtualLink && (
                          <p className="text-sm text-blue-600">
                            🔗 <a href={booking.class.virtualLink} target="_blank" rel="noopener noreferrer" className="underline">
                              Join Virtual Class
                            </a>
                          </p>
                        )}
                        <p className="text-sm text-orange-600">
                          📧 {booking.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
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

        {/* No Bookings Message */}
        {bookings.length === 0 && packageBookings.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h2 className="text-xl font-semibold text-orange-800 mb-4">No Bookings Yet</h2>
            <p className="text-orange-600 mb-4">You haven't booked any classes yet.</p>
            <div className="space-x-4">
              <Link
                href="/classes"
                className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition-colors"
              >
                Browse Classes
              </Link>
              <Link
                href="/packages"
                className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors"
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