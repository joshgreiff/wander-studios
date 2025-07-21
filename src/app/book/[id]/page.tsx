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
  const [submitted, setSubmitted] = useState(false);
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

  async function handlePayment(method: 'square' | 'bitcoin') {
    setPaying(method);
    const api = method === 'square' ? '/api/square-checkout' : '/api/bitcoin-invoice';
    const body = {
      name: form.name,
      email: form.email,
      classId: classData?.id,
    };
    try {
      const res = await fetch(api, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Payment error');
      }
    } catch {
      alert('Payment error');
    } finally {
      setPaying(null);
    }
  }

  // Format time to 12-hour format with EST
  let formattedTime = classData?.time;
  if (classData?.time) {
    const dateObj = new Date(`1970-01-01T${classData.time}`);
    formattedTime = dateObj.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'America/New_York',
      timeZoneName: 'short'
    });
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
              <div>Date: {classData.date?.slice(0, 10)}</div>
              <div>Time: {formattedTime}</div>
              <div>Capacity: {classData.capacity}</div>
            </div>
            <form onSubmit={e => e.preventDefault()} className="w-full max-w-md flex flex-col gap-4 bg-white/90 rounded p-6 border shadow">
              {submitted ? (
                <div className="text-green-700 font-semibold">Booking submitted! (Payment coming soon)</div>
              ) : (
                <>
                  <div className="flex flex-col gap-3 sm:flex-row sm:gap-2">
                    <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required className="border rounded px-3 py-2 flex-1 min-w-0 max-w-xs bg-white placeholder-gray-600 text-orange-900 focus:outline-orange-400" />
                    <input name="email" value={form.email} onChange={handleChange} placeholder="Email" type="email" required className="border rounded px-3 py-2 flex-1 min-w-0 max-w-xs bg-white placeholder-gray-600 text-orange-900 focus:outline-orange-400" />
                    <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="border rounded px-3 py-2 flex-1 min-w-0 max-w-xs bg-white placeholder-gray-600 text-orange-900 focus:outline-orange-400" />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <input type="checkbox" name="waiver" checked={form.waiver} onChange={handleChange} required />
                    <span className="text-orange-800 text-sm">I agree to the liability waiver</span>
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
              )}
            </form>
          </>
        )}
      </section>
    </main>
  );
} 