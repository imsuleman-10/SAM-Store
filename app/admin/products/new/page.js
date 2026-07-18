'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', category: '', price: '', compare_at_price: '', stock: '50'
  });
  
  const [shortDesc, setShortDesc] = useState('');
  const [longDesc, setLongDesc] = useState('');

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
    const res = await fetch('/api/upload/image', { method: 'POST', body: formData });
    const data = await res.json();
    if (!res.ok || !data.url) throw new Error(data.error || 'Unable to upload image.');
    return data.url;
  }

  async function generateProductCopy() {
    if (!form.name && !shortDesc && !longDesc && !form.category && !form.price) {
      setError('Please provide at least a product name or category so AI can generate professional copy.');
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
          description: shortDesc + ' ' + longDesc,
          price: form.price,
          compare_at_price: form.compare_at_price,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI analysis failed.');

      const sanitizeAI = (d) => {
        let name = d?.name || '';
        let description = d?.description || '';
        if (typeof description === 'string') {
          const s = description.trim();
          const jsonMatch = s.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              const inner = JSON.parse(jsonMatch[0]);
              name = inner.name || name;
              description = inner.description || description;
            } catch (e) {}
          }
        }
        if (typeof name === 'string') name = name.trim();
        return { name, description };
      };

      const sanitized = sanitizeAI(data);
      if (sanitized.name) update('name', sanitized.name);
      
      try {
        const parsedDesc = JSON.parse(sanitized.description);
        setShortDesc(parsedDesc.short || '');
        setLongDesc(parsedDesc.long || '');
      } catch (e) {
        setLongDesc(sanitized.description);
      }
      
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
      setError('Name and price are required.');
      return;
    }

    setSaving(true);
    setError('');

    let uploadedUrls = [];

    if (mediaFiles.length > 0) {
      setUploadingStatus('Uploading images...');
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
      setUploadingStatus('Uploading video...');
      try {
        const videoForm = new FormData();
        videoForm.append('file', videoFile);
        const uploadRes = await fetch('/api/upload/video', { method: 'POST', body: videoForm });
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

    const finalDescription = JSON.stringify({
      short: shortDesc,
      long: longDesc
    });

    const payload = {
      ...form,
      description: finalDescription,
      price: Number(form.price),
      compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
      stock: Number(form.stock) || 0,
      media_urls: uploadedUrls,
      image_url: uploadedUrls[0] || null,
    };

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
      setError(data.error || 'Something went wrong. Please try again.');
    }
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin/dashboard" className="text-sm text-muted hover:text-ink transition inline-flex items-center gap-1.5 mb-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back to Dashboard
          </Link>
          <h1 className="font-display font-bold text-3xl">Add New Product</h1>
        </div>
        <button
          type="button"
          onClick={generateProductCopy}
          disabled={generating}
          className="btn btn-secondary flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
          {generating ? 'Generating...' : 'AI Generate Content'}
        </button>
      </div>

      {aiStatus && <div className="mb-6 p-4 rounded-xl bg-brass/10 text-brass border border-brass/20 text-sm">{aiStatus}</div>}
      {error && <div className="mb-6 p-4 rounded-xl bg-rust/10 text-rust border border-rust/20 text-sm">{error}</div>}
      {uploadingStatus && <div className="mb-6 p-4 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 text-sm flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        {uploadingStatus}
      </div>}

      <form onSubmit={handleSubmit} className="lg:grid lg:grid-cols-3 gap-8 items-start">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6 space-y-5 shadow-sm border border-line">
            <h2 className="text-lg font-semibold border-b border-line pb-3 mb-4">Basic Information</h2>
            <div>
              <label className="text-sm font-medium text-ink mb-1.5 block">Product Name</label>
              <input className="input w-full" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. Glowing Face Wash" />
            </div>
            
            <div>
              <label className="text-sm font-medium text-ink mb-1.5 block">Short Description</label>
              <textarea rows={2} className="input w-full resize-y" placeholder="Brief summary for product cards..." value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} />
            </div>
            
            <div>
              <label className="text-sm font-medium text-ink mb-1.5 block">Full Description</label>
              <textarea rows={6} className="input w-full resize-y font-sans" placeholder="Detailed product information, benefits, ingredients..." value={longDesc} onChange={(e) => setLongDesc(e.target.value)} />
            </div>
          </div>

          <div className="card p-6 space-y-5 shadow-sm border border-line">
            <h2 className="text-lg font-semibold border-b border-line pb-3 mb-4">Media</h2>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-ink mb-1.5 block">Upload Images</label>
                <div className="relative group border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer bg-gray-50/50">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex flex-col items-center gap-2 pointer-events-none">
                    <div className="p-3 rounded-full bg-white shadow-sm text-gray-400 group-hover:text-primary transition-colors">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-primary">Click to browse</span>
                      <span className="text-sm text-muted"> or drag & drop</span>
                    </div>
                    <p className="text-xs text-muted">JPG, PNG, WEBP (Max 5MB)</p>
                  </div>
                </div>
                {mediaFiles.length > 0 && (
                  <div className="mt-3 text-sm font-medium text-emerald-600 flex items-center gap-1.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                    {mediaFiles.length} image(s) ready to upload
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-ink mb-1.5 block">Upload Video (Optional)</label>
                <div className="relative group border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer bg-gray-50/50">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex flex-col items-center gap-2 pointer-events-none">
                    <div className="p-3 rounded-full bg-white shadow-sm text-gray-400 group-hover:text-primary transition-colors">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-primary">Select video</span>
                    </div>
                    <p className="text-xs text-muted">MP4, WEBM (Max 50MB)</p>
                  </div>
                </div>
                {videoFile && (
                  <div className="mt-3 text-sm font-medium text-emerald-600 flex items-center gap-1.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                    {videoFile.name} ready
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Organization & Pricing */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-6 space-y-5 shadow-sm border border-line">
            <h2 className="text-lg font-semibold border-b border-line pb-3 mb-2">Organization</h2>
            
            <div>
              <label className="text-sm font-medium text-ink mb-1.5 block">Category</label>
              <select
                className="input w-full bg-gray-50/50"
                value={form.category}
                onChange={(e) => update('category', e.target.value)}
              >
                <option value="">-- Select Category --</option>
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
            
            <div className="pt-2">
              <label className="text-sm font-medium text-ink mb-1.5 block">Inventory Stock</label>
              <input type="number" className="input w-full bg-gray-50/50" value={form.stock} onChange={(e) => update('stock', e.target.value)} />
            </div>
          </div>

          <div className="card p-6 space-y-5 shadow-sm border border-line">
            <h2 className="text-lg font-semibold border-b border-line pb-3 mb-2">Pricing</h2>
            
            <div>
              <label className="text-sm font-medium text-ink mb-1.5 block flex justify-between">
                <span>Selling Price</span>
                <span className="text-muted font-normal">Rs</span>
              </label>
              <input type="number" className="input w-full bg-gray-50/50 text-lg font-semibold" value={form.price} onChange={(e) => update('price', e.target.value)} placeholder="1699" />
            </div>
            
            <div>
              <label className="text-sm font-medium text-ink mb-1.5 block flex justify-between">
                <span>Compare-at Price</span>
                <span className="text-muted font-normal">Rs</span>
              </label>
              <input type="number" className="input w-full bg-gray-50/50 text-muted line-through" value={form.compare_at_price} onChange={(e) => update('compare_at_price', e.target.value)} placeholder="2499" />
              <p className="text-[11px] text-muted mt-1.5">To show a markdown, enter a higher value here.</p>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-full justify-center py-3.5 text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow" 
            disabled={saving}
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                {uploadingStatus || 'Saving...'}
              </span>
            ) : 'Save Product'}
          </button>
        </div>
      </form>
    </main>
  );
}
