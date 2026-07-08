import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  href?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  href,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-display font-medium rounded-full transition-all duration-300 focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-light active:scale-[0.98]',
    secondary: 'bg-secondary text-white hover:bg-opacity-90 active:scale-[0.98]',
    outline: 'border border-primary text-primary hover:bg-primary hover:text-white active:scale-[0.98]',
    text: 'text-dark hover:text-primary hover:underline bg-transparent p-0 active:opacity-80',
  };

  const sizes = {
    sm: 'text-xs px-4 py-2 gap-1.5',
    md: 'text-sm px-6 py-3 gap-2',
    lg: 'text-base px-8 py-4 gap-2.5 tracking-wide',
  };

  const variantClass = variants[variant];
  const sizeClass = sizes[size];
  const combinedClass = `${baseStyles} ${variantClass} ${sizeClass} ${className}`;

  if (href) {
    return (
      <motion.a
        href={href}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
        className={combinedClass}
      >
        {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </motion.a>
    );
  }

  // De-structure event listeners that cause type conflicts with React 19 motion.button
  const {
    onAnimationStart,
    onDragStart,
    onDragEnd,
    onDrag,
    onTransitionEnd,
    ...cleanProps
  } = props as any;

  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      className={combinedClass}
      disabled={isLoading || props.disabled}
      {...cleanProps}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {!isLoading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </motion.button>
  );
};

export default Button;
