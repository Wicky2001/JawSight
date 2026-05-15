import { useEffect } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  error?:boolean,
  onClose: () => void;
}

export const Toast = ({ error = false, message, onClose }:ToastProps) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-in fade-in slide-in-from-bottom-5">
      {error ? (
        <AlertCircle className="w-5 h-5 text-red-400" />
      ) : (
        <CheckCircle className="w-5 h-5 text-green-400" />
      )}
      <p className="font-medium text-sm">{message}</p>
      <button onClick={onClose} className="ml-2">
        <X className="w-4 h-4 text-slate-400 hover:text-white transition-colors" />
      </button>
    </div>
  );
};
