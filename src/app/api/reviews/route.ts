import { getFirebaseAdmin } from '@/data/firebase.admin';
import { NextResponse } from 'next/server';
import { ProductReview } from '@/lib/types/product';

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
    
    const snapshot = await db.collection('reviews')
      .orderBy('createdAt', 'desc')
      .get();
    
    const reviews: ProductReview[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        reviewId: doc.id,
        productId: data.productId || data.orderId || '',
        userId: data.userId || '',
        rating: data.rating || 1,
        comment: data.comment || '',
        images: data.images || [],
        createdAt: data.createdAt?._seconds ? new Date(data.createdAt._seconds * 1000) : new Date(),
        updatedAt: data.updatedAt?._seconds ? new Date(data.updatedAt._seconds * 1000) : new Date()
      } as ProductReview;
    });
    
    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}