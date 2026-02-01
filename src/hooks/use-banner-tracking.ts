import { useCallback } from 'react';

export interface BannerViewMetadata {
  carousel_index?: number;
  total_banners?: number;
  source?: string;
  userAgent?: string;
  [key: string]: any;
}

export interface BannerClickData {
  clickType?: 'internal' | 'external' | 'app_action';
  clickUrl?: string;
  city?: string;
  region?: string;
  country?: string;
  ipAddress?: string;
  userEmail?: string;
  userAgent?: string;
  metadata?: BannerViewMetadata;
}

export interface BannerStats {
  totalViews: number;
  totalClicks: number;
  ctr: number;
  userViews?: number;
  userClicks?: number;
}

/**
 * Hook to track banner views and analytics
 * Usage:
 * const { trackView, trackClick, getStats, isLoading } = useBannerTracking();
 * 
 * // Track a view
 * await trackView(bannerId, userId, { carousel_index: 0, source: 'home' });
 * 
 * // Track a click
 * await trackClick(bannerId, userId, {
 *   clickType: 'external',
 *   clickUrl: 'https://example.com',
 *   city: 'New York',
 *   country: 'USA'
 * });
 * 
 * // Get stats
 * const stats = await getStats(bannerId, userId);
 */
export function useBannerTracking() {
  const trackView = useCallback(
    async (
      bannerId: string,
      userId: string,
      metadata?: BannerViewMetadata
    ): Promise<{ success: boolean; viewId?: string; message: string }> => {
      try {
        const response = await fetch('/api/banners/track-view', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bannerId,
            userId,
            metadata,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        console.error('Error tracking banner view:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Failed to track view',
        };
      }
    },
    []
  );

  const trackClick = useCallback(
    async (
      bannerId: string,
      userId: string,
      clickData: BannerClickData
    ): Promise<{ success: boolean; analyticsId?: string; message: string }> => {
      try {
        const response = await fetch('/api/banners/track-analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bannerId,
            userId,
            clickData,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        console.error('Error tracking banner click:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Failed to track click',
        };
      }
    },
    []
  );

  const getStats = useCallback(
    async (
      bannerId: string,
      userId?: string
    ): Promise<{
      success: boolean;
      stats?: BannerStats;
      message: string;
    }> => {
      try {
        const url = new URL(`/api/banners/${bannerId}/stats`, window.location.origin);
        if (userId) {
          url.searchParams.append('userId', userId);
        }

        const response = await fetch(url.toString());

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        console.error('Error fetching banner stats:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Failed to fetch stats',
        };
      }
    },
    []
  );

  return {
    trackView,
    trackClick,
    getStats,
  };
}
