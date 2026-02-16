/*
 * Example: How to use Payment Banners on Payment Screen
 * 
 * This file contains examples of:
 * 1. Displaying payment banners on payment screen
 * 2. Tracking banner views and clicks
 * 3. Creating banners in admin panel
 * 4. Getting banner statistics
 */

import { 
  getPaymentBannersAction, 
  trackPaymentBannerViewAction, 
  trackPaymentBannerAnalyticsAction,
  createPaymentBannerAction,
  getPaymentBannerStatsAction,
  getPaymentBannersWithStatsAction,
  updatePaymentBannerAction
} from '@/actions/payment-banner-actions';
import { PaymentBanner } from '@/lib/types/all-schemas';

/**
 * EXAMPLE 1: Fetch and Display Payment Banners
 * This shows how to get payment banners for the selected payment method
 */
export async function exampleFetchPaymentBanners(paymentMethod: string) {
  try {
    const banners = await getPaymentBannersAction();
    console.log(`Found ${banners.length} payment banners`);
    return banners;
  } catch (error) {
    console.error('Failed to fetch payment banners:', error);
    return [];
  }
}

/**
 * EXAMPLE 2: Track Banner View
 * Called when a banner is displayed to the user
 */
export async function exampleTrackBannerView(
  paymentBannerId: string,
  userId: string,
  paymentMethod: string
) {
  try {
    const result = await trackPaymentBannerViewAction(paymentBannerId, userId, {
      paymentMethod,
      source: 'payment_screen',
      carousel_index: 0,
      total_banners: 1,
    });
    console.log('View tracked:', result.viewId);
    return result;
  } catch (error) {
    console.error('Failed to track banner view:', error);
  }
}

/**
 * EXAMPLE 3: Track Banner Click
 * Called when user clicks/interacts with a banner
 */
export async function exampleTrackBannerClick(
  paymentBannerId: string,
  userId: string,
  paymentMethod: string,
  bannerUrl?: string
) {
  try {
    const result = await trackPaymentBannerAnalyticsAction(paymentBannerId, userId, {
      clickType: 'payment_method_select',
      paymentMethod,
      clickUrl: bannerUrl || '',
      metadata: {
        source: 'payment_screen',
      },
    });
    console.log('Click tracked:', result.analyticsId);
    return result;
  } catch (error) {
    console.error('Failed to track banner click:', error);
  }
}

/**
 * EXAMPLE 4: Create New Payment Banner (Admin)
 * Used in admin panel to create payment banners
 */
export async function exampleCreatePaymentBanner() {
  try {
    // This would typically come from form data
    const bannerData = {
      title: 'UPI Payment - 10% Cashback',
      imageUrl: 'https://storage.googleapis.com/bucket/payment-banners/upi-banner.jpg',
      paymentMethods: ['upi'] as any,
      linkTo: 'https://example.com/upi-cashback-offer',
      rank: 1,
      isActive: true,
      view_change_time: 5,
    };

    const result = await createPaymentBannerAction(bannerData);
    
    if (result.success) {
      console.log('Payment banner created:', result.paymentPageBannerId);
      return result;
    } else {
      console.error('Failed to create banner:', result.message);
      return null;
    }
  } catch (error) {
    console.error('Error creating payment banner:', error);
    throw error;
  }
}

/**
 * EXAMPLE 5: Get Banner Statistics
 * Used in admin dashboard to view banner performance
 */
export async function exampleGetBannerStats(paymentBannerId: string) {
  try {
    // Get overall stats
    const overallStats = await getPaymentBannerStatsAction(paymentBannerId);
    console.log('Overall Banner Stats:', {
      totalViews: overallStats.stats?.totalViews,
      totalClicks: overallStats.stats?.totalClicks,
      ctr: overallStats.stats?.ctr + '%',
    });

    // Get user-specific stats
    const userStats = await getPaymentBannerStatsAction(paymentBannerId, 'user123');
    console.log('User-Specific Stats:', {
      userViews: userStats.stats?.userViews,
      userClicks: userStats.stats?.userClicks,
    });

    return overallStats;
  } catch (error) {
    console.error('Failed to fetch banner stats:', error);
  }
}

/**
 * EXAMPLE 6: Get All Banners with Statistics
 * Used in admin dashboard to show all banners and their performance
 */
export async function exampleGetAllBannersWithStats() {
  try {
    const bannersWithStats = await getPaymentBannersWithStatsAction();

    console.log('All Payment Banners with Statistics:');
    bannersWithStats.forEach((banner) => {
      console.log(`\nBanner: ${banner.title}`);
      console.log(`  Link: ${banner.linkTo}`);
      console.log(`  Views: ${banner.analytics?.totalViews}`);
      console.log(`  Clicks: ${banner.analytics?.totalClicks}`);
      console.log(`  CTR: ${banner.analytics?.ctr}%`);
    });

    return bannersWithStats;
  } catch (error) {
    console.error('Error fetching banners with stats:', error);
    throw error;
  }
}

/**
 * EXAMPLE 7: Update Payment Banner
 * Used in admin panel to modify existing banner
 */
export async function exampleUpdatePaymentBanner(paymentBannerId: string) {
  try {
    const result = await updatePaymentBannerAction(paymentBannerId, {
      title: 'UPI Payment - Updated Banner',
      isActive: true,
    });

    if (result.success) {
      console.log('Payment banner updated successfully');
      return result;
    } else {
      console.error('Failed to update banner:', result.message);
      return null;
    }
  } catch (error) {
    console.error('Error updating payment banner:', error);
    throw error;
  }
}
