'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function SignupPage() {
  const router = useRouter();
  
  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  
  // UI States
  const [step, setStep] = useState(1); // 1 = Details, 2 = OTP
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 1: Request Signup
  async function handleSignupRequest(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, whatsapp })
    });
    
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Failed to send OTP');
    } else {
      setStep(2);
      setMessage(`An OTP has been sent to ${email}. Please check your inbox (and spam folder) to verify your account.`);
    }
  }

  // Step 2: Verify OTP
  async function handleVerifyOtp(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Call our custom verification endpoint
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code: otp })
    });

    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      setLoading(false);
      setError(data.error || 'Failed to verify OTP');
    } else {
      // Custom verification successful (User created in backend)
      // Now, log them in on the client side
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      setLoading(false);

      if (signInError) {
        setError(signInError.message);
      } else {
        const urlParams = new URLSearchParams(window.location.search);
        const redirectUrl = urlParams.get('redirect') || '/';
        router.push(redirectUrl);
      }
    }
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-5 py-20 bg-white">
      <div className="w-full max-w-md border border-border p-8 md:p-10">
        <p className="section-label mb-3 text-center">Account</p>
        <h1 className="mb-8 font-display text-3xl font-light text-center text-black">
          {step === 1 ? 'Create Account' : 'Verify Email'}
        </h1>
        
        {error && (
          <div className="mb-6 border border-red-200 bg-red-50 p-3 text-sm text-red-700 text-center">
            {error}
          </div>
        )}
        
        {message && (
          <div className="mb-6 border border-green-200 bg-green-50 p-3 text-sm text-green-700 text-center leading-relaxed">
            {message}
          </div>
        )}

        {step === 1 ? (
          // ── STEP 1: REGISTRATION FORM ──
          <form onSubmit={handleSignupRequest} className="space-y-6">
            <div>
              <label className="mb-2 block text-[10px] font-medium uppercase tracking-widest text-grey">
                Full Name *
              </label>
              <input
                type="text"
                required
                className="input w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ahmed Khan"
              />
            </div>
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
                WhatsApp Number *
              </label>
              <input
                type="tel"
                required
                className="input w-full"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="03XX-XXXXXXX"
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
                minLength="6"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? 'Sending Code...' : 'Create Account'}
            </button>
            
            <div className="mt-8 text-center text-sm text-grey">
              Already have an account?{' '}
              <Link href="/login" className="text-black underline underline-offset-4 hover:text-black/70">
                Log In
              </Link>
            </div>
          </form>
        ) : (
          // ── STEP 2: OTP VERIFICATION FORM ──
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label className="mb-2 block text-[10px] font-medium uppercase tracking-widest text-grey">
                Enter 6-Digit OTP *
              </label>
              <input
                type="text"
                required
                className="input w-full text-center text-xl tracking-[0.5em] font-medium"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000000"
                maxLength="6"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? 'Verifying...' : 'Verify & Log In'}
            </button>

            <div className="mt-6 text-center">
              <button 
                type="button" 
                onClick={() => {
                  setStep(1);
                  setError('');
                  setMessage('');
                }}
                className="text-[11px] font-medium uppercase tracking-widest text-grey underline underline-offset-4 hover:text-black"
              >
                Change Email Address
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
