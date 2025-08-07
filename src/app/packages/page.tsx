"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type ClassPackage = {
  id: number;
  name: string;
  description: string;
  classCount: number;
  price: number;
  discount?: number;
  isActive: boolean;
};

export default function PackagesPage() {
  const [packages, setPackages] = useState<ClassPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<ClassPackage | null>(null);
  const [form, setForm] = useState({ 
    customerName: '', 
    customerEmail: '', 
    customerPhone: '', 
    waiver: false, 
    signature: '' 
  });
  const [paying, setPaying] = useState<'square' | 'bitcoin' | null>(null);
  const _router = useRouter();

  useEffect(() => {
    fetch('/api/packages')
      .then(res => res.json())
      .then(data => {
        setPackages(data);
        setLoading(false);
      });
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  }

  function calculateFinalPrice(pkg: ClassPackage): number {
    if (pkg.discount) {
      return pkg.price * (1 - pkg.discount / 100);
    }
    return pkg.price;
  }

  async function handlePayment(method: 'square' | 'bitcoin') {
    if (!selectedPackage) return;
    
    setPaying(method);
    const api = method === 'square' ? '/api/packages/square-checkout' : '/api/packages/bitcoin-invoice';
    const body = {
      packageId: selectedPackage.id,
      customerName: form.customerName,
      customerEmail: form.customerEmail,
      customerPhone: form.customerPhone,
      waiverName: form.signature,
      waiverAgreed: form.waiver,
    };
    
    try {
      console.log(`Making ${method} payment request for package:`, body);
      
      const res = await fetch(api, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      console.log(`${method} payment response status:`, res.status);
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error(`${method} payment error response:`, errorData);
        alert(`Payment error: ${res.status} - ${errorData.error || 'Unknown error'}`);
        return;
      }
      
      const data = await res.json();
      console.log(`${method} payment success:`, data);
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Payment error - no URL returned');
      }
    } catch (error) {
      console.error(`${method} payment fetch error:`, error);
      alert(`Payment error: ${error instanceof Error ? error.message : 'Network error'}`);
    } finally {
      setPaying(null);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-200 via-orange-400 to-red-400 flex flex-col items-center p-4">
      <section className="max-w-4xl w-full bg-white/90 rounded-xl shadow p-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-6 text-orange-900 text-center">Class Packages</h1>
        <p className="text-orange-800 text-center mb-8 max-w-2xl">
          Save money and commit to your movement practice with our class packages. 
          Perfect for beginners and regular practitioners alike!
        </p>
        
        {loading ? (
          <div className="text-orange-700">Loading packages...</div>
        ) : packages.length === 0 ? (
          <div className="text-orange-700">No packages available at the moment.</div>
        ) : (
          <div className="w-full">
            {/* Package Selection */}
            {!selectedPackage && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {packages.map(pkg => (
                  <div key={pkg.id} className="border rounded-lg p-6 bg-white/80 shadow hover:shadow-lg transition">
                    <h3 className="text-xl font-bold text-orange-900 mb-2">{pkg.name}</h3>
                    <p className="text-orange-800 mb-4">{pkg.description}</p>
                    <div className="mb-4">
                      <span className="text-2xl font-bold text-orange-600">
                        ${calculateFinalPrice(pkg).toFixed(2)}
                      </span>
                      {pkg.discount && (
                        <span className="text-sm text-gray-500 line-through ml-2">
                          ${pkg.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <div className="text-orange-700 mb-4">
                      <strong>{pkg.classCount} classes</strong>
                      {pkg.discount && (
                        <span className="text-green-600 ml-2">
                          ({pkg.discount}% off!)
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedPackage(pkg)}
                      className="w-full bg-orange-600 text-white font-semibold py-2 px-4 rounded hover:bg-orange-700 transition"
                    >
                      Select Package
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Package Purchase Form */}
            {selectedPackage && (
              <div className="max-w-md mx-auto">
                <div className="mb-6 p-4 bg-orange-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-orange-900 mb-2">Selected Package</h3>
                  <p className="text-orange-800">{selectedPackage.name}</p>
                  <p className="text-orange-700">{selectedPackage.description}</p>
                  <p className="text-xl font-bold text-orange-600">
                    ${calculateFinalPrice(selectedPackage).toFixed(2)} for {selectedPackage.classCount} classes
                  </p>
                  <button
                    onClick={() => setSelectedPackage(null)}
                    className="text-orange-600 hover:text-orange-800 text-sm mt-2"
                  >
                    ← Choose different package
                  </button>
                </div>

                <form className="space-y-4">
                  <div>
                    <label className="block text-orange-900 font-semibold mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="customerName"
                      value={form.customerName}
                      onChange={handleChange}
                      className="w-full p-3 border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-orange-900 font-semibold mb-2">Email *</label>
                    <input
                      type="email"
                      name="customerEmail"
                      value={form.customerEmail}
                      onChange={handleChange}
                      className="w-full p-3 border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-orange-900 font-semibold mb-2">Phone</label>
                    <input
                      type="tel"
                      name="customerPhone"
                      value={form.customerPhone}
                      onChange={handleChange}
                      className="w-full p-3 border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="waiver"
                        checked={form.waiver}
                        onChange={handleChange}
                        className="mr-2"
                        required
                      />
                      <span className="text-orange-900">I agree to the waiver and release of liability *</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-orange-900 font-semibold mb-2">Digital Signature (Full Name) *</label>
                    <input
                      type="text"
                      name="signature"
                      value={form.signature}
                      onChange={handleChange}
                      placeholder="Type your full name to sign"
                      className="w-full p-3 border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                      className="w-full bg-orange-600 text-white font-semibold py-3 rounded hover:bg-orange-700 mt-2 disabled:opacity-60"
                      onClick={() => handlePayment('square')}
                      disabled={paying !== null || !form.customerName || !form.customerEmail || !form.signature || !form.waiver}
                    >
                      {paying === 'square' ? 'Processing...' : `Pay with Card (Square) $${calculateFinalPrice(selectedPackage).toFixed(2)}`}
                    </button>
                    <button
                      type="button"
                      className="w-full bg-yellow-500 text-white font-semibold py-3 rounded hover:bg-yellow-600 mt-2 disabled:opacity-60"
                      onClick={() => handlePayment('bitcoin')}
                      disabled={paying !== null || !form.customerName || !form.customerEmail || !form.signature || !form.waiver}
                    >
                      {paying === 'bitcoin' ? 'Processing...' : `Pay with Bitcoin (Speed) $${(calculateFinalPrice(selectedPackage) * 0.95).toFixed(2)}`}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
} 