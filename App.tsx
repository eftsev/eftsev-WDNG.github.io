
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { PhotoFile, AppState } from './types';
import PhotoCard from './components/PhotoCard';
import { analyzePhotos } from './services/geminiService';

const App: React.FC = () => {
  const [photos, setPhotos] = useState<PhotoFile[]>([]);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [analysis, setAnalysis] = useState<string | null>(null);
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
    // Fix: Explicitly cast to File[] to ensure correct type inference for 'file' and resolve type mismatch errors
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    const newPhotos: PhotoFile[] = files.map(file => {
      const id = Math.random().toString(36).substr(2, 9);
      // Fix: 'file' is now correctly typed as 'File' (which extends Blob), satisfying URL.createObjectURL requirements
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

    // Simulate gradual high-quality loading to keep UI thread responsive
    // In a real app, this would involve creating thumbnails or processing
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

  const handleUpload = async () => {
    if (photos.length === 0) return;
    
    setAppState(AppState.ANALYZING);
    try {
      // In a production app, we would upload to S3/Cloudinary first.
      // Here we grab a few thumbnails for Gemini.
      const sampleBase64s = await Promise.all(
        photos.slice(0, 4).map(async (p) => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(p.file);
          });
        })
      );

      const result = await analyzePhotos(sampleBase64s);
      setAnalysis(result);
      setAppState(AppState.SUCCESS);
    } catch (error) {
      console.error("Analysis failed", error);
      setAppState(AppState.IDLE);
      alert("Something went wrong with the photo analysis.");
    }
  };

  // Cleanup all URLs on unmount
  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start relative overflow-hidden">
      {/* Dynamic Background */}
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
        <header className="text-center mb-12">
          <h1 className="font-wedding text-5xl md:text-6xl text-neutral-800 mb-2">Petros & Christina</h1>
          <p className="font-script text-3xl md:text-4xl text-rose-400/80">June 20, 2026</p>
        </header>

        <section className="w-full bg-white/40 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50 mb-8">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-neutral-700">Share Your Perspectives</h2>
              <p className="text-neutral-500 max-w-md mx-auto">
                Upload your favorite moments. Our memory weaver will craft a beautiful summary of your shared story.
              </p>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-gradient-to-r from-rose-400 to-amber-400 font-pj rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 hover:scale-105 active:scale-95"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Select Photos
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
            <div className="mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {photos.map(photo => (
                  <PhotoCard key={photo.id} photo={photo} onRemove={removePhoto} />
                ))}
              </div>

              <div className="flex justify-center pt-4">
                <button
                  disabled={appState === AppState.ANALYZING}
                  onClick={handleUpload}
                  className={`px-12 py-4 rounded-2xl font-semibold shadow-lg transition-all flex items-center space-x-2 ${
                    appState === AppState.ANALYZING 
                      ? 'bg-neutral-300 cursor-not-allowed' 
                      : 'bg-neutral-800 text-white hover:bg-neutral-900 hover:shadow-xl'
                  }`}
                >
                  {appState === AppState.ANALYZING ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Weaving Memories...</span>
                    </>
                  ) : (
                    <span>Upload & Weave Memories</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </section>

        {appState === AppState.SUCCESS && analysis && (
          <section className="w-full bg-gradient-to-br from-rose-50 to-amber-50 rounded-3xl p-8 shadow-xl border border-rose-100 animate-in zoom-in-95 duration-700">
            <h3 className="font-wedding text-2xl text-rose-800 mb-4 text-center">A Moment's Whisper</h3>
            <div className="relative">
              <span className="absolute -top-4 -left-2 text-6xl text-rose-200 font-serif">“</span>
              <p className="text-lg text-neutral-700 font-light italic text-center leading-relaxed px-6">
                {analysis}
              </p>
              <span className="absolute -bottom-10 -right-2 text-6xl text-rose-200 font-serif">”</span>
            </div>
            <div className="mt-10 flex justify-center">
               <button 
                onClick={() => { setAppState(AppState.IDLE); setPhotos([]); setAnalysis(null); }}
                className="text-sm font-medium text-rose-600 hover:text-rose-700 underline underline-offset-4"
               >
                 Upload More Memories
               </button>
            </div>
          </section>
        )}
      </main>

      <footer className="mt-auto py-8 text-neutral-400 text-xs font-medium tracking-widest uppercase">
        © 2026 ELYSIAN MOMENTS
      </footer>
    </div>
  );
};

export default App;
