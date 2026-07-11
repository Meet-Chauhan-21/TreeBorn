import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  action,
  icon: Icon,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 saas-shadow ${className}`}>
      {(title || subtitle || action) && (
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-700">
                <Icon size={18} />
              </div>
            )}
            <div>
              {title && <h3 className="text-base font-bold text-slate-900 leading-tight">{title}</h3>}
              {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {action && <div className="flex items-center">{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};

export default Card;
