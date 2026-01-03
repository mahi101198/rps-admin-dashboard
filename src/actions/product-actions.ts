'use server';

import { getFirestore, getStorageBucket } from '@/data/firebase.admin';
import { revalidatePath } from 'next/cache';
import { Product, ProductWithDetails, ProductReview } from '@/lib/types/all-schemas';
import { verifyAuth, withAuth, AuthError } from '@/lib/auth';

// Helper function to safely convert timestamps to Date objects
function convertTimestampToDate(timestamp: any): Date {
  // If it's already a Date object
  if (timestamp instanceof Date) {
    return timestamp;
  }
  
  // If it's a Firestore timestamp object with _seconds
  if (typeof timestamp === 'object' && '_seconds' in timestamp) {
    return new Date(timestamp._seconds * 1000 + Math.floor(timestamp._nanoseconds / 1000000));
  }
  
  // If it's a string, try to parse it
  if (typeof timestamp === 'string') {
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? new Date() : date;
  }
  
  // If it's a number (timestamp)
  if (typeof timestamp === 'number') {
    return new Date(timestamp);
  }
  
  // Fallback
  return new Date();
}

// Deep convert all timestamps in an object
const deepConvertTimestamps = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;
  
  // Handle Firestore timestamps
  if (obj._seconds !== undefined) {
    return convertTimestampToDate(obj);
  }
  
  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => deepConvertTimestamps(item));
  }
  
  // Handle regular objects
  const converted: any = {};
  for (const [key, value] of Object.entries(obj)) {
    converted[key] = deepConvertTimestamps(value);
  }
  return converted;
};

