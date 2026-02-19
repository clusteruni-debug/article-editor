'use client';

import { cn } from '@/lib/utils/cn';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-gray-200 border-t-black',
        {
          'h-4 w-4': size === 'sm',
          'h-6 w-6': size === 'md',
          'h-8 w-8': size === 'lg',
        },
        className
      )}
    />
  );
}
