import { NextRequest, NextResponse } from 'next/server';
import { trackPaymentBannerAnalyticsAction } from '@/actions/payment-banner-actions';

/**
 * POST /api/payment-banners/track-analytics
 * Track a payment banner click/analytics event
 * 
 * Body:
 * {
 *   paymentBannerId: string;
 *   userId: string;
 *   clickData: {
 *     clickType?: 'payment_method_select' | 'external_link' | 'app_action';
 *     clickUrl?: string;
 *     paymentMethod?: string;
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
    const { paymentBannerId, userId, clickData } = body;

    if (!paymentBannerId || !userId || !clickData) {
      return NextResponse.json(
        { success: false, message: 'paymentBannerId, userId, and clickData are required' },
        { status: 400 }
      );
    }

    const result = await trackPaymentBannerAnalyticsAction(paymentBannerId, userId, clickData);
    
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
