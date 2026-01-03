'use server';

import { getFirestore } from '@/data/firebase.admin';
import { revalidatePath } from 'next/cache';
import { ProductReview } from '@/lib/types/product';
import { withAuth, verifyAuth, AuthError } from '@/lib/auth';

// Get all reviews
export async function getReviewsAction(): Promise<ProductReview[]> {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('product_reviews').get();
    
    return snapshot.docs.map((doc: any) => {
      const data: any = doc.data();
      return {
        reviewId: doc.id,
        productId: data.productId || '',
        userId: data.userId || '',
        rating: data.rating || 0,
        comment: data.comment || '',
        images: data.images || [],
        createdAt: data.createdAt?._seconds ? 
          new Date(data.createdAt._seconds * 1000) : 
          data.createdAt instanceof Date ? data.createdAt :
          new Date(),
        updatedAt: data.updatedAt?._seconds ? 
          new Date(data.updatedAt._seconds * 1000) : 
          new Date(),
      } as ProductReview;
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
}

// Get review by ID
export async function getReviewAction(reviewId: string): Promise<ProductReview | null> {
  try {
    const db = getFirestore();
    const doc = await db.collection('product_reviews').doc(reviewId).get();
    
    if (!doc.exists) {
      return null;
    }
    
    const data: any = doc.data();
    return {
      reviewId: doc.id,
      productId: data?.productId || '',
      userId: data?.userId || '',
      rating: data?.rating || 0,
      comment: data?.comment || '',
      images: data?.images || [],
      createdAt: data?.createdAt?._seconds ? 
        new Date(data.createdAt._seconds * 1000) : 
        data?.createdAt instanceof Date ? data.createdAt :
        new Date(),
      updatedAt: data?.updatedAt?._seconds ? 
        new Date(data.updatedAt._seconds * 1000) : 
        new Date(),
    } as ProductReview;
  } catch (error) {
    console.error('Error fetching review:', error);
    return null;
  }
}

// Get reviews by product ID
export async function getReviewsByProductAction(productId: string): Promise<ProductReview[]> {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('product_reviews')
      .where('productId', '==', productId)
      .get();
    
    return snapshot.docs.map((doc: any) => {
      const data: any = doc.data();
      return {
        reviewId: doc.id,
        productId: data.productId || '',
        userId: data.userId || '',
        rating: data.rating || 0,
        comment: data.comment || '',
        images: data.images || [],
        createdAt: data.createdAt?._seconds ? 
          new Date(data.createdAt._seconds * 1000) : 
          data.createdAt instanceof Date ? data.createdAt :
          new Date(),
        updatedAt: data.updatedAt?._seconds ? 
          new Date(data.updatedAt._seconds * 1000) : 
          new Date(),
      } as ProductReview;
    });
  } catch (error) {
    console.error('Error fetching reviews by product:', error);
    return [];
  }
}

// Create review
export async function createReviewAction(
  reviewData: Omit<ProductReview, 'reviewId' | 'createdAt' | 'updatedAt'>
): Promise<{ success: boolean; message: string; reviewId?: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();

    const newReview = {
      ...reviewData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await db.collection('product_reviews').add(newReview);
    
    revalidatePath('/reviews');
    return { success: true, message: 'Review created successfully', reviewId: docRef.id };
  } catch (error) {
    console.error('Error creating review:', error);
    return { success: false, message: 'Failed to create review' };
  }
}

// Update review
export async function updateReviewAction(
  reviewId: string,
  reviewData: Partial<ProductReview>
): Promise<{ success: boolean; message: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();

    await db.collection('product_reviews').doc(reviewId).update({
      ...reviewData,
      updatedAt: new Date(),
    });
    
    revalidatePath('/reviews');
    return { success: true, message: 'Review updated successfully' };
  } catch (error) {
    console.error('Error updating review:', error);
    return { success: false, message: 'Failed to update review' };
  }
}

// Delete review
export async function deleteReviewAction(
  reviewId: string
): Promise<{ success: boolean; message: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();

    await db.collection('product_reviews').doc(reviewId).delete();
    
    revalidatePath('/reviews');
    return { success: true, message: 'Review deleted successfully' };
  } catch (error) {
    console.error('Error deleting review:', error);
    return { success: false, message: 'Failed to delete review' };
  }
}