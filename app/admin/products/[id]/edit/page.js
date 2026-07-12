'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditProductPage({ params }) {
  const router = useRouter();
  const [form, setForm] = useState(null);
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
      .then((data) => setForm(data.product));
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
          const jsonMatch = s.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              const inner = JSON.parse(jsonMatch[0]);
              name = inner.name || name;
              description = inner.description || description;
            } catch (e) {}
          }

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
    setSaving(true);

    let uploadedUrls = [];
    if (form.media_urls) {
      uploadedUrls = [...form.media_urls];
    }

    if (selectedImages.length > 0) {
      setUploadingStatus('Uploading new images to Supabase...');
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
      setError(data.error || 'Kuch masla ho gaya.');
    }
  }

  if (!form) return <main className="max-w-xl mx-auto px-6 py-10 text-muted">Loading...</main>;

  return (
    <main className="max-w-xl mx-auto px-6 py-10">
      <Link href="/admin/dashboard" className="text-sm text-muted mb-6 inline-block">← Back to Dashboard</Link>
      <h1 className="font-display font-bold text-2xl mb-6">Edit Product</h1>
      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label className="text-xs text-muted mb-1.5 block">Product Name</label>
          <input className="input" value={form.name || ''} onChange={(e) => update('name', e.target.value)} />
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
            value={form.category || ''}
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
            <input type="number" className="input" value={form.price || ''} onChange={(e) => update('price', e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted mb-1.5 block">Compare-at Price (Rs)</label>
            <input type="number" className="input" value={form.compare_at_price || ''} onChange={(e) => update('compare_at_price', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="text-xs text-muted mb-1.5 block">Stock Quantity</label>
          <input type="number" className="input" value={form.stock || ''} onChange={(e) => update('stock', e.target.value)} />
        </div>
        <div className="p-4 border-[1.5px] border-line rounded-xl bg-panel/30">
          <label className="text-sm font-semibold mb-2 block">Upload Images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 cursor-pointer"
          />
          {selectedImages.length > 0 && (
            <p className="text-xs text-muted mt-3">Selected {selectedImages.length} image(s).</p>
          )}
          {form.media_urls?.length > 0 && (
            <>
              <p className="text-xs text-muted mt-3">Already saved media: {form.media_urls.length} file(s).</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {form.media_urls.map((url, index) => {
                  const isVideo = url.match(/\.(mp4|webm|ogg|mov)$/i) || url.includes('video');
                  return (
                    <div key={index} className="relative overflow-hidden rounded-3xl border border-line bg-white">
                      <div className="h-28 w-full overflow-hidden">
                        {isVideo ? (
                          <video src={url} muted loop className="h-full w-full object-cover" />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={url} alt={`media-${index + 1}`} className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2 border-t border-line p-2 text-[11px] text-muted">
                        <span>{isVideo ? 'Video' : 'Image'} {index + 1}</span>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => removeMedia(index)}
                            className="rounded-full bg-rust/10 px-2 py-1 text-rust"
                          >
                            Remove
                          </button>
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => moveMedia(index, index - 1)}
                              className="rounded-full bg-ink/5 px-2 py-1 text-ink"
                            >
                              ←
                            </button>
                          )}
                          {index < form.media_urls.length - 1 && (
                            <button
                              type="button"
                              onClick={() => moveMedia(index, index + 1)}
                              className="rounded-full bg-ink/5 px-2 py-1 text-ink"
                            >
                              →
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="p-4 border-[1.5px] border-line rounded-xl bg-panel/30">
          <label className="text-sm font-semibold mb-2 block">Upload Video</label>
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoChange}
            className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 cursor-pointer"
          />
          {videoFile && <p className="text-xs text-muted mt-3">Selected video: {videoFile.name}</p>}
        </div>
        <div>
          <label className="text-xs text-muted mb-1.5 block">Description</label>
          <textarea rows={4} className="input" value={form.description || ''} onChange={(e) => update('description', e.target.value)} />
          {aiStatus && <p className="text-brass text-sm mt-2">{aiStatus}</p>}
        </div>
        {error && <p className="text-rust text-sm">{error}</p>}
        <button className="btn btn-primary w-full justify-center" disabled={saving}>
          {saving ? 'Saving...' : 'Update Product'}
        </button>
      </form>
    </main>
  );
}
