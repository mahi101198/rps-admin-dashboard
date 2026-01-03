import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/data/firebase.admin';
import { verifyAuth, AuthError } from '@/lib/auth';

// Helper function to safely convert Firestore timestamp to Date
function convertTimestampToDate(timestamp: any): Date | null {
  if (!timestamp) return null;
  
  // If it's already a Date object
  if (timestamp instanceof Date) {
    return timestamp;
  }
  
  // If it's a Firestore timestamp object with _seconds
  if (typeof timestamp === 'object' && '_seconds' in timestamp) {
    return new Date(timestamp._seconds * 1000);
  }
  
  // If it's a string, try to parse it
  if (typeof timestamp === 'string') {
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? null : date;
  }
  
  // If it's a number (timestamp)
  if (typeof timestamp === 'number') {
    return new Date(timestamp);
  }
  
  return null;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    await verifyAuth();
    
    const { userId } = await context.params;
    
    // Try to get Firebase admin, but handle potential initialization errors
    let adminInstance;
    try {
      adminInstance = getFirebaseAdmin();
    } catch (firebaseError) {
      console.error('Firebase initialization error:', firebaseError);
      return NextResponse.json(
        { error: 'Firebase service unavailable' },
        { status: 503 }
      );
    }
    
    // Get Firestore instance
    let db;
    try {
      db = adminInstance.firestore();
    } catch (dbError) {
      console.error('Firestore initialization error:', dbError);
      return NextResponse.json(
        { error: 'Database service unavailable' },
        { status: 503 }
      );
    }
    
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const userData = userDoc.data();
    
    // Combine firstName and lastName into a single name field
    const name = `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim();
    
    return NextResponse.json({
      userId: userDoc.id,
      name: name || userData?.name || '',
      email: userData?.email || '',
      phone: userData?.phone || userData?.phoneNumber || '',
      role: userData?.role || 'customer',
      walletBalance: userData?.walletBalance || 0,
      profilePicture: userData?.profilePicture || undefined,
      referralCode: userData?.referralCode || '',
      referredBy: userData?.referredBy || null,
      addresses: userData?.addresses || [],
      createdAt: convertTimestampToDate(userData?.createdAt),
      updatedAt: convertTimestampToDate(userData?.updatedAt)
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch user' },
      { status: 500 }
    );
  }
}