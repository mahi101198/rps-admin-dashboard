import { getFirebaseAdmin } from '@/data/firebase.admin';
import { NextResponse } from 'next/server';
import { verifyAuth } from '@/app/api/utils/auth';

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

export async function GET() {
  try {
    // Verify authentication
    await verifyAuth();
    
    // Try to get Firebase admin, but handle potential initialization errors
    let admin;
    try {
      admin = getFirebaseAdmin();
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
      db = admin.firestore();
    } catch (dbError) {
      console.error('Firestore initialization error:', dbError);
      return NextResponse.json(
        { error: 'Database service unavailable' },
        { status: 503 }
      );
    }
    
    // Add limit and ordering for better performance
    const snapshot = await db.collection('users')
      .orderBy('createdAt', 'desc')
      .limit(100) // Limit to prevent excessive data loading
      .get();
    
    const users = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        userId: doc.id, // Document ID is the userId
        role: data.role || 'customer',
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        profilePicture: data.profilePicture || undefined,
        referralCode: data.referralCode || '',
        referredBy: data.referredBy || null,
        walletBalance: data.walletBalance || 0,
        addresses: data.addresses || [],
        createdAt: convertTimestampToDate(data.createdAt),
        updatedAt: convertTimestampToDate(data.updatedAt)
      };
    });

    return NextResponse.json(users);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}