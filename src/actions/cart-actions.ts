'use server';

import { getFirestore } from '@/data/firebase.admin';
import { revalidatePath } from 'next/cache';
import { CartItem, Cart } from '@/lib/types/product';
import { withAuth, verifyAuth, AuthError } from '@/lib/auth';

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

// Get user's cart
export async function getCartAction(userId: string): Promise<Cart | null> {
  try {
    await verifyAuth();
    const db = getFirestore();
    const cartDoc = await db.collection('carts').doc(userId).get();
    
    if (!cartDoc.exists) {
      return null;
    }
    
    const data = cartDoc.data();
    return {
      userId: cartDoc.id,
      items: (data?.items || []).map((item: any) => ({
        ...item,
        addedAt: convertTimestampToDate(item.addedAt)
      })),
      createdAt: convertTimestampToDate(data?.createdAt),
      updatedAt: convertTimestampToDate(data?.updatedAt),
    } as Cart;
  } catch (error) {
    console.error('Error fetching cart:', error);
    return null;
  }
}

// Add item to cart
export async function addToCartAction(
  userId: string,
  item: Omit<CartItem, 'addedAt'>
): Promise<{ success: boolean; message: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();

    const cartRef = db.collection('carts').doc(userId);
    const cartDoc = await cartRef.get();
    
    if (!cartDoc.exists) {
      // Create new cart
      await cartRef.set({
        items: [{
          ...item,
          addedAt: new Date(),
        }],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } else {
      // Update existing cart
      const cartData = cartDoc.data();
      const existingItems = cartData?.items || [];
      
      // Check if item already exists (by productId only since CartItem doesn't have selectedAttributes)
      const existingItemIndex = existingItems.findIndex(
        (cartItem: CartItem) => cartItem.productId === item.productId
      );
      
      if (existingItemIndex >= 0) {
        // Update quantity
        existingItems[existingItemIndex].quantity += item.quantity;
        existingItems[existingItemIndex].addedAt = new Date();
      } else {
        // Add new item
        existingItems.push({
          ...item,
          addedAt: new Date(),
        });
      }
      
      await cartRef.update({
        items: existingItems,
        updatedAt: new Date(),
      });
    }
    
    revalidatePath('/carts');
    return { success: true, message: 'Item added to cart successfully' };
  } catch (error) {
    console.error('Error adding to cart:', error);
    return { success: false, message: 'Failed to add item to cart' };
  }
}

// Update cart item
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
    
    // Find the item to update
    const itemIndex = items.findIndex((item: CartItem) => item.productId === productId);
    
    if (itemIndex < 0) {
      return { success: false, message: 'Item not found in cart' };
    }
    
    // Update quantity
    items[itemIndex].quantity = quantity;
    items[itemIndex].addedAt = new Date();
    
    await cartRef.update({
      items,
      updatedAt: new Date(),
    });
    
    revalidatePath('/carts');
    return { success: true, message: 'Cart item updated successfully' };
  } catch (error) {
    console.error('Error updating cart item:', error);
    return { success: false, message: 'Failed to update cart item' };
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
    const items = cartData?.items || [];
    
    // Filter out the item to remove
    const updatedItems = items.filter((item: CartItem) => item.productId !== productId);
    
    await cartRef.update({
      items: updatedItems,
      updatedAt: new Date(),
    });
    
    revalidatePath('/carts');
    return { success: true, message: 'Item removed from cart successfully' };
  } catch (error) {
    console.error('Error removing from cart:', error);
    return { success: false, message: 'Failed to remove item from cart' };
  }
}

// Clear cart
export async function clearCartAction(userId: string): Promise<{ success: boolean; message: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();

    await db.collection('carts').doc(userId).update({
      items: [],
      updatedAt: new Date(),
    });
    
    revalidatePath('/carts');
    return { success: true, message: 'Cart cleared successfully' };
  } catch (error) {
    console.error('Error clearing cart:', error);
    return { success: false, message: 'Failed to clear cart' };
  }
}

