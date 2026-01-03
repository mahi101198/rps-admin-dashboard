'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageOff } from 'lucide-react';

interface SmartImageProps {
  src?: string | null;
  alt?: string;
  className?: string;
  size?: number;
}

// Domains that have issues with Next.js image optimization
const PROBLEMATIC_DOMAINS = [
  'placeholder.com',
  'picsum.photos',
  'supabase.co',
  'placehold.co',
  'dummyimage.com'
];

// Function to get a working placeholder URL
const getWorkingPlaceholder = (originalSrc: string) => {
  // Extract text from via.placeholder.com URLs
  const textMatch = originalSrc.match(/text=([^&]+)/);
  const text = textMatch ? decodeURIComponent(textMatch[1].replace(/\+/g, ' ')) : 'Product';
  
  // Use a different placeholder service that works
  return `https://placehold.co/300x300?text=${encodeURIComponent(text)}`;
};

// Function to check if URL is a placeholder service
const isPlaceholderUrl = (src: string) => {
  return src.includes('placeholder.com') || src.includes('placehold.co') || src.includes('dummyimage.com');
};

/**
 * Smart image component that automatically chooses between Next.js Image and regular img
 * based on the src domain to avoid optimization issues
 */
const SmartImage: React.FC<SmartImageProps> = ({ src, alt = '', className, size }) => {
  const hasSrc = Boolean(src);
  const [isLoading, setIsLoading] = React.useState(hasSrc);
  const [isError, setIsError] = React.useState(!hasSrc);
  const [currentSrc, setCurrentSrc] = React.useState(src || '');
  const [actualSrc, setActualSrc] = React.useState(src || '');

  // Check if this source should bypass Next.js optimization
  const shouldBypassOptimization = React.useMemo(() => {
    if (!actualSrc || typeof actualSrc !== 'string') return false;
    return PROBLEMATIC_DOMAINS.some(domain => actualSrc.includes(domain));
  }, [actualSrc]);

  // Reset states when src changes and handle placeholder URLs
  React.useEffect(() => {
    const normalizedSrc = src || '';
    if (normalizedSrc === currentSrc) return;
    
    setCurrentSrc(normalizedSrc);
    setIsLoading(true);
    setIsError(false);
    
    // If no src provided, show error state
    if (!src) {
      setIsLoading(false);
      setIsError(true);
      setActualSrc('');
      return;
    }
    
    // Convert problematic placeholder URLs to working ones
    if (src.includes('via.placeholder.com')) {
      const workingUrl = getWorkingPlaceholder(src);
      console.log('Converting placeholder URL from:', src, 'to:', workingUrl);
      setActualSrc(workingUrl);
    } else {
      setActualSrc(src);
    }
  }, [src, currentSrc]);

  const containerClasses = cn(
    'relative overflow-hidden rounded-md bg-muted',
    size ? `size-${size}` : 'w-full aspect-square',
    className
  );

  const handleLoad = () => {
    setIsLoading(false);
    setIsError(false);
  };

  const handleError = () => {
    console.warn('Smart image load error for:', actualSrc);
    
    // Try fallback to logo if it's not already the logo
    if (actualSrc && !actualSrc.includes('/logo.png') && !isPlaceholderUrl(actualSrc)) {
      console.log('Falling back to logo.png');
      setActualSrc('/logo.png');
      setIsLoading(true);
      return;
    }
    
    setIsLoading(false);
    setIsError(true);
  };

  return (
    <div className={containerClasses}>
      {/* Loading skeleton */}
      {isLoading && <Skeleton className="absolute inset-0" />}

      {/* Error state */}
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
          <div className="flex flex-col items-center text-gray-500">
            <ImageOff className="size-4 mb-1" />
            <span className="text-[0.6rem] font-medium">
              {alt || 'Product'}
            </span>
          </div>
        </div>
      )}

      {/* Conditional rendering based on domain */}
      {actualSrc && !isError ? (
        shouldBypassOptimization ? (
          // Use regular img tag for problematic domains
          <img
            src={actualSrc}
            alt={alt}
            className={cn(
              'w-full h-full object-cover transition-opacity duration-300',
              isLoading ? 'opacity-0' : 'opacity-100'
            )}
            onLoad={handleLoad}
            onError={handleError}
          />
        ) : (
          // Use Next.js Image for other domains
          <Image
            src={actualSrc}
            alt={alt}
            fill={size === undefined}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={cn(
              'object-cover transition-opacity duration-300',
              isLoading ? 'opacity-0' : 'opacity-100'
            )}
            onLoad={handleLoad}
            onError={handleError}
            priority={false}
          />
        )
      ) : null}
    </div>
  );
};

SmartImage.displayName = 'SmartImage';

export { SmartImage };