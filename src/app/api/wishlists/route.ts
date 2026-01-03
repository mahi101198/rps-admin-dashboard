import { getFirebaseAdmin } from '@/data/firebase.admin';
import { NextResponse } from 'next/server';
import { Wishlist } from '@/lib/types/all-schemas';

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
    
    const snapshot = await db.collection('wishlists')
      .orderBy('updatedAt', 'desc')
      .get();
    
    const wishlists: Wishlist[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        userId: doc.id, // Document ID is the userId
        items: data.items?.map((item: any) => ({
          productId: item.productId || '',
          addedAt: item.addedAt?._seconds ? new Date(item.addedAt._seconds * 1000) : new Date()
        })) || [],
        updatedAt: data.updatedAt?._seconds ? new Date(data.updatedAt._seconds * 1000) : new Date()
      } as Wishlist;
    });
    
    return NextResponse.json(wishlists);
  } catch (error) {
    console.error('Error fetching wishlists:', error);
    return NextResponse.json({ error: 'Failed to fetch wishlists' }, { status: 500 });
  }
}