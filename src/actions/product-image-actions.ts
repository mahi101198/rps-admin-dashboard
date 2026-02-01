'use server';

import { getFirestore, getStorageBucket } from '@/data/firebase.admin';
import { revalidatePath } from 'next/cache';
import { withAuth, verifyAuth, AuthError } from '@/lib/auth';

// Upload product image
export async function uploadProductImageAction(
  file: File,
  productId: string,
  imageType: 'main' | 'gallery' | 'sku' = 'main',
  skuId?: string
): Promise<{ success: boolean; message: string; imageUrl?: string }> {
  try {
    await verifyAuth();
    
    const bucket = getStorageBucket();
    if (!bucket) {
      return { success: false, message: 'Storage not configured' };
    }

    // Generate filename based on image type
    let fileName: string;
    if (imageType === 'sku' && skuId) {
      fileName = `products/${productId}/skus/${skuId}_${Date.now()}.${file.name.split('.').pop()}`;
    } else if (imageType === 'gallery') {
      fileName = `products/${productId}/gallery/${Date.now()}_${file.name}`;
    } else {
      fileName = `products/${productId}/main_${Date.now()}.${file.name.split('.').pop()}`;
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    
    const fileUpload = bucket.file(fileName);
    await fileUpload.save(fileBuffer, {
      metadata: {
        contentType: file.type,
      },
    });

    const imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    
    revalidatePath('/products');
    return { success: true, message: 'Image uploaded successfully', imageUrl };
  } catch (error) {
    console.error('Error uploading product image:', error);
    return { success: false, message: 'Failed to upload image' };
  }
}

// Upload multiple product images
export async function uploadProductImagesAction(
  files: { file: File; type: 'main' | 'gallery' | 'sku'; skuId?: string }[],
  productId: string
): Promise<{ success: boolean; message: string; imageUrls?: string[] }> {
  try {
    await verifyAuth();
    
    const bucket = getStorageBucket();
    if (!bucket) {
      return { success: false, message: 'Storage not configured' };
    }

    const imageUrls: string[] = [];
    
    for (const { file, type, skuId } of files) {
      // Generate filename based on image type
      let fileName: string;
      if (type === 'sku' && skuId) {
        fileName = `products/${productId}/skus/${skuId}_${Date.now()}.${file.name.split('.').pop()}`;
      } else if (type === 'gallery') {
        fileName = `products/${productId}/gallery/${Date.now()}_${file.name}`;
      } else {
        fileName = `products/${productId}/main_${Date.now()}.${file.name.split('.').pop()}`;
      }

      const fileBuffer = Buffer.from(await file.arrayBuffer());
      
      const fileUpload = bucket.file(fileName);
      await fileUpload.save(fileBuffer, {
        metadata: {
          contentType: file.type,
        },
      });

      const imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      imageUrls.push(imageUrl);
    }
    
    revalidatePath('/products');
    return { success: true, message: 'Images uploaded successfully', imageUrls };
  } catch (error) {
    console.error('Error uploading product images:', error);
    return { success: false, message: 'Failed to upload images' };
  }
}

// Delete product image
export async function deleteProductImageAction(
  imageUrl: string,
  productId: string
): Promise<{ success: boolean; message: string }> {
  try {
    await verifyAuth();
    
    // Extract the file path from the URL
    const urlParts = imageUrl.split('/');
    const fileName = urlParts.slice(3).join('/'); // Remove https://storage.googleapis.com/bucket-name/
    
    if (fileName) {
      const bucket = getStorageBucket();
      if (bucket) {
        try {
          await bucket.file(fileName).delete();
          console.log(`Deleted product image: ${fileName}`);
        } catch (error) {
          console.warn('Failed to delete image from storage:', error);
          // Continue with operation even if image deletion fails
        }
      }
    }

    revalidatePath('/products');
    return { success: true, message: 'Image deleted successfully' };
  } catch (error) {
    console.error('Error deleting product image:', error);
    return { success: false, message: 'Failed to delete image' };
  }
}

// Delete multiple product images
export async function deleteProductImagesAction(
  imageUrls: string[],
  productId: string
): Promise<{ success: boolean; message: string }> {
  try {
    await verifyAuth();
    
    const bucket = getStorageBucket();
    if (!bucket) {
      return { success: false, message: 'Storage not configured' };
    }

    for (const imageUrl of imageUrls) {
      try {
        // Extract the file path from the URL
        const urlParts = imageUrl.split('/');
        const fileName = urlParts.slice(3).join('/'); // Remove https://storage.googleapis.com/bucket-name/
        
        if (fileName) {
          await bucket.file(fileName).delete();
          console.log(`Deleted product image: ${fileName}`);
        }
      } catch (error) {
        console.warn('Failed to delete image from storage:', error);
        // Continue with other deletions even if one fails
      }
    }

    revalidatePath('/products');
    return { success: true, message: 'Images deleted successfully' };
  } catch (error) {
    console.error('Error deleting product images:', error);
    return { success: false, message: 'Failed to delete images' };
  }
}