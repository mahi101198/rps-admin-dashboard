/**
 * Utility functions for banner analytics tracking
 */

export interface GeoLocation {
  city?: string;
  region?: string;
  country?: string;
  ipAddress?: string;
}

/**
 * Get user's geolocation from their IP address
 * Uses a public IP geolocation API (ipapi.co)
 * This is optional and can be called to enhance analytics data
 */
export async function getUserGeoLocation(): Promise<GeoLocation> {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    return {
      city: data.city || '',
      region: data.region || '',
      country: data.country_name || '',
      ipAddress: data.ip || '',
    };
  } catch (error) {
    console.warn('Failed to get geolocation:', error);
    return {};
  }
}

/**
 * Get user agent string
 */
export function getUserAgent(): string {
  if (typeof navigator !== 'undefined') {
    return navigator.userAgent || '';
  }
  return '';
}

/**
 * Get carousel metadata (if viewing banners in a carousel)
 */
export function getCarouselMetadata(
  currentIndex: number,
  totalBanners: number,
  source: string = 'carousel'
) {
  return {
    carousel_index: currentIndex,
    total_banners: totalBanners,
    source,
  };
}

/**
 * Format analytics data with all available metadata
 */
export async function getEnrichedClickData(baseData: {
  clickType: 'internal' | 'external' | 'app_action';
  clickUrl?: string;
  metadata?: any;
}): Promise<any> {
  const geo = await getUserGeoLocation();
  const userAgent = getUserAgent();

  return {
    ...baseData,
    userAgent,
    city: geo.city,
    region: geo.region,
    country: geo.country,
    ipAddress: geo.ipAddress,
  };
}

/**
 * Helper to create a banner click tracking promise
 * that can be awaited or ignored (fire and forget)
 */
export async function trackBannerClickEvent(
  bannerId: string,
  userId: string,
  clickUrl: string,
  metadata?: any
): Promise<void> {
  try {
    const clickData = await getEnrichedClickData({
      clickType: clickUrl.startsWith('http') ? 'external' : 'internal',
      clickUrl,
      metadata,
    });

    await fetch('/api/banners/track-analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bannerId,
        userId,
        clickData,
      }),
    });
  } catch (error) {
    console.warn('Failed to track banner click:', error);
    // Don't throw - this is non-critical
  }
}

/**
 * Helper to create a banner view tracking promise
 */
export async function trackBannerViewEvent(
  bannerId: string,
  userId: string,
  metadata?: any
): Promise<void> {
  try {
    const userAgent = getUserAgent();

    await fetch('/api/banners/track-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bannerId,
        userId,
        metadata: {
          userAgent,
          ...metadata,
        },
      }),
    });
  } catch (error) {
    console.warn('Failed to track banner view:', error);
    // Don't throw - this is non-critical
  }
}
