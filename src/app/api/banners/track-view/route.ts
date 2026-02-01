import { NextRequest, NextResponse } from 'next/server';
import { trackBannerViewAction } from '@/actions/banner-actions';

/**
 * POST /api/banners/track-view
 * Track a banner view event
 * 
 * Body:
 * {
 *   bannerId: string;
 *   userId: string;
 *   metadata?: {
 *     carousel_index?: number;
 *     total_banners?: number;
 *     source?: string;
 *     userAgent?: string;
 *     [key: string]: any;
 *   };
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bannerId, userId, metadata } = body;

    if (!bannerId || !userId) {
      return NextResponse.json(
        { success: false, message: 'bannerId and userId are required' },
        { status: 400 }
      );
    }

    const result = await trackBannerViewAction(bannerId, userId, metadata);
    
    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error) {
    console.error('Error in track-view API:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
