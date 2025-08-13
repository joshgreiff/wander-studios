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
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-orange-600">Loading...</div>
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
    <div className="min-h-screen bg-orange-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-orange-900">Class Packages</h1>
              <p className="text-orange-600">Welcome, {user.name}!</p>
            </div>
            <Link
              href="/dashboard"
              className="text-orange-600 hover:text-orange-800 transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Pricing Comparison */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-orange-800 mb-4">Pricing Comparison</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-orange-200 rounded-lg p-4">
              <h3 className="font-semibold text-orange-900 mb-2">Individual Classes</h3>
              <p className="text-2xl font-bold text-orange-600">{formatPrice(individualPrice)}</p>
              <p className="text-sm text-orange-600">per class</p>
              <p className="text-sm text-orange-500 mt-2">
                {individualPrice === 10 ? 'Current price until August 31, 2025' : 'New price effective September 1, 2025'}
              </p>
            </div>
            <div className="border-2 border-orange-400 rounded-lg p-4 bg-orange-50">
              <h3 className="font-semibold text-orange-900 mb-2">4-Class Package</h3>
              <p className="text-2xl font-bold text-orange-600">{formatPrice(packagePrice)}</p>
              <p className="text-sm text-orange-600">for 4 classes</p>
              <p className="text-sm text-green-600 font-semibold mt-2">
                Save {formatPrice(savings)} ({savingsPercentage}% off!)
              </p>
            </div>
          </div>
        </div>

        {/* Available Packages */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-orange-800 mb-4">Available Packages</h2>
          
          {packages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-orange-600">No packages available at the moment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {packages.map((pkg) => (
                <div key={pkg.id} className="border border-orange-200 rounded-lg p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-orange-900">{pkg.name}</h3>
                      <p className="text-orange-700 mt-1">{pkg.description}</p>
                      <div className="mt-3 space-y-1">
                        <p className="text-sm text-orange-600">
                          📅 Expires in {pkg.expiresInDays} days
                        </p>
                        <p className="text-sm text-orange-600">
                          💰 {formatPrice(pkg.price)} for {pkg.classCount} classes
                        </p>
                        <p className="text-sm text-green-600 font-semibold">
                          💡 Save {formatPrice(savings)} compared to individual classes
                        </p>
                        <p className="text-sm text-blue-600">
                          🎯 Lock in the $10/class rate with this package!
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-orange-600 mb-2">
                        {formatPrice(pkg.price)}
                      </p>
                      <button
                        onClick={() => handlePurchasePackage(pkg.id)}
                        disabled={purchasingPackageId === pkg.id}
                        className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700 transition-colors disabled:opacity-50"
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
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-semibold text-orange-800 mb-4">Package Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <div className="text-green-500 text-xl">💰</div>
              <div>
                <h4 className="font-semibold text-orange-900">Save Money</h4>
                <p className="text-sm text-orange-600">Get {savingsPercentage}% off compared to individual classes</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="text-green-500 text-xl">🎯</div>
              <div>
                <h4 className="font-semibold text-orange-900">Lock in $10 Rate</h4>
                <p className="text-sm text-orange-600">Secure the current $10/class rate before prices increase</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="text-green-500 text-xl">⏰</div>
              <div>
                <h4 className="font-semibold text-orange-900">90-Day Expiration</h4>
                <p className="text-sm text-orange-600">Use your classes within 3 months</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="text-green-500 text-xl">📱</div>
              <div>
                <h4 className="font-semibold text-orange-900">Easy Management</h4>
                <p className="text-sm text-orange-600">Track your remaining classes in your dashboard</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 