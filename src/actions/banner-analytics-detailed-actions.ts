'use server';

import { getFirestore } from '@/data/firebase.admin';
import { withAuth } from '@/lib/auth';

// ============================================
// TYPES
// ============================================

export interface ViewRecord {
  viewId: string;
  bannerId: string;
  userId: string;
  userEmail: string;
  viewedAt: Date;
  country: string;
  city: string;
  region: string;
  ipAddress: string;
  userAgent: string;
  source: string;
  view_duration_seconds: number;
  metadata?: {
    carousel_index?: number;
    total_banners?: number;
    [key: string]: any;
  };
}

export interface AnalyticsRecord {
  analyticsId: string;
  bannerId: string;
  userId: string;
  userEmail: string;
  clickedAt: Date;
  country: string;
  city: string;
  region: string;
  ipAddress: string;
  userAgent: string;
  clickUrl: string;
  clickType: string;
  source: string;
  metadata?: {
    carousel_index?: number;
    total_banners?: number;
    [key: string]: any;
  };
}

export interface ViewSummary {
  userId: string;
  userEmail: string;
  viewCount: number;
  firstViewed: Date;
  lastViewed: Date;
  locations: string[];
  devices: string[];
  sources: string[];
  totalDurationSeconds: number;
}

export interface AnalyticsSummary {
  userId: string;
  userEmail: string;
  clickCount: number;
  firstClicked: Date;
  lastClicked: Date;
  clickUrls: string[];
  locations: string[];
  devices: string[];
  sources: string[];
}

export interface BannerAnalyticsResponse {
  success: boolean;
  bannerId: string;
  bannerTitle?: string;
  views: ViewRecord[];
  analytics: AnalyticsRecord[];
  viewsSummary: ViewSummary[];
  analyticsSummary: AnalyticsSummary[];
  totalViews: number;
  totalClicks: number;
  uniqueViewers: number;
  uniqueClickers: number;
  error?: string;
}

// ============================================
// ACTIONS
// ============================================

/**
 * Get all view records for a banner
 */
