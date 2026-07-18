'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditProductPage({ params }) {
  const router = useRouter();
  const [form, setForm] = useState(null);
  
  // Split description into short and long
  const [shortDesc, setShortDesc] = useState('');
  const [longDesc, setLongDesc] = useState('');
  
  const [selectedImages, setSelectedImages] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [aiStatus, setAiStatus] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingStatus, setUploadingStatus] = useState('');

  useEffect(() => {
    fetch(`/api/products/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setForm(data.product);
        
        // Try parsing JSON description
        if (data.product.description) {
          try {
            const parsed = JSON.parse(data.product.description);
            if (parsed.short || parsed.long) {
              setShortDesc(parsed.short || '');
              setLongDesc(parsed.long || '');
            } else {
              setLongDesc(data.product.description);
            }
          } catch (e) {
            setLongDesc(data.product.description);
          }
        }
      });
  }, [params.id]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  const handleImageChange = (e) => {
    setSelectedImages(e.target.files ? Array.from(e.target.files) : []);
  };

  function removeMedia(index) {
    setForm((f) => ({
      ...f,
      media_urls: f.media_urls?.filter((_, idx) => idx !== index) || [],
    }));
  }

  function moveMedia(fromIndex, toIndex) {
    setForm((f) => {
      const media = [...(f.media_urls || [])];
      const [moved] = media.splice(fromIndex, 1);
      media.splice(toIndex, 0, moved);
      return { ...f, media_urls: media };
    });
  }

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
      
      // Parse description if it came back as JSON string
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
    setSaving(true);
    setError('');

    let uploadedUrls = [];
    if (form.media_urls) {
      uploadedUrls = [...form.media_urls];
    }

    if (selectedImages.length > 0) {
      setUploadingStatus('Uploading new images...');
      for (const file of selectedImages) {
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

    // Combine short and long descriptions into JSON
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
      image_url: uploadedUrls[0] || form.image_url || null,
    };

    const res = await fetch(`/api/products/${params.id}`, {
      method: 'PUT',
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

  if (!form) return <main className="max-w-5xl mx-auto px-6 py-10 text-muted flex items-center justify-center min-h-[400px]">
    <div className="flex flex-col items-center gap-3">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p>Loading Product...</p>
    </div>
  </main>;

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin/dashboard" className="text-sm text-muted hover:text-ink transition inline-flex items-center gap-1.5 mb-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back to Dashboard
          </Link>
          <h1 className="font-display font-bold text-3xl">Edit Product</h1>
        </div>
        <button
          type="button"
          onClick={generateProductCopy}
          disabled={generating}
          className="btn btn-secondary flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
          {generating ? 'Generating...' : 'AI Enhance Content'}
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
              <input className="input w-full" value={form.name || ''} onChange={(e) => update('name', e.target.value)} />
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
            <h2 className="text-lg font-semibold border-b border-line pb-3 mb-4">Media Library</h2>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Image Upload Zone */}
              <div>
                <label className="text-sm font-medium text-ink mb-1.5 block">Add Images</label>
                <div className="relative group border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer bg-gray-50/50">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
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
                {selectedImages.length > 0 && (
                  <div className="mt-3 text-sm font-medium text-emerald-600 flex items-center gap-1.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                    {selectedImages.length} image(s) ready to upload
                  </div>
                )}
              </div>

              {/* Video Upload Zone */}
              <div>
                <label className="text-sm font-medium text-ink mb-1.5 block">Add Video (Optional)</label>
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

            {form.media_urls?.length > 0 && (
              <div className="pt-4 border-t border-line mt-4">
                <h3 className="text-sm font-medium text-ink mb-3">Saved Media ({form.media_urls.length})</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {form.media_urls.map((url, index) => {
                    const isVideo = url.match(/\.(mp4|webm|ogg|mov)$/i) || url.includes('video');
                    return (
                      <div key={index} className="group relative rounded-xl border border-line bg-white overflow-hidden shadow-sm hover:shadow-md transition-all">
                        <div className="aspect-square bg-gray-50">
                          {isVideo ? (
                            <video src={url} muted loop autoPlay playsInline className="h-full w-full object-cover" />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={url} alt={`media-${index + 1}`} className="h-full w-full object-cover" />
                          )}
                        </div>
                        
                        {/* Overlay Controls */}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex gap-1">
                              <button type="button" onClick={() => moveMedia(index, index - 1)} disabled={index === 0} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/20 text-white hover:bg-white/40 disabled:opacity-30 disabled:hover:bg-white/20">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                              </button>
                              <button type="button" onClick={() => moveMedia(index, index + 1)} disabled={index === form.media_urls.length - 1} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/20 text-white hover:bg-white/40 disabled:opacity-30 disabled:hover:bg-white/20">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                              </button>
                            </div>
                            <button type="button" onClick={() => removeMedia(index)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-500/80 text-white hover:bg-red-500">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            </button>
                          </div>
                        </div>
                        
                        {/* Number Badge */}
                        <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/50 text-white text-[10px] font-bold flex items-center justify-center backdrop-blur-sm">
                          {index + 1}
                        </div>
                        {isVideo && (
                          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/50 text-white text-[9px] font-bold uppercase tracking-wider backdrop-blur-sm">
                            Video
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
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
                value={form.category || ''}
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
              <input type="number" className="input w-full bg-gray-50/50" value={form.stock || ''} onChange={(e) => update('stock', e.target.value)} />
            </div>
          </div>

          <div className="card p-6 space-y-5 shadow-sm border border-line">
            <h2 className="text-lg font-semibold border-b border-line pb-3 mb-2">Pricing</h2>
            
            <div>
              <label className="text-sm font-medium text-ink mb-1.5 block flex justify-between">
                <span>Selling Price</span>
                <span className="text-muted font-normal">Rs</span>
              </label>
              <input type="number" className="input w-full bg-gray-50/50 text-lg font-semibold" value={form.price || ''} onChange={(e) => update('price', e.target.value)} />
            </div>
            
            <div>
              <label className="text-sm font-medium text-ink mb-1.5 block flex justify-between">
                <span>Compare-at Price</span>
                <span className="text-muted font-normal">Rs</span>
              </label>
              <input type="number" className="input w-full bg-gray-50/50 text-muted line-through" value={form.compare_at_price || ''} onChange={(e) => update('compare_at_price', e.target.value)} placeholder="Original Price" />
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
                Saving Changes...
              </span>
            ) : 'Update Product'}
          </button>
        </div>
      </form>
    </main>
  );
}
