'use server';

import { getFirestore } from '@/data/firebase.admin';
import { revalidatePath } from 'next/cache';
import { Payment } from '@/lib/types/product';
import { withAuth, verifyAuth, AuthError } from '@/lib/auth';

// Safe timestamp conversion
const convertTimestamp = (timestamp: any): Date => {
  if (!timestamp) return new Date();
  if (timestamp instanceof Date) return timestamp;
  if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  if (timestamp._seconds !== undefined) {
    return new Date(timestamp._seconds * 1000);
  }
  return new Date();
};

// Deep convert all timestamps in an object
const deepConvertTimestamps = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;
  
  // Handle Firestore timestamps
  if (obj._seconds !== undefined || (obj.toDate && typeof obj.toDate === 'function')) {
    return convertTimestamp(obj);
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

// Get all payments
export async function getPaymentsAction(): Promise<Payment[]> {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('payments').get();
    
    return snapshot.docs.map((doc: any) => {
      const data: any = doc.data();
      return {
        paymentId: doc.id,
        orderId: data.orderId || '',
        userId: data.userId || '',
        amount: data.amount || 0,
        currency: data.currency || 'INR',
        status: data.status || 'pending',
        paymentMethod: data.paymentMethod || 'upi',
        transactionId: data.transactionId || null,
        attemptCount: data.attemptCount || 0,
        gateway: data.gateway || null,
        method: data.method || '',
        timestamps: {
          completedAt: data.timestamps?.completedAt ? convertTimestamp(data.timestamps.completedAt) : null,
          initiatedAt: data.timestamps?.initiatedAt ? convertTimestamp(data.timestamps.initiatedAt) : new Date(),
        },
        updatedAt: data.updatedAt ? convertTimestamp(data.updatedAt) : new Date(),
        amountBreakdown: data.amountBreakdown ? deepConvertTimestamps(data.amountBreakdown) : null,
        couponInfo: data.couponInfo ? deepConvertTimestamps(data.couponInfo) : null,
        gatewayPaymentId: data.gatewayPaymentId || null,
        paymentDetails: data.paymentDetails ? deepConvertTimestamps(data.paymentDetails) : null,
        transactionDetails: data.transactionDetails ? deepConvertTimestamps(data.transactionDetails) : null,
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
    
    const data: any = doc.data();
    return {
      paymentId: doc.id,
      orderId: data?.orderId || '',
      userId: data?.userId || '',
      amount: data?.amount || 0,
      currency: data?.currency || 'INR',
      status: data?.status || 'pending',
      paymentMethod: data?.paymentMethod || 'upi',
      transactionId: data?.transactionId || null,
      attemptCount: data?.attemptCount || 0,
      gateway: data?.gateway || null,
      method: data?.method || '',
      timestamps: {
        completedAt: data?.timestamps?.completedAt ? convertTimestamp(data.timestamps.completedAt) : null,
        initiatedAt: data?.timestamps?.initiatedAt ? convertTimestamp(data.timestamps.initiatedAt) : new Date(),
      },
      updatedAt: data?.updatedAt ? convertTimestamp(data.updatedAt) : new Date(),
      amountBreakdown: data?.amountBreakdown ? deepConvertTimestamps(data.amountBreakdown) : null,
      couponInfo: data?.couponInfo ? deepConvertTimestamps(data.couponInfo) : null,
      gatewayPaymentId: data?.gatewayPaymentId || null,
      paymentDetails: data?.paymentDetails ? deepConvertTimestamps(data.paymentDetails) : null,
      transactionDetails: data?.transactionDetails ? deepConvertTimestamps(data.transactionDetails) : null,
    } as Payment;
  } catch (error) {
    console.error('Error fetching payment:', error);
    return null;
  }
}

// Get payments by order ID
export async function getPaymentsByOrderAction(orderId: string): Promise<Payment[]> {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('payments')
      .where('orderId', '==', orderId)
      .get();
    
    return snapshot.docs.map((doc: any) => {
      const data: any = doc.data();
      return {
        paymentId: doc.id,
        orderId: data.orderId || '',
        userId: data.userId || '',
        amount: data.amount || 0,
        currency: data.currency || 'INR',
        status: data.status || 'pending',
        paymentMethod: data.paymentMethod || 'upi',
        transactionId: data.transactionId || null,
        attemptCount: data.attemptCount || 0,
        gateway: data.gateway || null,
        method: data.method || '',
        timestamps: {
          completedAt: data.timestamps?.completedAt ? convertTimestamp(data.timestamps.completedAt) : null,
          initiatedAt: data.timestamps?.initiatedAt ? convertTimestamp(data.timestamps.initiatedAt) : new Date(),
        },
        updatedAt: data.updatedAt ? convertTimestamp(data.updatedAt) : new Date(),
        amountBreakdown: data.amountBreakdown ? deepConvertTimestamps(data.amountBreakdown) : null,
        couponInfo: data.couponInfo ? deepConvertTimestamps(data.couponInfo) : null,
        gatewayPaymentId: data.gatewayPaymentId || null,
        paymentDetails: data.paymentDetails ? deepConvertTimestamps(data.paymentDetails) : null,
        transactionDetails: data.transactionDetails ? deepConvertTimestamps(data.transactionDetails) : null,
      } as Payment;
    });
  } catch (error) {
    console.error('Error fetching payments by order:', error);
    return [];
  }
}

// Create payment
export async function createPaymentAction(
  paymentData: Omit<Payment, 'paymentId' | 'timestamps' | 'updatedAt'>
): Promise<{ success: boolean; message: string; paymentId?: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();

    const newPayment = {
      ...paymentData,
      timestamps: {
        initiatedAt: new Date(),
        completedAt: null,
      },
      updatedAt: new Date(),
    };

    const docRef = await db.collection('payments').add(newPayment);
    
    revalidatePath('/payments');
    return { success: true, message: 'Payment created successfully', paymentId: docRef.id };
  } catch (error) {
    console.error('Error creating payment:', error);
    return { success: false, message: 'Failed to create payment' };
  }
}

// Update payment
export async function updatePaymentAction(
  paymentId: string,
  paymentData: Partial<Payment>
): Promise<{ success: boolean; message: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();

    await db.collection('payments').doc(paymentId).update({
      ...paymentData,
      updatedAt: new Date(),
    });
    
    revalidatePath('/payments');
    return { success: true, message: 'Payment updated successfully' };
  } catch (error) {
    console.error('Error updating payment:', error);
    return { success: false, message: 'Failed to update payment' };
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

// Update payment status
export async function updatePaymentStatusAction(
  paymentId: string,
  status: string,
  transactionId?: string
): Promise<{ success: boolean; message: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();

    const updateData: any = {
      status,
      updatedAt: new Date(),
    };
    
    if (transactionId) {
      updateData.transactionId = transactionId;
    }
    
    // If status is successful or failed, set completedAt timestamp
    if (status === 'successful' || status === 'failed') {
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
  paymentData: Partial<Payment>
): Promise<{ success: boolean; message: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();

    await db.collection('payments').doc(paymentId).update({
      ...paymentData,
      updatedAt: new Date(),
    });
    
    revalidatePath('/payments');
    return { success: true, message: 'Payment details updated successfully' };
  } catch (error) {
    console.error('Error updating payment details:', error);
    return { success: false, message: 'Failed to update payment details' };
  }
}