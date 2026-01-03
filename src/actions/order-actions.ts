'use server';

import { getFirestore } from '@/data/firebase.admin';
import { revalidatePath } from 'next/cache';
import { Order, OrderStatus } from '@/lib/types/all-schemas';
import { withAuth, verifyAuth, AuthError } from '@/lib/auth';

// Get all orders
export async function getOrdersAction(): Promise<Order[]> {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('orders')
      .orderBy('timestamps.placedAt', 'desc')
      .limit(100)
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
    console.error('Error fetching orders:', error);
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
      stats.totalRevenue += data.pricing?.total || 0;
      
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
    return {
      orderId: doc.id,
      userId: data?.userId || '',
      items: data?.items || [],
      deliveryAddress: data?.deliveryAddress || {},
      pricing: {
        deliveryFee: data?.pricing?.deliveryFee || 0,
        discount: data?.pricing?.discount || 0,
        subtotal: data?.pricing?.subtotal || 0,
        tax: data?.pricing?.tax || 0,
        total: data?.pricing?.total || 0,
      },
      status: data?.status || 'placed',
      paymentStatus: data?.paymentStatus || 'pending',
      paymentId: data?.paymentId || '',
      paymentMode: data?.paymentMode || 'cod',
      timestamps: {
        placedAt: data?.timestamps?.placedAt instanceof Date 
          ? data.timestamps.placedAt 
          : new Date(),
        updatedAt: data?.timestamps?.updatedAt instanceof Date 
          ? data.timestamps.updatedAt 
          : new Date(),
      },
      updatedAt: data?.updatedAt instanceof Date ? data.updatedAt : new Date(),
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
