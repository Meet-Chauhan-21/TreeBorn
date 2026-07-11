import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  trend?: { value: string; positive: boolean };
  icon: string | React.ComponentType<any>;
  color?: 'primary' | 'blue' | 'purple' | 'orange' | 'green';
}

const colorClasses = {
  primary: 'bg-slate-50 border border-slate-100 text-slate-800',
  blue: 'bg-blue-50/50 border border-blue-100/50 text-blue-600',
  purple: 'bg-indigo-50/50 border border-indigo-100/50 text-indigo-600',
  orange: 'bg-amber-50/50 border border-amber-100/50 text-amber-600',
  green: 'bg-emerald-50/50 border border-emerald-100/50 text-emerald-600',
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  trend,
  icon,
  color = 'primary',
}) => {
  const renderIcon = () => {
    if (typeof icon === 'string') {
      return (
        <i className={`${icon} text-lg transition-transform duration-200 group-hover:scale-105`} />
      );
    }
    const IconComponent = icon;
    return (
      <IconComponent
        size={18}
        className="transition-transform duration-200 group-hover:scale-105"
      />
    );
  };

  return (
    <div className="group bg-white rounded-2xl p-6 border border-slate-200/80 saas-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">{title}</p>
          <p className="text-2xl font-bold tracking-tight text-slate-900">{value}</p>
          {trend && (
            <div className="flex items-center gap-1.5 mt-3.5">
              <span
                className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md border ${
                  trend.positive 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/40' 
                    : 'bg-rose-50 text-rose-700 border-rose-200/40'
                }`}
              >
                {trend.positive ? '↑' : '↓'} {trend.value}
              </span>
              <span className="text-xs text-slate-400">vs last month</span>
            </div>
          )}
        </div>
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 ${colorClasses[color]}`}
        >
          {renderIcon()}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
