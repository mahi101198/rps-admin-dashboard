import { getFirebaseAdmin, getFirestore } from '@/data/firebase.admin';
import { NextResponse } from 'next/server';
import { verifyAuth, AuthError } from '@/lib/auth';
import { dashboardCache } from '@/lib/cache';

export async function GET() {
  try {
    // Verify authentication
    await verifyAuth();
    
    // Check cache first
    const cachedData = dashboardCache.get('stats');
    if (cachedData) {
      return NextResponse.json(cachedData);
    }
    
    // Only initialize Firebase Admin when needed, not at module level
    let db;
    try {
      const firebaseAdmin = getFirebaseAdmin();
      if (!firebaseAdmin) {
        throw new Error('Firebase Admin not initialized');
      }
      db = firebaseAdmin.firestore();
    } catch (error) {
      console.error('Error initializing Firebase Admin:', error);
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Get counts from all collections
    const [usersCount, productsCount, ordersCount, categoriesCount] = await Promise.all([
      db.collection('users').count().get().then(snapshot => snapshot.data().count).catch(() => 0),
      db.collection('products').count().get().then(snapshot => snapshot.data().count).catch(() => 0),
      db.collection('orders').count().get().then(snapshot => snapshot.data().count).catch(() => 0),
      db.collection('categories').count().get().then(snapshot => snapshot.data().count).catch(() => 0)
    ]);

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get recent orders from today
    const recentOrdersSnapshot = await db.collection('orders')
      .where('createdAt', '>=', today)
      .where('createdAt', '<', tomorrow)
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get()
      .catch(() => ({ docs: [] }));

    // Serialize the recent orders data to remove Firestore objects
    const recentOrders = recentOrdersSnapshot.docs.map(doc => {
      const data = doc.data();
      
      // Convert Firestore timestamps to serializable format
      const serializedData: any = {};
      for (const [key, value] of Object.entries(data)) {
        if (value && typeof value === 'object' && '_seconds' in value) {
          // Convert Firestore timestamp to ISO string
          serializedData[key] = new Date((value as any)._seconds * 1000).toISOString();
        } else if (value && typeof value === 'object' && value.constructor.name !== 'Object') {
          // For other non-plain objects, convert to string representation
          serializedData[key] = JSON.parse(JSON.stringify(value));
        } else {
          serializedData[key] = value;
        }
      }
      
      return {
        id: doc.id,
        ...serializedData
      };
    });

    const result = {
      usersCount,
      productsCount,
      ordersCount,
      categoriesCount,
      recentOrders
    };

    // Cache the result for 5 minutes
    dashboardCache.set('stats', result);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}