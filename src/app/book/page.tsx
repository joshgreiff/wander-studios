"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

type Class = {
  id: number;
  date: string;
  time: string;
  description: string;
  capacity: number;
  bookings?: Array<{ id: number }>;
};

export default function BookPage() {
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

  // Function to format date and time
  function formatDateTime(dateString: string, timeString: string) {
    // Handle both ISO date strings and simple date strings
    let date: Date;
    if (dateString.includes('T')) {
      // ISO date string from database (e.g., "2025-08-09T00:00:00.000Z")
      // Extract just the date part to avoid timezone issues
      const dateOnly = dateString.split('T')[0];
      const [year, month, day] = dateOnly.split('-').map(Number);
      date = new Date(year, month - 1, day); // month is 0-indexed
    } else {
      // Simple date string (e.g., "2025-08-09")
      const [year, month, day] = dateString.split('-').map(Number);
      date = new Date(year, month - 1, day); // month is 0-indexed
    }
    
    // Format date like "Saturday, August 9th" - use local timezone
    const dateOptions: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-warm-50 via-warm-100 to-warm-200 flex flex-col items-center p-4">
      <section className="max-w-2xl w-full bg-warm-50/95 rounded-xl shadow p-8 flex flex-col items-center border border-warm-200">
        <h1 className="text-3xl font-serif font-bold mb-6 text-brown-800 text-center">Book a Class</h1>
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
                  <div>
                    <div className="font-serif font-semibold text-brown-800 text-lg">{formatDateTime(c.date, c.time)}</div>
                    <div className="text-brown-700 font-serif">{c.description}</div>
                    <div className="text-brown-600 text-sm font-serif">
                      {isFull ? (
                        <span className="text-red-600 font-serif font-semibold">Class Full ({c.capacity}/{c.capacity})</span>
                      ) : (
                        <span>Available Spots: {availableSpots}/{c.capacity}</span>
                      )}
                    </div>
                  </div>
                  {isFull ? (
                    <div className="mt-4 sm:mt-0 text-center">
                      <span className="bg-red-100 text-red-800 px-3 py-2 rounded text-sm font-serif font-semibold">Full</span>
                    </div>
                  ) : (
                    <Link
                      href={`/book/${c.id}`}
                      className="mt-4 sm:mt-0 bg-warm-400 text-white font-serif font-semibold py-2 px-6 rounded hover:bg-warm-500 transition text-center"
                    >
                      Book
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
} 