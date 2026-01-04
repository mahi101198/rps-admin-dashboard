'use server';

import { getFirestore } from '@/data/firebase.admin';
import { revalidatePath } from 'next/cache';
import { Order, OrderStatus } from '@/lib/types/all-schemas';
import { withAuth, verifyAuth, AuthError } from '@/lib/auth';

// Get all orders
export async function getOrdersAction(): Promise<Order[]> {
  try {
    console.log('Fetching orders...');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Firebase Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
    
    const db = getFirestore();
    
    // First, let's check ALL collections to verify connection
    try {
      const allCollections = await db.listCollections();
      console.log('Available collections:', allCollections.map(c => c.id).join(', '));
    } catch (listError: any) {
      console.warn('Could not list collections:', listError.message);
    }
    
    // Use simple query without orderBy since it's causing issues
    // We'll sort on the client side instead
    let snapshot;
    try {
      console.log('Fetching orders without orderBy...');
      snapshot = await db.collection('orders')
        .limit(100)
        .get();
      console.log('Orders fetched successfully, count:', snapshot.size);
    } catch (fetchError: any) {
      console.error('Failed to fetch orders:', fetchError.message);
      throw fetchError;
    }
    
    // If we have 0 orders, let's check if the collection exists at all
    if (snapshot.size === 0) {
      console.warn('⚠️ No orders found in the database!');
      console.warn('Database path: projects/' + process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID + '/databases/(default)/documents/orders');
      
      // Try to get a single document to verify collection exists
      const testSnapshot = await db.collection('orders').limit(1).get();
      console.log('Test query result - Empty:', testSnapshot.empty, 'Size:', testSnapshot.size);
    }
    
    const orders = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      
      // Helper function to convert Firestore Timestamp to Date
      const toDate = (timestamp: any): Date => {
        if (!timestamp) return new Date();
        if (timestamp instanceof Date) return timestamp;
        if (timestamp.toDate && typeof timestamp.toDate === 'function') {
          return timestamp.toDate();
        }
        if (timestamp._seconds) {
          return new Date(timestamp._seconds * 1000);
        }
        return new Date();
      };
      
      // Debug: Log pricing data and all available fields
      if (doc.id) {
        console.log(`Order ${doc.id.slice(-6)} amountBreakdown:`, data.amountBreakdown);
      }
      
      return {
        orderId: doc.id,
        userId: data.userId || '',
        items: data.items || [],
        deliveryAddress: data.deliveryInfo?.address || {},
        pricing: {
          deliveryFee: data.amountBreakdown?.deliveryFee || 0,
          discount: data.amountBreakdown?.discount || 0,
          subtotal: data.amountBreakdown?.subTotal || 0,
          tax: data.amountBreakdown?.taxAmount || 0,
          total: data.amountBreakdown?.finalAmount || data.amountBreakdown?.totalOrderAmount || 0,
        },
        status: data.status || 'placed',
        paymentStatus: data.paymentStatus || 'pending',
        paymentId: data.paymentId || '',
        paymentMode: data.paymentMode || 'cod',
        timestamps: {
          placedAt: toDate(data.createdAt),
          updatedAt: toDate(data.timestamps?.updatedAt || data.updatedAt),
        },
        updatedAt: toDate(data.timestamps?.updatedAt || data.updatedAt),
      } as Order;
    });
    
    console.log('Orders processed successfully:', orders.length);
    return orders;
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    console.error('Error details:', error.message, error.code);
    return [];
  }
}

// Get order statistics
export async function getOrderStatsAction(): Promise<{
  total: number;
  totalOrders: number;
  totalRevenue: number;
  placed: number;
  confirmed: number;
  paid: number;
  shipped: number;
  out_for_delivery: number;
  delivered: number;
  cancelled: number;
  pendingOrders: number;
  deliveredOrders: number;
}> {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('orders').get();
    
    const stats = {
      total: snapshot.size,
      totalOrders: snapshot.size,
      totalRevenue: 0,
      placed: 0,
      confirmed: 0,
      paid: 0,
      shipped: 0,
      out_for_delivery: 0,
      delivered: 0,
      cancelled: 0,
      pendingOrders: 0,
      deliveredOrders: 0,
    };
    
    snapshot.forEach((doc: any) => {
      const data = doc.data();
      // Use amountBreakdown instead of pricing
      stats.totalRevenue += data.amountBreakdown?.finalAmount || data.amountBreakdown?.totalOrderAmount || 0;
      
      // Count by status
      const status = data.status || 'placed';
      switch (status) {
        case 'placed':
          stats.placed++;
          break;
        case 'confirmed':
          stats.confirmed++;
          break;
        case 'paid':
          stats.paid++;
          break;
        case 'shipped':
          stats.shipped++;
          break;
        case 'out_for_delivery':
          stats.out_for_delivery++;
          break;
        case 'delivered':
          stats.delivered++;
          stats.deliveredOrders++;
          break;
        case 'cancelled':
          stats.cancelled++;
          break;
      }
      
      // Count pending orders (not delivered or cancelled)
      if (['placed', 'confirmed', 'paid', 'shipped', 'out_for_delivery'].includes(status)) {
        stats.pendingOrders++;
      }
    });
    
    return stats;
  } catch (error) {
    console.error('Error fetching order stats:', error);
    return {
      total: 0,
      totalOrders: 0,
      totalRevenue: 0,
      placed: 0,
      confirmed: 0,
      paid: 0,
      shipped: 0,
      out_for_delivery: 0,
      delivered: 0,
      cancelled: 0,
      pendingOrders: 0,
      deliveredOrders: 0,
    };
  }
}

