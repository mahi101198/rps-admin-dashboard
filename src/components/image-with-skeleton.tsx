'use client';

import * as React from 'react';
import Image from 'next/image';

import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageOff } from 'lucide-react';

interface ImageWithSkeletonProps {
  src: string;
  alt?: string;
  className?: string;
  size?: number;
}

/**
 * ImageWithSkeleton component that displays a skeleton loader while the image is loading and handles error states
 */
const ImageWithSkeleton: React.FC<ImageWithSkeletonProps> = ({ src, alt = '', className, size }) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isError, setIsError] = React.useState(false);
  const [currentSrc, setCurrentSrc] = React.useState(src);
  
  // Determine if unoptimized mode is needed immediately
  const useUnoptimized = React.useMemo(() => {
    const shouldUseUnoptimized = src.includes('placeholder.com') || src.includes('picsum.photos') || src.includes('supabase.co');
    if (shouldUseUnoptimized) {
      console.log('Using unoptimized mode for:', src);
    }
    return shouldUseUnoptimized;
  }, [src]);

  // Only reset states when src actually changes
  React.useEffect(() => {
    if (src === currentSrc) return;

    setCurrentSrc(src);
    setIsLoading(true);
    setIsError(false);
  }, [src, currentSrc]);

  const containerClasses = cn(
    'relative overflow-hidden rounded-md bg-muted',
    size ? `size-${size}` : 'w-full aspect-square',
    className
  );

  return (
    <div className={containerClasses}>
      {/* Loading skeleton */}
      {isLoading && <Skeleton className="absolute inset-0" />}

      {/* Error state */}
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <ImageOff className="size-6 text-muted-foreground" />
        </div>
      )}

      {/* Image */}
      <Image
        src={src}
        alt={alt}
        fill={size === undefined}
        unoptimized={useUnoptimized}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className={cn(
          'object-cover transition-opacity duration-300',
          isLoading || isError ? 'opacity-0' : 'opacity-100'
        )}
        onLoad={() => {
          setIsLoading(false);
          setIsError(false);
        }}
        onError={() => {
          console.warn('Image load error for:', src);
          setIsLoading(false);
          setIsError(true);
        }}
        priority={false}
      />
    </div>
  );
};

ImageWithSkeleton.displayName = 'ImageWithSkeleton';

export { ImageWithSkeleton };
