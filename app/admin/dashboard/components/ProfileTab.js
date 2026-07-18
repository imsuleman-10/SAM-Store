import React, { useState } from 'react';
import { Spinner } from './UI';

// ─── Profile Tab ─────────────────────────────────────────────────────────────
export function ProfileTab({ me, setMe, addToast }) {
  const [name, setName] = useState(me?.name || '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, avatar_url: me?.avatar_url }),
      });
      if (res.ok) {
        const updated = await res.json();
        setMe(p => ({ ...p, ...updated }));
        addToast('Profile updated successfully.', 'success');
      } else {
        const d = await res.json();
        addToast(d.error || 'Failed to update profile.', 'error');
      }
    } catch {
      addToast('Network error.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    addToast('Uploading image…', 'info');
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', 'admin');
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        const patchRes = await fetch('/api/admin/me', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, avatar_url: data.url }),
        });
        if (patchRes.ok) {
          const updated = await patchRes.json();
          setMe(p => ({ ...p, ...updated }));
          addToast('Avatar updated.', 'success');
        }
      } else {
        addToast(data.error || 'Upload failed.', 'error');
      }
    } catch {
      addToast('Upload error.', 'error');
    } finally {
      setUploading(false);
    }
  }

  const isSuperAdmin = me?.id === 'super_admin';

  return (
    <div className="max-w-lg mx-auto">
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-br from-gray-900 to-gray-700 px-8 py-12 flex flex-col items-center gap-4">
          <div className="relative group">
            {me?.avatar_url ? (
              <img src={me.avatar_url} alt="Avatar" className="w-24 h-24 rounded-full object-cover ring-4 ring-white/20 shadow-xl" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-white/10 ring-4 ring-white/20 shadow-xl flex items-center justify-center text-4xl font-bold text-white">
                {(me?.name || me?.email || 'A').charAt(0).toUpperCase()}
              </div>
            )}
            <label className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
              <span className="text-white text-xs font-semibold">{uploading ? '…' : 'Change'}</span>
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={uploading} />
            </label>
          </div>
          <div className="text-center">
            <h2 className="text-white text-xl font-bold">{me?.name || me?.email}</h2>
            <span className={`inline-block mt-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${me?.role === 'admin' ? 'bg-amber-400 text-amber-900' : 'bg-blue-300 text-blue-900'}`}>
              {me?.role || 'admin'}
            </span>
          </div>
        </div>
        <div className="p-8">
          {isSuperAdmin && (
            <div className="text-center py-4 mb-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500">You are logged in as the <strong>Super Admin</strong>.</p>
              <p className="text-xs text-gray-400 mt-1">You can customize your display name and avatar below.</p>
            </div>
          )}
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">Display Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">Email Address</label>
              <input type="text" value={me?.email || ''} readOnly
                className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed" />
            </div>
            <button type="submit" disabled={saving}
              className="btn btn-primary w-full justify-center py-2.5">
              {saving ? <Spinner /> : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

