/**
 * Example Banner Carousel Component with Analytics Tracking
 * This is a complete working example of how to integrate banner analytics
 * 
 * Usage:
 * <BannerCarouselWithAnalytics 
 *   banners={banners} 
 *   autoRotate={true}
 *   rotationInterval={5000}
 * />
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useBannerTracking } from '@/hooks/use-banner-tracking';
import { useAuth } from '@/contexts/auth-context';
import { Banner } from '@/lib/types/all-schemas';

interface BannerCarouselProps {
  banners: Banner[];
  autoRotate?: boolean;
  rotationInterval?: number; // milliseconds
  onStatsFetch?: (stats: any) => void;
}

export function BannerCarouselWithAnalytics({
  banners,
  autoRotate = true,
  rotationInterval = 5000,
  onStatsFetch,
}: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stats, setStats] = useState<{ [key: string]: any }>({});
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();
  const { trackView, trackClick, getStats } = useBannerTracking();

  const currentBanner = banners[currentIndex];

  // Track view whenever banner changes
  useEffect(() => {
    if (!user?.uid || !currentBanner) return;

    // Track view with carousel metadata
    trackView(currentBanner.bannerId, user.uid, {
      carousel_index: currentIndex,
      total_banners: banners.length,
      source: 'home_carousel',
    }).catch(err => {
      console.warn('Failed to track banner view:', err);
    });
  }, [currentIndex, currentBanner, user?.uid, trackView, banners.length]);

  // Auto-rotate carousel
  useEffect(() => {
    if (!autoRotate || banners.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % banners.length);
    }, rotationInterval);

    return () => clearInterval(timer);
  }, [autoRotate, rotationInterval, banners.length]);

  // Handle banner click
  const handleBannerClick = useCallback(async () => {
    if (!user?.uid || !currentBanner) return;

    try {
      // Track click with detailed data
      await trackClick(currentBanner.bannerId, user.uid, {
        clickType: currentBanner.linkTo?.startsWith('http') ? 'external' : 'internal',
        clickUrl: currentBanner.linkTo,
        metadata: {
          carousel_index: currentIndex,
          total_banners: banners.length,
          source: 'home_carousel',
        },
      });

      // Navigate to banner URL
      if (currentBanner.linkTo) {
        window.location.href = currentBanner.linkTo;
      }
    } catch (error) {
      console.error('Error handling banner click:', error);
      // Still navigate even if tracking fails
      if (currentBanner.linkTo) {
        window.location.href = currentBanner.linkTo;
      }
    }
  }, [user?.uid, currentBanner, trackClick, currentIndex, banners.length]);

  // Fetch stats for current banner
  const loadStats = useCallback(async () => {
    if (!currentBanner) return;

    setLoading(true);
    try {
      const result = await getStats(currentBanner.bannerId, user?.uid);
      if (result.success && result.stats) {
        setStats(prev => ({
          ...prev,
          [currentBanner.bannerId]: result.stats,
        }));
        onStatsFetch?.(result.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  }, [currentBanner, getStats, user?.uid, onStatsFetch]);

  const currentStats = currentBanner ? stats[currentBanner.bannerId] : null;

  return (
    <div className="banner-carousel">
      {/* Banner Container */}
      <div className="banner-container" onClick={handleBannerClick}>
        {currentBanner && (
          <>
            <img
              src={currentBanner.imageUrl}
              alt={currentBanner.title}
              className="banner-image"
              loading="lazy"
            />
            <div className="banner-overlay">
              <h2>{currentBanner.title}</h2>
              <p>Click to view</p>
            </div>
          </>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="carousel-controls">
        {/* Previous Button */}
        <button
          onClick={() => setCurrentIndex(prev => (prev - 1 + banners.length) % banners.length)}
          className="carousel-btn prev-btn"
          aria-label="Previous banner"
        >
          ← Prev
        </button>

        {/* Indicators */}
        <div className="carousel-indicators">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`indicator ${index === currentIndex ? 'active' : ''}`}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={() => setCurrentIndex(prev => (prev + 1) % banners.length)}
          className="carousel-btn next-btn"
          aria-label="Next banner"
        >
          Next →
        </button>
      </div>

      {/* Stats Section (Optional) */}
      {user?.uid && (
        <div className="banner-stats">
          <button
            onClick={loadStats}
            disabled={loading}
            className="stats-btn"
          >
            {loading ? 'Loading...' : 'View Stats'}
          </button>

          {currentStats && (
            <div className="stats-display">
              <div className="stat-item">
                <span className="stat-label">Views:</span>
                <span className="stat-value">{currentStats.totalViews}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Clicks:</span>
                <span className="stat-value">{currentStats.totalClicks}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">CTR:</span>
                <span className="stat-value">{currentStats.ctr}%</span>
              </div>
              {currentStats.userViews && (
                <div className="stat-item">
                  <span className="stat-label">Your Views:</span>
                  <span className="stat-value">{currentStats.userViews}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Styles */}
      <style jsx>{`
        .banner-carousel {
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
        }

        .banner-container {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          border-radius: 8px;
          cursor: pointer;
          transition: transform 0.3s ease;
        }

        .banner-container:hover {
          transform: scale(1.02);
        }

        .banner-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .banner-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
          color: white;
          padding: 20px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .banner-container:hover .banner-overlay {
          opacity: 1;
        }

        .banner-overlay h2 {
          margin: 0 0 8px 0;
          font-size: 20px;
        }

        .banner-overlay p {
          margin: 0;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.8);
        }

        .carousel-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-top: 16px;
        }

        .carousel-btn {
          padding: 8px 16px;
          background-color: #f0f0f0;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .carousel-btn:hover {
          background-color: #e0e0e0;
        }

        .carousel-btn:active {
          transform: scale(0.95);
        }

        .carousel-indicators {
          display: flex;
          gap: 8px;
          justify-content: center;
          flex: 1;
        }

        .indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #ccc;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .indicator:hover {
          background-color: #999;
        }

        .indicator.active {
          background-color: #333;
          width: 24px;
          border-radius: 4px;
        }

        .banner-stats {
          margin-top: 16px;
          padding: 12px;
          background-color: #f9f9f9;
          border-radius: 4px;
        }

        .stats-btn {
          padding: 8px 16px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s ease;
        }

        .stats-btn:hover:not(:disabled) {
          background-color: #0056b3;
        }

        .stats-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .stats-display {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 12px;
          margin-top: 12px;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 8px;
          background-color: white;
          border-radius: 4px;
          border: 1px solid #eee;
        }

        .stat-label {
          font-size: 12px;
          color: #666;
          margin-bottom: 4px;
        }

        .stat-value {
          font-size: 20px;
          font-weight: bold;
          color: #007bff;
        }
      `}</style>
    </div>
  );
}

/**
 * Example Usage in a Page:
 * 
 * import { getBannersWithStatsAction } from '@/actions/banner-actions';
 * import { BannerCarouselWithAnalytics } from '@/components/banner-carousel-analytics';
 * 
 * export default async function HomePage() {
 *   const banners = await getBannersWithStatsAction();
 *   
 *   return (
 *     <main>
 *       <BannerCarouselWithAnalytics 
 *         banners={banners}
 *         autoRotate={true}
 *         rotationInterval={5000}
 *         onStatsFetch={(stats) => console.log('Stats loaded:', stats)}
 *       />
 *     </main>
 *   );
 * }
 */
