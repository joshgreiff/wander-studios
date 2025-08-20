'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function RegisterForm() {
  const [form, setForm] = useState({
    email: '',
    name: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.email,
          name: form.name,
          phone: form.phone,
          password: form.password
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('user', JSON.stringify(data.user));
        window.dispatchEvent(new Event('userLogin'));
        const redirectUrl = searchParams?.get('redirect') || '/dashboard';
        router.push(redirectUrl);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Registration failed');
      }
    } catch (_error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-warm-50 p-8 rounded-lg border border-warm-200">
          <div>
            <h2 className="mt-6 text-center text-3xl font-serif font-bold text-brown-800">
              Create your account
            </h2>
            <p className="mt-2 text-center text-sm font-sans text-brown-700">
              Join Wander Studios and start booking classes
            </p>
          </div>
          <div className="mt-6 border-t border-brown-800 pt-6">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-serif font-medium text-brown-800">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={handleChange}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-warm-300 placeholder-brown-500 text-brown-800 rounded-md focus:outline-none focus:ring-warm-400 focus:border-warm-400 sm:text-sm font-serif"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-serif font-medium text-brown-800">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-warm-300 placeholder-brown-500 text-brown-800 rounded-md focus:outline-none focus:ring-warm-400 focus:border-warm-400 sm:text-sm font-serif"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-serif font-medium text-brown-800">
                    Phone Number (optional)
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-warm-300 placeholder-brown-500 text-brown-800 rounded-md focus:outline-none focus:ring-warm-400 focus:border-warm-400 sm:text-sm font-serif"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-serif font-medium text-brown-800">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={form.password}
                    onChange={handleChange}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-warm-300 placeholder-brown-500 text-brown-800 rounded-md focus:outline-none focus:ring-warm-400 focus:border-warm-400 sm:text-sm font-serif"
                    placeholder="Create a password"
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-serif font-medium text-brown-800">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-warm-300 placeholder-brown-500 text-brown-800 rounded-md focus:outline-none focus:ring-warm-400 focus:border-warm-400 sm:text-sm font-serif"
                    placeholder="Confirm your password"
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm text-center font-serif">
                  {error}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-serif font-medium rounded-md text-white bg-warm-400 hover:bg-warm-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-warm-400 disabled:opacity-50"
                >
                  {loading ? 'Creating account...' : 'Create account'}
                </button>
              </div>

              <div className="text-center">
                <p className="text-sm text-brown-700 font-sans">
                  Already have an account?{' '}
                  <Link href="/login" className="text-brown-800 hover:text-brown-900 underline font-serif">
                    Sign in here
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
} 