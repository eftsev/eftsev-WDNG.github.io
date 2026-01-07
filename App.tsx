
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { PhotoFile, AppState } from './types';
import PhotoCard from './components/PhotoCard';

const LOCAL_QUOTES = [
  "In the tapestry of life, your love is the most beautiful thread, weaving together moments of joy, grace, and eternal celebration.",
  "Your wedding day marks the start of a beautiful journey where two souls become one, painting the world with the colors of your shared dreams.",
  "A successful marriage is built on falling in love many times, always with the same person, amidst the magic of cherished memories.",
  "Love does not consist in gazing at each other, but in looking outward together in the same direction, creating a lifetime of stories.",
  "The best thing to hold onto in life is each other. Every photo captured here is a testament to a love that grows more radiant with every passing day."
];

const App: React.FC = () => {
  const [photos, setPhotos] = useState<PhotoFile[]>([]);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [summary, setSummary] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Performance optimization: Using a Map to track object URLs for cleanup
  const objectUrlsRef = useRef<Map<string, string>>(new Map());

  const cleanupUrl = (id: string) => {
    const url = objectUrlsRef.current.get(id);
    if (url) {
      URL.revokeObjectURL(url);
      objectUrlsRef.current.delete(id);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    const newPhotos: PhotoFile[] = files.map(file => {
      const id = Math.random().toString(36).substr(2, 9);
      const url = URL.createObjectURL(file);
      objectUrlsRef.current.set(id, url);
      
      return {
        id,
        file,
        previewUrl: url,
        isHighQuality: false,
        timestamp: Date.now()
      };
    });

    setPhotos(prev => [...prev, ...newPhotos]);

    // UI-friendly gradual "upgrade" to high quality (simulated)
    setTimeout(() => {
      setPhotos(prev => 
        prev.map(p => newPhotos.find(np => np.id === p.id) ? { ...p, isHighQuality: true } : p)
      );
    }, 800);
  };

  const removePhoto = useCallback((id: string) => {
    cleanupUrl(id);
    setPhotos(prev => prev.filter(p => p.id !== id));
  }, []);

  const handleProcessMemories = async () => {
    if (photos.length === 0) return;
    
    setAppState(AppState.PROCESSING);
    
    // Simulate local "Memory Weaving" process
    setTimeout(() => {
      const randomQuote = LOCAL_QUOTES[Math.floor(Math.random() * LOCAL_QUOTES.length)];
      setSummary(randomQuote);
      setAppState(AppState.SUCCESS);
    }, 2000);
  };

  // Cleanup all URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start relative overflow-hidden">
      {/* Dynamic Background Pattern */}
      <div className="fixed inset-0 z-0 bg-[#faf7f5]">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,0 C30,20 70,20 100,0 L100,100 C70,80 30,80 0,100 Z" fill="url(#grad1)" />
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#eecda3', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#ef629f', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      <main className="relative z-10 w-full max-w-4xl px-6 py-12 flex flex-col items-center">
        <header className="text-center mb-12 animate-in fade-in zoom-in duration-1000">
          <h1 className="font-wedding text-5xl md:text-6xl text-neutral-800 mb-2">Petros & Christina</h1>
          <p className="font-script text-3xl md:text-4xl text-rose-400/80">June 20, 2026</p>
        </header>

        <section className="w-full bg-white/50 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-white/50 mb-8 transition-all duration-500">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-neutral-700">The Digital Guestbook</h2>
              <p className="text-neutral-500 max-w-md mx-auto">
                Select your favorite photos from the day. Our local weaver will help curate the emotions captured in your frames.
              </p>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="group relative inline-flex items-center justify-center px-10 py-4 font-bold text-white transition-all duration-300 bg-gradient-to-r from-rose-400 to-amber-400 font-pj rounded-2xl shadow-rose-200 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Memories
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              accept="image/*"
              className="hidden"
            />
          </div>

          {photos.length > 0 && (
            <div className="mt-12 space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {photos.map(photo => (
                  <PhotoCard key={photo.id} photo={photo} onRemove={removePhoto} />
                ))}
              </div>

              <div className="flex justify-center pt-4">
                <button
                  disabled={appState === AppState.PROCESSING}
                  onClick={handleProcessMemories}
                  className={`px-14 py-4 rounded-2xl font-semibold shadow-xl transition-all flex items-center space-x-3 ${
                    appState === AppState.PROCESSING 
                      ? 'bg-neutral-300 cursor-not-allowed scale-95 opacity-80' 
                      : 'bg-neutral-800 text-white hover:bg-neutral-900 hover:shadow-2xl'
                  }`}
                >
                  {appState === AppState.PROCESSING ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Weaving Together...</span>
                    </>
                  ) : (
                    <span>Weave Memories</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </section>

        {appState === AppState.SUCCESS && summary && (
          <section className="w-full bg-gradient-to-br from-white to-rose-50/50 backdrop-blur-md rounded-3xl p-10 shadow-xl border border-rose-100/50 animate-in zoom-in-95 duration-1000">
            <h3 className="font-wedding text-2xl text-rose-800 mb-6 text-center tracking-wide">A Poetic Perspective</h3>
            <div className="relative">
              <span className="absolute -top-6 -left-4 text-7xl text-rose-200/50 font-serif italic">“</span>
              <p className="text-xl text-neutral-700 font-light italic text-center leading-relaxed px-8 relative z-10">
                {summary}
              </p>
              <span className="absolute -bottom-14 -right-4 text-7xl text-rose-200/50 font-serif italic">”</span>
            </div>
            <div className="mt-16 flex justify-center">
               <button 
                onClick={() => { setAppState(AppState.IDLE); setPhotos([]); setSummary(null); }}
                className="group flex items-center space-x-2 text-sm font-medium text-rose-500 hover:text-rose-600 transition-colors"
               >
                 <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                 </svg>
                 <span>Reset Gallery</span>
               </button>
            </div>
          </section>
        )}
      </main>

      <footer className="mt-auto py-10 text-neutral-400 text-[10px] font-medium tracking-[0.3em] uppercase opacity-60">
        © 2026 ELYSIAN MOMENTS • PRESERVING LOVE
      </footer>
    </div>
  );
};

export default App;
