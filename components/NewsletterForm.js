'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle'); // idle | loading | success | error | unauth
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setState('error');
      setErrorMsg('Please enter a valid email.');
      return;
    }
    setState('loading');

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setState('unauth');
      return;
    }

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setState('success');
        setEmail('');
      } else {
        const d = await res.json();
        setState('error');
        setErrorMsg(d.error || 'Something went wrong.');
      }
    } catch {
      setState('error');
      setErrorMsg('Network error. Please try again.');
    }
  }

  if (state === 'success') {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-white/20 bg-white/5 px-4 py-3">
        <span className="text-green-400">✓</span>
        <p className="text-sm text-warm/80">You&apos;re subscribed! Thank you.</p>
      </div>
    );
  }

  if (state === 'unauth') {
    return (
      <div className="flex flex-col gap-2 rounded-lg border border-orange-200/20 bg-orange-500/10 px-4 py-3">
        <p className="text-sm text-orange-200">Please log in to subscribe to our newsletter.</p>
        <Link href="/login" className="text-xs font-bold text-white underline underline-offset-4 hover:text-white/70">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <input
        type="email"
        value={email}
        onChange={e => { setEmail(e.target.value); setState('idle'); }}
        placeholder="Your email address"
        className="border border-white/20 bg-transparent px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-white/60"
        disabled={state === 'loading'}
      />
      {state === 'error' && (
        <p className="text-[11px] text-red-400">{errorMsg}</p>
      )}
      <button
        type="submit"
        disabled={state === 'loading'}
        className="btn btn-white text-[10px] disabled:opacity-60"
      >
        {state === 'loading' ? 'Subscribing…' : 'Subscribe'}
      </button>
    </form>
  );
}
