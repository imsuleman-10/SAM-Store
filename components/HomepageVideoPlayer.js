'use client';

import { useState, useRef, useEffect } from 'react';

export default function HomepageVideoPlayer({ src }) {
  // Always start muted
  const [isMuted, setIsMuted] = useState(true); 
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(e => console.error('Playback failed', e));
    }
  }, []);

  const toggleMute = () => {
    if (videoRef.current) {
      const newMutedState = !isMuted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
    }
  };

  return (
    <div className="relative w-full h-full group">
      <video
        ref={videoRef}
        src={src}
        className="h-full w-full object-cover"
        loop
        playsInline
      />

      {/* Watermark Cover (Hides AI logo) */}
      <div className="absolute top-3 right-3 rounded-md bg-black/60 px-3 py-1.5 backdrop-blur-md pointer-events-none">
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/90">
          Glowvie
        </span>
      </div>
      
      {/* Sound Toggle Button */}
      <button 
        onClick={toggleMute}
        className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-xl border border-white/30 transition-all hover:bg-white/40 hover:scale-110 shadow-lg group-hover:opacity-100 focus:outline-none"
        aria-label={isMuted ? "Unmute" : "Mute"}
        title={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? (
          // Volume X icon (Muted)
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <line x1="23" y1="9" x2="17" y2="15"></line>
            <line x1="17" y1="9" x2="23" y2="15"></line>
          </svg>
        ) : (
          // Volume 2 icon (Unmuted)
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          </svg>
        )}
      </button>
    </div>
  );
}
