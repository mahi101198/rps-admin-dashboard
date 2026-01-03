/**
 * Utility functions for Firebase Storage operations
 */
import { getFirebaseAdmin } from '@/data/firebase.admin';

/**
 * Gets a permanent download URL for a file in Firebase Storage
 * @param path The path to the file in Firebase Storage (e.g. "banner/banner2.jpg")
 * @returns A Promise that resolves to the permanent download URL
 */
export async function getImageUrl(path: string): Promise<string> {
  try {
    const admin = getFirebaseAdmin();
    const bucket = admin.storage().bucket();
    const file = bucket.file(path);
    
    // Make the file publicly accessible
    await file.makePublic();
    
    // Get the permanent public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${path}`;
    return publicUrl;
  } catch (error) {
    console.error('Error getting image URL:', error);
    throw new Error('Failed to get image URL');
  }
}

/**
 * Gets a signed URL with expiration for a file in Firebase Storage
 * @param path The path to the file in Firebase Storage
 * @param expirationMs Time in milliseconds until the URL expires (default: 1 hour)
 * @returns A Promise that resolves to the signed URL
 */
export async function getSignedImageUrl(path: string, expirationMs = 60 * 60 * 1000): Promise<string> {
  try {
    const admin = getFirebaseAdmin();
    const bucket = admin.storage().bucket();
    const file = bucket.file(path);
    
    // Get a signed URL that expires after the specified time
    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + expirationMs,
    });
    
    return signedUrl;
  } catch (error) {
    console.error('Error getting signed image URL:', error);
    throw new Error('Failed to get signed image URL');
  }
}