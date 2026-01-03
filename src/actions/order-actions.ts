'use server';

import { getFirestore } from '@/data/firebase.admin';
import { revalidatePath } from 'next/cache';
import { Order, OrderStatus } from '@/lib/types/product';
import { withAuth, AuthError } from '@/lib/auth';

// Get all orders
export const getOrdersAction = withAuth(async (user) => {
  try {
    const db = getFirestore();
    console.log('[getOrdersAction] Fetching orders from Firestore...');
    
    // Get all orders without orderBy to avoid index issues
    const snapshot = await db.collection('orders').get();
    
    console.log('[getOrdersAction] Fetched', snapshot.docs.length, 'orders');
    
    const orders = snapshot.docs.map(doc => {
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
          total: data.pricing?.total || 0
        },
        status: data.status || 'placed',
        paymentStatus: data.paymentStatus || 'pending',
        paymentId: data.paymentId || undefined,
        paymentMode: data.paymentMode || 'cod',
        timestamps: {
          placedAt: data.timestamps?.placedAt?._seconds ? new Date(data.timestamps.placedAt._seconds * 1000) : new Date(),
          updatedAt: data.timestamps?.updatedAt?._seconds ? new Date(data.timestamps.updatedAt._seconds * 1000) : new Date()
        },
        updatedAt: data.updatedAt?._seconds ? new Date(data.updatedAt._seconds * 1000) : new Date()
      } as Order;
    });
    
    return orders;
  } catch (error) {
    console.error('[getOrdersAction] Error:', error);
    return [];
  }
});

// Get order statistics
export const getOrderStatsAction = withAuth(async (user) => {
  try {
    const db = getFirestore();
    
    // Get all orders (inefficient but works for small datasets)
    const ordersSnapshot = await db.collection('orders').get();
    const orders = ordersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        status: data.status || 'placed',
        totalAmount: data.pricing?.total || 0,
        createdAt: data.timestamps?.placedAt?._seconds ? new Date(data.timestamps.placedAt._seconds * 1000) : new Date()
      };
    });
    
    // Calculate stats
    const stats = {
      total: orders.length,
      placed: orders.filter(o => o.status === 'placed').length,
      confirmed: orders.filter(o => o.status === 'confirmed').length,
      paid: orders.filter(o => o.status === 'paid').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      out_for_delivery: orders.filter(o => o.status === 'out_for_delivery').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
      totalRevenue: orders
        .filter(o => o.status === 'delivered')
        .reduce((sum, order) => sum + order.totalAmount, 0)
    };
    
    return stats;
  } catch (error) {
    console.error('Error fetching order stats:', error);
    return {
      total: 0,
      placed: 0,
      confirmed: 0,
      paid: 0,
      shipped: 0,
      out_for_delivery: 0,
      delivered: 0,
      cancelled: 0,
      totalRevenue: 0
    };
  }
});

// Update order status
export const updateOrderStatusAction = withAuth(async (
  user,
  orderId: string,
  status: OrderStatus
) => {
  try {
    const db = getFirestore();

    await db.collection('orders').doc(orderId).update({
      status,
      'timestamps.updatedAt': new Date()
    });
    
    revalidatePath('/orders');
    return { success: true, message: 'Order status updated successfully' };
  } catch (error) {
    console.error('Error updating order status:', error);
    return { success: false, message: 'Failed to update order status' };
  }
});

// Update payment status
export const updatePaymentStatusAction = withAuth(async (
  user,
  orderId: string,
  paymentStatus: string
) => {
  try {
    const db = getFirestore();

    await db.collection('orders').doc(orderId).update({
      paymentStatus,
      'timestamps.updatedAt': new Date()
    });
    
    revalidatePath('/orders');
    return { success: true, message: 'Payment status updated successfully' };
  } catch (error) {
    console.error('Error updating payment status:', error);
    return { success: false, message: 'Failed to update payment status' };
  }
});

// Delete order
export const deleteOrderAction = withAuth(async (
  user,
  orderId: string
) => {
  try {
    const db = getFirestore();
    
    await db.collection('orders').doc(orderId).delete();
    
    revalidatePath('/orders');
    return { success: true, message: 'Order deleted successfully' };
  } catch (error) {
    console.error('Error deleting order:', error);
    return { success: false, message: 'Failed to delete order' };
  }
});

// Get a single order by ID
export const getOrderByIdAction = withAuth(async (
  user,
  orderId: string
): Promise<Order | null> => {
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
        total: data?.pricing?.total || 0
      },
      status: data?.status || 'placed',
      paymentStatus: data?.paymentStatus || 'pending',
      paymentId: data?.paymentId || undefined,
      paymentMode: data?.paymentMode || 'cod',
      timestamps: {
        placedAt: data?.timestamps?.placedAt?._seconds ? new Date(data.timestamps.placedAt._seconds * 1000) : new Date(),
        updatedAt: data?.timestamps?.updatedAt?._seconds ? new Date(data.timestamps.updatedAt._seconds * 1000) : new Date()
      },
      updatedAt: data?.updatedAt?._seconds ? new Date(data.updatedAt._seconds * 1000) : new Date()
    } as Order;
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
});