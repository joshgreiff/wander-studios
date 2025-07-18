"use client";
import React, { useState, useEffect } from 'react';

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || '';

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [classes, setClasses] = useState<any[]>([]);
  const [form, setForm] = useState({ date: '', time: '', description: '', capacity: 10 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Auto-authenticate if localStorage says so
    if (typeof window !== 'undefined' && localStorage.getItem('isAdmin') === 'true') {
      setAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (authenticated) fetchClasses();
    // eslint-disable-next-line
  }, [authenticated]);

  async function fetchClasses() {
    setLoading(true);
    const res = await fetch('/api/classes');
    const data = await res.json();
    setClasses(data);
    setLoading(false);
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      if (typeof window !== 'undefined') localStorage.setItem('isAdmin', 'true');
    } else alert('Incorrect password');
  }

  function handleLogout() {
    setAuthenticated(false);
    setPassword('');
    if (typeof window !== 'undefined') localStorage.removeItem('isAdmin');
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleAddClass(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ date: '', time: '', description: '', capacity: 10 });
      fetchClasses();
    } else {
      alert('Failed to add class');
    }
    setLoading(false);
  }

  async function handleDelete(id: number) {
    setLoading(true);
    const res = await fetch(`/api/classes/${id}`, { method: 'DELETE' });
    if (res.ok) fetchClasses();
    else alert('Failed to delete class');
    setLoading(false);
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-200 via-orange-400 to-red-400 p-4">
        <section className="bg-white/90 rounded-xl shadow p-8 max-w-sm w-full flex flex-col items-center">
          <h1 className="text-2xl font-bold mb-4 text-orange-900">Admin Login</h1>
          <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="border rounded px-4 py-2"
              style={{ color: '#b45309' }}
            />
            <button type="submit" className="bg-orange-600 text-white font-semibold py-2 rounded hover:bg-orange-700">Login</button>
          </form>
          <style jsx global>{`
            input[type='password']::placeholder {
              color: #f59e42 !important;
              opacity: 1;
            }
          `}</style>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center bg-gradient-to-br from-orange-200 via-orange-400 to-red-400 p-4">
      <section className="bg-white/90 rounded-xl shadow p-8 max-w-xl w-full flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-4 text-orange-900">Manage Classes</h1>
        <button onClick={handleLogout} className="mb-4 self-end text-orange-700 hover:underline">Log out</button>
        <form onSubmit={handleAddClass} className="flex flex-col gap-2 w-full mb-6">
          <div className="flex gap-2">
            <div className="flex flex-col flex-1">
              <label className="text-sm font-bold text-orange-700 mb-1" htmlFor="date">Date</label>
              <input type="date" id="date" name="date" value={form.date} onChange={handleChange} className="border rounded px-2 py-1 flex-1" required />
            </div>
            <div className="flex flex-col flex-1">
              <label className="text-sm font-bold text-orange-700 mb-1" htmlFor="time">Time</label>
              <input type="time" id="time" name="time" value={form.time} onChange={handleChange} className="border rounded px-2 py-1 flex-1" required />
            </div>
            <div className="flex flex-col w-20">
              <label className="text-sm font-bold text-orange-700 mb-1" htmlFor="capacity">Capacity</label>
              <input type="number" id="capacity" name="capacity" value={form.capacity} onChange={handleChange} className="border rounded px-2 py-1 w-20" min={1} required />
            </div>
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-bold text-orange-700 mb-1" htmlFor="description">Description</label>
            <textarea id="description" name="description" value={form.description} onChange={handleChange} className="border rounded px-2 py-1" placeholder="Class description" required />
          </div>
          <button type="submit" className="bg-orange-600 text-white font-semibold py-2 rounded hover:bg-orange-700" disabled={loading}>{loading ? 'Saving...' : 'Add Class'}</button>
        </form>
        {loading && <div className="text-orange-700 mb-2">Loading...</div>}
        <ul className="w-full">
          {classes.map(c => (
            <li key={c.id} className="flex items-center justify-between border-b py-2">
              <div>
                <span className="font-semibold text-orange-900">{c.date?.slice(0, 10)} {c.time}</span> — {c.description} (Capacity: {c.capacity})
              </div>
              <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:underline ml-4">Delete</button>
            </li>
          ))}
        </ul>
        <style jsx global>{`
          input, textarea {
            color: #b45309 !important;
          }
          input::placeholder, textarea::placeholder {
            color: #f59e42 !important;
            opacity: 1;
          }
        `}</style>
      </section>
    </main>
  );
} 