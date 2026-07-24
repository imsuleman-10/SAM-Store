'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StaffSetupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch('/api/staff/me')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        if (!data.staff.first_login) {
          router.push('/staff/dashboard');
        } else {
          if (data.staff.name) setName(data.staff.name);
          setLoading(false);
        }
      })
      .catch(() => {
        router.push('/staff/login');
      });
  }, [router]);

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

  async function uploadAvatar(file) {
    const compressedFile = await compressImage(file, 150);
    const formData = new FormData();
    formData.append('file', compressedFile);
    formData.append('folder', 'staffs'); // → images/staffs/
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    if (!res.ok || !data.url) throw new Error(data.error || 'Upload failed');
    return data.url;
  }

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setUploading(true);
    try {
      const url = await uploadAvatar(file);
      setAvatarUrl(url);
    } catch {
      setError('Failed to upload image.');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/staff/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), avatar_url: avatarUrl }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push('/staff/dashboard');
      } else {
        setError(data.error || 'Setup failed.');
      }
    } catch {
      setError('Connection error.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-sm text-gray-400 bg-[#f1f5f9]">Loading...</div>;
  }

  return (
    <main className="max-w-md mx-auto px-6 py-28">
      <div className="text-center mb-8">
        <h1 className="font-display font-bold text-2xl mb-2">Welcome Aboard!</h1>
        <p className="text-muted text-sm text-gray-500">Set up your profile to get started</p>
      </div>
      <div className="card p-8 shadow-md rounded-2xl border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="h-20 w-20 rounded-full object-cover border-2 border-gray-200" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 border-2 border-dashed border-gray-300">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </div>
              )}
              <label className="absolute bottom-0 right-0 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-indigo-600 text-white shadow-md hover:bg-indigo-700 transition">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            </div>
            {uploading && <p className="text-xs text-gray-400">Uploading…</p>}
            <p className="text-xs text-gray-400">Upload a profile picture (optional)</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition"
              placeholder="Enter your full name"
              required
            />
          </div>

          {error && <p className="text-rose-500 text-xs bg-rose-50 p-2 rounded-lg">{error}</p>}

          <button
            type="submit"
            disabled={saving || uploading}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 w-full justify-center text-sm font-semibold text-white hover:bg-indigo-700 transition shadow-sm disabled:opacity-70"
          >
            {saving ? 'Saving...' : 'Save & Continue'}
          </button>
        </form>
      </div>
    </main>
  );
}
