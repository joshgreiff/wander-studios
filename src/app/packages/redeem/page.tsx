"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Class = {
  id: number;
  date: string;
  time: string;
  description: string;
  capacity: number;
  bookings: Array<{ id: number }>;
  packageBookings: Array<{ id: number; redeemed: boolean }>;
};

type PackageBooking = {
  id: number;
  package: {
    id: number;
    name: string;
    classCount: number;
  };
  class: Class;
  customerName: string;
  customerEmail: string;
  redeemed: boolean;
  redeemedAt?: string;
  paid: boolean;
};

export default function PackageRedemptionPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [packageBookings, setPackageBookings] = useState<PackageBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [customerEmail, setCustomerEmail] = useState('');
  const [searching, setSearching] = useState(false);
  const [redeeming, setRedeeming] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/classes')
      .then(res => res.json())
      .then(data => {
        setClasses(data);
        setLoading(false);
      });
  }, []);

  async function searchPackageBookings() {
    if (!customerEmail.trim()) {
      alert('Please enter your email address');
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(`/api/packages/bookings?email=${encodeURIComponent(customerEmail)}`);
      if (response.ok) {
        const data = await response.json();
        setPackageBookings(data);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to find package bookings');
      }
    } catch (error) {
      console.error('Error searching package bookings:', error);
      alert('Failed to search package bookings');
    } finally {
      setSearching(false);
    }
  }

  async function redeemClass(packageBookingId: number, classId: number) {
    setRedeeming(packageBookingId);
    try {
      const response = await fetch('/api/packages/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'redeem',
          classId: classId,
          customerEmail: customerEmail,
          packageId: 0, // Not needed for redemption
          customerName: '', // Not needed for redemption
          waiverName: '', // Not needed for redemption
          waiverAgreed: true // Not needed for redemption
        }),
      });

      if (response.ok) {
        alert('Class successfully redeemed!');
        // Refresh the package bookings
        searchPackageBookings();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to redeem class');
      }
    } catch (error) {
      console.error('Error redeeming class:', error);
      alert('Failed to redeem class');
    } finally {
      setRedeeming(null);
    }
  }

  function getAvailableBookingsForClass(classId: number): PackageBooking[] {
    return packageBookings.filter(booking => 
      booking.class.id === classId && 
      !booking.redeemed && 
      booking.paid
    );
  }

  function getTotalBookingsForClass(classId: number): number {
    const classItem = classes.find(c => c.id === classId);
    if (!classItem) return 0;
    
    const regularBookings = classItem.bookings.length;
    const redeemedPackageBookings = classItem.packageBookings.filter(pb => pb.redeemed).length;
    
    return regularBookings + redeemedPackageBookings;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-200 via-orange-400 to-red-400 flex flex-col items-center p-4">
      <section className="max-w-4xl w-full bg-white/90 rounded-xl shadow p-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-6 text-orange-900 text-center">Redeem Package Classes</h1>
        <p className="text-orange-800 text-center mb-8 max-w-2xl">
          Use your purchased package to book classes. Enter your email to see your available package bookings.
        </p>

        {/* Email Search */}
        <div className="w-full max-w-md mb-8">
          <div className="flex gap-2">
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 p-3 border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              onClick={searchPackageBookings}
              disabled={searching}
              className="bg-orange-600 text-white font-semibold py-3 px-6 rounded hover:bg-orange-700 transition disabled:opacity-60"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-orange-700">Loading classes...</div>
        ) : (
          <div className="w-full">
            {/* Package Bookings Summary */}
            {packageBookings.length > 0 && (
              <div className="mb-6 p-4 bg-green-50 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900 mb-2">Your Package Bookings</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(packageBookings.reduce((acc, booking) => {
                    const packageName = booking.package.name;
                    if (!acc[packageName]) {
                      acc[packageName] = { total: 0, redeemed: 0 };
                    }
                    acc[packageName].total++;
                    if (booking.redeemed) acc[packageName].redeemed++;
                    return acc;
                  }, {} as Record<string, { total: number; redeemed: number }>)).map(([packageName, counts]) => (
                    <div key={packageName} className="text-green-800">
                      <strong>{packageName}:</strong> {counts.redeemed}/{counts.total} classes used
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Available Classes */}
            <h2 className="text-2xl font-bold mb-4 text-orange-900">Available Classes</h2>
            <div className="space-y-4">
              {classes.map(c => {
                const availableBookings = getAvailableBookingsForClass(c.id);
                const totalBookings = getTotalBookingsForClass(c.id);
                const isFull = totalBookings >= c.capacity;
                const hasAvailableBookings = availableBookings.length > 0;

                return (
                  <div key={c.id} className="border rounded-lg p-4 bg-white/80 shadow">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-orange-900 text-lg">
                          {c.date?.slice(0, 10)} {c.time}
                        </div>
                        <div className="text-orange-800">{c.description}</div>
                        <div className="text-orange-700 text-sm">
                          Capacity: {totalBookings}/{c.capacity}
                          {hasAvailableBookings && (
                            <span className="text-green-600 ml-2">
                              • {availableBookings.length} package booking{availableBookings.length > 1 ? 's' : ''} available
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 sm:mt-0">
                        {hasAvailableBookings && !isFull ? (
                          <button
                            onClick={() => redeemClass(availableBookings[0].id, c.id)}
                            disabled={redeeming === availableBookings[0].id}
                            className="bg-green-600 text-white font-semibold py-2 px-6 rounded hover:bg-green-700 transition disabled:opacity-60"
                          >
                            {redeeming === availableBookings[0].id ? 'Redeeming...' : 'Redeem Class'}
                          </button>
                        ) : isFull ? (
                          <span className="text-red-600 font-semibold">Class Full</span>
                        ) : (
                          <span className="text-gray-500">No package bookings available</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {packageBookings.length === 0 && customerEmail && !searching && (
              <div className="text-center text-orange-700 mt-8">
                <p>No package bookings found for this email address.</p>
                <p className="mt-2">
                  <button
                    onClick={() => router.push('/packages')}
                    className="text-orange-600 hover:text-orange-800 underline"
                  >
                    Purchase a package here
                  </button>
                </p>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
} 