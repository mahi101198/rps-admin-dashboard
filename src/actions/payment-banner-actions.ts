'use server';

import { getFirestore, getStorageBucket } from '@/data/firebase.admin';
import { revalidatePath } from 'next/cache';
import { PaymentBanner } from '@/lib/types/all-schemas';
import { withAuth, verifyAuth, AuthError } from '@/lib/auth';

// Get all payment banners
export async function getPaymentBannersAction(): Promise<PaymentBanner[]> {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('payment-banners').orderBy('rank', 'asc').get();
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        paymentPageBannerId: doc.id,
        title: data.title || '',
        imageUrl: data.imageUrl || '',
        linkTo: data.linkTo || '',
        rank: data.rank || 0,
        isActive: data.isActive ?? true,
        view_change_time: data.view_change_time || 5, // Default to 5 seconds if not set
        createdAt: data.createdAt?._seconds ? 
          new Date(data.createdAt._seconds * 1000) : 
          data.createdAt instanceof Date ? data.createdAt :
          new Date(),
        updatedAt: data.updatedAt?._seconds ? 
          new Date(data.updatedAt._seconds * 1000) : 
          new Date(),
      } as PaymentBanner;
    });
  } catch (error) {
    console.error('Error fetching payment banners:', error);
    return [];
  }
}

// Create a new payment banner
export async function createPaymentBannerAction(
  bannerData: Omit<PaymentBanner, 'paymentPageBannerId' | 'createdAt' | 'updatedAt'>
): Promise<{ success: boolean; message: string; paymentPageBannerId?: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();

    const newBanner = {
      ...bannerData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await db.collection('payment-banners').add(newBanner);
    
    revalidatePath('/banners');
    return { success: true, message: 'Payment banner created successfully', paymentPageBannerId: docRef.id };
  } catch (error) {
    console.error('Error creating payment banner:', error);
    return { success: false, message: 'Failed to create payment banner' };
  }
}

// Update a payment banner
export async function updatePaymentBannerAction(
  paymentPageBannerId: string,
  bannerData: Partial<PaymentBanner>
): Promise<{ success: boolean; message: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();

    await db.collection('payment-banners').doc(paymentPageBannerId).update({
      ...bannerData,
      updatedAt: new Date(),
    });
    
    revalidatePath('/banners');
    return { success: true, message: 'Payment banner updated successfully' };
  } catch (error) {
    console.error('Error updating payment banner:', error);
    return { success: false, message: 'Failed to update payment banner' };
  }
}

// Delete a payment banner
export async function deletePaymentBannerAction(
  paymentPageBannerId: string
): Promise<{ success: boolean; message: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();
    const bucket = getStorageBucket();

    // Get banner data to retrieve image URL before deletion
    const bannerDoc = await db.collection('payment-banners').doc(paymentPageBannerId).get();
    
    if (bannerDoc.exists) {
      const bannerData = bannerDoc.data();
      
      // Delete image from Firebase Storage if it exists
      if (bannerData?.imageUrl && bucket) {
        try {
          // Extract file path from URL
          // URL format: https://storage.googleapis.com/bucket-name/payment-banners/filename
          const urlParts = bannerData.imageUrl.split('/');
          const fileName = urlParts.pop(); // Get filename
          if (fileName) {
            await bucket.file(`payment-banners/${fileName}`).delete();
            console.log(`Deleted payment banner image: payment-banners/${fileName}`);
          }
        } catch (error) {
          console.warn('Failed to delete payment banner image from storage:', error);
          // Continue with banner deletion even if image deletion fails
        }
      }
    }

    // Delete banner document
    await db.collection('payment-banners').doc(paymentPageBannerId).delete();
    
    revalidatePath('/banners');
    return { success: true, message: 'Payment banner deleted successfully' };
  } catch (error) {
    console.error('Error deleting payment banner:', error);
    return { success: false, message: 'Failed to delete payment banner' };
  }
}