// Get all products
export async function getProductsAction(): Promise<Product[]> {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('products').get();
    
    return snapshot.docs.map(doc => {
      const data: any = deepConvertTimestamps(doc.data());
      return {
        productId: doc.id,
        name: data.name || '',
        mrp: data.mrp || 0,
        price: data.price || 0,
        discount: data.discount || 0,
        image: data.image || '',
        stock: data.stock || 0,
        categoryId: data.categoryId || '',
        subcategoryId: data.subcategoryId || '',
        isActive: data.isActive ?? true,
        maxQuantityPerUser: data.maxQuantityPerUser || 10,
        createdAt: convertTimestampToDate(data.createdAt),
        updatedAt: convertTimestampToDate(data.updatedAt),
      } as Product;
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

// Get product by ID
export async function getProductAction(productId: string): Promise<ProductWithDetails | null> {
  try {
    const db = getFirestore();
    
    // Get main product data
    const productDoc = await db.collection('products').doc(productId).get();
    if (!productDoc.exists) {
      return null;
    }
    
    const productData: any = deepConvertTimestamps(productDoc.data());
    const product: any = {
      productId: productDoc.id,
      name: productData.name || '',
      mrp: productData.mrp || 0,
      price: productData.price || 0,
      discount: productData.discount || 0,
      image: productData.image || '',
      stock: productData.stock || 0,
      categoryId: productData.categoryId || '',
      subcategoryId: productData.subcategoryId || '',
      isActive: productData.isActive ?? true,
      maxQuantityPerUser: productData.maxQuantityPerUser || 10,
      createdAt: convertTimestampToDate(productData.createdAt),
      updatedAt: convertTimestampToDate(productData.updatedAt),
    };
    
    // Get product details
    const detailsDoc = await db.collection('product_details').doc(productId).get();
    if (detailsDoc.exists) {
      const detailsData: any = deepConvertTimestamps(detailsDoc.data());
      product.description = detailsData.description || '';
      product.images = detailsData.images || [];
      product.miniInfo = detailsData.miniInfo || [];
      product.tags = detailsData.tags || [];
      product.colors = detailsData.colors || [];
      product.shippingInfo = detailsData.shippingInfo || '';
      product.shippingInfoTitle = detailsData.shippingInfoTitle || '';
      product.returnTitle = detailsData.returnTitle || '';
      product.returnDescription = detailsData.returnDescription || '';
      product.detailsCreatedAt = convertTimestampToDate(detailsData.createdAt);
      product.detailsUpdatedAt = convertTimestampToDate(detailsData.updatedAt);
    }
    
    return product as ProductWithDetails;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

// Create product
export const createProductAction = withAuth(async (
  user,
  productData: Omit<ProductWithDetails, 'productId' | 'createdAt' | 'updatedAt' | 'detailsCreatedAt' | 'detailsUpdatedAt'>
): Promise<{ success: boolean; message: string; productId?: string }> => {
  try {
    const db = getFirestore();

    // Create main product document WITHOUT productId first (to generate auto ID)
    const tempProductData = {
      name: productData.name,
      mrp: productData.mrp,
      price: productData.price,
      discount: productData.discount,
      image: productData.image,
      stock: productData.stock,
      categoryId: productData.categoryId,
      subcategoryId: productData.subcategoryId,
      isActive: productData.isActive,
      maxQuantityPerUser: productData.maxQuantityPerUser,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const productDocRef = await db.collection('products').add(tempProductData);
    const productId = productDocRef.id;
    
    // Update the product document to include productId field
    await db.collection('products').doc(productId).update({
      productId: productId,
    });
    
    // Create product details document with productId
    const productDetailsData = {
      productId,
      description: productData.description,
      images: productData.images,
      miniInfo: productData.miniInfo,
      tags: productData.tags,
      colors: productData.colors || [],
      shippingInfo: productData.shippingInfo,
      shippingInfoTitle: productData.shippingInfoTitle,
      returnTitle: productData.returnTitle,
      returnDescription: productData.returnDescription,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('product_details').doc(productId).set(productDetailsData);
    
    revalidatePath('/products');
    return { success: true, message: 'Product created successfully', productId };
  } catch (error) {
    console.error('Error creating product:', error);
    return { success: false, message: 'Failed to create product' };
  }
});

// Update product
export const updateProductAction = withAuth(async (
  user,
  productId: string,
  productData: Partial<ProductWithDetails>
): Promise<{ success: boolean; message: string }> => {
  try {
    const db = getFirestore();

    // Update main product document if any main fields are provided
    const mainProductFields = [
      'name', 'mrp', 'price', 'discount', 'image', 'stock', 
      'categoryId', 'subcategoryId', 'isActive', 'maxQuantityPerUser'
    ];
    
    const mainProductUpdate: any = {};
    let hasMainProductUpdate = false;
    
    for (const field of mainProductFields) {
      if (field in productData) {
        mainProductUpdate[field] = (productData as any)[field];
        hasMainProductUpdate = true;
      }
    }
    
    if (hasMainProductUpdate) {
      mainProductUpdate.updatedAt = new Date();
      await db.collection('products').doc(productId).update(mainProductUpdate);
    }
    
    // Update product details document if any detail fields are provided
    const detailFields = [
      'description', 'images', 'miniInfo', 'tags', 'colors', 'shippingInfo', 
      'shippingInfoTitle', 'returnTitle', 'returnDescription'
    ];
    
    const detailsUpdate: any = {};
    let hasDetailsUpdate = false;
    
    for (const field of detailFields) {
      if (field in productData) {
        detailsUpdate[field] = (productData as any)[field];
        hasDetailsUpdate = true;
      }
    }
    
    if (hasDetailsUpdate) {
      detailsUpdate.updatedAt = new Date();
      await db.collection('product_details').doc(productId).update(detailsUpdate);
    }
    
    revalidatePath('/products');
    return { success: true, message: 'Product updated successfully' };
  } catch (error) {
    console.error('Error updating product:', error);
    return { success: false, message: 'Failed to update product' };
  }
});

// Delete product
export const deleteProductAction = withAuth(async (
  user,
  productId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const db = getFirestore();

    // Delete main product document
    await db.collection('products').doc(productId).delete();
    
    // Delete product details document
    await db.collection('product_details').doc(productId).delete();
    
    // Delete associated reviews
    const reviewsSnapshot = await db.collection('product_reviews')
      .where('productId', '==', productId)
      .get();
    
    const batch = db.batch();
    reviewsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    
    revalidatePath('/products');
    return { success: true, message: 'Product deleted successfully' };
  } catch (error) {
    console.error('Error deleting product:', error);
    return { success: false, message: 'Failed to delete product' };
  }
});

// Toggle product active status
export const toggleProductActiveAction = withAuth(async (
  user,
  productId: string,
  isActive: boolean
): Promise<{ success: boolean; message: string }> => {
  try {
    const db = getFirestore();

    await db.collection('products').doc(productId).update({
      isActive,
      updatedAt: new Date(),
    });
    
    revalidatePath('/products');
    return { success: true, message: `Product ${isActive ? 'activated' : 'deactivated'} successfully` };
  } catch (error) {
    console.error('Error toggling product active status:', error);
    return { success: false, message: `Failed to ${isActive ? 'activate' : 'deactivate'} product` };
  }
});

// Upload product image
export const uploadProductImageAction = withAuth(async (
  user,
  file: File,
  productId: string
): Promise<{ success: boolean; message: string; imageUrl?: string }> => {
  try {
    const bucket = getStorageBucket();
    if (!bucket) {
      return { success: false, message: 'Storage not configured' };
    }

    const fileName = `products/${productId}_${Date.now()}.${file.name.split('.').pop()}`;
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
});

// Delete product image
export const deleteProductImageAction = withAuth(async (
  user,
  imageUrl: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // Extract the file name from the URL
    const fileName = imageUrl.split('/').pop();
    if (fileName) {
      const bucket = getStorageBucket();
      if (bucket) {
        try {
          await bucket.file(`products/${fileName}`).delete();
        } catch (error) {
          console.warn('Failed to delete image from storage:', error);
        }
      }
    }
    
    revalidatePath('/products');
    return { success: true, message: 'Image deleted successfully' };
  } catch (error) {
    console.error('Error deleting product image:', error);
    return { success: false, message: 'Failed to delete image' };
  }
});

// Get product reviews
export async function getProductReviewsAction(productId: string): Promise<ProductReview[]> {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('product_reviews')
      .where('productId', '==', productId)
      .get();
    
    return snapshot.docs.map((doc: any) => {
      const data: any = deepConvertTimestamps(doc.data());
      return {
        reviewId: doc.id,
        productId: data.productId || '',
        userId: data.userId || '',
        rating: data.rating || 0,
        comment: data.comment || '',
        images: data.images || [],
        createdAt: convertTimestampToDate(data.createdAt),
        updatedAt: convertTimestampToDate(data.updatedAt),
      } as ProductReview;
    });
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    return [];
  }
}

// Delete product review
export const deleteProductReviewAction = withAuth(async (
  user,
  reviewId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const db = getFirestore();

    await db.collection('product_reviews').doc(reviewId).delete();
    
    revalidatePath('/products');
    return { success: true, message: 'Review deleted successfully' };
  } catch (error) {
    console.error('Error deleting product review:', error);
    return { success: false, message: 'Failed to delete review' };
  }
});