'use server';

import { getFirestore } from '@/data/firebase.admin';
import { revalidatePath } from 'next/cache';
import { AppSettings } from '@/lib/types/all-schemas';
import { withAuth, verifyAuth, AuthError } from '@/lib/auth';

// Get app settings
export async function getAppSettingsAction(): Promise<AppSettings | null> {
  try {
    const db = getFirestore();
    // Assuming there's a single settings document
    const snapshot = await db.collection('settings').limit(1).get();
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    const data = doc.data();
    
    return {
      settingsId: doc.id,
      key: data.key || '',
      value: data.value || '',
      description: data.description || '',
      type: data.type || 'string',
      createdAt: data.createdAt instanceof Date ? data.createdAt : new Date(),
      updatedAt: data.updatedAt instanceof Date ? data.updatedAt : new Date(),
    } as AppSettings;
  } catch (error) {
    console.error('Error fetching app settings:', error);
    return null;
  }
}

// Update app settings
export async function updateAppSettingsAction(
  settingsId: string,
  updates: Partial<AppSettings>
): Promise<{ success: boolean; message: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();
    
    await db.collection('settings').doc(settingsId).update({
      ...updates,
      updatedAt: new Date(),
    });
    
    revalidatePath('/settings');
    return { success: true, message: 'Settings updated successfully' };
  } catch (error) {
    console.error('Error updating app settings:', error);
    return { success: false, message: 'Failed to update settings' };
  }
}

// Create or update a setting by key
export async function upsertSettingAction(
  key: string,
  value: string,
  type: string = 'string',
  description?: string
): Promise<{ success: boolean; message: string; settingsId?: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();
    
    // Check if setting exists
    const snapshot = await db.collection('settings')
      .where('key', '==', key)
      .limit(1)
      .get();
    
    if (!snapshot.empty) {
      // Update existing setting
      const doc = snapshot.docs[0];
      await doc.ref.update({
        value,
        type,
        description: description || doc.data().description,
        updatedAt: new Date(),
      });
      
      revalidatePath('/settings');
      return { success: true, message: 'Setting updated successfully', settingsId: doc.id };
    } else {
      // Create new setting
      const docRef = await db.collection('settings').add({
        key,
        value,
        type,
        description: description || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      revalidatePath('/settings');
      return { success: true, message: 'Setting created successfully', settingsId: docRef.id };
    }
  } catch (error) {
    console.error('Error upserting setting:', error);
    return { success: false, message: 'Failed to save setting' };
  }
}

// Get all settings
export async function getAllSettingsAction(): Promise<AppSettings[]> {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('settings').get();
    
    return snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        settingsId: doc.id,
        key: data.key || '',
        value: data.value || '',
        description: data.description || '',
        type: data.type || 'string',
        createdAt: data.createdAt instanceof Date ? data.createdAt : new Date(),
        updatedAt: data.updatedAt instanceof Date ? data.updatedAt : new Date(),
      } as AppSettings;
    });
  } catch (error) {
    console.error('Error fetching all settings:', error);
    return [];
  }
}

// Get setting by key
export async function getSettingByKeyAction(key: string): Promise<AppSettings | null> {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('settings')
      .where('key', '==', key)
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    const data = doc.data();
    
    return {
      settingsId: doc.id,
      key: data.key || '',
      value: data.value || '',
      description: data.description || '',
      type: data.type || 'string',
      createdAt: data.createdAt instanceof Date ? data.createdAt : new Date(),
      updatedAt: data.updatedAt instanceof Date ? data.updatedAt : new Date(),
    } as AppSettings;
  } catch (error) {
    console.error('Error fetching setting by key:', error);
    return null;
  }
}

// Delete setting
export async function deleteSettingAction(
  settingsId: string
): Promise<{ success: boolean; message: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();
    
    await db.collection('settings').doc(settingsId).delete();
    
    revalidatePath('/settings');
    return { success: true, message: 'Setting deleted successfully' };
  } catch (error) {
    console.error('Error deleting setting:', error);
    return { success: false, message: 'Failed to delete setting' };
  }
}
