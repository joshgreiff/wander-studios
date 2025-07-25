"use client";
import React, { useState, useEffect } from 'react';

type Class = {
  id: number;
  date: string;
  time: string;
  description: string;
  capacity: number;
};

type Waiver = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  emergencyContact: string;
  emergencyPhone: string;
  relationship?: string;
  healthConditions?: string;
  injuries?: string;
  medications?: string;
  isPregnant: boolean;
  pregnancyWeeks?: number;
  digitalSignature: string;
  waiverAgreed: boolean;
  healthInfoAgreed: boolean;
  createdAt: string;
};

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [classes, setClasses] = useState<Class[]>([]);
  const [waivers, setWaivers] = useState<Waiver[]>([]);
  const [form, setForm] = useState({ date: '', time: '', description: '', capacity: 10 });
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ date: '', time: '', description: '', capacity: 10 });
  const [activeTab, setActiveTab] = useState<'classes' | 'waivers'>('classes');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    // Auto-authenticate if localStorage says so
    if (typeof window !== 'undefined' && localStorage.getItem('isAdmin') === 'true') {
      setAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchClasses();
      fetchWaivers();
    }
  }, [authenticated]);

  async function fetchClasses() {
    setLoading(true);
    const res = await fetch('/api/classes');
    const data = await res.json();
    setClasses(data);
    setLoading(false);
  }

  async function fetchWaivers() {
    const res = await fetch('/api/waivers');
    const data = await res.json();
    setWaivers(data);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError('');
    setLoading(true);
    
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setAuthenticated(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem('isAdmin', 'true');
          // Dispatch custom event to notify navigation
          window.dispatchEvent(new CustomEvent('adminLoginStatusChanged', { detail: { isAdmin: true } }));
        }
      } else {
        setLoginError(data.error || 'Login failed');
      }
    } catch (error) {
      setLoginError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    setAuthenticated(false);
    setPassword('');
    setLoginError('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isAdmin');
      // Dispatch custom event to notify navigation
      window.dispatchEvent(new CustomEvent('adminLoginStatusChanged', { detail: { isAdmin: false } }));
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleEditChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  }

  function startEdit(classData: Class) {
    setEditingId(classData.id);
    setEditForm({
      date: classData.date.slice(0, 10), // Convert to YYYY-MM-DD format for input
      time: classData.time,
      description: classData.description,
      capacity: classData.capacity
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({ date: '', time: '', description: '', capacity: 10 });
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    
    setLoading(true);
    const res = await fetch(`/api/classes/${editingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    });
    if (res.ok) {
      setEditingId(null);
      setEditForm({ date: '', time: '', description: '', capacity: 10 });
      fetchClasses();
    } else {
      alert('Failed to update class');
    }
    setLoading(false);
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
              required
            />
            {loginError && (
              <p className="text-red-600 text-sm text-center">{loginError}</p>
            )}
            <button 
              type="submit" 
              className="bg-orange-600 text-white font-semibold py-2 rounded hover:bg-orange-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
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
      <section className="bg-white/90 rounded-xl shadow p-8 max-w-4xl w-full flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-4 text-orange-900">Admin Dashboard</h1>
        <button onClick={handleLogout} className="mb-4 self-end text-orange-700 hover:underline">Log out</button>
        
        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6 w-full">
          <button
            onClick={() => setActiveTab('classes')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              activeTab === 'classes' 
                ? 'bg-orange-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Manage Classes
          </button>
          <button
            onClick={() => setActiveTab('waivers')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              activeTab === 'waivers' 
                ? 'bg-orange-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            View Waivers ({waivers.length})
          </button>
        </div>

        {activeTab === 'classes' && (
          <>
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
                <li key={c.id} className="border-b py-2">
                  {editingId === c.id ? (
                    // Edit form
                    <form onSubmit={handleEditSubmit} className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <div className="flex flex-col flex-1">
                          <label className="text-sm font-bold text-orange-700 mb-1">Date</label>
                          <input type="date" name="date" value={editForm.date} onChange={handleEditChange} className="border rounded px-2 py-1 flex-1" required />
                        </div>
                        <div className="flex flex-col flex-1">
                          <label className="text-sm font-bold text-orange-700 mb-1">Time</label>
                          <input type="time" name="time" value={editForm.time} onChange={handleEditChange} className="border rounded px-2 py-1 flex-1" required />
                        </div>
                        <div className="flex flex-col w-20">
                          <label className="text-sm font-bold text-orange-700 mb-1">Capacity</label>
                          <input type="number" name="capacity" value={editForm.capacity} onChange={handleEditChange} className="border rounded px-2 py-1 w-20" min={1} required />
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm font-bold text-orange-700 mb-1">Description</label>
                        <textarea name="description" value={editForm.description} onChange={handleEditChange} className="border rounded px-2 py-1" placeholder="Class description" required />
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" className="bg-green-600 text-white font-semibold py-1 px-3 rounded hover:bg-green-700 text-sm" disabled={loading}>
                          {loading ? 'Saving...' : 'Save'}
                        </button>
                        <button type="button" onClick={cancelEdit} className="bg-gray-500 text-white font-semibold py-1 px-3 rounded hover:bg-gray-600 text-sm">
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    // Display mode
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-orange-900">{c.date?.slice(0, 10)} {c.time} — {c.description} (Capacity: {c.capacity})</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(c)} className="text-blue-600 hover:underline text-sm">Edit</button>
                        <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:underline text-sm">Delete</button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}

        {activeTab === 'waivers' && (
          <div className="w-full">
            <h2 className="text-xl font-bold mb-4 text-orange-900">Submitted Waivers</h2>
            {waivers.length === 0 ? (
              <p className="text-orange-700">No waivers submitted yet.</p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {waivers.map(waiver => (
                  <div key={waiver.id} className="border rounded-lg p-4 bg-orange-50">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-orange-900">
                        {waiver.firstName} {waiver.lastName}
                      </h3>
                      <span className="text-sm text-orange-700">
                        {new Date(waiver.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-800">
                      <div><strong className="text-orange-800">Email:</strong> {waiver.email}</div>
                      {waiver.phone && <div><strong className="text-orange-800">Phone:</strong> {waiver.phone}</div>}
                      <div><strong className="text-orange-800">Emergency Contact:</strong> {waiver.emergencyContact}</div>
                      <div><strong className="text-orange-800">Emergency Phone:</strong> {waiver.emergencyPhone}</div>
                      {waiver.healthConditions && (
                        <div className="md:col-span-2"><strong className="text-orange-800">Health Conditions:</strong> {waiver.healthConditions}</div>
                      )}
                      {waiver.injuries && (
                        <div className="md:col-span-2"><strong className="text-orange-800">Injuries:</strong> {waiver.injuries}</div>
                      )}
                      {waiver.medications && (
                        <div className="md:col-span-2"><strong className="text-orange-800">Medications:</strong> {waiver.medications}</div>
                      )}
                      {waiver.isPregnant && (
                        <div><strong className="text-orange-800">Pregnant:</strong> Yes {waiver.pregnancyWeeks && `(${waiver.pregnancyWeeks} weeks)`}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

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