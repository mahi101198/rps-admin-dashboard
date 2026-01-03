'use server';

import { getFirestore } from '@/data/firebase.admin';
import { revalidatePath } from 'next/cache';
import { CartItem, Cart } from '@/lib/types/all-schemas';
import { withAuth, verifyAuth, AuthError } from '@/lib/auth';

// Get all carts with user information
export async function getAllCartsAction(): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    const db = getFirestore();
    const cartsSnapshot = await db.collection('carts').get();
    
    const cartsWithDetails = await Promise.all(
      cartsSnapshot.docs.map(async (cartDoc) => {
        const cartData = cartDoc.data();
        const userId = cartDoc.id;
        
        // Fetch user info
        let userInfo = null;
        try {
          const userDoc = await db.collection('users').doc(userId).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            userInfo = {
              firstName: userData?.firstName || '',
              lastName: userData?.lastName || '',
              email: userData?.email || '',
              phoneNumber: userData?.phoneNumber || ''
            };
          }
        } catch (error) {
          console.error(`Error fetching user ${userId}:`, error);
        }
        
        const items = cartData.items || [];
        const totalItems = items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
        
        // Calculate total value by fetching product prices
        let totalValue = 0;
        for (const item of items) {
          try {
            const productDoc = await db.collection('products').doc(item.productId).get();
            if (productDoc.exists) {
              const productData = productDoc.data();
              totalValue += (productData?.price || 0) * (item.quantity || 0);
            }
          } catch (error) {
            console.error(`Error fetching product ${item.productId}:`, error);
          }
        }
        
        return {
          userId,
          userInfo,
          items: items.length,
          totalItems,
          totalValue,
          updatedAt: cartData.updatedAt || cartData.createdAt || new Date(),
          createdAt: cartData.createdAt || new Date()
        };
      })
    );
    
    return { success: true, data: cartsWithDetails };
  } catch (error) {
    console.error('Error fetching carts:', error);
    return { success: false, error: 'Failed to fetch carts' };
  }
}

// Get cart details for a specific user
export async function getCartDetailsAction(userId: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const db = getFirestore();
    const cartDoc = await db.collection('carts').doc(userId).get();
    
    if (!cartDoc.exists) {
      return { success: false, error: 'Cart not found' };
    }
    
    const cartData = cartDoc.data();
    const items = cartData?.items || [];
    
    // Fetch product details for each item
    const itemsWithDetails = await Promise.all(
      items.map(async (item: any) => {
        try {
          const productDoc = await db.collection('products').doc(item.productId).get();
          if (productDoc.exists) {
            const productData = productDoc.data();
            return {
              productId: item.productId,
              quantity: item.quantity,
              addedAt: item.addedAt,
              productName: productData?.name || '',
              productImage: productData?.image || '',
              productPrice: productData?.price || 0,
              productMrp: productData?.mrp || 0,
              subtotal: (productData?.price || 0) * item.quantity
            };
          }
        } catch (error) {
          console.error(`Error fetching product ${item.productId}:`, error);
        }
        return null;
      })
    );
    
    const validItems = itemsWithDetails.filter(item => item !== null);
    const totalValue = validItems.reduce((sum, item) => sum + (item?.subtotal || 0), 0);
    
    return {
      success: true,
      data: {
        userId,
        items: validItems,
        totalItems: validItems.reduce((sum, item) => sum + (item?.quantity || 0), 0),
        totalValue,
        updatedAt: cartData?.updatedAt || new Date(),
        createdAt: cartData?.createdAt || new Date()
      }
    };
  } catch (error) {
    console.error('Error fetching cart details:', error);
    return { success: false, error: 'Failed to fetch cart details' };
  }
}

// Get cart for a user
export async function getCartAction(userId: string): Promise<Cart | null> {
  try {
    const db = getFirestore();
    const doc = await db.collection('carts').doc(userId).get();
    
    if (!doc.exists) {
      return null;
    }
    
    const data = doc.data();
    return {
      userId: doc.id,
      items: data?.items || [],
      createdAt: data?.createdAt instanceof Date ? data.createdAt : new Date(),
      updatedAt: data?.updatedAt instanceof Date ? data.updatedAt : new Date(),
    } as Cart;
  } catch (error) {
    console.error('Error fetching cart:', error);
    return null;
  }
}

// Add item to cart
export async function addToCartAction(
  userId: string,
  productId: string,
  quantity: number
): Promise<{ success: boolean; message: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();
    const cartRef = db.collection('carts').doc(userId);
    const cartDoc = await cartRef.get();
    
    if (cartDoc.exists) {
      const cartData = cartDoc.data();
      const items = cartData?.items || [];
      const existingItemIndex = items.findIndex((item: any) => item.productId === productId);
      
      if (existingItemIndex >= 0) {
        items[existingItemIndex].quantity += quantity;
      } else {
        items.push({
          productId,
          quantity,
          addedAt: new Date()
        });
      }
      
      await cartRef.update({
        items,
        updatedAt: new Date()
      });
    } else {
      await cartRef.set({
        items: [{
          productId,
          quantity,
          addedAt: new Date()
        }],
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    revalidatePath('/carts');
    return { success: true, message: 'Item added to cart successfully' };
  } catch (error) {
    console.error('Error adding to cart:', error);
    return { success: false, message: 'Failed to add item to cart' };
  }
}

// Remove item from cart
export async function removeFromCartAction(
  userId: string,
  productId: string
): Promise<{ success: boolean; message: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();
    const cartRef = db.collection('carts').doc(userId);
    const cartDoc = await cartRef.get();
    
    if (!cartDoc.exists) {
      return { success: false, message: 'Cart not found' };
    }
    
    const cartData = cartDoc.data();
    const items = (cartData?.items || []).filter((item: any) => item.productId !== productId);
    
    await cartRef.update({
      items,
      updatedAt: new Date()
    });
    
    revalidatePath('/carts');
    return { success: true, message: 'Item removed from cart successfully' };
  } catch (error) {
    console.error('Error removing from cart:', error);
    return { success: false, message: 'Failed to remove item from cart' };
  }
}

// Update cart item quantity
export async function updateCartItemAction(
  userId: string,
  productId: string,
  quantity: number
): Promise<{ success: boolean; message: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();
    const cartRef = db.collection('carts').doc(userId);
    const cartDoc = await cartRef.get();
    
    if (!cartDoc.exists) {
      return { success: false, message: 'Cart not found' };
    }
    
    const cartData = cartDoc.data();
    const items = cartData?.items || [];
    const itemIndex = items.findIndex((item: any) => item.productId === productId);
    
    if (itemIndex >= 0) {
      if (quantity <= 0) {
        items.splice(itemIndex, 1);
      } else {
        items[itemIndex].quantity = quantity;
      }
      
      await cartRef.update({
        items,
        updatedAt: new Date()
      });
      
      revalidatePath('/carts');
      return { success: true, message: 'Cart updated successfully' };
    }
    
    return { success: false, message: 'Item not found in cart' };
  } catch (error) {
    console.error('Error updating cart:', error);
    return { success: false, message: 'Failed to update cart' };
  }
}

// Clear cart
export async function clearCartAction(userId: string): Promise<{ success: boolean; message: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();
    
    await db.collection('carts').doc(userId).update({
      items: [],
      updatedAt: new Date()
    });
    
    revalidatePath('/carts');
    return { success: true, message: 'Cart cleared successfully' };
  } catch (error) {
    console.error('Error clearing cart:', error);
    return { success: false, message: 'Failed to clear cart' };
  }
}
