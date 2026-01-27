import { forwardRef, type ReactNode, type MouseEvent } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps {
  variant?: 'default' | 'elevated' | 'glass';
  hoverable?: boolean;
  children?: ReactNode;
  className?: string;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hoverable = false, children, onClick }, ref) => {
    const variants = {
      default: 'bg-neutral-900 border border-neutral-800',
      elevated: 'bg-neutral-800 shadow-xl shadow-black/20',
      glass: 'glass',
    };

    return (
      <motion.div
        ref={ref}
        whileHover={hoverable ? { scale: 1.02, y: -2 } : undefined}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        className={cn(
          'rounded-2xl p-5',
          variants[variant],
          hoverable && 'cursor-pointer',
          className
        )}
        onClick={onClick}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

interface CardHeaderProps {
  children?: ReactNode;
  className?: string;
}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 mb-4', className)}
    >
      {children}
    </div>
  )
);

CardHeader.displayName = 'CardHeader';

interface CardTitleProps {
  children?: ReactNode;
  className?: string;
}

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, children }, ref) => (
    <h3
      ref={ref}
      className={cn('text-xl font-bold text-white', className)}
    >
      {children}
    </h3>
  )
);

CardTitle.displayName = 'CardTitle';

interface CardDescriptionProps {
  children?: ReactNode;
  className?: string;
}

const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, children }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-neutral-400', className)}
    >
      {children}
    </p>
  )
);

CardDescription.displayName = 'CardDescription';

interface CardContentProps {
  children?: ReactNode;
  className?: string;
}

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children }, ref) => (
    <div ref={ref} className={cn('', className)}>
      {children}
    </div>
  )
);

CardContent.displayName = 'CardContent';

export { Card, CardHeader, CardTitle, CardDescription, CardContent };