export async function getBannerViewsDetailAction(bannerId: string): Promise<BannerAnalyticsResponse> {
  try {
    if (!bannerId || typeof bannerId !== 'string' || bannerId.trim() === '') {
      return {
        success: false,
        bannerId: bannerId || 'unknown',
        views: [],
        analytics: [],
        viewsSummary: [],
        analyticsSummary: [],
        totalViews: 0,
        totalClicks: 0,
        uniqueViewers: 0,
        uniqueClickers: 0,
        error: 'Invalid banner ID provided',
      };
    }

    const cleanBannerId = bannerId.trim();
    const db = getFirestore();
    if (!db) {
      return {
        success: false,
        bannerId: cleanBannerId,
        views: [],
        analytics: [],
        viewsSummary: [],
        analyticsSummary: [],
        totalViews: 0,
        totalClicks: 0,
        uniqueViewers: 0,
        uniqueClickers: 0,
        error: 'Firestore not initialized',
      };
    }

    // Fetch all views
    const viewsRef = db
      .collection('banners')
      .doc(cleanBannerId)
      .collection('views');

    const viewsSnapshot = await viewsRef.get();

    const views: ViewRecord[] = [];
    viewsSnapshot.forEach((doc) => {
      const data = doc.data();
      views.push({
        viewId: doc.id,
        bannerId: cleanBannerId,
        userId: data.userId || '',
        userEmail: data.userEmail || '',
        viewedAt: data.viewedAt?.toDate?.() || new Date(),
        country: data.country || '',
        city: data.city || '',
        region: data.region || '',
        ipAddress: data.ipAddress || '',
        userAgent: data.userAgent || '',
        source: data.source || '',
        view_duration_seconds: data.view_duration_seconds || 0,
        metadata: data.metadata,
      });
    });

    // Group by user to create summary
    const viewsByUser = new Map<string, ViewRecord[]>();
    views.forEach((view) => {
      const key = view.userId;
      if (!viewsByUser.has(key)) {
        viewsByUser.set(key, []);
      }
      viewsByUser.get(key)!.push(view);
    });

    const viewsSummary: ViewSummary[] = [];
    viewsByUser.forEach((userViews, userId) => {
      const first = userViews.sort((a, b) => a.viewedAt.getTime() - b.viewedAt.getTime())[0];
      const last = userViews.sort((a, b) => b.viewedAt.getTime() - a.viewedAt.getTime())[0];

      viewsSummary.push({
        userId,
        userEmail: first.userEmail,
        viewCount: userViews.length,
        firstViewed: first.viewedAt,
        lastViewed: last.viewedAt,
        locations: [...new Set(userViews.map((v) => `${v.city}, ${v.country}`))],
        devices: [...new Set(userViews.map((v) => v.userAgent))],
        sources: [...new Set(userViews.map((v) => v.source))],
        totalDurationSeconds: userViews.reduce((sum, v) => sum + v.view_duration_seconds, 0),
      });
    });

    return {
      success: true,
      bannerId: cleanBannerId,
      views,
      analytics: [],
      viewsSummary,
      analyticsSummary: [],
      totalViews: views.length,
      totalClicks: 0,
      uniqueViewers: viewsByUser.size,
      uniqueClickers: 0,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching banner views:', errorMessage);
    return {
      success: false,
      bannerId: bannerId || 'unknown',
      views: [],
      analytics: [],
      viewsSummary: [],
      analyticsSummary: [],
      totalViews: 0,
      totalClicks: 0,
      uniqueViewers: 0,
      uniqueClickers: 0,
      error: errorMessage,
    };
  }
}

/**
 * Get all analytics records for a banner
 */
export async function getBannerAnalyticsDetailAction(bannerId: string): Promise<BannerAnalyticsResponse> {
  try {
    if (!bannerId || typeof bannerId !== 'string' || bannerId.trim() === '') {
      return {
        success: false,
        bannerId: bannerId || 'unknown',
        views: [],
        analytics: [],
        viewsSummary: [],
        analyticsSummary: [],
        totalViews: 0,
        totalClicks: 0,
        uniqueViewers: 0,
        uniqueClickers: 0,
        error: 'Invalid banner ID provided',
      };
    }

    const cleanBannerId = bannerId.trim();
    const db = getFirestore();
    if (!db) {
      return {
        success: false,
        bannerId: cleanBannerId,
        views: [],
        analytics: [],
        viewsSummary: [],
        analyticsSummary: [],
        totalViews: 0,
        totalClicks: 0,
        uniqueViewers: 0,
        uniqueClickers: 0,
        error: 'Firestore not initialized',
      };
    }

    // Fetch all analytics
    const analyticsRef = db
      .collection('banners')
      .doc(cleanBannerId)
      .collection('analytics');

    const analyticsSnapshot = await analyticsRef.get();

    const analytics: AnalyticsRecord[] = [];
    analyticsSnapshot.forEach((doc) => {
      const data = doc.data();
      analytics.push({
        analyticsId: doc.id,
        bannerId: cleanBannerId,
        userId: data.userId || '',
        userEmail: data.userEmail || '',
        clickedAt: data.clickedAt?.toDate?.() || new Date(),
        country: data.country || '',
        city: data.city || '',
        region: data.region || '',
        ipAddress: data.ipAddress || '',
        userAgent: data.userAgent || '',
        clickUrl: data.clickUrl || '',
        clickType: data.clickType || '',
        source: data.source || '',
        metadata: data.metadata,
      });
    });

    // Group by user to create summary
    const analyticsByUser = new Map<string, AnalyticsRecord[]>();
    analytics.forEach((record) => {
      const key = record.userId;
      if (!analyticsByUser.has(key)) {
        analyticsByUser.set(key, []);
      }
      analyticsByUser.get(key)!.push(record);
    });

    const analyticsSummary: AnalyticsSummary[] = [];
    analyticsByUser.forEach((userAnalytics, userId) => {
      const first = userAnalytics.sort((a, b) => a.clickedAt.getTime() - b.clickedAt.getTime())[0];
      const last = userAnalytics.sort((a, b) => b.clickedAt.getTime() - a.clickedAt.getTime())[0];

      analyticsSummary.push({
        userId,
        userEmail: first.userEmail,
        clickCount: userAnalytics.length,
        firstClicked: first.clickedAt,
        lastClicked: last.clickedAt,
        clickUrls: [...new Set(userAnalytics.map((a) => a.clickUrl))],
        locations: [...new Set(userAnalytics.map((a) => `${a.city}, ${a.country}`))],
        devices: [...new Set(userAnalytics.map((a) => a.userAgent))],
        sources: [...new Set(userAnalytics.map((a) => a.source))],
      });
    });

    return {
      success: true,
      bannerId: cleanBannerId,
      views: [],
      analytics,
      viewsSummary: [],
      analyticsSummary,
      totalViews: 0,
      totalClicks: analytics.length,
      uniqueViewers: 0,
      uniqueClickers: analyticsByUser.size,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching banner analytics:', errorMessage);
    return {
      success: false,
      bannerId: bannerId || 'unknown',
      views: [],
      analytics: [],
      viewsSummary: [],
      analyticsSummary: [],
      totalViews: 0,
      totalClicks: 0,
      uniqueViewers: 0,
      uniqueClickers: 0,
      error: errorMessage,
    };
  }
}

/**
 * Get combined views and analytics for a banner
 */
export async function getBannerAnalyticsAllAction(bannerId: string): Promise<BannerAnalyticsResponse> {
  try {
    // Validate bannerId
    if (!bannerId || typeof bannerId !== 'string' || bannerId.trim() === '') {
      return {
        success: false,
        bannerId: bannerId || 'unknown',
        views: [],
        analytics: [],
        viewsSummary: [],
        analyticsSummary: [],
        totalViews: 0,
        totalClicks: 0,
        uniqueViewers: 0,
        uniqueClickers: 0,
        error: 'Invalid banner ID provided',
      };
    }

    const cleanBannerId = bannerId.trim();
    const db = getFirestore();
    if (!db) {
      return {
        success: false,
        bannerId: cleanBannerId,
        views: [],
        analytics: [],
        viewsSummary: [],
        analyticsSummary: [],
        totalViews: 0,
        totalClicks: 0,
        uniqueViewers: 0,
        uniqueClickers: 0,
        error: 'Firestore not initialized',
      };
    }

    // Fetch banner details
    const bannerDoc = await db.collection('banners').doc(cleanBannerId).get();
    const bannerTitle = bannerDoc.data()?.title;

    // Fetch views
    const viewsRef = db.collection('banners').doc(cleanBannerId).collection('views');
    const viewsSnapshot = await viewsRef.get();

    const views: ViewRecord[] = [];
    viewsSnapshot.forEach((doc) => {
      const data = doc.data();
      views.push({
        viewId: doc.id,
        bannerId: cleanBannerId,
        userId: data.userId || '',
        userEmail: data.userEmail || '',
        viewedAt: data.viewedAt?.toDate?.() || new Date(),
        country: data.country || '',
        city: data.city || '',
        region: data.region || '',
        ipAddress: data.ipAddress || '',
        userAgent: data.userAgent || '',
        source: data.source || '',
        view_duration_seconds: data.view_duration_seconds || 0,
        metadata: data.metadata,
      });
    });

    // Fetch analytics
    const analyticsRef = db.collection('banners').doc(cleanBannerId).collection('analytics');
    const analyticsSnapshot = await analyticsRef.get();

    const analytics: AnalyticsRecord[] = [];
    analyticsSnapshot.forEach((doc) => {
      const data = doc.data();
      analytics.push({
        analyticsId: doc.id,
        bannerId: cleanBannerId,
        userId: data.userId || '',
        userEmail: data.userEmail || '',
        clickedAt: data.clickedAt?.toDate?.() || new Date(),
        country: data.country || '',
        city: data.city || '',
        region: data.region || '',
        ipAddress: data.ipAddress || '',
        userAgent: data.userAgent || '',
        clickUrl: data.clickUrl || '',
        clickType: data.clickType || '',
        source: data.source || '',
        metadata: data.metadata,
      });
    });

    // Create summaries
    const viewsByUser = new Map<string, ViewRecord[]>();
    views.forEach((view) => {
      const key = view.userId;
      if (!viewsByUser.has(key)) {
        viewsByUser.set(key, []);
      }
      viewsByUser.get(key)!.push(view);
    });

    const viewsSummary: ViewSummary[] = [];
    viewsByUser.forEach((userViews) => {
      const first = userViews.sort((a, b) => a.viewedAt.getTime() - b.viewedAt.getTime())[0];
      const last = userViews.sort((a, b) => b.viewedAt.getTime() - a.viewedAt.getTime())[0];

      viewsSummary.push({
        userId: first.userId,
        userEmail: first.userEmail,
        viewCount: userViews.length,
        firstViewed: first.viewedAt,
        lastViewed: last.viewedAt,
        locations: [...new Set(userViews.map((v) => `${v.city}, ${v.country}`))],
        devices: [...new Set(userViews.map((v) => v.userAgent))],
        sources: [...new Set(userViews.map((v) => v.source))],
        totalDurationSeconds: userViews.reduce((sum, v) => sum + v.view_duration_seconds, 0),
      });
    });

    const analyticsByUser = new Map<string, AnalyticsRecord[]>();
    analytics.forEach((record) => {
      const key = record.userId;
      if (!analyticsByUser.has(key)) {
        analyticsByUser.set(key, []);
      }
      analyticsByUser.get(key)!.push(record);
    });

    const analyticsSummary: AnalyticsSummary[] = [];
    analyticsByUser.forEach((userAnalytics) => {
      const first = userAnalytics.sort((a, b) => a.clickedAt.getTime() - b.clickedAt.getTime())[0];
      const last = userAnalytics.sort((a, b) => b.clickedAt.getTime() - a.clickedAt.getTime())[0];

      analyticsSummary.push({
        userId: first.userId,
        userEmail: first.userEmail,
        clickCount: userAnalytics.length,
        firstClicked: first.clickedAt,
        lastClicked: last.clickedAt,
        clickUrls: [...new Set(userAnalytics.map((a) => a.clickUrl))],
        locations: [...new Set(userAnalytics.map((a) => `${a.city}, ${a.country}`))],
        devices: [...new Set(userAnalytics.map((a) => a.userAgent))],
        sources: [...new Set(userAnalytics.map((a) => a.source))],
      });
    });

    return {
      success: true,
      bannerId: cleanBannerId,
      bannerTitle,
      views,
      analytics,
      viewsSummary,
      analyticsSummary,
      totalViews: views.length,
      totalClicks: analytics.length,
      uniqueViewers: viewsByUser.size,
      uniqueClickers: analyticsByUser.size,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching banner analytics all:', errorMessage);
    return {
      success: false,
      bannerId: bannerId || 'unknown',
      views: [],
      analytics: [],
      viewsSummary: [],
      analyticsSummary: [],
      totalViews: 0,
      totalClicks: 0,
      uniqueViewers: 0,
      uniqueClickers: 0,
      error: errorMessage,
    };
  }
}
