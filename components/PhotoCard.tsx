
import React, { useState, useEffect } from 'react';
import { PhotoFile } from '../types';

interface PhotoCardProps {
  photo: PhotoFile;
  onRemove: (id: string) => void;
}

const PhotoCard: React.FC<PhotoCardProps> = ({ photo, onRemove }) => {
  const [loaded, setLoaded] = useState(false);

  // Optimization: Release object URL when component unmounts
  useEffect(() => {
    return () => {
      // Logic for revocation is handled in the parent to avoid double-freeing if re-renders occur,
      // but we could also do it here if this component owned the URL.
    };
  }, []);

  return (
    <div className="relative group aspect-square overflow-hidden rounded-xl bg-neutral-200 shadow-md transition-all hover:shadow-xl hover:-translate-y-1">
      <img
        src={photo.previewUrl}
        alt="Wedding Preview"
        className={`h-full w-full object-cover transition-all duration-700 ease-in-out ${
          loaded ? 'opacity-100 blur-0' : 'opacity-0 blur-lg'
        } ${!photo.isHighQuality ? 'scale-105 contrast-75' : 'scale-100'}`}
        onLoad={() => setLoaded(true)}
      />
      
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <button
          onClick={() => onRemove(photo.id)}
          className="bg-rose-500 text-white p-2 rounded-full transform scale-75 group-hover:scale-100 transition-transform shadow-lg hover:bg-rose-600 focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {!photo.isHighQuality && (
        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-white/70 backdrop-blur-sm rounded-md text-[10px] font-medium text-neutral-600">
          Optimizing...
        </div>
      )}
    </div>
  );
};

export default PhotoCard;
