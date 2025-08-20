"use client";
import React, { useEffect, useState } from 'react';
import { createClassCalendarEvent, generateICalEvent, generateGoogleCalendarUrl, downloadCalendarFile } from '@/utils/calendar';
import Link from 'next/link';

type User = {
  id: number;
  email: string;
  name: string;
  isAdmin?: boolean;
};

type Class = {
  id: number;
  date: string;
  time: string;
  description: string;
  capacity: number;
  address?: string;
  bookings?: Array<{ id: number }>;
};

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    fetch('/api/classes')
      .then(res => res.json())
      .then(data => {
        setClasses(data);
        setLoading(false);
      });
  }, []);

  const formatDateTime = (date: string, _time: string) => {
    const d = new Date(date);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const hours = d.getHours();
    const minutes = d.getMinutes();
    return `${month}/${day} ${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-warm-50 via-warm-100 to-warm-200 flex flex-col items-center p-4">
      <section className="max-w-2xl w-full bg-warm-50/95 rounded-xl shadow p-8 flex flex-col items-center border border-warm-200">
        <h1 className="text-3xl font-serif font-bold mb-6 text-brown-800 text-center">Upcoming Classes</h1>
        {loading ? (
          <div className="text-brown-700 font-serif">Loading...</div>
        ) : classes.length === 0 ? (
          <div className="text-brown-700 font-serif">No classes scheduled yet.</div>
        ) : (
          <ul className="w-full flex flex-col gap-4">
            {classes.map(c => {
              const currentBookings = c.bookings?.length || 0;
              const availableSpots = c.capacity - currentBookings;
              const isFull = availableSpots <= 0;
              
              return (
                <li key={c.id} className="border border-warm-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between bg-warm-50/80 shadow">
                  <div className="flex-1">
                    <div className="font-serif font-semibold text-brown-800 text-lg">{formatDateTime(c.date, c.time)}</div>
                    <div className="text-brown-700 font-serif">{c.description}</div>
                    <div className="text-brown-600 text-sm font-serif">
                      {isFull ? (
                        <span className="text-red-600 font-serif font-semibold">Class Full ({c.capacity}/{c.capacity})</span>
                      ) : (
                        <span>Available Spots: {availableSpots}/{c.capacity}</span>
                      )}
                    </div>
                    
                    {/* Calendar Integration for Logged-in Users */}
                    {user && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          onClick={() => {
                            const event = createClassCalendarEvent(
                              c.description,
                              c.date,
                              c.time,
                              60,
                              c.address,
                              `Join us for ${c.description} at Wander Movement!`
                            );
                            const icalContent = generateICalEvent(event);
                            downloadCalendarFile(icalContent, `wander-movement-${c.description.replace(/\s+/g, '-').toLowerCase()}.ics`);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors flex items-center space-x-1"
                        >
                          <span>📱</span>
                          <span>Apple</span>
                        </button>
                        <button
                          onClick={() => {
                            const event = createClassCalendarEvent(
                              c.description,
                              c.date,
                              c.time,
                              60,
                              c.address,
                              `Join us for ${c.description} at Wander Movement!`
                            );
                            const googleUrl = generateGoogleCalendarUrl(event);
                            window.open(googleUrl, '_blank');
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors flex items-center space-x-1"
                        >
                          <span>📅</span>
                          <span>Google</span>
                        </button>
                      </div>
                    )}
                  </div>
                  <Link
                    href={`/book/${c.id}`}
                    className={`mt-4 sm:mt-0 font-serif font-semibold py-2 px-6 rounded transition text-center ${
                      isFull 
                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                        : 'bg-warm-400 text-white hover:bg-warm-500'
                    }`}
                  >
                    {isFull ? 'Full' : 'Book'}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
} 