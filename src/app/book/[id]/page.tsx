'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCurrentIndividualClassPrice, getPackagePrice, formatPrice, PRICING_CONFIG } from '@/utils/pricing';
import { createClassCalendarEvent, generateICalEvent, generateGoogleCalendarUrl, downloadCalendarFile } from '@/utils/calendar';
import Link from 'next/link';

type User = {
  id: number;
  email: string;
  name: string;
};

type Class = {
  id: number;
  date: string;
  time: string;
  description: string;
  capacity: number;
  address?: string;
  isVirtual: boolean;
  virtualLink?: string;
  minAttendance: number;
};

type AvailablePackage = {
  id: number;
  classesRemaining: number;
  expiresAt: string;
  package: {
    id: number;
    name: string;
    description: string;
    classCount: number;
    price: number;
  };
};

export default function BookClassPage() {
  const params = useParams();
  const router = useRouter();
  const [classItem, setClassItem] = useState<Class | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [availablePackages, setAvailablePackages] = useState<AvailablePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    waiverName: '',
    waiverAgreed: false,
    paymentMethod: 'square'
  });

  const individualPrice = getCurrentIndividualClassPrice();
  const packagePrice = getPackagePrice();

  const fetchAvailablePackages = useCallback(async (userId: number) => {
    try {
      const response = await fetch(`/api/users/${userId}/available-packages`);
      if (response.ok) {
        const data = await response.json();
        setAvailablePackages(data);
      }
    } catch (error) {
      console.error('Error fetching available packages:', error);
    }
  }, []);

  const checkUserLogin = useCallback(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const userObj = JSON.parse(userData);
      setUser(userObj);
      fetchAvailablePackages(userObj.id);
    }
  }, []);

  const fetchClass = useCallback(async (classId: number) => {
    try {
      const response = await fetch(`/api/classes/${classId}`);
      if (response.ok) {
        const data = await response.json();
        setClassItem(data);
    } else {
        router.push('/classes');
      }
    } catch (error) {
      console.error('Error fetching class:', error);
      router.push('/classes');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (params?.id) {
      fetchClass(Number(params.id));
      checkUserLogin();
    }
  }, [params?.id, fetchClass, checkUserLogin]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPackageId && user) {
      handlePaymentClick('package');
    }
  };

  const handlePaymentClick = async (paymentMethod: 'square' | 'bitcoin' | 'package') => {
    setForm(prev => ({ ...prev, paymentMethod }));
    setBooking(true);

    try {
      let response;
      
      if (paymentMethod === 'package' && selectedPackageId && user) {
        // Use package redemption
        response = await fetch('/api/packages/redeem', {
        method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            packageBookingId: selectedPackageId,
            classId: classItem?.id,
            userId: user.id,
            customerName: form.name || user.name,
            customerEmail: form.email || user.email,
            phone: form.phone,
            waiverName: form.waiverName || user.name,
            waiverAgreed: form.waiverAgreed
          }),
        });
      } else {
        // Regular booking - determine payment method
        const endpoint = paymentMethod === 'bitcoin' ? '/api/bitcoin-invoice' : '/api/square-checkout';
        
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            classId: classItem?.id,
            ...form
          }),
        });
      }

      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          window.location.href = data.url;
        } else if (paymentMethod === 'package') {
          // Package redemption was successful, redirect to thank you
          router.push(`/thank-you?type=package-redemption&classId=${classItem?.id}&packageBookingId=${selectedPackageId}`);
        } else {
          // Regular booking was successful, redirect to thank you
          router.push(`/thank-you?type=booking&classId=${classItem?.id}`);
        }
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to book class');
      }
    } catch (error) {
      console.error('Error booking class:', error);
      alert('Network error. Please try again.');
    } finally {
      setBooking(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center">
        <div className="text-brown-600">Loading...</div>
      </div>
    );
  }

  if (!classItem) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center">
        <div className="text-brown-600">Class not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-brown-900">Book Your Class</h1>
              <p className="text-brown-600">Complete your booking below</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-brown-600">{formatPrice(individualPrice)}</p>
              <p className="text-sm text-brown-500">per class</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Class Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-brown-800 mb-4">Class Details</h2>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-brown-900">{classItem.description}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-brown-600">📅</span>
                  <span>{formatDate(classItem.date)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-brown-600">⏰</span>
                  <span>{formatTime(classItem.time)}</span>
                </div>
                {classItem.address && (
                  <div className="flex items-center space-x-2">
                    <span className="text-brown-600">📍</span>
                    <span>{classItem.address}</span>
                  </div>
                )}
                {classItem.isVirtual && classItem.virtualLink && (
                  <div className="flex items-center space-x-2">
                    <span className="text-brown-600">🔗</span>
                    <span className="text-blue-600">
                      <a href={classItem.virtualLink} target="_blank" rel="noopener noreferrer" className="underline">
                        Virtual Class Link
                      </a>
                    </span>
                  </div>
                )}
                {classItem.minAttendance > 1 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-brown-600">👥</span>
                    <span>Minimum {classItem.minAttendance} people required</span>
                  </div>
                )}
              </div>
              
              {/* Calendar Integration for Logged-in Users */}
              {user && (
                <div className="mt-6 pt-4 border-t border-warm-200">
                  <h3 className="text-lg font-semibold text-brown-800 mb-3">📅 Add to Calendar</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        const event = createClassCalendarEvent(
                          classItem.description,
                          classItem.date,
                          classItem.time,
                          60, // 60 minutes duration
                          classItem.address,
                          `Join us for ${classItem.description} at Wander Movement!${classItem.isVirtual && classItem.virtualLink ? `\n\nVirtual Class Link: ${classItem.virtualLink}` : ''}`
                        );
                        const icalContent = generateICalEvent(event);
                        downloadCalendarFile(icalContent, `wander-movement-${classItem.description.replace(/\s+/g, '-').toLowerCase()}.ics`);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors flex items-center space-x-2"
                    >
                      <span>📱</span>
                      <span>Apple Calendar</span>
                    </button>
                    <button
                      onClick={() => {
                        const event = createClassCalendarEvent(
                          classItem.description,
                          classItem.date,
                          classItem.time,
                          60,
                          classItem.address,
                          `Join us for ${classItem.description} at Wander Movement!${classItem.isVirtual && classItem.virtualLink ? `\n\nVirtual Class Link: ${classItem.virtualLink}` : ''}`
                        );
                        const googleUrl = generateGoogleCalendarUrl(event);
                        window.open(googleUrl, '_blank');
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors flex items-center space-x-2"
                    >
                      <span>📅</span>
                      <span>Google Calendar</span>
                    </button>
                  </div>
                  <p className="text-xs text-brown-600 mt-2">
                    Add this class to your calendar to get reminders and never miss a session!
                  </p>
                </div>
              )}
            </div>
            
            {/* Waiver Reminder */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <div className="text-blue-500 text-xl">📋</div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Waiver Required</h3>
                  <p className="text-blue-700 text-sm mb-2">
                    All participants must complete our liability waiver before attending class.
                  </p>
                  <Link
                    href="/waiver"
                    target="_blank"
                    className="text-blue-600 hover:text-blue-800 underline text-sm font-medium"
                  >
                    Complete Waiver Form →
                  </Link>
                </div>
              </div>
            </div>

            {/* Package Promotion */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-2 border-warm-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-brown-900 mb-2">
                    💰 Lock in Current Pricing with Class Packages!
                  </h3>
                  <p className="text-brown-700 mb-3">
                    Get {formatPrice(packagePrice)} for 4 classes 
                    <br />
                    <span className="font-semibold text-blue-600">
                      Currently: {formatPrice(individualPrice)}/class • After Aug 31: {formatPrice(PRICING_CONFIG.INDIVIDUAL_CLASS_PRICE_AFTER_AUGUST_31)}/class
                    </span>
                    <br />
                    <span className="font-semibold text-green-600">
                      Lock in the {formatPrice(individualPrice)}/class rate before prices increase!
                    </span>
                  </p>
                  <Link
                    href="/packages"
                    className="inline-block bg-warm-400 text-white px-4 py-2 rounded hover:bg-warm-500 transition-colors"
                  >
                    View Packages
                  </Link>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-brown-600">{formatPrice(packagePrice)}</div>
                  <div className="text-sm text-brown-600">for 4 classes</div>
                  <div className="text-xs text-blue-600 font-semibold">Lock in current rate</div>
                </div>
              </div>
                  </div>
                  
            {/* Package Redemption Section */}
            {user && availablePackages.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-2 border-warm-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Use Your Package</h2>
                <p className="text-gray-700 mb-4">
                  You have available packages! Use one to book this class for free.
                </p>
                
                <div className="space-y-3">
                  {availablePackages.map((pkg) => (
                    <div key={pkg.id} className="flex items-center justify-between p-3 border border-warm-200 rounded-lg bg-warm-50">
                      <div>
                        <h3 className="font-semibold text-gray-900">{pkg.package.name}</h3>
                        <p className="text-sm text-gray-600">
                          {pkg.classesRemaining} classes remaining • Expires {new Date(pkg.expiresAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedPackageId(selectedPackageId === pkg.id ? null : pkg.id)}
                        className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                          selectedPackageId === pkg.id
                            ? 'bg-warm-400 text-white'
                            : 'bg-white text-brown-700 border border-warm-300 hover:bg-warm-50'
                        }`}
                      >
                        {selectedPackageId === pkg.id ? 'Selected' : 'Use Package'}
                      </button>
                    </div>
                  ))}
                </div>
                
                {selectedPackageId && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-300 rounded-lg">
                    <p className="text-green-800 text-sm">
                      ✅ Package selected! This class will be booked using your package (no additional charge).
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Booking Form */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-brown-800 mb-4">Book This Class</h2>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brown-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      required
                      className="w-full border border-warm-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-warm-400"
                    />
                    </div>
                  <div>
                    <label className="block text-sm font-medium text-brown-700 mb-1">
                      Email *
                    </label>
                    <input
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      type="email"
                      required
                      className="w-full border border-warm-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-warm-400"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-brown-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="(555) 123-4567"
                    type="tel"
                    className="w-full border border-warm-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-warm-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brown-700 mb-1">
                    Waiver Name *
                  </label>
                  <input
                    name="waiverName"
                    value={form.waiverName}
                    onChange={handleChange}
                    placeholder="Name for liability waiver"
                    required
                    className="w-full border border-warm-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-warm-400"
                  />
                </div>

                <div className="flex items-start space-x-3">
                  <input
                    name="waiverAgreed"
                    type="checkbox"
                    checked={form.waiverAgreed}
                    onChange={handleChange}
                    required
                    className="mt-1 h-4 w-4 text-warm-400 focus:ring-warm-400 border-warm-300 rounded"
                  />
                  <label className="text-sm text-brown-700">
                    I agree to the liability waiver and understand the risks associated with physical activity. *
                  </label>
                  </div>
                  
                {/* Submit Button for Package Redemption */}
                {selectedPackageId && (
                  <button
                    type="button"
                    onClick={() => handlePaymentClick('package')}
                    disabled={booking}
                    className="w-full py-3 px-6 rounded-lg transition-colors disabled:opacity-50 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {booking ? 'Processing...' : 'Book Class with Package (Free)'}
                  </button>
                )}

                {/* Payment Options */}
                {!selectedPackageId && (
                  <div className="mt-6 space-y-3">
                    <div className="text-center text-sm text-gray-600 mb-4">
                      Choose your payment method:
                    </div>
                    
                    {/* Credit Card Payment */}
                    <button
                      type="button"
                      onClick={() => handlePaymentClick('square')}
                      disabled={booking}
                      className="w-full py-3 px-6 rounded-lg transition-colors disabled:opacity-50 bg-warm-400 hover:bg-warm-500 text-white flex items-center justify-center space-x-2"
                    >
                      <span>💳</span>
                      <span>Pay with Credit Card - {formatPrice(individualPrice)}</span>
                    </button>

                    {/* Bitcoin Payment */}
                  <button
                    type="button"
                      onClick={() => handlePaymentClick('bitcoin')}
                      disabled={booking}
                      className="w-full py-3 px-6 rounded-lg transition-colors disabled:opacity-50 bg-yellow-600 hover:bg-yellow-700 text-white flex items-center justify-center space-x-2"
                    >
                      <span>₿</span>
                      <span>Pay with Bitcoin - {formatPrice(individualPrice * 0.95)} (5% off!)</span>
                  </button>

                    <div className="text-center text-xs text-gray-500 mt-2">
                      Bitcoin payments receive a 5% discount
                    </div>
                  </div>
                )}
            </form>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-brown-800 mb-4">Pricing Summary</h3>
              
              <div className="space-y-4">
                {selectedPackageId && (
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-green-700 font-medium">Package Redemption</span>
                      <span className="font-semibold text-green-900">FREE</span>
                    </div>
                    <p className="text-xs text-green-600">
                      Using your available package
                    </p>
                  </div>
                )}
                
                <div className="border-b border-warm-200 pb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-brown-700">Individual Class</span>
                    <span className="font-semibold text-brown-900">{formatPrice(individualPrice)}</span>
                  </div>
                  <p className="text-xs text-brown-500 mt-1">
                    {individualPrice === 10 ? 'Current price until August 31, 2025' : 'New price effective September 1, 2025'}
                  </p>
                </div>

                <div className="bg-warm-50 rounded-lg p-4 border border-warm-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-brown-700 font-medium">4-Class Package</span>
                    <span className="font-semibold text-brown-900">{formatPrice(packagePrice)}</span>
                  </div>
                  <p className="text-xs text-blue-600 font-semibold">
                    Lock in {formatPrice(individualPrice)}/class rate
                  </p>
                  <p className="text-xs text-brown-600 mt-1">
                    After Aug 31: {formatPrice(PRICING_CONFIG.INDIVIDUAL_CLASS_PRICE_AFTER_AUGUST_31)}/class
                  </p>
                  <p className="text-xs text-brown-600">
                    Expires in 3 months
                  </p>
                </div>

                <Link
                  href="/packages"
                  className="block w-full bg-warm-100 text-brown-800 text-center py-2 rounded hover:bg-warm-200 transition-colors text-sm font-medium border border-warm-200"
                >
                  View Package Details →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 