'use server';

import { getFirestore } from '@/data/firebase.admin';
import { revalidatePath } from 'next/cache';
import { Payment, PaymentStatus } from '@/lib/types/all-schemas';
import { withAuth, verifyAuth, AuthError } from '@/lib/auth';

// Get all payments
export async function getPaymentsAction(): Promise<Payment[]> {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('payments')
      .orderBy('timestamps.initiatedAt', 'desc')
      .limit(100)
      .get();
    
    return snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        paymentId: doc.id,
        orderId: data.orderId || '',
        userId: data.userId || '',
        amount: data.amount || 0,
        currency: data.currency || 'INR',
        status: data.status || 'pending',
        paymentMethod: data.paymentMethod || data.method || 'cod',
        transactionId: data.transactionId || null,
        attemptCount: data.attemptCount || 0,
        gateway: data.gateway || null,
        method: data.method || 'cod',
        timestamps: {
          completedAt: data.timestamps?.completedAt instanceof Date 
            ? data.timestamps.completedAt 
            : data.timestamps?.completedAt 
            ? new Date(data.timestamps.completedAt) 
            : null,
          initiatedAt: data.timestamps?.initiatedAt instanceof Date 
            ? data.timestamps.initiatedAt 
            : new Date(),
        },
        updatedAt: data.updatedAt instanceof Date ? data.updatedAt : new Date(),
        amountBreakdown: data.amountBreakdown || null,
        couponInfo: data.couponInfo || null,
        gatewayPaymentId: data.gatewayPaymentId || null,
        paymentDetails: data.paymentDetails || null,
        transactionDetails: data.transactionDetails || null,
      } as Payment;
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return [];
  }
}

// Get payment by ID
export async function getPaymentAction(paymentId: string): Promise<Payment | null> {
  try {
    const db = getFirestore();
    const doc = await db.collection('payments').doc(paymentId).get();
    
    if (!doc.exists) {
      return null;
    }
    
    const data = doc.data();
    return {
      paymentId: doc.id,
      orderId: data?.orderId || '',
      userId: data?.userId || '',
      amount: data?.amount || 0,
      currency: data?.currency || 'INR',
      status: data?.status || 'pending',
      paymentMethod: data?.paymentMethod || data?.method || 'cod',
      transactionId: data?.transactionId || null,
      attemptCount: data?.attemptCount || 0,
      gateway: data?.gateway || null,
      method: data?.method || 'cod',
      timestamps: {
        completedAt: data?.timestamps?.completedAt instanceof Date 
          ? data.timestamps.completedAt 
          : data?.timestamps?.completedAt 
          ? new Date(data.timestamps.completedAt) 
          : null,
        initiatedAt: data?.timestamps?.initiatedAt instanceof Date 
          ? data.timestamps.initiatedAt 
          : new Date(),
      },
      updatedAt: data?.updatedAt instanceof Date ? data.updatedAt : new Date(),
      amountBreakdown: data?.amountBreakdown || null,
      couponInfo: data?.couponInfo || null,
      gatewayPaymentId: data?.gatewayPaymentId || null,
      paymentDetails: data?.paymentDetails || null,
      transactionDetails: data?.transactionDetails || null,
    } as Payment;
  } catch (error) {
    console.error('Error fetching payment:', error);
    return null;
  }
}

// Update payment status
export async function updatePaymentStatusAction(
  paymentId: string,
  status: PaymentStatus
): Promise<{ success: boolean; message: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();
    
    const updateData: any = {
      status,
      'timestamps.updatedAt': new Date(),
      updatedAt: new Date(),
    };
    
    // If status is completed, set the completedAt timestamp
    if (status === 'completed') {
      updateData['timestamps.completedAt'] = new Date();
    }
    
    await db.collection('payments').doc(paymentId).update(updateData);
    
    revalidatePath('/payments');
    return { success: true, message: 'Payment status updated successfully' };
  } catch (error) {
    console.error('Error updating payment status:', error);
    return { success: false, message: 'Failed to update payment status' };
  }
}

