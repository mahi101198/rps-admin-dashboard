'use server';

import { getStorageBucket } from '@/data/firebase.admin';
import { verifyAuth } from '@/lib/auth';

export interface StorageFile {
  name: string;
  path: string;
  url: string;
  size: number;
  lastModified: string;
  bucket: string;
}

// Get all files from a Firebase Storage folder
export async function listStorageFilesAction(
  folderPath: string = ''
): Promise<{ success: boolean; files?: StorageFile[]; message: string }> {
  try {
    await verifyAuth();

    const bucket = getStorageBucket();
    if (!bucket) {
      return { success: false, message: 'Storage not configured' };
    }

    const [files] = await bucket.getFiles({
      prefix: folderPath,
      delimiter: '/',
    });

    const storageFiles: StorageFile[] = await Promise.all(
      files.map(async (file) => {
        const [metadata] = await file.getMetadata();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;

        return {
          name: file.name.split('/').pop() || file.name,
          path: file.name,
          url: publicUrl,
          size: parseInt(metadata.size as string) || 0,
          lastModified: metadata.updated || new Date().toISOString(),
          bucket: bucket.name,
        };
      })
    );

    return { success: true, files: storageFiles, message: 'Files listed successfully' };
  } catch (error) {
    console.error('Error listing storage files:', error);
    return { success: false, message: 'Failed to list files from storage' };
  }
}

// Get files from specific folder (product images, category images, etc.)
export async function getProductImagesAction(): Promise<StorageFile[]> {
  const result = await listStorageFilesAction('products/');
  return result.files || [];
}

export async function getCategoryImagesAction(): Promise<StorageFile[]> {
  const result = await listStorageFilesAction('category/');
  return result.files || [];
}

export async function getSubcategoryImagesAction(): Promise<StorageFile[]> {
  const result = await listStorageFilesAction('subcategories/');
  return result.files || [];
}

export async function getBannerImagesAction(): Promise<StorageFile[]> {
  const result = await listStorageFilesAction('banners/');
  return result.files || [];
}

// Get all images from storage
export async function getAllImagesAction(): Promise<StorageFile[]> {
  try {
    await verifyAuth();

    const bucket = getStorageBucket();
    if (!bucket) {
      return [];
    }

    const [files] = await bucket.getFiles();

    const allFiles: StorageFile[] = await Promise.all(
      files
        .filter((file) => {
          const imageExtensions = [
            '.jpg',
            '.jpeg',
            '.png',
            '.gif',
            '.webp',
            '.svg',
          ];
          return imageExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));
        })
        .map(async (file) => {
          const [metadata] = await file.getMetadata();
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;

          return {
            name: file.name.split('/').pop() || file.name,
            path: file.name,
            url: publicUrl,
            size: parseInt(metadata.size as string) || 0,
            lastModified: metadata.updated || new Date().toISOString(),
            bucket: bucket.name,
          };
        })
    );

    return allFiles.sort((a, b) =>
      new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    );
  } catch (error) {
    console.error('Error getting all images:', error);
    return [];
  }
}
