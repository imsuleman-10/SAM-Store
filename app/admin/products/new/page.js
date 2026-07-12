'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', description: '', category: '', price: '', compare_at_price: '', stock: '50'
  });
  const [mediaFiles, setMediaFiles] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingStatus, setUploadingStatus] = useState('');
  const [generating, setGenerating] = useState(false);
  const [aiStatus, setAiStatus] = useState('');

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  const handleFileChange = (e) => {
    if (e.target.files) {
      setMediaFiles(Array.from(e.target.files));
    }
  };

  const handleVideoChange = (e) => {
    setVideoFile(e.target.files?.[0] || null);
  };

  async function uploadImage(file) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload/image', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();

    if (!res.ok || !data.url) {
      throw new Error(data.error || 'Unable to upload image.');
    }

    return data.url;
  }

  async function generateProductCopy() {
    if (!form.name && !form.description && !form.category && !form.price) {
      setError('Product ka naam ya description chahiye taake AI use professional bana sake.');
      return;
    }
    setGenerating(true);
    setAiStatus('Generating name and description with AI...');
    setError('');

    try {
      const res = await fetch('/api/admin/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          category: form.category,
          description: form.description,
          price: form.price,
          compare_at_price: form.compare_at_price,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'AI analysis failed.');
      }

      // sanitize AI response in case model returns stringified JSON or extra text
      const sanitizeAI = (d) => {
        let name = d?.name || '';
        let description = d?.description || '';
        if (typeof description === 'string') {
          const s = description.trim();
          // if there's a JSON object inside the response, prefer its fields
          const jsonMatch = s.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              const inner = JSON.parse(jsonMatch[0]);
              name = inner.name || name;
              description = inner.description || description;
            } catch (e) {}
          }

          // if description is a quoted JSON string like "{...}", try to parse
          if (description.startsWith('"') && description.endsWith('"')) {
            try {
              const parsed = JSON.parse(description);
              if (typeof parsed === 'object' && parsed !== null) {
                name = parsed.name || name;
                description = parsed.description || description;
              } else if (typeof parsed === 'string') {
                description = parsed;
              }
            } catch (e) {}
          }
        }

        // final trim
        if (typeof name === 'string') name = name.trim();
        if (typeof description === 'string') description = description.trim();
        return { name, description };
      };

      const sanitized = sanitizeAI(data);

      setForm((f) => ({
        ...f,
        name: sanitized.name || f.name,
        description: sanitized.description || f.description,
      }));
      setAiStatus('Name and description updated with AI.');
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
      setTimeout(() => setAiStatus(''), 4000);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.price) {
      setError('Naam aur price zaroori hain.');
      return;
    }

    setSaving(true);
    setError('');

    let uploadedUrls = [];

    if (mediaFiles.length > 0) {
      setUploadingStatus('Uploading images to Supabase...');
      for (const file of mediaFiles) {
        try {
          const imageUrl = await uploadImage(file);
          uploadedUrls.push(imageUrl);
        } catch (err) {
          setError(`Upload failed for ${file.name}: ${err.message}`);
          setSaving(false);
          setUploadingStatus('');
          return;
        }
      }
      setUploadingStatus('');
    }

    if (videoFile) {
      setUploadingStatus('Uploading video to Supabase...');
      try {
        const videoForm = new FormData();
        videoForm.append('file', videoFile);

        const uploadRes = await fetch('/api/upload/video', {
          method: 'POST',
          body: videoForm,
        });
        const videoData = await uploadRes.json();

        if (!uploadRes.ok || !videoData.url) {
          setError(`Video upload failed: ${videoData.error || 'Unknown error'}`);
          setSaving(false);
          setUploadingStatus('');
          return;
        }

        uploadedUrls.push(videoData.url);
      } catch (err) {
        setError(`Video upload error: ${err.message}`);
        setSaving(false);
        setUploadingStatus('');
        return;
      }
      setUploadingStatus('');
    }

    const payload = {
      ...form,
      price: Number(form.price),
      compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
      stock: Number(form.stock) || 0,
      media_urls: uploadedUrls,
      image_url: uploadedUrls[0] || null,
    };
    
    // Remove videoUrl from payload as it's not a DB column
    delete payload.videoUrl;

    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    setSaving(false);
    
    if (res.ok) {
      router.push('/admin/dashboard');
    } else {
      const data = await res.json();
      setError(data.error || 'Kuch masla ho gaya.');
    }
  }

  return (
    <main className="max-w-xl mx-auto px-6 py-10">
      <Link href="/admin/dashboard" className="text-sm text-muted mb-6 inline-block">← Back to Dashboard</Link>
      <h1 className="font-display font-bold text-2xl mb-6">Add New Product</h1>
      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label className="text-xs text-muted mb-1.5 block">Product Name</label>
          <input className="input" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Wireless Game Controller" />
          <button
            type="button"
            className="btn btn-secondary mt-3"
            onClick={generateProductCopy}
            disabled={generating}
          >
            {generating ? 'Generating...' : 'Suggest name & description with AI'}
          </button>
        </div>
        <div>
          <label className="text-xs text-muted mb-1.5 block">Category</label>
          <select
            className="input"
            value={form.category}
            onChange={(e) => update('category', e.target.value)}
          >
            <option value="">-- Category Select Karein --</option>
            <option value="face-care">Face Care</option>
            <option value="beard-care">Beard Care</option>
            <option value="hair-care">Hair Care</option>
            <option value="body-care">Body Care</option>
            <option value="lip-care">Lip Care</option>
            <option value="eye-care">Eye Care</option>
            <option value="fragrances">Fragrances</option>
            <option value="tools">Tools & Accessories</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted mb-1.5 block">Selling Price (Rs)</label>
            <input type="number" className="input" value={form.price} onChange={(e) => update('price', e.target.value)} placeholder="1699" />
          </div>
          <div>
            <label className="text-xs text-muted mb-1.5 block">Compare-at Price (Rs)</label>
            <input type="number" className="input" value={form.compare_at_price} onChange={(e) => update('compare_at_price', e.target.value)} placeholder="2499" />
          </div>
        </div>
        <div>
          <label className="text-xs text-muted mb-1.5 block">Stock Quantity</label>
          <input type="number" className="input" value={form.stock} onChange={(e) => update('stock', e.target.value)} />
        </div>
        
        <div className="p-4 border-[1.5px] border-line rounded-xl bg-panel/30">
          <label className="text-sm font-semibold mb-2 block">Upload Images</label>
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            onChange={handleFileChange} 
            className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 cursor-pointer"
          />
          {mediaFiles.length > 0 && (
            <p className="text-xs text-muted mt-3">
              Selected {mediaFiles.length} image(s).
            </p>
          )}
          <p className="text-xs text-muted mt-1.5">Aap apne product ke liye jitni marzi images upload kar sakte hain.</p>
        </div>

        <div className="p-4 border-[1.5px] border-line rounded-xl bg-panel/30">
          <label className="text-sm font-semibold mb-2 block">Upload Video</label>
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoChange}
            className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 cursor-pointer"
          />
          {videoFile && (
            <p className="text-xs text-muted mt-3">Selected video: {videoFile.name}</p>
          )}
          <p className="text-xs text-muted mt-1.5">Video file upload karein; URL product media mein save ho jayega.</p>
        </div>

        <div>
          <label className="text-xs text-muted mb-1.5 block">Description</label>
          <textarea rows={4} className="input" value={form.description} onChange={(e) => update('description', e.target.value)} />
          {aiStatus && <p className="text-brass text-sm mt-2">{aiStatus}</p>}
        </div>
        {error && <p className="text-rust text-sm">{error}</p>}
        {uploadingStatus && <p className="text-brass text-sm">{uploadingStatus}</p>}
        
        <button className="btn btn-primary w-full justify-center" disabled={saving}>
          {saving ? (uploadingStatus || 'Saving...') : 'Save Product'}
        </button>
      </form>
    </main>
  );
}
