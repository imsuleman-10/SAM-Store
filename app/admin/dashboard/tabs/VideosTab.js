import { useState, useEffect } from 'react';

export default function VideosTab() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [title, setTitle] = useState('');
  const [sub, setSub] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchVideos();
  }, []);

  async function fetchVideos() {
    setLoading(true);
    const res = await fetch('/api/admin/homepage-videos');
    if (res.ok) {
      const data = await res.json();
      setVideos(data.videos || []);
    }
    setLoading(false);
  }

  async function handleAddVideo(e) {
    e.preventDefault();
    if (!title || !videoFile) return alert('Title and Video File are required');

    setUploading(true);

    // 1. Upload video
    const formData = new FormData();
    formData.append('file', videoFile);
    formData.append('folder', 'homepage'); // → videos/homepage/
    
    const uploadRes = await fetch('/api/upload/video', {
      method: 'POST',
      body: formData,
    });
    
    if (!uploadRes.ok) {
      alert('Video upload failed');
      setUploading(false);
      return;
    }

    const { url } = await uploadRes.json();

    // 2. Save to database
    const res = await fetch('/api/admin/homepage-videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, sub, video_url: url }),
    });

    if (res.ok) {
      setTitle('');
      setSub('');
      setVideoFile(null);
      e.target.reset();
      fetchVideos();
    } else {
      const data = await res.json();
      alert('Error saving video: ' + data.error);
    }
    setUploading(false);
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this video?')) return;
    const res = await fetch(`/api/admin/homepage-videos/${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchVideos();
    } else {
      alert('Failed to delete video');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium text-black">Homepage Videos</h2>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6">
        <h3 className="mb-4 text-sm font-medium text-black">Add New Video</h3>
        <form onSubmit={handleAddVideo} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-black">Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-border px-3 py-2 text-sm focus:border-black outline-none"
                placeholder="e.g. DermiVe Skin Transformation"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-black">Subtitle (Optional)</label>
              <input
                type="text"
                value={sub}
                onChange={(e) => setSub(e.target.value)}
                className="w-full border border-border px-3 py-2 text-sm focus:border-black outline-none"
                placeholder="e.g. Product Demos"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-black">Video File * (1:1 Square recommended)</label>
            <input
              type="file"
              accept="video/mp4,video/webm"
              required
              onChange={(e) => setVideoFile(e.target.files[0])}
              className="block w-full text-sm text-grey file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-sand file:text-black hover:file:bg-border cursor-pointer border border-border"
            />
          </div>
          <button
            type="submit"
            disabled={uploading}
            className="bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload Video'}
          </button>
        </form>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="text-sm text-grey">Loading videos...</p>
        ) : videos.length === 0 ? (
          <p className="text-sm text-grey">No videos found. Upload one above.</p>
        ) : (
          videos.map((v) => (
            <div key={v.id} className="flex flex-col gap-3 p-4 relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="aspect-square w-full bg-black">
                <video src={v.video_url} className="w-full h-full object-cover" muted autoPlay loop playsInline />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-gold">{v.sub || 'No subtitle'}</p>
                <p className="font-display text-lg text-black">{v.title}</p>
              </div>
              <button
                onClick={() => handleDelete(v.id)}
                className="absolute top-2 right-2 bg-white/90 text-red-600 p-1 rounded-full shadow hover:bg-red-50 hover:text-red-700"
                title="Delete Video"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/>
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
