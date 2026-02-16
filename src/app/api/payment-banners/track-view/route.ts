import { NextRequest, NextResponse } from 'next/server';
import { trackPaymentBannerViewAction } from '@/actions/payment-banner-actions';

/**
 * POST /api/payment-banners/track-view
 * Track a payment banner view event
 * 
 * Body:
 * {
 *   paymentBannerId: string;
 *   userId: string;
 *   metadata?: {
 *     carousel_index?: number;
 *     total_banners?: number;
 *     source?: string;
 *     userAgent?: string;
 *     paymentMethod?: string;
 *     [key: string]: any;
 *   };
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentBannerId, userId, metadata } = body;

    if (!paymentBannerId || !userId) {
      return NextResponse.json(
        { success: false, message: 'paymentBannerId and userId are required' },
        { status: 400 }
      );
    }

    const result = await trackPaymentBannerViewAction(paymentBannerId, userId, metadata);
    
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
