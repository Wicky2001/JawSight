import { createPortal } from "react-dom";

export type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  children: React.ReactNode;
};

const SideBar = ({
  isOpen,
  onClose,
  title,
  description,
  children,
}: SidebarProps) => {
  return createPortal(
    <>
      {/* Background Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel - Left Aligned */}
      <div
        className={`fixed top-0 left-0 h-full w-full sm:w-96 bg-green-50 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ zIndex: 9999 }}
      >
        {/* Header Section */}
        <div className="px-6 py-5 border-b border-green-200 bg-green-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-green-800">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 -mr-2 text-green-400 hover:text-green-600 hover:bg-green-200 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-300"
              aria-label="Close sidebar"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          {/* Description */}
          {description && (
            <p className="mt-2 text-sm text-green-600">{description}</p>
          )}
        </div>

        {/* Body Section (Scrollable) */}
        <div className="flex-1 p-6 overflow-y-auto  bg-green-50">
          {children}
        </div>
      </div>
    </>,
    document.body,
  );
};

export default SideBar;
