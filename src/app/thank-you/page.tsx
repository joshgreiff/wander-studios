'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function ThankYouContent() {
  const searchParams = useSearchParams();
  const [bookingStatus, setBookingStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Get booking data from URL parameters
    if (!searchParams) return;
    
    const type = searchParams.get('type');
    
    if (type === 'package') {
      // Handle package purchase
      const customerName = searchParams.get('customerName');
      const customerEmail = searchParams.get('customerEmail');
      const packageId = searchParams.get('packageId');
      const waiverName = searchParams.get('waiverName');
      const waiverAgreed = searchParams.get('waiverAgreed');
      const customerPhone = searchParams.get('customerPhone');

      if (customerName && customerEmail && packageId && waiverName && waiverAgreed) {
        createPackageBooking({
          customerName,
          customerEmail,
          packageId,
          waiverName,
          waiverAgreed: waiverAgreed === 'true',
          customerPhone: customerPhone || undefined
        });
      } else {
        setBookingStatus('success');
      }
    } else {
      // Handle individual class booking
      const name = searchParams.get('name');
      const email = searchParams.get('email');
      const classId = searchParams.get('classId');
      const waiverName = searchParams.get('waiverName');
      const waiverAgreed = searchParams.get('waiverAgreed');
      const phone = searchParams.get('phone');

      // If we have the required parameters, create the booking
      if (name && email && classId && waiverName && waiverAgreed) {
        createBooking({
          name,
          email,
          classId,
          waiverName,
          waiverAgreed: waiverAgreed === 'true',
          phone: phone || undefined
        });
      } else {
        // No booking data, just show success message
        setBookingStatus('success');
      }
    }
  }, [searchParams]);

  async function createBooking(bookingData: {
    name: string;
    email: string;
    classId: string;
    waiverName: string;
    waiverAgreed: boolean;
    phone?: string;
  }) {
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
        throw new Error(errorData.error || 'Failed to create booking');
      }

      setBookingStatus('success');
    } catch (error) {
      console.error('Error creating booking:', error);
      setBookingStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async function createPackageBooking(bookingData: {
    customerName: string;
    customerEmail: string;
    packageId: string;
    waiverName: string;
    waiverAgreed: boolean;
    customerPhone?: string;
  }) {
    try {
      const response = await fetch('/api/packages/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...bookingData,
          action: 'purchase'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create package booking');
      }

      // Mark all package bookings as paid
      const packageBookings = await response.json();
      await Promise.all(
        packageBookings.packageBookings.map((booking: { id: number }) =>
          fetch('/api/packages/book', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              packageId: bookingData.packageId,
              customerName: bookingData.customerName,
              customerEmail: bookingData.customerEmail,
              customerPhone: bookingData.customerPhone,
              waiverName: bookingData.waiverName,
              waiverAgreed: bookingData.waiverAgreed,
              action: 'mark-paid',
              bookingId: booking.id
            }),
          })
        )
      );

      setBookingStatus('success');
    } catch (error) {
      console.error('Error creating package booking:', error);
      setBookingStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-200 via-orange-400 to-red-400 flex flex-col items-center p-4">
      <section className="max-w-2xl w-full bg-white/80 rounded-xl shadow-lg p-8 mt-8 text-center">
        {bookingStatus === 'loading' && (
          <>
            <h2 className="text-3xl font-bold mb-4 text-orange-900">Processing Your Booking...</h2>
            <p className="mb-4 text-orange-800">Please wait while we confirm your spot.</p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          </>
        )}

        {bookingStatus === 'success' && (
          <>
            <h2 className="text-3xl font-bold mb-4 text-orange-900">Thank You for Booking!</h2>
            <p className="mb-4 text-orange-800">Your spot is confirmed. We can&apos;t wait to move with you!</p>
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-orange-900 mb-2">What to Bring</h3>
              <ul className="list-disc list-inside text-orange-800 text-left inline-block">
                <li>Comfortable clothes</li>
                <li>Yoga mat (if you have one)</li>
                <li>Water bottle</li>
                <li>Open mind and positive energy!</li>
              </ul>
            </div>
            <p className="text-orange-700 text-sm">Check your email for confirmation and further details.</p>
          </>
        )}

        {bookingStatus === 'error' && (
          <>
            <h2 className="text-3xl font-bold mb-4 text-red-900">Booking Error</h2>
            <p className="mb-4 text-red-800">There was an issue confirming your booking.</p>
            <p className="mb-4 text-red-700 text-sm">{errorMessage}</p>
            <p className="text-red-700 text-sm">Please contact us if you believe this is an error.</p>
          </>
        )}
      </section>
    </main>
  );
}

export default function ThankYou() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-br from-orange-200 via-orange-400 to-red-400 flex flex-col items-center p-4">
        <section className="max-w-2xl w-full bg-white/80 rounded-xl shadow-lg p-8 mt-8 text-center">
          <h2 className="text-3xl font-bold mb-4 text-orange-900">Loading...</h2>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
        </section>
      </main>
    }>
      <ThankYouContent />
    </Suspense>
  );
} 