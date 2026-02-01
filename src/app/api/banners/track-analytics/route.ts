import { NextRequest, NextResponse } from 'next/server';
import { trackBannerAnalyticsAction } from '@/actions/banner-actions';

/**
 * POST /api/banners/track-analytics
 * Track a banner click/analytics event
 * 
 * Body:
 * {
 *   bannerId: string;
 *   userId: string;
 *   clickData: {
 *     clickType?: 'internal' | 'external' | 'app_action';
 *     clickUrl?: string;
 *     city?: string;
 *     region?: string;
 *     country?: string;
 *     ipAddress?: string;
 *     userEmail?: string;
 *     userAgent?: string;
 *     metadata?: {
 *       carousel_index?: number;
 *       total_banners?: number;
 *       source?: string;
 *       [key: string]: any;
 *     };
 *   };
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bannerId, userId, clickData } = body;

    if (!bannerId || !userId) {
      return NextResponse.json(
        { success: false, message: 'bannerId and userId are required' },
        { status: 400 }
      );
    }

    if (!clickData) {
      return NextResponse.json(
        { success: false, message: 'clickData is required' },
        { status: 400 }
      );
    }

    const result = await trackBannerAnalyticsAction(bannerId, userId, clickData);
    
    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error) {
    console.error('Error in track-analytics API:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
