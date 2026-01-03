'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageOff } from 'lucide-react';

interface FallbackImageProps {
  src: string;
  alt?: string;
  className?: string;
}

/**
 * Fallback image component that uses regular img tag instead of Next.js Image
 * Useful for external services that have issues with Next.js image optimization
 */
export const FallbackImage: React.FC<FallbackImageProps> = ({ src, alt = '', className }) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isError, setIsError] = React.useState(false);

  const handleImageLoad = () => {
    setIsLoading(false);
    setIsError(false);
  };

  const handleImageError = () => {
    console.warn('Fallback image load error for:', src);
    setIsLoading(false);
    setIsError(true);
  };

  const containerClasses = cn(
    'relative overflow-hidden rounded-md bg-muted',
    className
  );

  return (
    <div className={containerClasses}>
      {/* Loading skeleton */}
      {isLoading && <Skeleton className="absolute inset-0" />}

      {/* Error state */}
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="flex flex-col items-center text-muted-foreground">
            <ImageOff className="size-6 mb-2" />
            <span className="text-xs">Failed to load</span>
          </div>
        </div>
      )}

      {/* Image */}
      <img
        src={src}
        alt={alt}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          isLoading || isError ? 'opacity-0' : 'opacity-100'
        )}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    </div>
  );
};

FallbackImage.displayName = 'FallbackImage';