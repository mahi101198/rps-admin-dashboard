'use server';

import { getFirestore } from '@/data/firebase.admin';
import { revalidatePath } from 'next/cache';
import { Coupon } from '@/lib/types/product';
import { withAuth, verifyAuth, AuthError } from '@/lib/auth';

// Get all coupons
export async function getCouponsAction(): Promise<Coupon[]> {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('coupons').get();
    
    return snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        couponId: doc.id,
        code: data.code || '',
        title: data.title || '',
        description: data.description || '',
        type: data.type || 'flat',
        value: data.value || 0,
        maxDiscount: data.maxDiscount || null,
        minOrderValue: data.minOrderValue || 0,
        applicableCategories: data.applicableCategories || [],
        applicableProducts: data.applicableProducts || [],
        isActive: data.isActive ?? true,
        usageLimit: data.usageLimit || 0,
        usedCount: data.usedCount || 0,
        validFrom: data.validFrom?._seconds ? 
          new Date(data.validFrom._seconds * 1000) : 
          data.validFrom instanceof Date ? data.validFrom :
          new Date(),
        validUntil: data.validUntil?._seconds ? 
          new Date(data.validUntil._seconds * 1000) : 
          new Date(),
        createdAt: data.createdAt?._seconds ? 
          new Date(data.createdAt._seconds * 1000) : 
          data.createdAt instanceof Date ? data.createdAt :
          new Date(),
        updatedAt: data.updatedAt?._seconds ? 
          new Date(data.updatedAt._seconds * 1000) : 
          new Date(),
      } as Coupon;
    });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return [];
  }
}

// Get coupon by ID
export async function getCouponAction(couponId: string): Promise<Coupon | null> {
  try {
    const db = getFirestore();
    const doc = await db.collection('coupons').doc(couponId).get();
    
    if (!doc.exists) {
      return null;
    }
    
    const data = doc.data();
    return {
      couponId: doc.id,
      code: data?.code || '',
      title: data?.title || '',
      description: data?.description || '',
      type: data?.type || 'flat',
      value: data?.value || 0,
      maxDiscount: data?.maxDiscount || null,
      minOrderValue: data?.minOrderValue || 0,
      applicableCategories: data?.applicableCategories || [],
      applicableProducts: data?.applicableProducts || [],
      isActive: data?.isActive ?? true,
      usageLimit: data?.usageLimit || 0,
      usedCount: data?.usedCount || 0,
      validFrom: data?.validFrom?._seconds ? 
        new Date(data.validFrom._seconds * 1000) : 
        data?.validFrom instanceof Date ? data.validFrom :
        new Date(),
      validUntil: data?.validUntil?._seconds ? 
        new Date(data.validUntil._seconds * 1000) : 
        new Date(),
      createdAt: data?.createdAt?._seconds ? 
        new Date(data.createdAt._seconds * 1000) : 
        data?.createdAt instanceof Date ? data.createdAt :
        new Date(),
      updatedAt: data?.updatedAt?._seconds ? 
        new Date(data.updatedAt._seconds * 1000) : 
        new Date(),
    } as Coupon;
  } catch (error) {
    console.error('Error fetching coupon:', error);
    return null;
  }
}

// Create coupon
export async function createCouponAction(
  couponData: Omit<Coupon, 'couponId' | 'createdAt' | 'updatedAt' | 'usedCount'>
): Promise<{ success: boolean; message: string; couponId?: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();

    const newCoupon = {
      ...couponData,
      usedCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await db.collection('coupons').add(newCoupon);
    
    revalidatePath('/coupons');
    return { success: true, message: 'Coupon created successfully', couponId: docRef.id };
  } catch (error) {
    console.error('Error creating coupon:', error);
    return { success: false, message: 'Failed to create coupon' };
  }
}

// Update coupon
export async function updateCouponAction(
  couponId: string,
  couponData: Partial<Coupon>
): Promise<{ success: boolean; message: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();

    await db.collection('coupons').doc(couponId).update({
      ...couponData,
      updatedAt: new Date(),
    });
    
    revalidatePath('/coupons');
    return { success: true, message: 'Coupon updated successfully' };
  } catch (error) {
    console.error('Error updating coupon:', error);
    return { success: false, message: 'Failed to update coupon' };
  }
}

// Delete coupon
export async function deleteCouponAction(
  couponId: string
): Promise<{ success: boolean; message: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();

    await db.collection('coupons').doc(couponId).delete();
    
    revalidatePath('/coupons');
    return { success: true, message: 'Coupon deleted successfully' };
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return { success: false, message: 'Failed to delete coupon' };
  }
}

// Toggle coupon active status
export async function toggleCouponActiveAction(
  couponId: string,
  isActive: boolean
): Promise<{ success: boolean; message: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();

    await db.collection('coupons').doc(couponId).update({
      isActive,
      updatedAt: new Date(),
    });
    
    revalidatePath('/coupons');
    return { success: true, message: `Coupon ${isActive ? 'activated' : 'deactivated'} successfully` };
  } catch (error) {
    console.error('Error toggling coupon active status:', error);
    return { success: false, message: `Failed to ${isActive ? 'activate' : 'deactivate'} coupon` };
  }
}

// Alias for toggleCouponActiveAction
export const toggleCouponStatusAction = toggleCouponActiveAction;
