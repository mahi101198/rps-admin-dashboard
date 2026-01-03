import { getFirebaseAdmin } from '@/data/firebase.admin';
import { NextResponse } from 'next/server';

async function getCollectionsInfoFromFirestore() {
  try {
    const adminInstance = getFirebaseAdmin();
    if (!adminInstance) {
      throw new Error('Firebase Admin SDK failed to initialize');
    }
    
    const db = adminInstance.firestore();
    if (!db) {
      throw new Error('Firestore failed to initialize');
    }
    
    const collections = await db.listCollections();
    const collectionsInfo = [];
    
    for (const collection of collections) {
      try {
        const snapshot = await collection.limit(5).get();
        const sampleDocs = snapshot.docs.map(doc => ({
          id: doc.id,
          data: doc.data()
        }));
        
        collectionsInfo.push({
          name: collection.id,
          documentCount: snapshot.size,
          sampleDocs: sampleDocs
        });
      } catch (error) {
        collectionsInfo.push({
          name: collection.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return collectionsInfo;
  } catch (error) {
    console.error('Error in getCollectionsInfoFromFirestore:', error);
    throw error;
  }
}

export async function GET() {
  try {
    const collectionsInfo = await getCollectionsInfoFromFirestore();
    return NextResponse.json(collectionsInfo);
  } catch (error) {
    console.error('Error getting collections info:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}