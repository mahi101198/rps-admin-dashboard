import { getFirebaseAdmin } from '@/data/firebase.admin';
import { NextResponse } from 'next/server';

async function testFirebaseConnection() {
  try {
    // Log environment variables for debugging (without sensitive data)
    console.log('Firebase Environment Check:');
    console.log('- Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
    console.log('- Client Email:', process.env.FIREBASE_CLIENT_EMAIL ? 'SET' : 'NOT SET');
    console.log('- Private Key:', process.env.FIREBASE_PRIVATE_KEY ? 'SET' : 'NOT SET');
    console.log('- Database URL:', process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL);
    console.log('- Storage Bucket:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
    
    // Test Firebase initialization
    console.log('Attempting to initialize Firebase Admin SDK...');
    const adminInstance = getFirebaseAdmin();
    if (!adminInstance) {
      throw new Error('Firebase Admin SDK failed to initialize');
    }
    console.log('✅ Firebase Admin SDK initialized successfully');
    
    // Test Firestore connection
    console.log('Attempting to initialize Firestore...');
    const db = adminInstance.firestore();
    if (!db) {
      throw new Error('Firestore failed to initialize');
    }
    console.log('✅ Firestore initialized successfully');
    
    // Test a simple query
    console.log('Testing Firestore query...');
    const testQuery = await db.collection('settings').limit(1).get();
    console.log('✅ Firestore query successful, documents found:', testQuery.size);
    
    return {
      status: 'ok',
      message: 'Firebase connection successful',
      timestamp: new Date().toISOString(),
      details: {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        databaseUrl: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
        documentsFound: testQuery.size
      }
    };
  } catch (error: any) {
    console.error('Error in testFirebaseConnection:', error);
    return {
      status: 'error',
      message: 'Firebase connection failed',
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    };
  }
}

export async function GET() {
  try {
    const result = await testFirebaseConnection();
    const statusCode = result.status === 'ok' ? 200 : 500;
    return NextResponse.json(result, { status: statusCode });
  } catch (error: any) {
    console.error('Health check failed:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}