'use client';
import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClassCalendarEvent, generateICalEvent, generateGoogleCalendarUrl, downloadCalendarFile } from '@/utils/calendar';
import Link from 'next/link';

type BookingData = {
  classId: string;
  email: string;
  name: string;
  phone?: string;
  waiverName?: string;
  waiverAgreed: boolean;
};

type PackageData = {
  id: number;
  package: {
    id: number;
    name: string;
    price: number;
    classCount: number;
  };
  expiresAt: string;
  paid: boolean;
};

function ThankYouContent() {
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [packageData, setPackageData] = useState<PackageData | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const type = searchParams?.get('type');
  const classId = searchParams?.get('classId');
  const packageBookingId = searchParams?.get('packageBookingId');
  const email = searchParams?.get('email');
  const name = searchParams?.get('name');
  const phone = searchParams?.get('phone');
  const waiverName = searchParams?.get('waiverName');
  const waiverAgreed = searchParams?.get('waiverAgreed');

  const createBooking = useCallback(async (bookingData: BookingData) => {
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to create booking:', errorData);
        // You might want to show an error message to the user here
      } else {
        console.log('Booking created successfully');
        // Store a flag to show that booking was linked to user (if applicable)
        const data = await response.json();
        if (data.userLinked) {
          localStorage.setItem('bookingLinkedToUser', 'true');
        }
      }
    } catch (error) {
      console.error('Error creating booking:', error);
    }
  }, []);

  const fetchPackageData = useCallback(async (packageBookingId: string) => {
    try {
      const response = await fetch(`/api/packages/${packageBookingId}`);
      if (response.ok) {
        const data = await response.json();
        setPackageData(data);
      }
    } catch (error) {
      console.error('Error fetching package data:', error);
    }
  }, []);

  useEffect(() => {
    
    if (type === 'package') {
      if (packageBookingId) {
        fetchPackageData(packageBookingId);
      }
    } else {
      // Handle individual class booking
      if (classId && email && name) {
        const bookingData = {
          classId,
          email,
          name,
          phone: phone || undefined,
          waiverName: waiverName || undefined,
          waiverAgreed: waiverAgreed === 'true'
        };
        setBookingData(bookingData);
        
        // Create the actual booking
        createBooking(bookingData);
      }
    }
    setLoading(false);
  }, [type, packageBookingId, classId, email, name, phone, waiverName, waiverAgreed, createBooking, fetchPackageData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <div className="text-brown-700 font-serif">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50">
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-pink-50/95 rounded-lg shadow-lg p-8 text-center border border-pink-200">
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
              <h1 className="text-3xl font-serif font-bold text-brown-800 mb-4">
                Package Purchase Successful!
              </h1>
              <p className="text-lg text-brown-700 mb-6 font-serif">
                Thank you for purchasing the {packageData.package.name}!
              </p>
              
              <div className="bg-pink-100 rounded-lg p-6 mb-6 text-left">
                <h2 className="text-xl font-serif font-semibold text-brown-700 mb-4">Package Details</h2>
                <div className="space-y-2 font-serif">
                  <p><strong>Package:</strong> {packageData.package.name}</p>
                  <p><strong>Price:</strong> ${packageData.package.price}</p>
                  <p><strong>Classes Included:</strong> {packageData.package.classCount}</p>
                  <p><strong>Expires:</strong> {new Date(packageData.expiresAt).toLocaleDateString()}</p>
                  <p><strong>Status:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-serif font-semibold ${
                      packageData.paid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {packageData.paid ? 'Paid' : 'Payment Pending'}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/classes"
                  className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors font-serif"
                >
                  Browse Classes
                </Link>
                <Link
                  href="/dashboard"
                  className="bg-pink-100 text-brown-800 px-6 py-3 rounded-lg hover:bg-pink-200 transition-colors font-serif"
                >
                  View Dashboard
                </Link>
              </div>
          </>
        )}

          {/* Individual Class Booking Success */}
          {bookingData && (
          <>
              <h1 className="text-3xl font-serif font-bold text-brown-800 mb-4">
                Booking Confirmed!
              </h1>
              <p className="text-lg text-brown-700 mb-6 font-serif">
                Thank you for booking your class, {bookingData.name}!
              </p>

              {/* Booking Linked Notification */}
              {typeof window !== 'undefined' && localStorage.getItem('bookingLinkedToUser') === 'true' && (
                <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg">
                  <p className="text-green-800 text-sm font-serif">
                    ✅ Your booking has been linked to your existing account. 
                    <br />
                    <a href="/dashboard" className="text-green-600 hover:text-green-800 underline">
                      View your bookings →
                    </a>
                  </p>
                </div>
              )}

              <div className="bg-pink-100 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-serif font-semibold text-brown-700 mb-4">What&apos;s Next?</h2>
                <div className="space-y-3 text-left">
                  <div className="flex items-start space-x-3">
                    <div className="text-brown-600 text-xl">📧</div>
                    <div>
                      <p className="font-serif font-medium text-brown-800">Confirmation Email</p>
                      <p className="text-sm text-brown-600 font-serif">You&apos;ll receive a confirmation email shortly</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="text-brown-600 text-xl">📅</div>
                    <div>
                      <p className="font-serif font-medium text-brown-800">Class Reminder</p>
                      <p className="text-sm text-brown-600 font-serif">We&apos;ll send you a reminder before your class</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="text-brown-600 text-xl">🎯</div>
                    <div>
                      <p className="font-serif font-medium text-brown-800">Save Money</p>
                      <p className="text-sm text-brown-600 font-serif">
                        Consider buying a class package for better value!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Calendar Integration */}
              <div className="bg-warm-50 rounded-lg p-6 mb-6 border border-warm-200">
                <h2 className="text-xl font-serif font-semibold text-brown-700 mb-4">📅 Add to Calendar</h2>
                <p className="text-brown-600 mb-4 font-serif">
                  Never miss your class! Add it to your calendar to get reminders.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      // We'll need to fetch class details to create the calendar event
                      if (classId) {
                        fetch(`/api/classes/${classId}`)
                          .then(res => res.json())
                          .then(classData => {
                            const event = createClassCalendarEvent(
                              classData.description,
                              new Date(classData.date),
                              classData.time,
                              `Join us for ${classData.description} at Wander Movement!${classData.isVirtual && classData.virtualLink ? `\n\nVirtual Class Link: ${classData.virtualLink}` : ''}`,
                              classData.address,
                              classData.virtualLink
                            );
                            const icalContent = generateICalEvent(event);
                            downloadCalendarFile(icalContent, `wander-movement-${classData.description.replace(/\s+/g, '-').toLowerCase()}.ics`);
                          });
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors flex items-center space-x-2"
                  >
                    <span>📱</span>
                    <span>Apple Calendar</span>
                  </button>
                  <button
                    onClick={() => {
                      if (classId) {
                        fetch(`/api/classes/${classId}`)
                          .then(res => res.json())
                          .then(classData => {
                            const event = createClassCalendarEvent(
                              classData.description,
                              new Date(classData.date),
                              classData.time,
                              `Join us for ${classData.description} at Wander Movement!${classData.isVirtual && classData.virtualLink ? `\n\nVirtual Class Link: ${classData.virtualLink}` : ''}`,
                              classData.address,
                              classData.virtualLink
                            );
                            const googleUrl = generateGoogleCalendarUrl(event);
                            window.open(googleUrl, '_blank');
                          });
                      }
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors flex items-center space-x-2"
                  >
                    <span>📅</span>
                    <span>Google Calendar</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/dashboard"
                  className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors font-serif"
                >
                  View Dashboard
                </Link>
                <Link
                  href="/packages"
                  className="bg-pink-100 text-brown-800 px-6 py-3 rounded-lg hover:bg-pink-200 transition-colors font-serif"
                >
                  Buy Class Package
                </Link>
              </div>
          </>
        )}

          {/* Contact Information */}
          <div className="mt-8 pt-6 border-t border-pink-200">
            <p className="text-sm text-brown-600 font-serif">
              Questions? Contact us at{' '}
              <a href="mailto:ltwander@gmail.com" className="text-brown-800 hover:text-brown-900 underline">
                ltwander@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ThankYouContent />
    </Suspense>
  );
} 