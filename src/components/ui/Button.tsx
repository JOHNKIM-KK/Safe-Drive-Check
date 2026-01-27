import { forwardRef, type ReactNode, type MouseEvent } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, onClick, type = 'button' }, ref) => {
    const variants = {
      primary: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25',
      secondary: 'bg-neutral-800 hover:bg-neutral-700 text-white',
      danger: 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25',
      ghost: 'bg-transparent hover:bg-neutral-800 text-neutral-200',
      outline: 'bg-transparent border-2 border-neutral-700 hover:border-neutral-500 text-neutral-200',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm rounded-lg',
      md: 'px-4 py-2.5 text-base rounded-xl',
      lg: 'px-6 py-3.5 text-lg rounded-xl',
      xl: 'px-8 py-4 text-xl rounded-2xl',
    };

    return (
      <motion.button
        ref={ref}
        type={type}
        whileTap={{ scale: 0.98 }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        className={cn(
          'font-semibold transition-colors duration-200 touch-target',
          'flex items-center justify-center gap-2',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        onClick={onClick}
      >
        {isLoading ? (
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : null}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
