'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCurrentIndividualClassPrice, getPackagePrice, calculatePackageSavings, getPackageSavingsPercentage, formatPrice } from '@/utils/pricing';
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
    waiverAgreed: false
  });

  const individualPrice = getCurrentIndividualClassPrice();
  const packagePrice = getPackagePrice();
  const savings = calculatePackageSavings();
  const savingsPercentage = getPackageSavingsPercentage();

  useEffect(() => {
    if (params.id) {
      fetchClass(Number(params.id));
      checkUserLogin();
    }
  }, [params.id]);

  const checkUserLogin = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const userObj = JSON.parse(userData);
      setUser(userObj);
      fetchAvailablePackages(userObj.id);
    }
  };

  const fetchClass = async (classId: number) => {
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
  };

  const fetchAvailablePackages = async (userId: number) => {
    try {
      const response = await fetch(`/api/users/${userId}/available-packages`);
      if (response.ok) {
        const data = await response.json();
        setAvailablePackages(data);
      }
    } catch (error) {
      console.error('Error fetching available packages:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBooking(true);

    try {
      let response;
      
      if (selectedPackageId && user) {
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
        // Regular booking
        response = await fetch('/api/bookings', {
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
        } else {
          // Package redemption was successful, redirect to thank you
          router.push(`/thank-you?type=package-redemption&classId=${classItem?.id}&packageBookingId=${selectedPackageId}`);
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
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-orange-600">Loading...</div>
      </div>
    );
  }

  if (!classItem) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-orange-600">Class not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-orange-900">Book Your Class</h1>
              <p className="text-orange-600">Complete your booking below</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-orange-600">{formatPrice(individualPrice)}</p>
              <p className="text-sm text-orange-500">per class</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Class Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-orange-800 mb-4">Class Details</h2>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-orange-900">{classItem.description}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-orange-600">📅</span>
                  <span>{formatDate(classItem.date)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-orange-600">⏰</span>
                  <span>{classItem.time}</span>
                </div>
                {classItem.address && (
                  <div className="flex items-center space-x-2">
                    <span className="text-orange-600">📍</span>
                    <span>{classItem.address}</span>
                  </div>
                )}
                {classItem.isVirtual && classItem.virtualLink && (
                  <div className="flex items-center space-x-2">
                    <span className="text-orange-600">🔗</span>
                    <span className="text-blue-600">
                      <a href={classItem.virtualLink} target="_blank" rel="noopener noreferrer" className="underline">
                        Virtual Class Link
                      </a>
                    </span>
                  </div>
                )}
                {classItem.minAttendance > 1 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-orange-600">👥</span>
                    <span>Minimum {classItem.minAttendance} people required</span>
                  </div>
                )}
              </div>
            </div>

            {/* Package Promotion */}
            <div className="bg-gradient-to-r from-orange-100 to-yellow-100 rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-orange-900 mb-2">
                    💰 Save Money with Class Packages!
                  </h3>
                  <p className="text-orange-700 mb-3">
                    Get {formatPrice(packagePrice)} for 4 classes instead of {formatPrice(individualPrice * 4)} 
                    <br />
                    <span className="font-semibold text-green-600">
                      Save {formatPrice(savings)} ({savingsPercentage}% off!)
                    </span>
                    <br />
                    <span className="font-semibold text-blue-600">
                      Lock in the $10/class rate before prices increase!
                    </span>
                  </p>
                  <Link
                    href="/packages"
                    className="inline-block bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition-colors"
                  >
                    View Packages
                  </Link>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-orange-600">{formatPrice(packagePrice)}</div>
                  <div className="text-sm text-orange-600">for 4 classes</div>
                  <div className="text-xs text-green-600 font-semibold">{savingsPercentage}% savings</div>
                </div>
              </div>
            </div>

            {/* Package Redemption Section */}
            {user && availablePackages.length > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold text-green-800 mb-4">Use Your Package</h2>
                <p className="text-green-700 mb-4">
                  You have available packages! Use one to book this class for free.
                </p>
                
                <div className="space-y-3">
                  {availablePackages.map((pkg) => (
                    <div key={pkg.id} className="flex items-center justify-between p-3 border border-green-200 rounded-lg">
                      <div>
                        <h3 className="font-semibold text-green-900">{pkg.package.name}</h3>
                        <p className="text-sm text-green-600">
                          {pkg.classesRemaining} classes remaining • Expires {new Date(pkg.expiresAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedPackageId(selectedPackageId === pkg.id ? null : pkg.id)}
                        className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                          selectedPackageId === pkg.id
                            ? 'bg-green-600 text-white'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {selectedPackageId === pkg.id ? 'Selected' : 'Use Package'}
                      </button>
                    </div>
                  ))}
                </div>
                
                {selectedPackageId && (
                  <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg">
                    <p className="text-green-800 text-sm">
                      ✅ Package selected! This class will be booked using your package (no additional charge).
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Booking Form */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-orange-800 mb-4">Book This Class</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-orange-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      required
                      className="w-full border border-orange-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-orange-700 mb-1">
                      Email *
                    </label>
                    <input
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      type="email"
                      required
                      className="w-full border border-orange-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-orange-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="(555) 123-4567"
                    type="tel"
                    className="w-full border border-orange-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-orange-700 mb-1">
                    Waiver Name *
                  </label>
                  <input
                    name="waiverName"
                    value={form.waiverName}
                    onChange={handleChange}
                    placeholder="Name for liability waiver"
                    required
                    className="w-full border border-orange-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="flex items-start space-x-3">
                  <input
                    name="waiverAgreed"
                    type="checkbox"
                    checked={form.waiverAgreed}
                    onChange={handleChange}
                    required
                    className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500 border-orange-300 rounded"
                  />
                  <label className="text-sm text-orange-700">
                    I agree to the liability waiver and understand the risks associated with physical activity. *
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={booking}
                  className={`w-full py-3 px-6 rounded-lg transition-colors disabled:opacity-50 ${
                    selectedPackageId 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-orange-600 hover:bg-orange-700 text-white'
                  }`}
                >
                  {booking ? 'Processing...' : 
                    selectedPackageId 
                      ? 'Book Class with Package (Free)' 
                      : `Book Class for ${formatPrice(individualPrice)}`
                  }
                </button>
              </form>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-orange-800 mb-4">Pricing Summary</h3>
              
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
                
                <div className="border-b border-orange-200 pb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-orange-700">Individual Class</span>
                    <span className="font-semibold text-orange-900">{formatPrice(individualPrice)}</span>
                  </div>
                  <p className="text-xs text-orange-500 mt-1">
                    {individualPrice === 10 ? 'Current price until August 31, 2025' : 'New price effective September 1, 2025'}
                  </p>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-orange-700 font-medium">4-Class Package</span>
                    <span className="font-semibold text-orange-900">{formatPrice(packagePrice)}</span>
                  </div>
                  <p className="text-xs text-green-600 font-semibold">
                    Save {formatPrice(savings)} ({savingsPercentage}% off!)
                  </p>
                  <p className="text-xs text-orange-600 mt-1">
                    Expires in 3 months
                  </p>
                </div>

                <Link
                  href="/packages"
                  className="block w-full bg-orange-100 text-orange-800 text-center py-2 rounded hover:bg-orange-200 transition-colors text-sm font-medium"
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