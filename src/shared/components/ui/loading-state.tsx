import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface LoadingStateProps {
  text?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

/**
 * LoadingState Component
 * 
 * A reusable loading indicator with optional text.
 * Can be displayed full-screen or inline.
 * 
 * @example
 * // Full screen loading
 * if (loading) return <LoadingState text="Loading contract..." />;
 * 
 * // Inline loading
 * <LoadingState size="sm" fullScreen={false} />
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  text,
  className,
  size = 'md',
  fullScreen = true,
}) => {
  const content = (
    <>
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      {text && <p className="mt-4 text-muted-foreground">{text}</p>}
    </>
  );

  if (fullScreen) {
    return (
      <div className={cn('flex flex-col justify-center items-center h-screen', className)}>
        {content}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col justify-center items-center', className)}>
      {content}
    </div>
  );
};
