"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Class = {
  id: number;
  date: string;
  time: string;
  description: string;
  address?: string;
  capacity: number;
  bookings: Array<{
    id: number;
    name: string;
    email: string;
  }>;
};

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/classes')
      .then(res => res.json())
      .then(data => {
        setClasses(data);
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-200 via-orange-400 to-red-400 flex flex-col items-center p-4">
      <section className="max-w-2xl w-full bg-white/90 rounded-xl shadow p-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-6 text-orange-900 text-center">Upcoming Classes</h1>
        {loading ? (
          <div className="text-orange-700">Loading...</div>
        ) : classes.length === 0 ? (
          <div className="text-orange-700">No classes scheduled yet.</div>
        ) : (
          <ul className="w-full flex flex-col gap-4">
            {classes.map(c => (
              <li key={c.id} className="border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between bg-white/80 shadow">
                <div>
                  <div className="font-semibold text-orange-900 text-lg">{c.date?.slice(0, 10)} {c.time}</div>
                  <div className="text-orange-800">{c.description}</div>
                  {c.address && <div className="text-orange-700 text-sm">📍 {c.address}</div>}
                  <div className="text-orange-700 text-sm">
                    📊 {c.bookings?.length || 0} / {c.capacity} spots filled
                    {c.bookings && c.bookings.length >= c.capacity && (
                      <span className="text-red-600 font-semibold ml-2">• FULL</span>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => router.push(`/book/${c.id}`)}
                  disabled={c.bookings && c.bookings.length >= c.capacity}
                  className={`mt-4 sm:mt-0 font-semibold py-2 px-6 rounded transition ${
                    c.bookings && c.bookings.length >= c.capacity
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-orange-600 text-white hover:bg-orange-700'
                  }`}
                >
                  {c.bookings && c.bookings.length >= c.capacity ? 'Full' : 'Book'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
} 