// Get all carts with user and product details
export async function getAllCartsAction(): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();
    
    // Get all carts
    const cartsSnapshot = await db.collection('carts').get();
    
    // Get all users
    const usersSnapshot = await db.collection('users').get();
    const usersMap = new Map();
    usersSnapshot.docs.forEach(doc => {
      usersMap.set(doc.id, doc.data());
    });
    
    // Get all products
    const productsSnapshot = await db.collection('products').get();
    const productsMap = new Map();
    productsSnapshot.docs.forEach(doc => {
      // Convert all timestamps in product data
      const productData = doc.data();
      productsMap.set(doc.id, deepConvertTimestamps(productData));
    });
    
    // Process carts with user and product information
    const cartDetails = await Promise.all(cartsSnapshot.docs.map(async (cartDoc) => {
      const cartData: any = cartDoc.data();
      const userId = cartDoc.id;
      const user = usersMap.get(userId);
      
      // Calculate cart totals
      let totalItems = 0;
      let totalValue = 0;
      
      const itemsWithDetails = (cartData?.items || []).map((item: any) => {
        const product = productsMap.get(item.productId);
        const quantity = item.quantity || 0;
        const price = product?.price || 0;
        const subtotal = quantity * price;
        
        totalItems += quantity;
        totalValue += subtotal;
        
        return {
          ...item,
          addedAt: convertTimestampToDate(item.addedAt),
          product,
          subtotal
        };
      });
      
      return {
        userId,
        userInfo: user ? {
          firstName: user.name?.split(' ')[0] || '',
          lastName: user.name?.split(' ').slice(1).join(' ') || '',
          email: user.email || '',
          phone: user.phone || ''
        } : null,
        items: itemsWithDetails,
        totalItems,
        totalValue,
        createdAt: convertTimestampToDate(cartData?.createdAt),
        updatedAt: convertTimestampToDate(cartData?.updatedAt),
      };
    }));
    
    return { success: true, data: cartDetails };
  } catch (error) {
    console.error('Error fetching all carts:', error);
    return { success: false, error: 'Failed to fetch carts' };
  }
}

// Get detailed cart information for a specific user
export async function getCartDetailsAction(userId: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();
    
    // Get the cart
    const cartDoc = await db.collection('carts').doc(userId).get();
    if (!cartDoc.exists) {
      return { success: false, error: 'Cart not found' };
    }
    
    const cartData: any = cartDoc.data();
    
    // Get the user
    const userDoc = await db.collection('users').doc(userId).get();
    const user = userDoc.exists ? userDoc.data() : null;
    
    // Get products for cart items
    const productRefs = (cartData?.items || []).map((item: any) => 
      db.collection('products').doc(item.productId)
    );
    
    const productDocs = productRefs.length > 0 
      ? await db.getAll(...productRefs) 
      : [];
      
    const productsMap = new Map();
    productDocs.forEach(doc => {
      if (doc.exists) {
        // Convert all timestamps in product data
        const productData = doc.data();
        productsMap.set(doc.id, deepConvertTimestamps(productData));
      }
    });
    
    // Process items with product details
    const productDetails = (cartData?.items || []).map((item: any) => {
      const product = productsMap.get(item.productId);
      return {
        ...item,
        addedAt: convertTimestampToDate(item.addedAt),
        name: product?.name || 'Unknown Product',
        price: product?.price || 0,
        image: product?.image || '',
        subtotal: (item.quantity || 0) * (product?.price || 0)
      };
    });
    
    const totalItems = productDetails.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
    const totalValue = productDetails.reduce((sum: number, item: any) => sum + (item.subtotal || 0), 0);
    
    return {
      success: true,
      data: {
        userId,
        userInfo: user ? {
          firstName: user.name?.split(' ')[0] || '',
          lastName: user.name?.split(' ').slice(1).join(' ') || '',
          email: user.email || '',
          phone: user.phone || ''
        } : null,
        items: (cartData?.items || []).map((item: any) => ({
          ...item,
          addedAt: convertTimestampToDate(item.addedAt)
        })),
        productDetails,
        totalItems,
        totalValue,
        createdAt: convertTimestampToDate(cartData?.createdAt),
        updatedAt: convertTimestampToDate(cartData?.updatedAt),
      }
    };
  } catch (error) {
    console.error('Error fetching cart details:', error);
    return { success: false, error: 'Failed to fetch cart details' };
  }
}
