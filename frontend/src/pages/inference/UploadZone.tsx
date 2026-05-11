import React, { useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Edit3 } from 'lucide-react';

interface UploadZoneProps {
  id: 'left' | 'right' | 'front';
  title: string;
  subtitle: string;
  imageDataUrl: string | null;
  bgImage?: string;
  hasCsv?: boolean;
  onUpload: (id: 'left' | 'right' | 'front', dataUrl: string) => void;
  onRemove: (id: 'left' | 'right' | 'front') => void;
  onError: (msg: string) => void;
  onEditMarks?: () => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ id, title, subtitle, imageDataUrl, bgImage, hasCsv, onUpload, onRemove, onError, onEditMarks }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        onError('Invalid file type. Please upload a .jpg, .jpeg, or .png file.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpload(id, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="flex justify-between items-end">
        <span className="font-medium text-slate-700">{title}</span>
        {imageDataUrl && (
          <span className={`text-xs font-semibold flex items-center gap-1 ${id === 'front' && !hasCsv ? 'text-amber-600' : 'text-emerald-600'}`}>
            {id === 'front' && !hasCsv ? <AlertCircle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />} 
            {id === 'front' && !hasCsv ? 'Pending Marks' : 'Uploaded'}
          </span>
        )}
      </div>
      
      <div 
        onClick={() => !imageDataUrl && fileInputRef.current?.click()}
        className={`relative flex-1 rounded-2xl transition-all duration-200 overflow-hidden min-h-[280px] flex flex-col items-center justify-center
          ${imageDataUrl 
            ? 'border-2 border-slate-200 shadow-sm bg-slate-900' 
            : 'border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-teal-400 cursor-pointer group'
          }`}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/jpeg, image/png, image/jpg" 
          className="hidden" 
        />

        {!imageDataUrl && bgImage && (
          <div 
            className="absolute inset-0 z-0 opacity-40 group-hover:opacity-50 transition-opacity"
            style={{
              backgroundImage: `url('${bgImage}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
        )}

        {imageDataUrl ? (
          <>
            <img src={imageDataUrl} alt={title} className="w-full h-full object-contain relative z-10" />
            
            {/* Top Right Controls */}
            <div className="absolute top-3 right-3 flex gap-2 z-20">
              {id === 'front' && onEditMarks && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onEditMarks(); }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full shadow-sm backdrop-blur-sm transition-colors text-sm font-medium
                    ${hasCsv ? 'bg-white/90 text-slate-700 hover:bg-white' : 'bg-amber-400 text-amber-900 hover:bg-amber-300 animate-pulse'}
                  `}
                >
                  <Edit3 className="w-4 h-4" />
                  {hasCsv ? 'Edit Marks' : 'Mark Points'}
                </button>
              )}
              <button 
                onClick={(e) => { e.stopPropagation(); onRemove(id); }}
                className="bg-white/90 hover:bg-red-50 text-slate-700 hover:text-red-600 p-2 rounded-full shadow-sm backdrop-blur-sm transition-colors"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="relative z-10 text-center p-6 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 group-hover:text-teal-600 transition-all">
              <Upload className="w-8 h-8 text-slate-500 group-hover:text-teal-600 transition-colors" />
            </div>
            <p className="font-semibold text-slate-800 mb-1 bg-white/70 backdrop-blur-md px-3 py-1 rounded-lg">Click to upload</p>
            <p className="text-sm text-slate-700 max-w-[200px] font-medium bg-white/70 backdrop-blur-md px-3 py-1 rounded-lg mt-1">{subtitle}</p>
          </div>
        )}
      </div>
    </div>
  );
};