// Update payment details
export async function updatePaymentDetailsAction(
  paymentId: string,
  details: Partial<Payment>
): Promise<{ success: boolean; message: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();
    
    const updateData: any = {
      ...details,
      updatedAt: new Date(),
    };
    
    // If status is being changed to completed, set completedAt
    if (details.status === 'completed') {
      updateData['timestamps.completedAt'] = new Date();
    }
    
    await db.collection('payments').doc(paymentId).update(updateData);
    
    revalidatePath('/payments');
    return { success: true, message: 'Payment details updated successfully' };
  } catch (error) {
    console.error('Error updating payment details:', error);
    return { success: false, message: 'Failed to update payment details' };
  }
}

// Delete payment
export async function deletePaymentAction(
  paymentId: string
): Promise<{ success: boolean; message: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();
    
    await db.collection('payments').doc(paymentId).delete();
    
    revalidatePath('/payments');
    return { success: true, message: 'Payment deleted successfully' };
  } catch (error) {
    console.error('Error deleting payment:', error);
    return { success: false, message: 'Failed to delete payment' };
  }
}

// Get payments by order ID
export async function getPaymentsByOrderAction(orderId: string): Promise<Payment[]> {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('payments')
      .where('orderId', '==', orderId)
      .orderBy('timestamps.initiatedAt', 'desc')
      .get();
    
    return snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        paymentId: doc.id,
        orderId: data.orderId || '',
        userId: data.userId || '',
        amount: data.amount || 0,
        currency: data.currency || 'INR',
        status: data.status || 'pending',
        paymentMethod: data.paymentMethod || data.method || 'cod',
        transactionId: data.transactionId || null,
        attemptCount: data.attemptCount || 0,
        gateway: data.gateway || null,
        method: data.method || 'cod',
        timestamps: {
          completedAt: data.timestamps?.completedAt instanceof Date 
            ? data.timestamps.completedAt 
            : data.timestamps?.completedAt 
            ? new Date(data.timestamps.completedAt) 
            : null,
          initiatedAt: data.timestamps?.initiatedAt instanceof Date 
            ? data.timestamps.initiatedAt 
            : new Date(),
        },
        updatedAt: data.updatedAt instanceof Date ? data.updatedAt : new Date(),
        amountBreakdown: data.amountBreakdown || null,
        couponInfo: data.couponInfo || null,
        gatewayPaymentId: data.gatewayPaymentId || null,
        paymentDetails: data.paymentDetails || null,
        transactionDetails: data.transactionDetails || null,
      } as Payment;
    });
  } catch (error) {
    console.error('Error fetching payments by order:', error);
    return [];
  }
}

// Get payments by user ID
export async function getPaymentsByUserAction(userId: string): Promise<Payment[]> {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('payments')
      .where('userId', '==', userId)
      .orderBy('timestamps.initiatedAt', 'desc')
      .get();
    
    return snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        paymentId: doc.id,
        orderId: data.orderId || '',
        userId: data.userId || '',
        amount: data.amount || 0,
        currency: data.currency || 'INR',
        status: data.status || 'pending',
        paymentMethod: data.paymentMethod || data.method || 'cod',
        transactionId: data.transactionId || null,
        attemptCount: data.attemptCount || 0,
        gateway: data.gateway || null,
        method: data.method || 'cod',
        timestamps: {
          completedAt: data.timestamps?.completedAt instanceof Date 
            ? data.timestamps.completedAt 
            : data.timestamps?.completedAt 
            ? new Date(data.timestamps.completedAt) 
            : null,
          initiatedAt: data.timestamps?.initiatedAt instanceof Date 
            ? data.timestamps.initiatedAt 
            : new Date(),
        },
        updatedAt: data.updatedAt instanceof Date ? data.updatedAt : new Date(),
        amountBreakdown: data.amountBreakdown || null,
        couponInfo: data.couponInfo || null,
        gatewayPaymentId: data.gatewayPaymentId || null,
        paymentDetails: data.paymentDetails || null,
        transactionDetails: data.transactionDetails || null,
      } as Payment;
    });
  } catch (error) {
    console.error('Error fetching payments by user:', error);
    return [];
  }
}
