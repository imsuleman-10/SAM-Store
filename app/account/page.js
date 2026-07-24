'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orders, setOrders] = useState([]);
  
  // Profile Form
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [msg, setMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    async function loadSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login?redirect=/account');
        return;
      }
      setUser(session.user);
      setFullName(session.user.user_metadata?.full_name || '');
      setPhone(session.user.user_metadata?.phone || '');
      setAvatarUrl(session.user.user_metadata?.avatar_url || '');

      // Load orders for this user's email
      try {
        const res = await fetch(`/api/user/orders?email=${encodeURIComponent(session.user.email)}`);
        if (res.ok) {
          const d = await res.json();
          setOrders(d.orders || []);
        }
      } catch (e) {
        console.error(e);
      }
      
      setLoading(false);
    }
    loadSession();
  }, [router]);

  async function handleSaveProfile(e) {
    e.preventDefault();
    setSaving(true);
    setMsg({ text: '', type: '' });

    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName, phone, avatar_url: avatarUrl }
    });

    setSaving(false);
    if (error) {
      setMsg({ text: error.message, type: 'error' });
    } else {
      setMsg({ text: 'Profile updated successfully.', type: 'success' });
    }
  }

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

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setSaving(true);
    setMsg({ text: 'Compressing & Uploading image...', type: 'info' });
    
    // Compress to 150KB if larger
    const compressedFile = await compressImage(file, 150);

    const formData = new FormData();
    formData.append('image', compressedFile);
    formData.append('folder', 'customers');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      if (res.ok && data.url) {
        setAvatarUrl(data.url);
        
        // Auto save to auth metadata
        await supabase.auth.updateUser({
          data: { full_name: fullName, phone, avatar_url: data.url }
        });
        
        setMsg({ text: 'Image uploaded and saved.', type: 'success' });
      } else {
        setMsg({ text: data.error || 'Failed to upload.', type: 'error' });
      }
    } catch (err) {
      setMsg({ text: 'Network error during upload.', type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="min-h-[70vh] flex items-center justify-center bg-sand"><div className="w-8 h-8 border-4 border-coal border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <main className="min-h-[70vh] bg-sand py-12 px-6">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* Sidebar / Profile Card */}
        <div className="md:w-1/3">
          <div className="bg-white rounded-2xl p-8 shadow-soft text-center">
            <div className="relative w-32 h-32 mx-auto mb-6 group">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="w-full h-full rounded-full object-cover shadow-sm" />
              ) : (
                <div className="w-full h-full rounded-full bg-sand flex items-center justify-center text-4xl text-silver shadow-sm">
                  {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              
              <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <span className="text-white text-xs font-semibold">Change</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>

            <h2 className="font-display text-2xl font-light">{fullName || 'Customer'}</h2>
            <p className="text-sm text-silver mt-1 mb-6">{user.email}</p>
            
            <button 
              onClick={async () => { await supabase.auth.signOut(); router.push('/'); }}
              className="text-xs uppercase tracking-widest text-grey hover:text-black transition"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:w-2/3 space-y-8">
          
          {/* Profile Details */}
          <div className="bg-white rounded-2xl p-8 shadow-soft">
            <h3 className="font-display text-xl mb-6">Profile Details</h3>
            {msg.text && (
              <div className={`mb-6 p-4 rounded-xl text-sm ${msg.type === 'error' ? 'bg-red-50 text-red-600' : msg.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                {msg.text}
              </div>
            )}
            
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-[11px] uppercase tracking-widest text-grey block mb-2">Full Name</label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="input bg-sand border-none w-full" placeholder="John Doe" />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-widest text-grey block mb-2">Phone Number</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="input bg-sand border-none w-full" placeholder="+1 234 567 8900" />
                </div>
              </div>
              <button type="submit" disabled={saving} className="btn btn-primary w-full md:w-auto px-8">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Order History */}
          <div className="bg-white rounded-2xl p-8 shadow-soft">
            <h3 className="font-display text-xl mb-6">Order History</h3>
            
            {orders.length === 0 ? (
              <p className="text-sm text-silver text-center py-10">You haven't placed any orders yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-sand text-grey text-[11px] uppercase tracking-wider">
                      <th className="pb-3 font-medium">Order ID</th>
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand">
                    {orders.map(order => (
                      <tr key={order.id} className="hover:bg-sand/30 transition">
                        <td className="py-4 font-medium text-coal">#{order.id.slice(0, 8).toUpperCase()}</td>
                        <td className="py-4 text-silver">{new Date(order.created_at).toLocaleDateString()}</td>
                        <td className="py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-4 text-right font-medium">Rs {Number(order.total).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
