import { getFirebaseAdmin, getFirestore } from '@/data/firebase.admin';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Testing Firebase connection from Next.js API route...');
    
    // Test Firebase Admin
    const admin = getFirebaseAdmin();
    console.log('✅ Firebase Admin SDK initialized:', !!admin);
    
    // Test Firestore
    const db = getFirestore();
    console.log('✅ Firestore initialized:', !!db);
    
    // Test a simple query
    console.log('Attempting Firestore query...');
    const snapshot = await db.collection('settings').limit(1).get();
    console.log('✅ Firestore query successful, documents found:', snapshot.size);
    
    return NextResponse.json({
      success: true,
      message: 'Firebase connection test successful',
      documentsFound: snapshot.size
    });
  } catch (error: any) {
    console.error('Firebase test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}