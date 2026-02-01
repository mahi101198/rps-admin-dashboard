'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getBannerStatsAction } from '@/actions/banner-actions';
import { ViewsDetailModal } from './views-detail-modal';
import { AnalyticsDetailModal } from './analytics-detail-modal';

/**
 * Enhanced banner component with stats buttons and detailed modal displays
 * Wraps existing banner components and adds analytics UI
 */
export function EnhancedBannerWithStats({
  bannerId,
  children,
  className = '',
}: {
  bannerId: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const { user } = useAuth();
  const [stats, setStats] = useState<{
    totalViews: number;
    totalClicks: number;
    ctr: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewsModalOpen, setViewsModalOpen] = useState(false);
  const [analyticsModalOpen, setAnalyticsModalOpen] = useState(false);

  useEffect(() => {
    loadBannerStats();
  }, [bannerId, user]);

  const loadBannerStats = async () => {
    if (!bannerId) return;

    setLoading(true);
    try {
      const result = await getBannerStatsAction(bannerId);
      if (result && result.success && result.stats) {
        setStats({
          totalViews: result.stats.totalViews || 0,
          totalClicks: result.stats.totalClicks || 0,
          ctr: result.stats.ctr || 0,
        });
      }
    } catch (error) {
      console.error('Error loading banner stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`banner-wrapper ${className}`}>
      {/* Banner Content */}
      <div className="banner-content">{children}</div>

      {/* Stats Buttons Bar */}
      <div className="stats-bar">
        <button
          className="stats-button views-btn"
          onClick={() => setViewsModalOpen(true)}
          disabled={loading || !stats}
        >
          <span className="btn-icon">👁️</span>
          <span className="btn-label">Views</span>
          <span className="btn-value">{stats?.totalViews || 0}</span>
        </button>

        <div className="stats-separator"></div>

        <button
          className="stats-button analytics-btn"
          onClick={() => setAnalyticsModalOpen(true)}
          disabled={loading || !stats}
        >
          <span className="btn-icon">📊</span>
          <span className="btn-label">Analytics</span>
          <span className="btn-value">{stats?.totalClicks || 0}</span>
        </button>

        <div className="stats-separator"></div>

        <div className="ctr-display">
          <span className="ctr-label">CTR</span>
          <span className="ctr-value">
            {loading ? '...' : `${(stats?.ctr || 0).toFixed(2)}%`}
          </span>
        </div>

        <div className="refresh-btn-container">
          <button
            className="refresh-btn"
            onClick={loadBannerStats}
            disabled={loading}
            title="Refresh stats"
          >
            {loading ? '⟳' : '↻'}
          </button>
        </div>
      </div>

      {/* Modals */}
      {bannerId && stats && (
        <>
          <ViewsDetailModal
            isOpen={viewsModalOpen}
            bannerId={bannerId}
            onClose={() => setViewsModalOpen(false)}
            totalViews={stats.totalViews}
            totalClicks={stats.totalClicks}
            ctr={stats.ctr}
          />

          <AnalyticsDetailModal
            isOpen={analyticsModalOpen}
            bannerId={bannerId}
            onClose={() => setAnalyticsModalOpen(false)}
            totalClicks={stats.totalClicks}
          />
        </>
      )}

      <style jsx>{`
        .banner-wrapper {
          position: relative;
          width: 100%;
        }

        .banner-content {
          width: 100%;
        }

        .stats-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 0 0 8px 8px;
          flex-wrap: wrap;
        }

        .stats-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .stats-button:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.3);
          border-color: rgba(255, 255, 255, 0.5);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .stats-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-icon {
          font-size: 16px;
        }

        .btn-label {
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .btn-value {
          font-size: 16px;
          font-weight: bold;
          background: rgba(255, 255, 255, 0.2);
          padding: 2px 8px;
          border-radius: 4px;
          min-width: 30px;
          text-align: center;
        }

        .stats-separator {
          width: 1px;
          height: 24px;
          background: rgba(255, 255, 255, 0.3);
        }

        .ctr-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          color: white;
          margin: 0 12px;
        }

        .ctr-label {
          font-size: 11px;
          text-transform: uppercase;
          opacity: 0.8;
          font-weight: 600;
        }

        .ctr-value {
          font-size: 18px;
          font-weight: bold;
          line-height: 1.2;
        }

        .refresh-btn-container {
          margin-left: auto;
        }

        .refresh-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 6px;
          cursor: pointer;
          font-size: 18px;
          transition: all 0.3s ease;
        }

        .refresh-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.3);
          border-color: rgba(255, 255, 255, 0.5);
          animation: spin 0.6s ease-in-out;
        }

        .refresh-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .stats-bar {
            flex-direction: column;
            gap: 10px;
          }

          .stats-button {
            flex: 1;
            width: 100%;
            justify-content: center;
          }

          .stats-separator {
            width: 100%;
            height: 1px;
            min-height: 1px;
          }

          .ctr-display {
            width: 100%;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }

          .refresh-btn-container {
            margin-left: 0;
            width: 100%;
          }

          .refresh-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Banner stats display component
 * Shows summary stats in a compact format
 */
export function BannerStatsDisplay({ bannerId }: { bannerId: string }) {
  const [stats, setStats] = useState<{
    totalViews: number;
    totalClicks: number;
    ctr: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const result = await getBannerStatsAction(bannerId);
        if (result && result.success && result.stats) {
          setStats({
            totalViews: result.stats.totalViews || 0,
            totalClicks: result.stats.totalClicks || 0,
            ctr: result.stats.ctr || 0,
          });
        }
      } catch (error) {
        console.error('Error loading banner stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [bannerId]);

  if (loading) {
    return <div className="stats-skeleton">Loading...</div>;
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="stats-display">
      <div className="stat-item">
        <span className="stat-icon">👁️</span>
        <span className="stat-text">{stats.totalViews} views</span>
      </div>
      <div className="stat-divider"></div>
      <div className="stat-item">
        <span className="stat-icon">📊</span>
        <span className="stat-text">{stats.totalClicks} clicks</span>
      </div>
      <div className="stat-divider"></div>
      <div className="stat-item">
        <span className="stat-icon">📈</span>
        <span className="stat-text">{stats.ctr.toFixed(2)}% CTR</span>
      </div>
    </div>
  );
}

export default EnhancedBannerWithStats;
