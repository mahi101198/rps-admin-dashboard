'use server';

import { getFirestore } from '@/data/firebase.admin';
import { revalidatePath } from 'next/cache';
import { Wishlist, WishlistItem } from '@/lib/types/all-schemas';
import { withAuth, verifyAuth, AuthError } from '@/lib/auth';

// Get user's wishlist
export async function getWishlistAction(userId: string): Promise<Wishlist | null> {
  try {
    const db = getFirestore();
    const doc = await db.collection('wishlists').doc(userId).get();
    
    if (!doc.exists) {
      return null;
    }
    
    const data: any = doc.data();
    return {
      userId: doc.id,
      items: data?.items || [],
      updatedAt: data?.updatedAt?._seconds ? 
        new Date(data.updatedAt._seconds * 1000) : 
        new Date(),
    } as Wishlist;
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return null;
  }
}

// Add item to wishlist
export async function addToWishlistAction(
  userId: string,
  productId: string
): Promise<{ success: boolean; message: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();

    const wishlistRef = db.collection('wishlists').doc(userId);
    const wishlistDoc = await wishlistRef.get();
    
    if (!wishlistDoc.exists) {
      // Create new wishlist
      await wishlistRef.set({
        items: [{
          productId,
          addedAt: new Date(),
        }],
        updatedAt: new Date(),
      });
    } else {
      // Update existing wishlist
      const wishlistData: any = wishlistDoc.data();
      const existingItems = wishlistData?.items || [];
      
      // Check if item already exists
      const existingItemIndex = existingItems.findIndex((item: WishlistItem) => item.productId === productId);
      
      if (existingItemIndex < 0) {
        // Add new item
        existingItems.push({
          productId,
          addedAt: new Date(),
        });
        
        await wishlistRef.update({
          items: existingItems,
          updatedAt: new Date(),
        });
      }
    }
    
    revalidatePath('/wishlists');
    return { success: true, message: 'Item added to wishlist successfully' };
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return { success: false, message: 'Failed to add item to wishlist' };
  }
}

// Remove item from wishlist
export async function removeFromWishlistAction(
  userId: string,
  productId: string
): Promise<{ success: boolean; message: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();

    const wishlistRef = db.collection('wishlists').doc(userId);
    const wishlistDoc = await wishlistRef.get();
    
    if (!wishlistDoc.exists) {
      return { success: false, message: 'Wishlist not found' };
    }
    
    const wishlistData: any = wishlistDoc.data();
    const items = wishlistData?.items || [];
    
    // Filter out the item to remove
    const updatedItems = items.filter((item: WishlistItem) => item.productId !== productId);
    
    await wishlistRef.update({
      items: updatedItems,
      updatedAt: new Date(),
    });
    
    revalidatePath('/wishlists');
    return { success: true, message: 'Item removed from wishlist successfully' };
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return { success: false, message: 'Failed to remove item from wishlist' };
  }
}

// Clear wishlist
export async function clearWishlistAction(
  userId: string
): Promise<{ success: boolean; message: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();

    await db.collection('wishlists').doc(userId).update({
      items: [],
      updatedAt: new Date(),
    });
    
    revalidatePath('/wishlists');
    return { success: true, message: 'Wishlist cleared successfully' };
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    return { success: false, message: 'Failed to clear wishlist' };
  }
}