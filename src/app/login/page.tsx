'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginForm() {
  const [form, setForm] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Dispatch custom event to update navigation
        window.dispatchEvent(new Event('userLogin'));
        
        // Redirect to dashboard or specified redirect URL
        const redirectUrl = searchParams?.get('redirect') || '/dashboard';
        router.push(redirectUrl);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Login failed');
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
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm font-sans text-brown-700">
              Welcome back to Wander Studios
            </p>
          </div>
          <div className="mt-6 border-t border-brown-800 pt-6">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
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
                  <label htmlFor="password" className="block text-sm font-serif font-medium text-brown-800">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={form.password}
                    onChange={handleChange}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-warm-300 placeholder-brown-500 text-brown-800 rounded-md focus:outline-none focus:ring-warm-400 focus:border-warm-400 sm:text-sm font-serif"
                    placeholder="Enter your password"
                  />
                  <p className="mt-1 text-xs text-brown-600 font-sans">
                    Default password: <span className="font-mono bg-gray-100 px-1 rounded">Welcome2025!</span>
                  </p>
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
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>

              <div className="text-center">
                <p className="text-sm text-brown-700 font-sans">
                  Don&apos;t have an account?{' '}
                  <Link href="/register" className="text-brown-800 hover:text-brown-900 underline font-serif">
                    Create one here
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
} 