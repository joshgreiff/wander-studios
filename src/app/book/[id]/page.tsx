"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Class = {
  id: number;
  date: string;
  time: string;
  description: string;
  capacity: number;
};

export default function BookClassPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const router = useRouter();
  const [classData, setClassData] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', phone: '', waiver: false, signature: '' });
  const [paying, setPaying] = useState<'square' | 'bitcoin' | null>(null);

  useEffect(() => {
    fetch(`/api/classes/${id}`)
      .then(res => res.json())
      .then(data => {
        setClassData(data);
        setLoading(false);
      });
  }, [id]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  }

  // Function to format date and time
  function formatDateTime(dateString: string, timeString: string) {
    // Handle both ISO date strings and simple date strings
    let date: Date;
    if (dateString.includes('T')) {
      // ISO date string from database (e.g., "2025-08-09T00:00:00.000Z")
      date = new Date(dateString);
    } else {
      // Simple date string (e.g., "2025-08-09")
      const [year, month, day] = dateString.split('-').map(Number);
      date = new Date(year, month - 1, day); // month is 0-indexed
    }
    
    // Format date like "Saturday, August 9th"
    const dateOptions: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/New_York'
    };
    
    // Add ordinal suffix to day
    const displayDay = date.getDate();
    const suffix = getOrdinalSuffix(displayDay);
    
    const formattedDate = date.toLocaleDateString('en-US', dateOptions).replace(/\d+$/, displayDay + suffix);
    
    // Format time like "10:00am EST"
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'America/New_York',
      timeZoneName: 'short'
    };
    
    const time = new Date(`1970-01-01T${timeString}`);
    const formattedTime = time.toLocaleTimeString('en-US', timeOptions);
    
    return `${formattedDate} at ${formattedTime}`;
  }

  // Function to get ordinal suffix (1st, 2nd, 3rd, etc.)
  function getOrdinalSuffix(day: number) {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  }

  async function handlePayment(method: 'square' | 'bitcoin') {
    setPaying(method);
    const api = method === 'square' ? '/api/square-checkout' : '/api/bitcoin-invoice';
    const body = {
      name: form.name,
      email: form.email,
      classId: classData?.id,
    };
    try {
      console.log(`Making ${method} payment request:`, body);
      
      const res = await fetch(api, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      console.log(`${method} payment response status:`, res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`${method} payment error response:`, errorText);
        alert(`Payment error: ${res.status} - ${errorText}`);
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
      <section className="max-w-xl w-full bg-white/90 rounded-xl shadow p-8 flex flex-col items-center">
        <button onClick={() => router.back()} className="mb-4 text-orange-700 hover:underline">&larr; Back to Classes</button>
        {loading ? (
          <div className="text-orange-700">Loading...</div>
        ) : !classData ? (
          <div className="text-orange-700">Class not found.</div>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-2 text-orange-900 text-center">Book: {classData.description}</h1>
            <div className="mb-4 text-orange-800 text-center">
              <div className="font-semibold text-lg">{formatDateTime(classData.date, classData.time)}</div>
              <div>Capacity: {classData.capacity}</div>
            </div>
            <form onSubmit={e => e.preventDefault()} className="w-full max-w-md flex flex-col gap-4 bg-white/90 rounded p-6 border shadow">
                <>
                  <div className="flex flex-col gap-3 sm:flex-row sm:gap-2">
                    <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required className="border rounded px-3 py-2 flex-1 min-w-0 max-w-xs bg-white placeholder-gray-600 text-orange-900 focus:outline-orange-400" />
                    <input name="email" value={form.email} onChange={handleChange} placeholder="Email" type="email" required className="border rounded px-3 py-2 flex-1 min-w-0 max-w-xs bg-white placeholder-gray-600 text-orange-900 focus:outline-orange-400" />
                    <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="border rounded px-3 py-2 flex-1 min-w-0 max-w-xs bg-white placeholder-gray-600 text-orange-900 focus:outline-orange-400" />
                  </div>
                  
                  {/* Waiver Section */}
                  <div className="bg-orange-50 rounded-lg p-4 mt-2">
                    <h4 className="font-semibold text-orange-900 mb-2">Liability Waiver & Health Information</h4>
                    <p className="text-sm text-orange-700 mb-3">
                      <strong>First-time students:</strong> Please complete our full liability waiver and health form before your first class for your safety and our records.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 mb-3">
                      <a 
                        href="/waiver" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded text-center text-sm transition"
                      >
                        Complete Full Waiver
                      </a>
                      <span className="text-xs text-orange-600 text-center sm:self-center">
                        (Opens in new tab)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" name="waiver" checked={form.waiver} onChange={handleChange} required />
                      <span className="text-orange-800 text-sm">
                        I agree to the{' '}
                        <a href="/waiver" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-800 underline">
                          liability waiver terms
                        </a>
                      </span>
                    </div>
                  </div>
                  
                  <input name="signature" value={form.signature} onChange={handleChange} placeholder="Type your name as signature" required className="border rounded px-3 py-2 mt-2 bg-white placeholder-gray-600 text-orange-900 focus:outline-orange-400" />
                  <button
                    type="button"
                    className="bg-orange-600 text-white font-semibold py-3 rounded hover:bg-orange-700 mt-2 disabled:opacity-60"
                    onClick={() => handlePayment('square')}
                    disabled={paying !== null || !form.name || !form.email || !form.signature || !form.waiver}
                  >
                    {paying === 'square' ? 'Processing...' : 'Pay with Card (Square) $10'}
                  </button>
                  <button
                    type="button"
                    className="bg-yellow-500 text-white font-semibold py-3 rounded hover:bg-yellow-600 mt-2 disabled:opacity-60"
                    onClick={() => handlePayment('bitcoin')}
                    disabled={paying !== null || !form.name || !form.email || !form.signature || !form.waiver}
                  >
                    {paying === 'bitcoin' ? 'Processing...' : 'Pay with Bitcoin (Speed) $9.50'}
                  </button>
                </>
            </form>
          </>
        )}
      </section>
    </main>
  );
} 