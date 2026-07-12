'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push('/admin/dashboard');
    } else {
      const data = await res.json();
      setError(data.error || 'Login fail ho gaya.');
    }
  }

  return (
    <main className="max-w-sm mx-auto px-6 py-28">
      <h1 className="font-display font-bold text-2xl mb-2 text-center">Admin Login</h1>
      <p className="text-muted text-sm text-center mb-8">SAM&CO dashboard tak access ke liye password dalein.</p>
      <form onSubmit={handleLogin} className="card p-6">
        <label className="text-xs text-muted mb-1.5 block">Admin Password</label>
        <input
          type="password"
          className="input mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
        {error && <p className="text-rust text-sm mb-4">{error}</p>}
        <button className="btn btn-primary w-full justify-center" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </main>
  );
}
