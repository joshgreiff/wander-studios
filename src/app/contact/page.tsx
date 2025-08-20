"use client";
import React, { useState } from 'react';

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      
      if (res.ok) {
        setSubmitted(true);
        setForm({ name: '', email: '', subject: '', message: '' });
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to send message');
      }
    } catch {
      alert('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-200 to-pink-300 flex flex-col items-center p-4">
        <section className="max-w-2xl w-full bg-pink-50/90 rounded-xl shadow-lg p-8 mt-8 text-center border border-pink-200">
          <h2 className="text-3xl font-serif font-bold mb-4 text-brown-800">Thank You!</h2>
          <p className="mb-4 text-brown-700 font-serif">Your message has been sent successfully. We&apos;ll get back to you soon!</p>
          <button 
            onClick={() => setSubmitted(false)} 
            className="bg-pink-600 hover:bg-pink-700 text-white font-serif font-semibold py-2 px-6 rounded transition"
          >
            Send Another Message
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-200 to-pink-300 flex flex-col items-center p-4">
      <section className="max-w-2xl w-full bg-pink-50/90 rounded-xl shadow-lg p-8 mt-8 border border-pink-200">
        <h2 className="text-3xl font-serif font-bold mb-4 text-brown-800">Contact Us</h2>
        <p className="mb-6 text-brown-700 font-serif">Have questions or want to connect? Reach out below.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-serif font-medium text-brown-800 mb-1">Name *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full border border-pink-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 font-serif"
                style={{ color: '#846358' }}
              />
            </div>
            <div>
              <label className="block text-sm font-serif font-medium text-brown-800 mb-1">Email *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full border border-pink-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 font-serif"
                style={{ color: '#846358' }}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-serif font-medium text-brown-800 mb-1">Subject *</label>
            <input
              type="text"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              required
              className="w-full border border-pink-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 font-serif"
              style={{ color: '#846358' }}
            />
          </div>
          
          <div>
            <label className="block text-sm font-serif font-medium text-brown-800 mb-1">Message *</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              rows={5}
              className="w-full border border-pink-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 font-serif"
              style={{ color: '#846358' }}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-gray-400 text-white font-serif font-semibold py-3 px-8 rounded-lg transition disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-pink-200">
          <p className="text-brown-700 text-center font-serif">Or email us directly: <a href="mailto:ltwander@gmail.com" className="underline text-brown-800">ltwander@gmail.com</a></p>
        </div>
        
        <style jsx global>{`
          input, textarea {
            color: #846358 !important;
          }
          input::placeholder, textarea::placeholder {
            color: #ec4899 !important;
            opacity: 0.7;
          }
          input:focus::placeholder, textarea:focus::placeholder {
            color: #ec4899 !important;
            opacity: 0.5;
          }
        `}</style>
      </section>
    </main>
  );
} 