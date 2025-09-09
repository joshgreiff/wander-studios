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
  isVirtual?: boolean;
  virtualLink?: string;
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
        console.log('Classes data:', data); // Debug: see the actual date format
        setClasses(data);
        setLoading(false);
      });
  }, []);

  const formatDateTime = (date: string, time: string) => {
    try {
      // Parse the date string to extract year, month, day
      // Handle both ISO format (2025-08-31T00:00:00.000Z) and simple format (2025-08-31)
      let year: number, month: number, day: number;
      
      if (date.includes('T')) {
        // ISO format: extract date part before 'T'
        const datePart = date.split('T')[0];
        [year, month, day] = datePart.split('-').map(Number);
      } else {
        // Simple format: YYYY-MM-DD
        [year, month, day] = date.split('-').map(Number);
      }
      
      // Validate the parsed values
      if (!year || !month || !day || isNaN(year) || isNaN(month) || isNaN(day)) {
        console.error('Invalid date components:', { year, month, day, originalDate: date });
        return 'Date Error';
      }
      
      // Create a date object to get the day of the week
      const dateObj = new Date(year, month - 1, day);
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayOfWeek = dayNames[dateObj.getDay()];
      
      // Parse the time string (format: "HH:MM")
      const [hours, minutes] = time.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) {
        console.error('Invalid time components:', { hours, minutes, originalTime: time });
        return 'Time Error';
      }
      
      const hour = hours % 12 || 12;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      
      return `${dayOfWeek} ${month}/${day} ${hour}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    } catch (error) {
      console.error('Error formatting date:', error, 'Date:', date, 'Time:', time);
      return 'Date Error';
    }
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
                    <div className="font-serif font-semibold text-brown-800 text-lg">
                      {formatDateTime(c.date, c.time)}
                      {c.isVirtual && <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Virtual</span>}
                    </div>
                    <div className="text-brown-700 font-serif">{c.description}</div>
                    <div className="text-brown-600 text-sm font-serif">
                      {isFull ? (
                        <span className="text-red-600 font-serif font-semibold">Class Full ({c.capacity}/{c.capacity})</span>
                      ) : (
                        <span>Available Spots: {availableSpots}/{c.capacity}</span>
                      )}
                    </div>
                    {c.isVirtual && (
                      <div className="text-blue-700 text-sm mt-1">
                        🔗 Virtual class link will be provided after booking
                      </div>
                    )}
                    
                    {/* Calendar Integration for Logged-in Users */}
                    {user && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          onClick={() => {
                            const event = createClassCalendarEvent(
                              c.description,
                              new Date(c.date),
                              c.time,
                              `Join us for ${c.description} at Wander Movement!${c.isVirtual && c.virtualLink ? `\n\nVirtual Class Link: ${c.virtualLink}` : ''}`,
                              c.address,
                              c.virtualLink
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
                              new Date(c.date),
                              c.time,
                              `Join us for ${c.description} at Wander Movement!${c.isVirtual && c.virtualLink ? `\n\nVirtual Class Link: ${c.virtualLink}` : ''}`,
                              c.address,
                              c.virtualLink
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

      <section className="max-w-2xl w-full bg-warm-50/95 rounded-xl shadow p-8 mt-8 border border-warm-200">
        <h2 className="text-2xl font-serif font-bold mb-4 text-brown-800 text-center">Additional Classes at Generations - Starting 9/7</h2>
        <div className="text-brown-700 font-serif space-y-4">
          <p className="text-brown-700">
            Mat Pilates class in Westerville, OH, at Generations Performing Arts Center. To sign up, create an account, click Register, and then Classes. You will find the Pilates classes under &quot;Class Sessions&quot; please reach out to Ltwander@gmail.com with questions.
          </p>
          <div className="text-center">
            <a 
              href="https://app.gostudiopro.com/online/index.php?account_id=6191&device_id=&devicetoken=" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block bg-warm-400 hover:bg-warm-500 text-white font-serif font-semibold py-3 px-8 rounded-full transition"
            >
              Sign Up for Generations Classes
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
