import { NextRequest, NextResponse } from 'next/server';
import { getBannerStatsAction } from '@/actions/banner-actions';

/**
 * GET /api/banners/[bannerId]/stats
 * Get banner statistics (views count, clicks count, CTR)
 * 
 * Query Parameters:
 * - userId?: string (optional, to get user-specific stats)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bannerId: string }> }
) {
  try {
    const { bannerId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || undefined;

    if (!bannerId) {
      return NextResponse.json(
        { success: false, message: 'bannerId is required' },
        { status: 400 }
      );
    }

    const result = await getBannerStatsAction(bannerId, userId || undefined);
    
    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error) {
    console.error('Error in get-stats API:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
