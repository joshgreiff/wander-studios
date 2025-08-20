'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  getPackagePrice, 
  getCurrentIndividualClassPrice, 
  calculatePackageSavings, 
  getPackageSavingsPercentage,
  formatPrice 
} from '@/utils/pricing';

type User = {
  id: number;
  email: string;
  name: string;
};

type ClassPackage = {
  id: number;
  name: string;
  description: string;
  classCount: number;
  price: number;
  expiresInDays: number;
  isActive: boolean;
};

export default function PackagesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [packages, setPackages] = useState<ClassPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasingPackageId, setPurchasingPackageId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login?redirect=/packages');
      return;
    }

    const userObj = JSON.parse(userData);
    setUser(userObj);
    fetchPackages();
  }, [router]);

  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/packages');
      if (response.ok) {
        const data = await response.json();
        setPackages(data);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchasePackage = async (packageId: number) => {
    if (!user) return;

    setPurchasingPackageId(packageId);
    try {
      const response = await fetch('/api/packages/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId,
          userId: user.id,
          customerName: user.name,
          customerEmail: user.email,
          waiverName: user.name,
          waiverAgreed: true
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          window.location.href = data.url; // Redirect to payment
        }
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to purchase package');
      }
    } catch (error) {
      console.error('Error purchasing package:', error);
      alert('Network error. Please try again.');
    } finally {
      setPurchasingPackageId(null);
    }
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

  const individualPrice = getCurrentIndividualClassPrice();
  const packagePrice = getPackagePrice();
  const savings = calculatePackageSavings();
  const savingsPercentage = getPackageSavingsPercentage();

  return (
    <div className="min-h-screen bg-pink-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="bg-pink-50/95 rounded-lg shadow-md p-6 mb-6 border border-pink-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-serif font-bold text-brown-800">Class Packages</h1>
              <p className="text-brown-600 font-serif">Welcome, {user.name}!</p>
            </div>
            <Link
              href="/dashboard"
              className="text-brown-600 hover:text-brown-800 transition-colors font-serif"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Pricing Comparison */}
        <div className="bg-pink-50/95 rounded-lg shadow-md p-6 mb-6 border border-pink-200">
          <h2 className="text-xl font-serif font-semibold text-brown-700 mb-4">Pricing Comparison</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-pink-200 rounded-lg p-4 bg-white/50">
              <h3 className="font-serif font-semibold text-brown-800 mb-2">Individual Classes</h3>
              <p className="text-2xl font-serif font-bold text-brown-600">{formatPrice(individualPrice)}</p>
              <p className="text-sm text-brown-600 font-serif">per class</p>
              <p className="text-sm text-brown-500 mt-2 font-serif">
                {individualPrice === 10 ? 'Current price until August 31, 2025' : 'New price effective September 1, 2025'}
              </p>
            </div>
            <div className="border-2 border-pink-400 rounded-lg p-4 bg-pink-100">
              <h3 className="font-serif font-semibold text-brown-800 mb-2">4-Class Package</h3>
              <p className="text-2xl font-serif font-bold text-brown-600">{formatPrice(packagePrice)}</p>
              <p className="text-sm text-brown-600 font-serif">for 4 classes</p>
              <p className="text-sm text-green-600 font-serif font-semibold mt-2">
                Save {formatPrice(savings)} ({savingsPercentage}% off!)
              </p>
            </div>
          </div>
        </div>

        {/* Available Packages */}
        <div className="bg-pink-50/95 rounded-lg shadow-md p-6 border border-pink-200">
          <h2 className="text-xl font-serif font-semibold text-brown-700 mb-4">Available Packages</h2>
          
          {packages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-brown-600 font-serif">No packages available at the moment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {packages.map((pkg) => (
                <div key={pkg.id} className="border border-pink-200 rounded-lg p-6 bg-white/50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-serif font-semibold text-brown-800">{pkg.name}</h3>
                      <p className="text-brown-700 mt-1 font-serif">{pkg.description}</p>
                      <div className="mt-3 space-y-1">
                        <p className="text-sm text-brown-600 font-serif">
                          📅 Expires in {pkg.expiresInDays} days
                        </p>
                        <p className="text-sm text-brown-600 font-serif">
                          💰 {formatPrice(pkg.price)} for {pkg.classCount} classes
                        </p>
                        <p className="text-sm text-green-600 font-serif font-semibold">
                          💡 Save {formatPrice(savings)} compared to individual classes
                        </p>
                        <p className="text-sm text-blue-600 font-serif">
                          🎯 Lock in the $10/class rate with this package!
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-serif font-bold text-brown-600 mb-2">
                        {formatPrice(pkg.price)}
                      </p>
                      <button
                        onClick={() => handlePurchasePackage(pkg.id)}
                        disabled={purchasingPackageId === pkg.id}
                        className="bg-pink-600 text-white px-6 py-2 rounded hover:bg-pink-700 transition-colors disabled:opacity-50 font-serif"
                      >
                        {purchasingPackageId === pkg.id ? 'Processing...' : 'Purchase Package'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Package Benefits */}
        <div className="bg-pink-50/95 rounded-lg shadow-md p-6 mt-6 border border-pink-200">
          <h2 className="text-xl font-serif font-semibold text-brown-700 mb-4">Package Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <div className="text-green-500 text-xl">💰</div>
              <div>
                <h4 className="font-serif font-semibold text-brown-800">Save Money</h4>
                <p className="text-sm text-brown-600 font-serif">Get {savingsPercentage}% off compared to individual classes</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="text-green-500 text-xl">🎯</div>
              <div>
                <h4 className="font-serif font-semibold text-brown-800">Lock in $10 Rate</h4>
                <p className="text-sm text-brown-600 font-serif">Secure the current $10/class rate before prices increase</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="text-green-500 text-xl">⏰</div>
              <div>
                <h4 className="font-serif font-semibold text-brown-800">90-Day Expiration</h4>
                <p className="text-sm text-brown-600 font-serif">Use your classes within 3 months</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="text-green-500 text-xl">📱</div>
              <div>
                <h4 className="font-serif font-semibold text-brown-800">Easy Management</h4>
                <p className="text-sm text-brown-600 font-serif">Track your remaining classes in your dashboard</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 