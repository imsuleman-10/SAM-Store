'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      // Successfully logged in
      // Optionally redirect to checkout if they were coming from there
      const urlParams = new URLSearchParams(window.location.search);
      const redirectUrl = urlParams.get('redirect') || '/';
      router.push(redirectUrl);
    }
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-5 py-20 bg-white">
      <div className="w-full max-w-md border border-border p-8 md:p-10">
        <p className="section-label mb-3 text-center">Account</p>
        <h1 className="mb-8 font-display text-3xl font-light text-center text-black">Log In</h1>
        
        {error && (
          <div className="mb-6 border border-red-200 bg-red-50 p-3 text-sm text-red-700 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
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
              placeholder="you@example.com"
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
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-grey">
          Don't have an account?{' '}
          <Link href="/signup" className="text-black underline underline-offset-4 hover:text-black/70">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
