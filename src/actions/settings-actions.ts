'use server';

import { getFirestore, getFirebaseAdmin } from '@/data/firebase.admin';
import { AppSettings } from '@/lib/types/product';
import { revalidatePath } from 'next/cache';
import { withAuth, verifyAuth, AuthError } from '@/lib/auth';

/**
 * Update app settings in Firestore
 * @param formData - The form data containing settings to update
 * @returns Promise<void>
 */
export async function updateAppSettingsAction(formData: FormData): Promise<void> {
  try {
    await verifyAuth();
    const firebaseAdmin = getFirebaseAdmin();
    if (!firebaseAdmin) {
      throw new Error('Firebase Admin not initialized');
    }
    const db = firebaseAdmin.firestore();
    
    // Extract values from formData
    const settingsToUpdate: any = {};
    
    // Numeric fields
    const numericFields = ['deliveryFee', 'freeDeliveryAbove', 'referrerRewardValue', 'refereeRewardValue', 'minOrderAmount', 'minWithdrawalAmount'];
    numericFields.forEach(field => {
      const value = formData.get(field);
      if (value !== null) {
        settingsToUpdate[field] = parseFloat(value as string) || 0;
      }
    });
    
    // Handle available pincodes (as comma-separated string)
    const availablePincodesValue = formData.get('availablePincodes');
    if (availablePincodesValue !== null) {
      const pincodesString = availablePincodesValue as string;
      settingsToUpdate.availablePincodes = pincodesString
        .split(',')
        .map(pin => pin.trim())
        .filter(pin => pin.length > 0);
    }
    
    // String fields
    const stringFields = ['appName', 'appVersion', 'currency', 'currencySymbol', 'supportEmail', 'supportPhone', 'razorpayKeyId', 'appDownloadLink'];
    stringFields.forEach(field => {
      const value = formData.get(field);
      if (value !== null) {
        settingsToUpdate[field] = value as string;
      }
    });
    
    // Boolean fields - handle isReferralActive properly
    const isReferralActiveValue = formData.get('isReferralActive');
    // When switch is on, it sends 'on', when off it sends null
    settingsToUpdate.isReferralActive = isReferralActiveValue === 'on';
    
    // Add updatedAt timestamp
    settingsToUpdate.updatedAt = new Date();
    
    // Use the correct document name "app" instead of "app-settings"
    const settingsRef = db.collection('settings').doc('app');
    
    // Check if document exists, if not create it with defaults
    const doc = await settingsRef.get();
    if (doc.exists) {
      // Update existing document
      await settingsRef.update(settingsToUpdate);
    } else {
      // Create new document with defaults + updated values
      const defaultSettings = {
        appName: 'RPS Stationery',
        appVersion: '1.0.0',
        currency: 'INR',
        currencySymbol: '₹',
        deliveryFee: 50,
        freeDeliveryAbove: 500,
        supportPhone: '+91-9876543210',
        supportEmail: 'support@rpsstationery.com',
        isReferralActive: true,
        referrerRewardValue: 50,
        refereeRewardValue: 50,
        minOrderAmount: 100,
        minWithdrawalAmount: 100,
        razorpayKeyId: 'rzp_test_RRQxpBL13AicBq',
        availablePincodes: [],
        appDownloadLink: '',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await settingsRef.set({
        ...defaultSettings,
        ...settingsToUpdate
      });
    }
    
    // Revalidate the settings page to show updated data
    revalidatePath('/(protected)/settings');
  } catch (error) {
    // Don't log expected auth errors - they'll be handled by redirecting to login
    if (!(error instanceof AuthError)) {
      console.error('Error updating app settings:', error);
    }
    // In a real application, you might want to throw an error or handle this differently
    throw error;
  }
}

/**
 * Get app settings from Firestore
 * @returns Promise<AppSettings | null> - The app settings or null if not found
 */
export async function getAppSettingsAction(): Promise<AppSettings | null> {
  try {
    await verifyAuth();
    const firebaseAdmin = getFirebaseAdmin();
    if (!firebaseAdmin) {
      throw new Error('Firebase Admin not initialized');
    }
    const db = firebaseAdmin.firestore();
    
    // Use the correct document name "app" instead of "app-settings"
    const settingsDoc = await db.collection('settings').doc('app').get();
    
    if (settingsDoc.exists) {
      const data = settingsDoc.data();
      return {
        id: settingsDoc.id,
        appName: data?.appName || 'RPS Stationery',
        appVersion: data?.appVersion || '1.0.0',
        currency: data?.currency || 'INR',
        currencySymbol: data?.currencySymbol || '₹',
        deliveryFee: data?.deliveryFee || 50,
        freeDeliveryAbove: data?.freeDeliveryAbove || 500,
        supportPhone: data?.supportPhone || '+91-9876543210',
        supportEmail: data?.supportEmail || 'support@rpsstationery.com',
        isReferralActive: data?.isReferralActive ?? true,
        referrerRewardValue: data?.referrerRewardValue || 50,
        refereeRewardValue: data?.refereeRewardValue || 50,
        minOrderAmount: data?.minOrderAmount || 100,
        minWithdrawalAmount: data?.minWithdrawalAmount || 100,
        razorpayKeyId: data?.razorpayKeyId || 'rzp_test_RRQxpBL13AicBq',
        availablePincodes: data?.availablePincodes || [],
        appDownloadLink: data?.appDownloadLink || '',
        lastUpdated: data?.lastUpdated ? new Date(data.lastUpdated) : undefined,
        createdAt: data?.createdAt?._seconds ? new Date(data.createdAt._seconds * 1000) : new Date(),
        updatedAt: data?.updatedAt?._seconds ? new Date(data.updatedAt._seconds * 1000) : new Date()
      } as AppSettings;
    }
    
    return null;
  } catch (error) {
    // Don't log expected auth errors - they'll be handled by redirecting to login
    if (!(error instanceof AuthError)) {
      console.error('Error fetching app settings:', error);
    }
    return null;
  }
}

/**
 * Get dashboard statistics
 * @returns Promise<any> - The dashboard statistics
 */
export async function getDashboardStatsAction(): Promise<any> {
  try {
    await verifyAuth();
    const firebaseAdmin = getFirebaseAdmin();
    if (!firebaseAdmin) {
      throw new Error('Firebase Admin not initialized');
    }
    const db = firebaseAdmin.firestore();

    // Get counts from all collections with better error handling
    const [usersCount, productsCount, ordersCount, categoriesCount] = await Promise.all([
      db.collection('users').count().get().then(snapshot => snapshot.data().count).catch(() => 0),
      db.collection('products').count().get().then(snapshot => snapshot.data().count).catch(() => 0),
      db.collection('orders').count().get().then(snapshot => snapshot.data().count).catch(() => 0),
      db.collection('categories').count().get().then(snapshot => snapshot.data().count).catch(() => 0)
    ]);

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get recent orders from today with limit
    const recentOrdersSnapshot = await db.collection('orders')
      .where('createdAt', '>=', today)
      .where('createdAt', '<', tomorrow)
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get()
      .catch(() => ({ docs: [] }));

    // Serialize the recent orders data to remove Firestore objects
    const recentOrders = recentOrdersSnapshot.docs.map(doc => {
      const data = doc.data();
      
      // Convert Firestore timestamps to serializable format
      const serializedData: any = {};
      for (const [key, value] of Object.entries(data)) {
        if (value && typeof value === 'object' && '_seconds' in value) {
          // Convert Firestore timestamp to ISO string
          serializedData[key] = new Date((value as any)._seconds * 1000).toISOString();
        } else if (value && typeof value === 'object' && value.constructor.name !== 'Object') {
          // For other non-plain objects, convert to string representation
          serializedData[key] = JSON.parse(JSON.stringify(value));
        } else {
          serializedData[key] = value;
        }
      }
      
      return {
        id: doc.id,
        ...serializedData
      };
    });

    return {
      usersCount,
      productsCount,
      ordersCount,
      categoriesCount,
      recentOrders
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    
    return {
      usersCount: 0,
      productsCount: 0,
      ordersCount: 0,
      categoriesCount: 0,
      recentOrders: []
    };
  }
}