
import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: React.ReactNode;
  isLoading?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  isLoading = false,
  className,
  children,
  ...props
}) => {
  const variantStyles = {
    primary: 'bg-hr-blue text-white hover:bg-hr-blue/90 active:bg-hr-blue/80',
    secondary: 'bg-hr-silver/20 text-hr-text-primary hover:bg-hr-silver/30 active:bg-hr-silver/40',
    outline: 'bg-transparent border border-hr-silver/30 text-hr-text-primary hover:bg-hr-silver/10 active:bg-hr-silver/20',
    ghost: 'bg-transparent text-hr-text-primary hover:bg-hr-silver/10 active:bg-hr-silver/20',
    link: 'bg-transparent text-hr-blue hover:underline p-0 h-auto'
  };

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 rounded-md',
    md: 'text-sm px-4 py-2 rounded-md',
    lg: 'text-base px-5 py-2.5 rounded-lg'
  };

  return (
    <button
      className={cn(
        'font-medium inline-flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-hr-blue/30 disabled:opacity-60 disabled:pointer-events-none',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        variant !== 'link' && 'shadow-sm',
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
      )}
      {icon && !isLoading && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
