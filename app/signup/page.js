'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[70vh] items-center justify-center"><span className="h-6 w-6 animate-spin rounded-full border-2 border-black border-t-transparent" /></div>}>
      <SignupContent />
    </Suspense>
  );
}

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') || '';
  
  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState(initialEmail);
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    if (initialEmail && !email) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);
  
  // UI States
  const [step, setStep] = useState(1); // 1 = Details, 2 = OTP
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Helpers
  async function compressImage(file, maxSizeKB) {
    if (file.size <= maxSizeKB * 1024) return file;
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          const MAX_SIZE = 800;
          if (width > height && width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          let quality = 0.9;
          const compress = () => {
            canvas.toBlob((blob) => {
              if (blob.size <= maxSizeKB * 1024 || quality <= 0.1) {
                const newName = file.name.replace(/\.[^/.]+$/, ".jpg");
                resolve(new File([blob], newName, { type: 'image/jpeg', lastModified: Date.now() }));
              } else {
                quality -= 0.1;
                compress();
              }
            }, 'image/jpeg', quality);
          };
          compress();
        };
      };
    });
  }

  // Step 1: Request Signup
  async function handleSignupRequest(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    let avatar_url = null;
    if (avatarFile) {
      setMessage('Uploading image...');
      try {
        const compressedFile = await compressImage(avatarFile, 150);
        const formData = new FormData();
        formData.append('image', compressedFile);
        formData.append('folder', 'customers');
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        const uploadData = await uploadRes.json();
        if (uploadData.url) {
          avatar_url = uploadData.url;
        } else {
          throw new Error(uploadData.error || 'Failed to upload image');
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
    }

    setMessage('Sending code...');

    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, whatsapp, avatar_url })
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
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="relative w-24 h-24 mb-3 group rounded-full border border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden cursor-pointer">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-[10px] font-semibold uppercase tracking-widest">Upload</span>
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setAvatarFile(file);
                      setAvatarPreview(URL.createObjectURL(file));
                    }
                  }} 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                />
              </div>
              <label className="text-[10px] font-medium uppercase tracking-widest text-grey">
                Profile Picture
              </label>
            </div>
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
