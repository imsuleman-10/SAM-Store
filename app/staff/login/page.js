'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function StaffLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/staff/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        if (data.staff.first_login) {
          router.push('/staff/setup');
        } else {
          router.push('/staff/dashboard');
        }
      } else {
        setError(data.error || 'Invalid email or password.');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-5 py-20 bg-white">
      <div className="w-full max-w-md border border-border p-8 md:p-10">
        <p className="section-label mb-3 text-center">Staff</p>
        <h1 className="mb-8 font-display text-3xl font-light text-center text-black">Log In</h1>

        {error && (
          <div className="mb-6 border border-red-200 bg-red-50 p-3 text-sm text-red-700 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-[10px] font-medium uppercase tracking-widest text-grey">
              Email Address *
            </label>
            <input
              type="email"
              required
              className="input w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="staff@glowvie.com"
            />
          </div>
          <div>
            <label className="mb-2 block text-[10px] font-medium uppercase tracking-widest text-grey">
              Password *
            </label>
            <input
              type="password"
              required
              className="input w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-grey">
          <Link href="/admin/login" className="text-black underline underline-offset-4 hover:text-black/70">
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
}
