'use server';

import { getFirestore, getStorageBucket } from '@/data/firebase.admin';
import { revalidatePath } from 'next/cache';
import { Banner } from '@/lib/types/product';
import { withAuth, verifyAuth, AuthError } from '@/lib/auth';

// Get all banners
export async function getBannersAction(): Promise<Banner[]> {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('banners').orderBy('rank', 'asc').get();
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        bannerId: doc.id,
        title: data.title || '',
        imageUrl: data.imageUrl || '',
        linkTo: data.linkTo || '',
        rank: data.rank || 0,
        isActive: data.isActive ?? true,
        createdAt: data.createdAt?._seconds ? 
          new Date(data.createdAt._seconds * 1000) : 
          data.createdAt instanceof Date ? data.createdAt :
          new Date(),
        updatedAt: data.updatedAt?._seconds ? 
          new Date(data.updatedAt._seconds * 1000) : 
          new Date(),
      } as Banner;
    });
  } catch (error) {
    console.error('Error fetching banners:', error);
    return [];
  }
}

// Create a new banner
export async function createBannerAction(
  bannerData: Omit<Banner, 'bannerId' | 'createdAt' | 'updatedAt'>
): Promise<{ success: boolean; message: string; bannerId?: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();

    const newBanner = {
      ...bannerData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await db.collection('banners').add(newBanner);
    
    revalidatePath('/banners');
    return { success: true, message: 'Banner created successfully', bannerId: docRef.id };
  } catch (error) {
    console.error('Error creating banner:', error);
    return { success: false, message: 'Failed to create banner' };
  }
}

// Update a banner
export async function updateBannerAction(
  bannerId: string,
  bannerData: Partial<Banner>
): Promise<{ success: boolean; message: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();

    await db.collection('banners').doc(bannerId).update({
      ...bannerData,
      updatedAt: new Date(),
    });
    
    revalidatePath('/banners');
    return { success: true, message: 'Banner updated successfully' };
  } catch (error) {
    console.error('Error updating banner:', error);
    return { success: false, message: 'Failed to update banner' };
  }
}

// Delete a banner
export async function deleteBannerAction(
  bannerId: string
): Promise<{ success: boolean; message: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();

    await db.collection('banners').doc(bannerId).delete();
    
    revalidatePath('/banners');
    return { success: true, message: 'Banner deleted successfully' };
  } catch (error) {
    console.error('Error deleting banner:', error);
    return { success: false, message: 'Failed to delete banner' };
  }
}

// Upload banner image
export async function uploadBannerImageAction(
  file: File,
  bannerId: string
): Promise<{ success: boolean; message: string; imageUrl?: string }> {
  try {
    await verifyAuth();
    
    const bucket = getStorageBucket();
    if (!bucket) {
      return { success: false, message: 'Storage not configured' };
    }

    const fileName = `banners/${bannerId}_${Date.now()}.${file.name.split('.').pop()}`;
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
    await db.collection('banners').doc(bannerId).update({
      imageUrl,
      updatedAt: new Date(),
    });
    
    revalidatePath('/banners');
    return { success: true, message: 'Image uploaded successfully', imageUrl };
  } catch (error) {
    console.error('Error uploading banner image:', error);
    return { success: false, message: 'Failed to upload image' };
  }
}

// Delete banner image
export async function deleteBannerImageAction(
  bannerId: string,
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
          await bucket.file(`banners/${fileName}`).delete();
        } catch (error) {
          console.warn('Failed to delete image from storage:', error);
        }
      }
    }

    // Update the banner to remove the image URL
    const db = getFirestore();
    await db.collection('banners').doc(bannerId).update({
      imageUrl: '',
      updatedAt: new Date(),
    });
    
    revalidatePath('/banners');
    return { success: true, message: 'Image deleted successfully' };
  } catch (error) {
    console.error('Error deleting banner image:', error);
    return { success: false, message: 'Failed to delete image' };
  }
}

// Toggle banner active status
export async function toggleBannerStatusAction(
  bannerId: string,
  isActive: boolean
): Promise<{ success: boolean; message: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();

    await db.collection('banners').doc(bannerId).update({
      isActive,
      updatedAt: new Date(),
    });
    
    revalidatePath('/banners');
    return { success: true, message: `Banner ${isActive ? 'activated' : 'deactivated'} successfully` };
  } catch (error) {
    console.error('Error toggling banner status:', error);
    return { success: false, message: `Failed to ${isActive ? 'activate' : 'deactivate'} banner` };
  }
}