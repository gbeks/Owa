'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const variantClasses = {
  primary:   'bg-owa-gold text-owa-night font-semibold hover:bg-owa-gold-bright active:scale-[0.97] disabled:opacity-50',
  secondary: 'bg-transparent text-owa-gold border border-owa-gold/25 hover:bg-owa-gold/10 active:scale-[0.97] disabled:opacity-50',
  ghost:     'bg-transparent text-owa-mist hover:bg-white/[0.06] active:scale-[0.97] disabled:opacity-50',
  danger:    'bg-red-600 text-white hover:bg-red-500 active:scale-[0.97] disabled:opacity-50',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3.5 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, children, className = '', disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          inline-flex items-center justify-center gap-2 rounded-xl
          transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-owa-gold focus:ring-offset-2 focus:ring-offset-owa-night2
          ${variantClasses[variant]} ${sizeClasses[size]} ${className}
        `}
        {...props}
      >
        {isLoading && (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