// Get order by ID
export async function getOrderAction(orderId: string): Promise<Order | null> {
  try {
    const db = getFirestore();
    const doc = await db.collection('orders').doc(orderId).get();
    
    if (!doc.exists) {
      return null;
    }
    
    const data = doc.data();
    
    // Helper function to convert Firestore Timestamp to Date
    const toDate = (timestamp: any): Date => {
      if (!timestamp) return new Date();
      if (timestamp instanceof Date) return timestamp;
      if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        return timestamp.toDate();
      }
      if (timestamp._seconds) {
        return new Date(timestamp._seconds * 1000);
      }
      return new Date();
    };
    
    return {
      orderId: doc.id,
      userId: data?.userId || '',
      items: data?.items || [],
      deliveryAddress: data?.deliveryInfo?.address || {},
      pricing: {
        deliveryFee: data?.amountBreakdown?.deliveryFee || 0,
        discount: data?.amountBreakdown?.discount || 0,
        subtotal: data?.amountBreakdown?.subTotal || 0,
        tax: data?.amountBreakdown?.taxAmount || 0,
        total: data?.amountBreakdown?.finalAmount || data?.amountBreakdown?.totalOrderAmount || 0,
      },
      status: data?.status || 'placed',
      paymentStatus: data?.paymentStatus || 'pending',
      paymentId: data?.paymentId || '',
      paymentMode: data?.paymentMode || 'cod',
      timestamps: {
        placedAt: toDate(data?.createdAt),
        updatedAt: toDate(data?.timestamps?.updatedAt || data?.updatedAt),
      },
      updatedAt: toDate(data?.timestamps?.updatedAt || data?.updatedAt),
    } as Order;
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
}

// Update order status
export async function updateOrderStatusAction(
  orderId: string,
  status: OrderStatus
): Promise<{ success: boolean; message: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();
    
    await db.collection('orders').doc(orderId).update({
      status,
      'timestamps.updatedAt': new Date(),
      updatedAt: new Date(),
    });
    
    revalidatePath('/orders');
    return { success: true, message: 'Order status updated successfully' };
  } catch (error) {
    console.error('Error updating order status:', error);
    return { success: false, message: 'Failed to update order status' };
  }
}

// Update payment status
export async function updatePaymentStatusAction(
  orderId: string,
  paymentStatus: string
): Promise<{ success: boolean; message: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();
    
    await db.collection('orders').doc(orderId).update({
      paymentStatus,
      'timestamps.updatedAt': new Date(),
      updatedAt: new Date(),
    });
    
    revalidatePath('/orders');
    return { success: true, message: 'Payment status updated successfully' };
  } catch (error) {
    console.error('Error updating payment status:', error);
    return { success: false, message: 'Failed to update payment status' };
  }
}

// Delete order
export async function deleteOrderAction(
  orderId: string
): Promise<{ success: boolean; message: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();
    
    await db.collection('orders').doc(orderId).delete();
    
    revalidatePath('/orders');
    return { success: true, message: 'Order deleted successfully' };
  } catch (error) {
    console.error('Error deleting order:', error);
    return { success: false, message: 'Failed to delete order' };
  }
}

// Create order (for admin to manually create orders)
export async function createOrderAction(
  orderData: Omit<Order, 'orderId' | 'timestamps' | 'updatedAt'>
): Promise<{ success: boolean; message: string; orderId?: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();
    
    const newOrder = {
      ...orderData,
      timestamps: {
        placedAt: new Date(),
        updatedAt: new Date(),
      },
      updatedAt: new Date(),
    };
    
    const docRef = await db.collection('orders').add(newOrder);
    
    revalidatePath('/orders');
    return { success: true, message: 'Order created successfully', orderId: docRef.id };
  } catch (error) {
    console.error('Error creating order:', error);
    return { success: false, message: 'Failed to create order' };
  }
}

// Get orders by user ID
export async function getOrdersByUserAction(userId: string): Promise<Order[]> {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('orders')
      .where('userId', '==', userId)
      .orderBy('timestamps.placedAt', 'desc')
      .get();
    
    return snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        orderId: doc.id,
        userId: data.userId || '',
        items: data.items || [],
        deliveryAddress: data.deliveryAddress || {},
        pricing: {
          deliveryFee: data.pricing?.deliveryFee || 0,
          discount: data.pricing?.discount || 0,
          subtotal: data.pricing?.subtotal || 0,
          tax: data.pricing?.tax || 0,
          total: data.pricing?.total || 0,
        },
        status: data.status || 'placed',
        paymentStatus: data.paymentStatus || 'pending',
        paymentId: data.paymentId || '',
        paymentMode: data.paymentMode || 'cod',
        timestamps: {
          placedAt: data.timestamps?.placedAt instanceof Date 
            ? data.timestamps.placedAt 
            : new Date(),
          updatedAt: data.timestamps?.updatedAt instanceof Date 
            ? data.timestamps.updatedAt 
            : new Date(),
        },
        updatedAt: data.updatedAt instanceof Date ? data.updatedAt : new Date(),
      } as Order;
    });
  } catch (error) {
    console.error('Error fetching orders by user:', error);
    return [];
  }
}
