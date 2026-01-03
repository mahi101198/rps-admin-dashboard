import { getFirebaseAdmin } from '@/data/firebase.admin';
import { NextResponse } from 'next/server';
import { Referral } from '@/lib/types/product';

export async function GET() {
  try {
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
    
    const snapshot = await db.collection('referrals')
      .orderBy('createdAt', 'desc')
      .get();
    
    const referrals: Referral[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        referralId: doc.id,
        referrerId: data.referrerId || data.referrerUserId || '',
        referredUserId: data.referredUserId || '',
        rewardAmount: data.rewardAmount || 0,
        status: data.status || 'pending',
        createdAt: data.createdAt?._seconds ? new Date(data.createdAt._seconds * 1000) : new Date(),
        completedAt: data.completedAt?._seconds ? new Date(data.completedAt._seconds * 1000) : null
      } as Referral;
    });
    
    return NextResponse.json(referrals);
  } catch (error) {
    console.error('Error fetching referrals:', error);
    return NextResponse.json({ error: 'Failed to fetch referrals' }, { status: 500 });
  }
}