'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useBannerTracking } from '@/hooks/use-banner-tracking';
import { EnhancedBannerWithStats } from './enhanced-banner-with-stats';

/**
 * Example: Banner with integrated stats buttons
 * Shows how to use EnhancedBannerWithStats wrapper
 */
export function BannerWithStatsExample({
  bannerId,
  title,
  description,
  imageUrl,
  actionUrl,
  onBannerClick,
}: {
  bannerId: string;
  title: string;
  description: string;
  imageUrl: string;
  actionUrl?: string;
  onBannerClick?: () => void;
}) {
  const { user } = useAuth();
  const { trackView, trackClick } = useBannerTracking();

  const handleBannerClick = async () => {
    // Track the click
    if (bannerId && actionUrl && user) {
      await trackClick(bannerId, user.uid, {
        clickType: 'external',
        clickUrl: actionUrl,
      });
    }

    if (onBannerClick) {
      onBannerClick();
    }

    if (actionUrl) {
      window.open(actionUrl, '_blank');
    }
  };

  const handleBannerView = async () => {
    // Track view when component mounts
    if (bannerId && user) {
      await trackView(bannerId, user.uid);
    }
  };

  return (
    <EnhancedBannerWithStats bannerId={bannerId}>
      <div className="banner-inner" onMouseEnter={handleBannerView}>
        <div className="banner-image">
          <img src={imageUrl} alt={title} />
        </div>
        <div className="banner-text">
          <h3>{title}</h3>
          <p>{description}</p>
          <button className="banner-cta" onClick={handleBannerClick}>
            Learn More →
          </button>
        </div>
      </div>

      <style jsx>{`
        .banner-inner {
          display: flex;
          align-items: center;
          gap: 24px;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 8px 8px 0 0;
          min-height: 200px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .banner-inner:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }

        .banner-image {
          flex: 0 0 300px;
          height: 200px;
          border-radius: 8px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.1);
        }

        .banner-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .banner-text {
          flex: 1;
          color: white;
        }

        .banner-text h3 {
          margin: 0 0 10px 0;
          font-size: 28px;
          font-weight: bold;
        }

        .banner-text p {
          margin: 0 0 20px 0;
          font-size: 16px;
          line-height: 1.6;
          opacity: 0.95;
        }

        .banner-cta {
          padding: 12px 24px;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 2px solid white;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .banner-cta:hover {
          background: white;
          color: #667eea;
          transform: translateX(4px);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .banner-inner {
            flex-direction: column;
            gap: 16px;
            padding: 16px;
            min-height: auto;
          }

          .banner-image {
            flex: 0 0 100%;
            height: 250px;
            width: 100%;
          }

          .banner-text h3 {
            font-size: 20px;
          }

          .banner-text p {
            font-size: 14px;
          }
        }
      `}</style>
    </EnhancedBannerWithStats>
  );
}

/**
 * Example: Carousel of banners with stats
 * Shows multiple banners each with their own stats buttons
 */
export function BannerCarouselWithStats({
  banners,
}: {
  banners: Array<{
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    actionUrl?: string;
  }>;
}) {
  const { user } = useAuth();
  const { trackView, trackClick } = useBannerTracking();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % banners.length;
    setCurrentIndex(nextIdx);
    if (user) {
      trackView(banners[nextIdx].id, user.uid);
    }
  };

  const handlePrev = () => {
    const prevIdx = (currentIndex - 1 + banners.length) % banners.length;
    setCurrentIndex(prevIdx);
    if (user) {
      trackView(banners[prevIdx].id, user.uid);
    }
  };

  const banner = banners[currentIndex];

  return (
    <div className="carousel-wrapper">
      <div className="carousel-container">
        <EnhancedBannerWithStats bannerId={banner.id}>
          <div 
            className="carousel-slide" 
            onMouseEnter={() => {
              if (user) {
                trackView(banner.id, user.uid);
              }
            }}
          >
            <img src={banner.imageUrl} alt={banner.title} />
            <div className="carousel-overlay">
              <h2>{banner.title}</h2>
              <p>{banner.description}</p>
            </div>
          </div>
        </EnhancedBannerWithStats>
      </div>

      <div className="carousel-controls">
        <button className="control-btn prev" onClick={handlePrev}>
          ← Prev
        </button>
        <span className="carousel-indicator">
          {currentIndex + 1} / {banners.length}
        </span>
        <button className="control-btn next" onClick={handleNext}>
          Next →
        </button>
      </div>

      <style jsx>{`
        .carousel-wrapper {
          width: 100%;
        }

        .carousel-container {
          position: relative;
          border-radius: 8px;
          overflow: hidden;
        }

        .carousel-slide {
          position: relative;
          width: 100%;
          height: 400px;
          overflow: hidden;
        }

        .carousel-slide img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .carousel-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
          color: white;
          padding: 40px 30px 30px;
          text-align: left;
        }

        .carousel-overlay h2 {
          margin: 0 0 10px 0;
          font-size: 28px;
          font-weight: bold;
        }

        .carousel-overlay p {
          margin: 0;
          font-size: 16px;
          opacity: 0.95;
        }

        .carousel-controls {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
          margin-top: 20px;
          padding: 20px;
          background: #f5f5f5;
          border-radius: 8px;
        }

        .control-btn {
          padding: 10px 20px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .control-btn:hover {
          background: #764ba2;
          transform: translateY(-2px);
        }

        .carousel-indicator {
          font-size: 14px;
          color: #666;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .carousel-slide {
            height: 300px;
          }

          .carousel-controls {
            flex-direction: column;
            gap: 15px;
          }

          .control-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default BannerWithStatsExample;
