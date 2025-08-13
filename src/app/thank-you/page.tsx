'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ThankYouPage() {
  const [bookingData, setBookingData] = useState<any>(null);
  const [packageData, setPackageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    const type = searchParams.get('type');
    
    if (type === 'package') {
      const packageBookingId = searchParams.get('packageBookingId');
      if (packageBookingId) {
        fetchPackageData(packageBookingId);
      }
    } else {
      // Handle individual class booking
      const classId = searchParams.get('classId');
      const email = searchParams.get('email');
      const name = searchParams.get('name');
      const phone = searchParams.get('phone');
      const waiverName = searchParams.get('waiverName');
      const waiverAgreed = searchParams.get('waiverAgreed');

      if (classId && email && name) {
        setBookingData({
          classId,
          email,
          name,
          phone,
          waiverName,
          waiverAgreed: waiverAgreed === 'true'
        });
      }
    }
    setLoading(false);
  }, [searchParams]);

  const fetchPackageData = async (packageBookingId: string) => {
    try {
      const response = await fetch(`/api/packages/${packageBookingId}`);
      if (response.ok) {
        const data = await response.json();
        setPackageData(data);
      }
    } catch (error) {
      console.error('Error fetching package data:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-orange-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50">
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Package Purchase Success */}
          {packageData && (
            <>
              <h1 className="text-3xl font-bold text-orange-900 mb-4">
                Package Purchase Successful!
              </h1>
              <p className="text-lg text-orange-700 mb-6">
                Thank you for purchasing the {packageData.package.name}!
              </p>
              
              <div className="bg-orange-50 rounded-lg p-6 mb-6 text-left">
                <h2 className="text-xl font-semibold text-orange-800 mb-4">Package Details</h2>
                <div className="space-y-2">
                  <p><strong>Package:</strong> {packageData.package.name}</p>
                  <p><strong>Price:</strong> ${packageData.package.price}</p>
                  <p><strong>Classes Included:</strong> {packageData.package.classCount}</p>
                  <p><strong>Expires:</strong> {new Date(packageData.expiresAt).toLocaleDateString()}</p>
                  <p><strong>Status:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${
                      packageData.paid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {packageData.paid ? 'Paid' : 'Payment Pending'}
                    </span>
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-orange-600">
                  You can now use your package to book classes. Each class will be deducted from your package.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/classes"
                    className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Browse Classes
                  </Link>
                  <Link
                    href="/dashboard"
                    className="bg-orange-100 text-orange-800 px-6 py-3 rounded-lg hover:bg-orange-200 transition-colors"
                  >
                    View Dashboard
                  </Link>
                </div>
              </div>
            </>
          )}

          {/* Individual Class Booking Success */}
          {bookingData && (
            <>
              <h1 className="text-3xl font-bold text-orange-900 mb-4">
                Booking Confirmed!
              </h1>
              <p className="text-lg text-orange-700 mb-6">
                Thank you for booking your class, {bookingData.name}!
              </p>

              {/* Booking Linked Notification */}
              {typeof window !== 'undefined' && localStorage.getItem('bookingLinkedToUser') === 'true' && (
                <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg">
                  <p className="text-green-800 text-sm">
                    ✅ Your booking has been linked to your existing account. 
                    <br />
                    <a href="/dashboard" className="text-green-600 hover:text-green-800 underline">
                      View your bookings →
                    </a>
                  </p>
                </div>
              )}

              <div className="bg-orange-50 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-orange-800 mb-4">What's Next?</h2>
                <div className="space-y-3 text-left">
                  <div className="flex items-start space-x-3">
                    <div className="text-orange-600 text-xl">📧</div>
                    <div>
                      <p className="font-medium text-orange-900">Confirmation Email</p>
                      <p className="text-sm text-orange-600">You'll receive a confirmation email shortly</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="text-orange-600 text-xl">📅</div>
                    <div>
                      <p className="font-medium text-orange-900">Class Reminder</p>
                      <p className="text-sm text-orange-600">We'll send you a reminder before your class</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="text-orange-600 text-xl">🎯</div>
                    <div>
                      <p className="font-medium text-orange-900">Save Money</p>
                      <p className="text-sm text-orange-600">
                        Consider buying a class package for better value!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/dashboard"
                  className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  View Dashboard
                </Link>
                <Link
                  href="/packages"
                  className="bg-orange-100 text-orange-800 px-6 py-3 rounded-lg hover:bg-orange-200 transition-colors"
                >
                  Buy Class Package
                </Link>
              </div>
            </>
          )}

          {/* Contact Information */}
          <div className="mt-8 pt-6 border-t border-orange-200">
            <p className="text-sm text-orange-600">
              Questions? Contact us at{' '}
              <a href="mailto:ltwander@gmail.com" className="text-orange-800 hover:text-orange-900 underline">
                ltwander@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 