// Upload payment banner image
export async function uploadPaymentBannerImageAction(
  file: File,
  paymentPageBannerId: string
): Promise<{ success: boolean; message: string; imageUrl?: string }> {
  try {
    await verifyAuth();
    
    const bucket = getStorageBucket();
    if (!bucket) {
      return { success: false, message: 'Storage not configured' };
    }

    const fileName = `payment-banners/${paymentPageBannerId}_${Date.now()}.${file.name.split('.').pop()}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    
    const fileUpload = bucket.file(fileName);
    await fileUpload.save(fileBuffer, {
      metadata: {
        contentType: file.type,
      },
    });

    const imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    
    // Update the banner with the new image URL
    const db = getFirestore();
    await db.collection('payment-banners').doc(paymentPageBannerId).update({
      imageUrl,
      updatedAt: new Date(),
    });
    
    revalidatePath('/banners');
    return { success: true, message: 'Image uploaded successfully', imageUrl };
  } catch (error) {
    console.error('Error uploading payment banner image:', error);
    return { success: false, message: 'Failed to upload image' };
  }
}

// Delete payment banner image
export async function deletePaymentBannerImageAction(
  paymentPageBannerId: string,
  imageUrl: string
): Promise<{ success: boolean; message: string }> {
  try {
    await verifyAuth();
    
    // Extract the file name from the URL
    const fileName = imageUrl.split('/').pop();
    if (fileName) {
      const bucket = getStorageBucket();
      if (bucket) {
        try {
          await bucket.file(`payment-banners/${fileName}`).delete();
        } catch (error) {
          console.warn('Failed to delete image from storage:', error);
        }
      }
    }

    // Update the banner to remove the image URL
    const db = getFirestore();
    await db.collection('payment-banners').doc(paymentPageBannerId).update({
      imageUrl: '',
      updatedAt: new Date(),
    });
    
    revalidatePath('/banners');
    return { success: true, message: 'Image deleted successfully' };
  } catch (error) {
    console.error('Error deleting payment banner image:', error);
    return { success: false, message: 'Failed to delete image' };
  }
}

// Toggle payment banner active status
export async function togglePaymentBannerStatusAction(
  paymentPageBannerId: string,
  isActive: boolean
): Promise<{ success: boolean; message: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();

    await db.collection('payment-banners').doc(paymentPageBannerId).update({
      isActive,
      updatedAt: new Date(),
    });
    
    revalidatePath('/banners');
    return { success: true, message: `Payment banner ${isActive ? 'activated' : 'deactivated'} successfully` };
  } catch (error) {
    console.error('Error toggling payment banner status:', error);
    return { success: false, message: `Failed to ${isActive ? 'activate' : 'deactivate'} payment banner` };
  }
}

/**
 * Track a payment banner view
 * Creates a view record in payment-banners/{paymentPageBannerId}/views/ subcollection
 */
export async function trackPaymentBannerViewAction(
  paymentPageBannerId: string,
  userId: string,
  metadata?: {
    carousel_index?: number;
    total_banners?: number;
    source?: string;
    userAgent?: string;
    paymentMethod?: string;
    [key: string]: any;
  }
): Promise<{ success: boolean; message: string; viewId?: string }> {
  try {
    const db = getFirestore();
    
    if (!paymentPageBannerId || !userId) {
      return { success: false, message: 'paymentPageBannerId and userId are required' };
    }

    // Generate unique viewId: paymentPageBannerId_timestamp_userHash
    const timestamp = Date.now();
    const userHash = Math.abs(
      userId.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a; // Convert to 32bit integer
      }, 0)
    );
    
    const viewId = `${paymentPageBannerId}_${timestamp}_${userHash}`;

    const viewRecord = {
      viewId,
      paymentPageBannerId,
      userId,
      viewedAt: new Date(),
      metadata: metadata || {},
    };

    await db
      .collection('payment-banners')
      .doc(paymentPageBannerId)
      .collection('views')
      .doc(viewId)
      .set(viewRecord);

    return { success: true, message: 'View tracked successfully', viewId };
  } catch (error) {
    console.error('Error tracking payment banner view:', error);
    return { success: false, message: 'Failed to track view' };
  }
}

/**
 * Track a payment banner click/analytics event
 * Creates an analytics record in payment-banners/{paymentPageBannerId}/analytics/ subcollection
 */
export async function trackPaymentBannerAnalyticsAction(
  paymentPageBannerId: string,
  userId: string,
  clickData: {
    clickType?: 'payment_method_select' | 'external_link' | 'app_action';
    clickUrl?: string;
    paymentMethod?: string;
    city?: string;
    region?: string;
    country?: string;
    ipAddress?: string;
    userEmail?: string;
    userAgent?: string;
    metadata?: {
      carousel_index?: number;
      total_banners?: number;
      source?: string;
      [key: string]: any;
    };
  }
): Promise<{ success: boolean; message: string; analyticsId?: string }> {
  try {
    const db = getFirestore();
    
    if (!paymentPageBannerId || !userId) {
      return { success: false, message: 'paymentPageBannerId and userId are required' };
    }

    // Generate unique analyticsId: paymentPageBannerId_timestamp_userHash
    const timestamp = Date.now();
    const userHash = Math.abs(
      userId.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0)
    );
    
    const analyticsId = `${paymentPageBannerId}_${timestamp}_${userHash}`;

    const analyticsRecord = {
      analyticsId,
      paymentPageBannerId,
      userId,
      clickType: clickData.clickType || 'external_link',
      clickUrl: clickData.clickUrl || '',
      paymentMethod: clickData.paymentMethod || '',
      city: clickData.city || '',
      region: clickData.region || '',
      country: clickData.country || '',
      ipAddress: clickData.ipAddress || '',
      userEmail: clickData.userEmail || '',
      userAgent: clickData.userAgent || '',
      clickedAt: new Date(),
      metadata: clickData.metadata || {},
    };

    await db
      .collection('payment-banners')
      .doc(paymentPageBannerId)
      .collection('analytics')
      .doc(analyticsId)
      .set(analyticsRecord);

    return { success: true, message: 'Analytics tracked successfully', analyticsId };
  } catch (error) {
    console.error('Error tracking payment banner analytics:', error);
    return { success: false, message: 'Failed to track analytics' };
  }
}

/**
 * Get payment banner statistics
 * Fetches total views count, total clicks count, and click-through rate
 */
export async function getPaymentBannerStatsAction(
  paymentPageBannerId: string,
  userId?: string
): Promise<{
  success: boolean;
  stats?: {
    totalViews: number;
    totalClicks: number;
    ctr: number; // Click-through rate as percentage
    userViews?: number; // Only if userId provided
    userClicks?: number; // Only if userId provided
  };
  message: string;
}> {
  try {
    const db = getFirestore();
    
    if (!paymentPageBannerId) {
      return { success: false, message: 'paymentPageBannerId is required' };
    }

    // Get total views
    const viewsSnapshot = await db
      .collection('payment-banners')
      .doc(paymentPageBannerId)
      .collection('views')
      .get();
    
    const totalViews = viewsSnapshot.docs.length;

    // Get total clicks/analytics
    const analyticsSnapshot = await db
      .collection('payment-banners')
      .doc(paymentPageBannerId)
      .collection('analytics')
      .get();
    
    const totalClicks = analyticsSnapshot.docs.length;

    // Calculate CTR (Click-Through Rate)
    const ctr = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;

    const stats: any = {
      totalViews,
      totalClicks,
      ctr: Math.round(ctr * 100) / 100, // Round to 2 decimal places
    };

    // Get user-specific stats if userId provided
    if (userId) {
      const userViewsSnapshot = await db
        .collection('payment-banners')
        .doc(paymentPageBannerId)
        .collection('views')
        .where('userId', '==', userId)
        .get();
      
      const userAnalyticsSnapshot = await db
        .collection('payment-banners')
        .doc(paymentPageBannerId)
        .collection('analytics')
        .where('userId', '==', userId)
        .get();

      stats.userViews = userViewsSnapshot.docs.length;
      stats.userClicks = userAnalyticsSnapshot.docs.length;
    }

    return {
      success: true,
      stats,
      message: 'Stats retrieved successfully',
    };
  } catch (error) {
    console.error('Error fetching payment banner stats:', error);
    return { success: false, message: 'Failed to fetch stats' };
  }
}

/**
 * Get all payment banners with analytics and views count
 * Enhanced version of getPaymentBannersAction that includes stats
 */
export async function getPaymentBannersWithStatsAction(): Promise<
  (PaymentBanner & {
    analytics?: {
      totalViews: number;
      totalClicks: number;
      ctr: number;
    };
  })[]
> {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('payment-banners').orderBy('rank', 'asc').get();
    
    const bannersWithStats = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();
        
        // Get views count
        const viewsSnapshot = await db
          .collection('payment-banners')
          .doc(doc.id)
          .collection('views')
          .count()
          .get();
        
        // Get analytics/clicks count
        const analyticsSnapshot = await db
          .collection('payment-banners')
          .doc(doc.id)
          .collection('analytics')
          .count()
          .get();

        const totalViews = viewsSnapshot.data().count;
        const totalClicks = analyticsSnapshot.data().count;
        const ctr = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;

        return {
          paymentPageBannerId: doc.id,
          title: data.title || '',
          imageUrl: data.imageUrl || '',
          linkTo: data.linkTo || '',
          rank: data.rank || 0,
          isActive: data.isActive ?? true,
          view_change_time: data.view_change_time || 5,
          createdAt: data.createdAt?._seconds 
            ? new Date(data.createdAt._seconds * 1000) 
            : data.createdAt instanceof Date ? data.createdAt
            : new Date(),
          updatedAt: data.updatedAt?._seconds 
            ? new Date(data.updatedAt._seconds * 1000) 
            : new Date(),
          analytics: {
            totalViews,
            totalClicks,
            ctr: Math.round(ctr * 100) / 100,
          },
        } as PaymentBanner & {
          analytics?: {
            totalViews: number;
            totalClicks: number;
            ctr: number;
          };
        };
      })
    );

    return bannersWithStats;
  } catch (error) {
    console.error('Error fetching payment banners with stats:', error);
    return [];
  }
}
