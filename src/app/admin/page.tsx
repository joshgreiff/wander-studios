"use client";
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useRouter } from 'next/navigation';

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
  address?: string;
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

type Booking = {
  id: number;
  classId: number;
  name: string;
  email: string;
  phone?: string;
  waiverName: string;
  waiverAgreed: boolean;
  paid: boolean;
  createdAt: string;
  paymentAmount?: number; // Added for Stripe revenue
  class?: Class;
};

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<Class[]>([]);
  const [waivers, setWaivers] = useState<Waiver[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [form, setForm] = useState({ date: '', time: '', description: '', address: '', capacity: 20 });
  const [bookingForm, setBookingForm] = useState({ 
    classId: '', 
    name: '', 
    email: '', 
    phone: '', 
    waiverName: '', 
    waiverAgreed: true, 
    paid: true 
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ date: '', time: '', description: '', address: '', capacity: 20 });
  const [activeTab, setActiveTab] = useState<'classes' | 'waivers' | 'bookings' | 'revenue'>('classes');
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [classBookings, setClassBookings] = useState<Booking[]>([]);
  const [bulkImportData, setBulkImportData] = useState('');
  const [bulkImportClassId, setBulkImportClassId] = useState('');
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [csvFiles, setCsvFiles] = useState<File[]>([]);
  const [importMethod, setImportMethod] = useState<'text' | 'csv'>('text');
  const [previewBookings, setPreviewBookings] = useState<Array<{ name: string; email?: string; phone?: string }>>([]);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    // Check if user is logged in and has admin privileges
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setUser(user);
      
      if (user.isAdmin) {
        setAuthenticated(true);
      } else {
        // User is logged in but not admin - redirect to home
        router.push('/');
        return;
      }
    } else {
      // No user logged in - redirect to login
      router.push('/login?redirect=/admin');
      return;
    }
    
    setLoading(false);
  }, [router]);

  useEffect(() => {
    if (authenticated && user?.isAdmin) {
      fetchClasses();
      fetchWaivers();
      fetchBookings();
      fetchSquareRevenue();
      generateQRCode();
    }
  }, [authenticated, user]);

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

  async function fetchBookings() {
    const res = await fetch('/api/bookings');
    const data = await res.json();
    setBookings(data);
  }

  async function fetchSquareRevenue() {
    try {
      const res = await fetch('/api/bookings/square-revenue');
      const data = await res.json();
      // Update bookings with real payment amounts
      setBookings(prevBookings => 
        prevBookings.map(booking => {
          const squareBooking = data.find((b: { id: number; paymentAmount: number }) => b.id === booking.id);
          return squareBooking ? { ...booking, paymentAmount: squareBooking.paymentAmount } : booking;
        })
      );
    } catch (error) {
      console.error('Error fetching Square revenue:', error);
    }
  }

  async function viewClassDetails(classData: Class) {
    setSelectedClass(classData);
    const res = await fetch(`/api/bookings?classId=${classData.id}`);
    const data = await res.json();
    setClassBookings(data);
  }

  function closeClassDetails() {
    setSelectedClass(null);
    setClassBookings([]);
  }

  function handleLogout() {
    // Clear user data and redirect to home
    localStorage.removeItem('user');
    router.push('/');
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
      address: classData.address || '',
      capacity: classData.capacity
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({ date: '', time: '', description: '', address: '', capacity: 10 });
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
      setEditForm({ date: '', time: '', description: '', address: '', capacity: 10 });
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
      setForm({ date: '', time: '', description: '', address: '', capacity: 10 });
      fetchClasses();
    } else {
      alert('Failed to add class');
    }
    setLoading(false);
  }

  async function handleDelete(id: number) {
    if (confirm('Are you sure you want to delete this class?')) {
      await fetch(`/api/classes/${id}`, { method: 'DELETE' });
      fetchClasses();
    }
  }

  async function handleAddBooking(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingForm),
      });
      
      if (res.ok) {
        setBookingForm({ 
          classId: '', 
          name: '', 
          email: '', 
          phone: '', 
          waiverName: '', 
          waiverAgreed: true, 
          paid: true 
        });
        fetchBookings();
        alert('Booking created successfully!');
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch {
      alert('Failed to create booking');
    }
  }

  function handleBookingChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setBookingForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  }

  function parseSquareData(data: string): Array<{ name: string; email?: string; phone?: string }> {
    const lines = data.trim().split('\n');
    const bookings: Array<{ name: string; email?: string; phone?: string }> = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Look for name pattern (First Last)
      const nameMatch = line.match(/^([A-Z][a-z]+ [A-Z][a-z]+)/);
      if (nameMatch) {
        const name = nameMatch[1];
        bookings.push({ name });
      }
    }
    
    return bookings;
  }

  function parseCSVData(csvText: string): Array<{ name: string; email?: string; phone?: string }> {
    const lines = csvText.trim().split('\n');
    const bookings: Array<{ name: string; email?: string; phone?: string }> = [];
    
    console.log('CSV parsing debug - First few lines:', lines.slice(0, 3));
    
    // Try to find the header row
    let startRow = 1; // Default to skip first row
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i].toLowerCase();
      if (line.includes('customer') || line.includes('name') || line.includes('amount') || line.includes('date')) {
        startRow = i + 1;
        console.log('Found header at row:', i);
        break;
      }
    }
    
    for (let i = startRow; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      console.log('Processing line:', line);
      
      // Split by comma, handling quoted fields
      const fields = line.split(',').map(field => field.replace(/^"|"$/g, '').trim());
      console.log('Fields:', fields);
      
      let name = '';
      let email = '';
      
      // More flexible name matching
      for (let j = 0; j < fields.length; j++) {
        const field = fields[j];
        
        // Look for various name patterns
        const namePatterns = [
          /^([A-Z][a-z]+ [A-Z][a-z]+)$/, // First Last
          /^([A-Z][a-z]+ [A-Z][a-z]+ [A-Z][a-z]+)$/, // First Middle Last
          /^([A-Z][a-z]+ [A-Z][a-z]+-[A-Z][a-z]+)$/, // First Last-Last (hyphenated)
        ];
        
        for (const pattern of namePatterns) {
          const nameMatch = field.match(pattern);
          if (nameMatch && !name) {
            name = nameMatch[1];
            console.log('Found name:', name);
            break;
          }
        }
        
        // Look for email pattern
        const emailMatch = field.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
        if (emailMatch && !email) {
          email = emailMatch[1];
          console.log('Found email:', email);
        }
      }
      
      if (name) {
        bookings.push({ name, email: email || undefined });
        console.log('Added booking:', { name, email });
      } else {
        console.log('No name found in line:', line);
      }
    }
    
    console.log('Total bookings found:', bookings.length);
    return bookings;
  }

  async function handleCSVFileUpload(files: FileList | null) {
    if (!files) return;
    
    const fileArray = Array.from(files);
    setCsvFiles(fileArray);
    
    let allBookings: Array<{ name: string; email?: string; phone?: string }> = [];
    
    for (const file of fileArray) {
      try {
        const text = await file.text();
        const bookings = parseCSVData(text);
        allBookings = [...allBookings, ...bookings];
      } catch (error) {
        console.error('Error reading file:', file.name, error);
      }
    }
    
    // Remove duplicates based on name
    const uniqueBookings = allBookings.filter((booking, index, self) => 
      index === self.findIndex(b => b.name === booking.name)
    );
    
    setPreviewBookings(uniqueBookings);
    return uniqueBookings;
  }

  // Update preview when text data changes
  useEffect(() => {
    if (importMethod === 'text' && bulkImportData.trim()) {
      const bookings = parseSquareData(bulkImportData);
      setPreviewBookings(bookings);
    }
  }, [bulkImportData, importMethod]);

  // Revenue calculation functions
  function calculateRevenue(bookings: Booking[], _classData: Class[]) {
    const total = bookings.reduce((total, booking) => {
      if (booking.paid) {
        // Use actual payment amount from Square if available, otherwise default to $10.09 (net after fees)
        return total + (booking.paymentAmount || 10.09);
      }
      return total;
    }, 0);
    
    return Math.round(total * 100) / 100; // Round to 2 decimal places
  }

  function getRevenueByPeriod(bookings: Booking[], _classData: Class[], period: 'week' | 'month') {
    const now = new Date();
    
    const filteredBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.createdAt);
      if (period === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return bookingDate >= weekAgo && booking.paid;
      } else {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return bookingDate >= monthAgo && booking.paid;
      }
    });
    
    const total = filteredBookings.reduce((total, booking) => total + (booking.paymentAmount || 10.09), 0);
    return Math.round(total * 100) / 100; // Round to 2 decimal places
  }

  function getRevenueByClass(bookings: Booking[], _classData: Class[]) {
    const revenueByClass = new Map();
    
    bookings.forEach(booking => {
      if (booking.paid && booking.class) {
        const classKey = `${booking.class.date?.slice(0, 10)} ${booking.class.time}`;
        const current = revenueByClass.get(classKey) || 0;
        revenueByClass.set(classKey, current + (booking.paymentAmount || 10.09));
      }
    });
    
    return Array.from(revenueByClass.entries()).map(([className, revenue]) => ({
      className,
      revenue: Math.round((revenue as number) * 100) / 100, // Round to 2 decimal places
      bookings: bookings.filter(b => b.paid && b.class && `${b.class.date?.slice(0, 10)} ${b.class.time}` === className).length
    }));
  }

  async function handleBulkImport(e: React.FormEvent) {
    e.preventDefault();
    if (!bulkImportClassId) {
      alert('Please select a class');
      return;
    }

    let parsedBookings: Array<{ name: string; email?: string; phone?: string }> = [];
    
    if (importMethod === 'text') {
      if (!bulkImportData.trim()) {
        alert('Please paste the Square data');
        return;
      }
      parsedBookings = parseSquareData(bulkImportData);
    } else if (importMethod === 'csv') {
      if (csvFiles.length === 0) {
        alert('Please select CSV files');
        return;
      }
      parsedBookings = await handleCSVFileUpload(null) || [];
    }

    if (parsedBookings.length === 0) {
      alert('No valid bookings found in the data. Please check the format.');
      return;
    }

    setLoading(true);
    let successCount = 0;
    let errorCount = 0;

    for (const booking of parsedBookings) {
      try {
        const res = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            classId: parseInt(bulkImportClassId),
            name: booking.name,
            email: booking.email || `${booking.name.toLowerCase().replace(' ', '.')}@example.com`,
            phone: booking.phone || '',
            waiverName: booking.name,
            waiverAgreed: true,
            paid: true
          }),
        });
        
        if (res.ok) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch {
        errorCount++;
      }
    }

    setLoading(false);
    alert(`Bulk import complete: ${successCount} successful, ${errorCount} failed`);
    
    if (successCount > 0) {
      setBulkImportData('');
      setBulkImportClassId('');
      setCsvFiles([]);
      setShowBulkImport(false);
      fetchBookings();
    }
  }

  // Generate QR Code
  const generateQRCode = async () => {
    try {
      const websiteUrl = window.location.origin + '/book';
      const qrDataUrl = await QRCode.toDataURL(websiteUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeUrl(qrDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  // Download QR Code
  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.download = 'wander-studios-qr.png';
      link.href = qrCodeUrl;
      link.click();
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-200 via-orange-400 to-red-400 p-4">
        <section className="bg-white/90 rounded-xl shadow p-8 max-w-sm w-full flex flex-col items-center">
          <h1 className="text-2xl font-bold mb-4 text-orange-900">Loading...</h1>
          <p className="text-gray-600">Checking admin access...</p>
        </section>
      </main>
    );
  }

  if (!authenticated || !user?.isAdmin) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-200 via-orange-400 to-red-400 p-4">
        <section className="bg-white/90 rounded-xl shadow p-8 max-w-sm w-full flex flex-col items-center">
          <h1 className="text-2xl font-bold mb-4 text-orange-900">Access Denied</h1>
          <p className="text-gray-600 text-center mb-4">
            You need admin privileges to access this page.
          </p>
          <button 
            onClick={() => router.push('/')}
            className="bg-orange-600 text-white font-semibold py-2 px-4 rounded hover:bg-orange-700"
          >
            Go Home
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center bg-gradient-to-br from-orange-200 via-orange-400 to-red-400 p-4">
      <section className="bg-white/90 rounded-xl shadow p-8 max-w-4xl w-full flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-4 text-orange-900">Admin Dashboard</h1>
        <button onClick={handleLogout} className="mb-4 self-end text-orange-700 hover:underline">Log out</button>
        
        {/* QR Code Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-orange-800 mb-4">QR Code for Flyers</h2>
          <div className="flex items-center space-x-4">
            {qrCodeUrl && (
              <div className="text-center">
                <img src={qrCodeUrl} alt="QR Code" className="border-2 border-orange-200 rounded-lg" />
                <button
                  onClick={downloadQRCode}
                  className="mt-2 bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition-colors"
                >
                  Download QR Code
                </button>
              </div>
            )}
            <div className="text-sm text-gray-600">
              <p><strong>Website URL:</strong> {typeof window !== 'undefined' ? window.location.origin + '/book' : ''}</p>
              <p className="mt-2">This QR code links directly to the class booking page. Perfect for flyers, business cards, and marketing materials.</p>
            </div>
          </div>
        </div>

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
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              activeTab === 'bookings' 
                ? 'bg-orange-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            View Bookings ({bookings.length})
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
          <button
            onClick={() => setActiveTab('revenue')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              activeTab === 'revenue' 
                ? 'bg-orange-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Revenue Dashboard
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
              <div className="flex flex-col">
                <label className="text-sm font-bold text-orange-700 mb-1" htmlFor="address">Address (optional)</label>
                <input type="text" id="address" name="address" value={form.address} onChange={handleChange} className="border rounded px-2 py-1" placeholder="Class location address" />
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
                      <div className="flex flex-col">
                        <label className="text-sm font-bold text-orange-700 mb-1">Address (optional)</label>
                        <input type="text" name="address" value={editForm.address} onChange={handleEditChange} className="border rounded px-2 py-1" placeholder="Class location address" />
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
                        {c.address && <div className="text-sm text-orange-700 mt-1">📍 {c.address}</div>}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => viewClassDetails(c)} className="text-green-600 hover:underline text-sm">View Details</button>
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

        {activeTab === 'bookings' && (
          <div className="w-full">
            <h2 className="text-xl font-bold mb-4 text-orange-900">Manage Bookings</h2>
            
            {/* Bulk Import Section */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-blue-900">Bulk Import from Square</h3>
                <button
                  type="button"
                  onClick={() => setShowBulkImport(!showBulkImport)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                >
                  {showBulkImport ? 'Hide' : 'Show'} Bulk Import
                </button>
              </div>
              
              {showBulkImport && (
                <form onSubmit={handleBulkImport} className="space-y-3">
                  <div>
                    <label className="text-sm font-bold text-blue-700 mb-1">Select Class</label>
                    <select 
                      value={bulkImportClassId} 
                      onChange={e => setBulkImportClassId(e.target.value)}
                      className="border rounded px-2 py-1 w-full" 
                      required
                    >
                      <option value="">Select a class</option>
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.date?.slice(0, 10)} {c.time} — {c.description}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Import Method Selection */}
                  <div>
                    <label className="text-sm font-bold text-blue-700 mb-2">Import Method</label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="importMethod"
                          value="text"
                          checked={importMethod === 'text'}
                          onChange={e => setImportMethod(e.target.value as 'text' | 'csv')}
                          className="mr-2"
                        />
                        <span className="text-sm">Paste Text Data</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="importMethod"
                          value="csv"
                          checked={importMethod === 'csv'}
                          onChange={e => setImportMethod(e.target.value as 'text' | 'csv')}
                          className="mr-2"
                        />
                        <span className="text-sm">Upload CSV Files</span>
                      </label>
                    </div>
                  </div>

                  {importMethod === 'text' && (
                    <div>
                      <label className="text-sm font-bold text-blue-700 mb-1">Paste Square Payment Data</label>
                      <textarea 
                        value={bulkImportData} 
                        onChange={e => setBulkImportData(e.target.value)}
                        className="border rounded px-2 py-1 w-full h-32" 
                        placeholder="Paste the Square payment data here (names will be automatically extracted)"
                      />
                      {bulkImportData && (
                        <div className="text-sm text-blue-700 mt-1">
                          Found {parseSquareData(bulkImportData).length} names: {parseSquareData(bulkImportData).map(b => b.name).join(', ')}
                        </div>
                      )}
                    </div>
                  )}

                  {importMethod === 'csv' && (
                    <div>
                      <label className="text-sm font-bold text-blue-700 mb-1">Upload CSV Files</label>
                      <input
                        type="file"
                        multiple
                        accept=".csv"
                        onChange={async (e) => {
                          const files = e.target.files;
                          if (files) {
                            const bookings = await handleCSVFileUpload(files);
                            if (bookings) {
                              // Show preview
                              console.log('Found bookings:', bookings);
                            }
                          }
                        }}
                        className="border rounded px-2 py-1 w-full"
                      />
                      {csvFiles.length > 0 && (
                        <div className="text-sm text-blue-700 mt-1">
                          Selected {csvFiles.length} file(s): {csvFiles.map(f => f.name).join(', ')}
                        </div>
                      )}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    className="bg-blue-600 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700"
                    disabled={loading}
                  >
                    {loading ? 'Importing...' : `Import Bookings`}
                  </button>

                  {/* Preview Section */}
                  {previewBookings.length > 0 && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">
                        Preview: {previewBookings.length} bookings found
                      </h4>
                      <div className="max-h-32 overflow-y-auto">
                        {previewBookings.map((booking, index) => (
                          <div key={index} className="text-sm text-green-800">
                            • {booking.name} {booking.email && `(${booking.email})`}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Debug Info */}
                  {previewBookings.length === 0 && (bulkImportData.trim() || csvFiles.length > 0) && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                      <h4 className="font-semibold text-yellow-900 mb-2">
                        No bookings found. Check the console for debug info.
                      </h4>
                      <p className="text-sm text-yellow-800">
                        The system couldn&apos;t parse any names from your data. Check the browser console (F12) for detailed debug information.
                      </p>
                    </div>
                  )}
                </form>
              )}
            </div>
            
            {/* Add Booking Form */}
            <form onSubmit={handleAddBooking} className="bg-orange-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-orange-900 mb-3">Add Manual Booking (for existing customers)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-bold text-orange-700 mb-1">Class</label>
                  <select 
                    name="classId" 
                    value={bookingForm.classId} 
                    onChange={handleBookingChange}
                    className="border rounded px-2 py-1 w-full" 
                    required
                  >
                    <option value="">Select a class</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.date?.slice(0, 10)} {c.time} — {c.description}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold text-orange-700 mb-1">Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={bookingForm.name} 
                    onChange={handleBookingChange}
                    className="border rounded px-2 py-1 w-full" 
                    required 
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-orange-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={bookingForm.email} 
                    onChange={handleBookingChange}
                    className="border rounded px-2 py-1 w-full" 
                    required 
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-orange-700 mb-1">Phone (optional)</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={bookingForm.phone} 
                    onChange={handleBookingChange}
                    className="border rounded px-2 py-1 w-full" 
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-orange-700 mb-1">Waiver Signature</label>
                  <input 
                    type="text" 
                    name="waiverName" 
                    value={bookingForm.waiverName} 
                    onChange={handleBookingChange}
                    className="border rounded px-2 py-1 w-full" 
                    placeholder="Customer's signature" 
                    required 
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      name="waiverAgreed" 
                      checked={bookingForm.waiverAgreed} 
                      onChange={handleBookingChange}
                      className="mr-2" 
                    />
                    <span className="text-sm font-bold text-orange-700">Waiver Agreed</span>
                  </label>
                </div>
              </div>
              <button 
                type="submit" 
                className="bg-orange-600 text-white font-semibold py-2 px-4 rounded hover:bg-orange-700 mt-3"
              >
                Add Booking
              </button>
            </form>

            {/* Bookings List */}
            <h3 className="font-semibold text-orange-900 mb-3">All Bookings</h3>
            {bookings.length === 0 ? (
              <p className="text-orange-700">No bookings yet.</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {bookings.map(booking => (
                  <div key={booking.id} className="border rounded-lg p-3 bg-white">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-orange-900">{booking.name}</h4>
                        <p className="text-sm text-orange-700">{booking.email}</p>
                        {booking.phone && <p className="text-sm text-orange-700">{booking.phone}</p>}
                        {booking.class && (
                          <p className="text-sm text-orange-800">
                            {booking.class.date?.slice(0, 10)} {booking.class.time} — {booking.class.description}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded ${
                          booking.paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {booking.paid ? 'Paid' : 'Unpaid'}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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

        {activeTab === 'revenue' && (
          <div className="w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-orange-900">Revenue Dashboard</h2>
              <button
                onClick={() => {
                  fetchSquareRevenue();
                  fetchBookings();
                }}
                className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700"
              >
                Refresh Data
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-3">Total Revenue</h3>
                <div className="text-4xl font-bold text-blue-600">${calculateRevenue(bookings, classes)}</div>
                <p className="text-sm text-blue-800 mt-2">Based on all paid bookings</p>
              </div>
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="font-semibold text-green-900 mb-3">Revenue by Period</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="text-sm text-green-800">
                    <strong>Last Week:</strong> ${getRevenueByPeriod(bookings, classes, 'week')}
                  </div>
                  <div className="text-sm text-green-800">
                    <strong>Last Month:</strong> ${getRevenueByPeriod(bookings, classes, 'month')}
                  </div>
                </div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-6">
                <h3 className="font-semibold text-yellow-900 mb-3">Revenue by Class</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {getRevenueByClass(bookings, classes).map((item, index) => (
                    <div key={index} className="text-sm text-yellow-800">
                      <strong>{item.className}:</strong> ${item.revenue} ({item.bookings} bookings)
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}



        {/* Class Details Modal */}
        {selectedClass && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-orange-900">Class Details</h2>
                    <p className="text-lg text-orange-800">
                      {selectedClass.date?.slice(0, 10)} {selectedClass.time} — {selectedClass.description}
                    </p>
                    <p className="text-sm text-orange-700">
                      Capacity: {classBookings.length}/{selectedClass.capacity} ({selectedClass.capacity - classBookings.length} spots available)
                    </p>
                  </div>
                  <button 
                    onClick={closeClassDetails}
                    className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600">{classBookings.length}</div>
                    <div className="text-sm text-blue-800">Total Bookings</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {classBookings.filter(b => b.paid).length}
                    </div>
                    <div className="text-sm text-green-800">Paid</div>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {classBookings.filter(b => b.waiverAgreed).length}
                    </div>
                    <div className="text-sm text-yellow-800">Waiver Signed</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {selectedClass.capacity - classBookings.length}
                    </div>
                    <div className="text-sm text-purple-800">Available Spots</div>
                  </div>
                </div>

                {/* Bookings List */}
                <div>
                  <h3 className="text-lg font-semibold text-orange-900 mb-3">Student Bookings</h3>
                  {classBookings.length === 0 ? (
                    <p className="text-orange-700">No bookings for this class yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {classBookings.map(booking => (
                        <div key={booking.id} className="border rounded-lg p-4 bg-orange-50">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold text-orange-900 text-lg">{booking.name}</h4>
                              <p className="text-orange-700">{booking.email}</p>
                              {booking.phone && <p className="text-orange-700">{booking.phone}</p>}
                              <p className="text-sm text-orange-600">
                                Booked: {new Date(booking.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex flex-col gap-2 items-end">
                              <div className="flex gap-2">
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                  booking.paid 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {booking.paid ? '✓ Paid' : '✗ Unpaid'}
                                </span>
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                  booking.waiverAgreed 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {booking.waiverAgreed ? '✓ Waiver' : '✗ No Waiver'}
                                </span>
                              </div>
                              {booking.waiverName && (
                                <p className="text-xs text-gray-600">
                                  Signed: &quot;{booking.waiverName}&quot;
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
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