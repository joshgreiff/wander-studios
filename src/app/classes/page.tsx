"use client";
import React, { useEffect, useState } from 'react';

type Class = {
  id: number;
  date: string;
  time: string;
  description: string;
  capacity: number;
};

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

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
                  <div className="text-orange-700 text-sm">Capacity: {c.capacity}</div>
                </div>
                <button className="mt-4 sm:mt-0 bg-orange-600 text-white font-semibold py-2 px-6 rounded hover:bg-orange-700 transition">Book</button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
} 