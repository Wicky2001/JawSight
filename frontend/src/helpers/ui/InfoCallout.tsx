import React from 'react';

interface InfoCalloutProps {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  type?: 'info' | 'warning' | 'success';
}

export const InfoCallout: React.FC<InfoCalloutProps> = ({ icon: Icon, title, children, type = 'info' }) => {
  const colors = {
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  };

  const iconColors = {
    info: 'text-blue-500',
    warning: 'text-amber-500',
    success: 'text-emerald-500',
  };

  return (
    <div className={`p-4 rounded-xl border ${colors[type]} flex gap-3`}>
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColors[type]}`} />
      <div>
        <h4 className="font-semibold text-sm mb-1">{title}</h4>
        <div className="text-sm opacity-90">{children}</div>
      </div>
    </div>
  );
};
