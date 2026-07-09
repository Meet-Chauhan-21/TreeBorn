import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  trend?: { value: string; positive: boolean };
  icon: string | React.ComponentType<any>;
  color?: 'primary' | 'blue' | 'purple' | 'orange' | 'green';
}

const colorClasses = {
  primary: 'from-primary to-secondary text-white',
  blue: 'from-blue-500 to-blue-600 text-white',
  purple: 'from-purple-500 to-purple-600 text-white',
  orange: 'from-orange-500 to-orange-600 text-white',
  green: 'bg-accent-sage text-primary group-hover:bg-accent-sage-dark',
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
        <i className={`${icon} text-xl transition-transform duration-350 ease-out group-hover:scale-115 group-hover:rotate-6`} />
      );
    }
    const IconComponent = icon;
    return (
      <IconComponent
        size={22}
        className="transition-transform duration-350 ease-out group-hover:scale-115 group-hover:rotate-6"
      />
    );
  };

  const isGradient = color !== 'green';

  return (
    <div className="group bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className="flex items-center gap-1.5 mt-3">
              <span
                className={`text-sm font-semibold ${
                  trend.positive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend.positive ? '↑' : '↓'} {trend.value}
              </span>
              <span className="text-sm text-gray-400">vs last month</span>
            </div>
          )}
        </div>
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
            isGradient ? `bg-gradient-to-br ${colorClasses[color]}` : colorClasses[color]
          }`}
        >
          {renderIcon()}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
