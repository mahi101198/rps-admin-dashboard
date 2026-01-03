'use server';

import { getFirestore } from '@/data/firebase.admin';
import { revalidatePath } from 'next/cache';
import { Referral } from '@/lib/types/all-schemas';
import { withAuth, verifyAuth, AuthError } from '@/lib/auth';

// Get all referrals
export async function getReferralsAction(): Promise<Referral[]> {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('referrals').get();
    
    return snapshot.docs.map(doc => {
      const data: any = doc.data();
      return {
        referralId: doc.id,
        referrerId: data.referrerId || '',
        referredUserId: data.referredUserId || '',
        status: data.status || 'pending',
        rewardAmount: data.rewardAmount || 0,
        createdAt: data.createdAt?._seconds ? 
          new Date(data.createdAt._seconds * 1000) : 
          data.createdAt instanceof Date ? data.createdAt :
          new Date(),
        completedAt: data.completedAt?._seconds ? 
          new Date(data.completedAt._seconds * 1000) : 
          data.completedAt instanceof Date ? data.completedAt :
          null,
      } as Referral;
    });
  } catch (error) {
    console.error('Error fetching referrals:', error);
    return [];
  }
}

// Get referral by ID
export async function getReferralAction(referralId: string): Promise<Referral | null> {
  try {
    const db = getFirestore();
    const doc = await db.collection('referrals').doc(referralId).get();
    
    if (!doc.exists) {
      return null;
    }
    
    const data: any = doc.data();
    return {
      referralId: doc.id,
      referrerId: data?.referrerId || '',
      referredUserId: data?.referredUserId || '',
      status: data?.status || 'pending',
      rewardAmount: data?.rewardAmount || 0,
      createdAt: data?.createdAt?._seconds ? 
        new Date(data.createdAt._seconds * 1000) : 
        data?.createdAt instanceof Date ? data.createdAt :
        new Date(),
      completedAt: data?.completedAt?._seconds ? 
        new Date(data.completedAt._seconds * 1000) : 
        data?.completedAt instanceof Date ? data.completedAt :
        null,
    } as Referral;
  } catch (error) {
    console.error('Error fetching referral:', error);
    return null;
  }
}

// Get referrals by referrer ID
export async function getReferralsByReferrerAction(referrerId: string): Promise<Referral[]> {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('referrals')
      .where('referrerId', '==', referrerId)
      .get();
    
    return snapshot.docs.map(doc => {
      const data: any = doc.data();
      return {
        referralId: doc.id,
        referrerId: data.referrerId || '',
        referredUserId: data.referredUserId || '',
        status: data.status || 'pending',
        rewardAmount: data.rewardAmount || 0,
        createdAt: data.createdAt?._seconds ? 
          new Date(data.createdAt._seconds * 1000) : 
          data.createdAt instanceof Date ? data.createdAt :
          new Date(),
        completedAt: data.completedAt?._seconds ? 
          new Date(data.completedAt._seconds * 1000) : 
          data.completedAt instanceof Date ? data.completedAt :
          null,
      } as Referral;
    });
  } catch (error) {
    console.error('Error fetching referrals by referrer:', error);
    return [];
  }
}

// Create referral
export async function createReferralAction(
  referralData: Omit<Referral, 'referralId' | 'createdAt' | 'completedAt'>
): Promise<{ success: boolean; message: string; referralId?: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();

    const newReferral = {
      ...referralData,
      createdAt: new Date(),
      completedAt: null,
    };

    const docRef = await db.collection('referrals').add(newReferral);
    
    revalidatePath('/referrals');
    return { success: true, message: 'Referral created successfully', referralId: docRef.id };
  } catch (error) {
    console.error('Error creating referral:', error);
    return { success: false, message: 'Failed to create referral' };
  }
}

// Update referral
export async function updateReferralAction(
  referralId: string,
  referralData: Partial<Referral>
): Promise<{ success: boolean; message: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();

    await db.collection('referrals').doc(referralId).update({
      ...referralData,
      updatedAt: new Date(),
    });
    
    revalidatePath('/referrals');
    return { success: true, message: 'Referral updated successfully' };
  } catch (error) {
    console.error('Error updating referral:', error);
    return { success: false, message: 'Failed to update referral' };
  }
}

// Delete referral
export async function deleteReferralAction(
  referralId: string
): Promise<{ success: boolean; message: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();

    await db.collection('referrals').doc(referralId).delete();
    
    revalidatePath('/referrals');
    return { success: true, message: 'Referral deleted successfully' };
  } catch (error) {
    console.error('Error deleting referral:', error);
    return { success: false, message: 'Failed to delete referral' };
  }
}

// Update referral status
export async function updateReferralStatusAction(
  referralId: string,
  status: string,
  rewardAmount?: number
): Promise<{ success: boolean; message: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();

    const updateData: any = {
      status,
      updatedAt: new Date(),
    };
    
    if (rewardAmount !== undefined) {
      updateData.rewardAmount = rewardAmount;
    }
    
    // If status is completed, set completedAt timestamp
    if (status === 'completed') {
      updateData.completedAt = new Date();
    }

    await db.collection('referrals').doc(referralId).update(updateData);
    
    revalidatePath('/referrals');
    return { success: true, message: 'Referral status updated successfully' };
  } catch (error) {
    console.error('Error updating referral status:', error);
    return { success: false, message: 'Failed to update referral status' };
  }
}