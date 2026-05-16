import { Image as ImageIcon } from "lucide-react";

interface ImageCardProps {
  title: string;
  url?: string | null;
}

const ResultImageCard = ({ title, url }: ImageCardProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[400px]">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <h3 className="font-semibold text-slate-700 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-teal-600" />
          {title}
        </h3>
      </div>
      <div className="flex-1 bg-slate-900 relative flex items-center justify-center p-2">
        {url ? (
          <img
            src={url}
            alt={title}
            className="w-full h-full object-contain"
            onError={(e) => {
              const imageElement = e.currentTarget;
              const fallbackElement =
                imageElement.nextElementSibling as HTMLDivElement | null;

              imageElement.style.display = "none";
              if (fallbackElement) {
                fallbackElement.style.display = "flex";
              }
            }}
          />
        ) : null}

        {/* Fallback for missing or expired images */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center text-slate-500 bg-slate-100 ${url ? "hidden" : "flex"}`}
        >
          <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
          <span className="text-sm font-medium">
            Image unavailable or expired
          </span>
        </div>
      </div>
    </div>
  );
};

export default ResultImageCard;
