import { NextRequest, NextResponse } from 'next/server';
import { getPaymentBannerStatsAction } from '@/actions/payment-banner-actions';

/**
 * GET /api/payment-banners/[paymentPageBannerId]/stats
 * Get statistics for a specific payment banner
 * 
 * Query parameters:
 * - userId?: string (optional, to get user-specific stats)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ paymentBannerId: string }> }
) {
  try {
    const { paymentBannerId } = await params;
    const userId = request.nextUrl.searchParams.get('userId') || undefined;

    if (!paymentBannerId) {
      return NextResponse.json(
        { success: false, message: 'paymentBannerId is required' },
        { status: 400 }
      );
    }

    const result = await getPaymentBannerStatsAction(paymentBannerId, userId || undefined);
    
    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error) {
    console.error('Error in stats API:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
