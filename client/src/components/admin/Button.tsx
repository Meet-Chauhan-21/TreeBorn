import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
}

const variantClasses = {
  primary: 'bg-slate-950 hover:bg-slate-800 text-white shadow-[0_1px_2px_rgba(0,0,0,0.06)] border border-slate-950',
  secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-250/70 shadow-2xs',
  danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs border border-rose-650',
  ghost: 'hover:bg-slate-50 border border-transparent hover:border-slate-200/60 text-slate-600 hover:text-slate-900',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4.5 py-2 text-sm',
  lg: 'px-5.5 py-2.5 text-base',
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  className = '',
  ...props
}) => {
  return (
    <button
      className={`inline-flex items-center gap-1.5 font-semibold rounded-xl transition-all duration-150 cursor-pointer ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon size={16} />}
      {children}
      {Icon && iconPosition === 'right' && <Icon size={16} />}
    </button>
  );
};

export default Button;
