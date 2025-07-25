"use client";
import React, { useState } from 'react';
import Link from 'next/link';

export default function Waiver() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    emergencyContact: '',
    emergencyPhone: '',
    relationship: '',
    dateOfBirth: '',
    healthConditions: '',
    injuries: '',
    medications: '',
    isPregnant: false,
    pregnancyWeeks: '',
    digitalSignature: '',
    waiverAgreed: false,
    healthInfoAgreed: false
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/waivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      
      if (res.ok) {
        setSubmitted(true);
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to submit waiver');
      }
    } catch {
      alert('Failed to submit waiver. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-orange-200 via-orange-400 to-red-400 flex flex-col items-center p-4">
        <section className="max-w-2xl w-full bg-white/80 rounded-xl shadow-lg p-8 mt-8 text-center">
          <h2 className="text-3xl font-bold mb-4 text-orange-900">Thank You!</h2>
          <p className="mb-4 text-orange-800">Your liability waiver and health information have been submitted successfully.</p>
          <p className="text-orange-700 text-sm">You only need to complete this waiver once. We&apos;ll keep your information on file for future classes.</p>
          <div className="mt-6">
            <Link href="/book" className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-8 rounded-full transition">
              Book a Class
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-200 via-orange-400 to-red-400 flex flex-col items-center p-4">
      <section className="max-w-3xl w-full bg-white/80 rounded-xl shadow-lg p-8 mt-8">
        <h2 className="text-3xl font-bold mb-4 text-orange-900">Liability Waiver & Health Information</h2>
        <p className="mb-6 text-orange-800">Before attending your first class, please complete this digital liability waiver and health information form. This helps us keep everyone safe and informed.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-orange-50 rounded-lg p-4">
            <h3 className="text-xl font-semibold text-orange-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-orange-800 mb-1">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                  className="w-full border border-orange-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-orange-800 mb-1">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                  className="w-full border border-orange-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-orange-800 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full border border-orange-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-orange-800 mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full border border-orange-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-orange-800 mb-1">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  className="w-full border border-orange-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-orange-50 rounded-lg p-4">
            <h3 className="text-xl font-semibold text-orange-900 mb-4">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-orange-800 mb-1">Emergency Contact Name *</label>
                <input
                  type="text"
                  name="emergencyContact"
                  value={form.emergencyContact}
                  onChange={handleChange}
                  required
                  className="w-full border border-orange-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-orange-800 mb-1">Emergency Contact Phone *</label>
                <input
                  type="tel"
                  name="emergencyPhone"
                  value={form.emergencyPhone}
                  onChange={handleChange}
                  required
                  className="w-full border border-orange-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-orange-800 mb-1">Relationship to Emergency Contact</label>
                <input
                  type="text"
                  name="relationship"
                  value={form.relationship}
                  onChange={handleChange}
                  placeholder="e.g., Spouse, Parent, Friend"
                  className="w-full border border-orange-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Health Information */}
          <div className="bg-orange-50 rounded-lg p-4">
            <h3 className="text-xl font-semibold text-orange-900 mb-4">Health Information</h3>
            <p className="text-sm text-orange-700 mb-4">Please provide any relevant health information to help us ensure your safety during classes.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-orange-800 mb-1">Current Health Conditions</label>
                <textarea
                  name="healthConditions"
                  value={form.healthConditions}
                  onChange={handleChange}
                  placeholder="e.g., Asthma, Heart condition, Diabetes, etc. (or 'None')"
                  rows={3}
                  className="w-full border border-orange-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-orange-800 mb-1">Recent Injuries or Surgeries</label>
                <textarea
                  name="injuries"
                  value={form.injuries}
                  onChange={handleChange}
                  placeholder="e.g., Recent back injury, knee surgery, etc. (or 'None')"
                  rows={3}
                  className="w-full border border-orange-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-orange-800 mb-1">Current Medications</label>
                <textarea
                  name="medications"
                  value={form.medications}
                  onChange={handleChange}
                  placeholder="List any medications you're currently taking (or 'None')"
                  rows={3}
                  className="w-full border border-orange-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isPregnant"
                    checked={form.isPregnant}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-orange-800">I am currently pregnant</span>
                </label>
                {form.isPregnant && (
                  <div>
                    <label className="block text-sm font-medium text-orange-800 mb-1">Weeks of Pregnancy</label>
                    <input
                      type="number"
                      name="pregnancyWeeks"
                      value={form.pregnancyWeeks}
                      onChange={handleChange}
                      min="1"
                      max="42"
                      className="w-20 border border-orange-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Liability Waiver */}
          <div className="bg-orange-50 rounded-lg p-4">
            <h3 className="text-xl font-semibold text-orange-900 mb-4">Liability Waiver</h3>
            <div className="bg-white rounded p-4 mb-4 text-sm text-gray-700 max-h-40 overflow-y-auto">
              <p className="mb-2"><strong>RELEASE OF LIABILITY, WAIVER OF CLAIMS, ASSUMPTION OF RISKS AND INDEMNITY AGREEMENT</strong></p>
              <p className="mb-2">By signing this agreement, I acknowledge that I am participating in fitness activities at Wander Movement, which may include Pilates, yoga, dance, and other movement classes.</p>
              <p className="mb-2">I understand that these activities involve inherent risks, including but not limited to physical injury, illness, or death. I voluntarily assume all risks associated with participation.</p>
              <p className="mb-2">I release Wander Movement, its instructors, employees, and agents from any liability for injuries, damages, or losses that may occur during or as a result of my participation.</p>
              <p className="mb-2">I confirm that I have provided accurate health information and will inform instructors of any changes to my health status.</p>
              <p>I understand that this waiver is binding and applies to all future classes at Wander Movement.</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-orange-800 mb-1">Digital Signature *</label>
                <input
                  type="text"
                  name="digitalSignature"
                  value={form.digitalSignature}
                  onChange={handleChange}
                  placeholder="Type your full name as your digital signature"
                  required
                  className="w-full border border-orange-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  name="waiverAgreed"
                  checked={form.waiverAgreed}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
                <label className="text-sm text-orange-800">
                  I have read, understood, and agree to the liability waiver above *
                </label>
              </div>
              
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  name="healthInfoAgreed"
                  checked={form.healthInfoAgreed}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
                <label className="text-sm text-orange-800">
                  I confirm that the health information provided above is accurate and complete *
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !form.waiverAgreed || !form.healthInfoAgreed || !form.digitalSignature}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-semibold py-3 px-8 rounded-lg transition disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Waiver & Health Information'}
          </button>
        </form>
      </section>
      <style jsx global>{`
        input, textarea {
          color: #b45309 !important;
        }
        input::placeholder, textarea::placeholder {
          color: #f59e42 !important;
          opacity: 0.7;
        }
        input:focus::placeholder, textarea:focus::placeholder {
          color: #f59e42 !important;
          opacity: 0.5;
        }
      `}</style>
    </main>
  );
} 