import admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';

// Global variables to store initialized instances
let initializedAdmin: admin.app.App | null = null;
let initializedFirestore: FirebaseFirestore.Firestore | null = null;
let initializationAttempted = false;

// Validate required environment variables
function validateEnvVars() {
  // Get environment variables and clean them up
  let projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  let clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  let privateKey = process.env.FIREBASE_PRIVATE_KEY?.trim();
  let databaseURL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL?.trim();
  let storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim();

  // Clean up all values - remove quotes and fix newlines
  const cleanValue = (value: string | undefined): string | undefined => {
    if (!value) return value;
    
    // Remove surrounding quotes if present
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    
    // Replace literal \n with actual newlines (for private key)
    value = value.replace(/\\n/g, '\n');
    
    // Remove any trailing newlines or whitespace
    value = value.trim();
    
    return value;
  };

  projectId = cleanValue(projectId);
  clientEmail = cleanValue(clientEmail);
  privateKey = cleanValue(privateKey);
  databaseURL = cleanValue(databaseURL);
  storageBucket = cleanValue(storageBucket);

  const required = {
    projectId,
    clientEmail,
    privateKey,
    databaseURL,
    storageBucket,
  };

  const missing = Object.entries(required)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    // In production, we should have these variables
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ Missing required Firebase environment variables in production:', missing);
      // Instead of throwing an error, return null to allow lazy initialization
      return null;
    }
    
    // In development, we can use default initialization
    console.warn('⚠️ Missing Firebase environment variables (using default initialization):', missing);
    return null;
  }

  // Check if we're using placeholder values in development
  if (process.env.NODE_ENV !== 'production' && privateKey?.includes('YOUR_PRIVATE_KEY_HERE')) {
    console.warn('⚠️ Firebase private key is a placeholder value (using default initialization)');
    return null;
  }

  // Validate database URL format
  if (databaseURL) {
    // Remove any internal newlines or illegal characters from database URL
    databaseURL = databaseURL.replace(/\n/g, '').replace(/\r/g, '').replace(/\t/g, '').trim();
    
    // Check if it's a valid Firebase database URL
    if (!databaseURL.startsWith('https://') && !databaseURL.includes('projects/')) {
      console.warn('⚠️ Invalid Firebase database URL format:', databaseURL);
      return null;
    }
  }

  return required;
}

export function getFirebaseAdmin(): admin.app.App {
  // Return existing instance if already initialized
  if (initializedAdmin) {
    return initializedAdmin!;
  }

  // Check if Firebase is already initialized
  if (admin.apps.length > 0) {
    initializedAdmin = admin.apps[0];
    return initializedAdmin!;
  }

  // Prevent multiple initialization attempts
  if (initializationAttempted) {
    throw new Error('Firebase Admin SDK initialization already attempted and failed');
  }

  initializationAttempted = true;

  // Validate environment variables when actually initializing
  const envVars = validateEnvVars();
  
  if (envVars) {
    try {
      // Log the database URL for debugging (without sensitive information)
      console.log('Initializing Firebase with database URL:', envVars.databaseURL?.split('?')[0]);
      
      // Use service account credentials when available
      const serviceAccount: ServiceAccount = {
        projectId: envVars.projectId!,
        clientEmail: envVars.clientEmail!,
        // Handle private key formatting issues
        privateKey: envVars.privateKey!.replace(/\\n/g, '\n'),
      };

      initializedAdmin = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: envVars.databaseURL!,
        storageBucket: envVars.storageBucket,
      });
      
      console.log('✅ Firebase Admin SDK initialized with service account credentials');
      return initializedAdmin!;
    } catch (error) {
      // Log the specific error for debugging
      console.error('❌ Error initializing Firebase with service account:', error);
      
      // In production, we should not fallback
      if (process.env.NODE_ENV === 'production') {
        console.error('❌ Error initializing Firebase with service account in production:', error);
        throw error;
      }
      
      // In development, we can fallback to default initialization
      console.error('Error initializing Firebase with service account (falling back to default):', error);
      try {
        initializedAdmin = admin.initializeApp();
        console.log('✅ Firebase Admin SDK initialized with default credentials (fallback)');
        return initializedAdmin!;
      } catch (fallbackError) {
        console.error('❌ Error initializing Firebase with default credentials:', fallbackError);
        throw fallbackError;
      }
    }
  } else {
    // Fall back to default initialization (development only)
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Firebase Admin SDK not properly configured for production');
    }
    
    console.log('Initializing Firebase with default credentials (development mode)');
    try {
      initializedAdmin = admin.initializeApp();
      console.log('✅ Firebase Admin SDK initialized with default credentials');
      return initializedAdmin!;
    } catch (error) {
      console.error('❌ Error initializing Firebase with default credentials:', error);
      throw error;
    }
  }
}

export function getFirestore() {
  // Return existing instance if already initialized
  if (initializedFirestore) {
    return initializedFirestore;
  }

  try {
    const firebaseAdmin = getFirebaseAdmin();
    if (!firebaseAdmin) {
      throw new Error('Firebase Admin SDK failed to initialize');
    }
    
    initializedFirestore = firebaseAdmin.firestore();
    
    // Set Firestore settings to avoid SSL issues (only if not already set)
    try {
      const settings: FirebaseFirestore.Settings = {
        ssl: true,
        ignoreUndefinedProperties: true,
      };
      
      // Force REST API if environment variable is set or if we're in a production environment
      if (process.env.FIREBASE_USE_REST_API === 'true' || process.env.NODE_ENV === 'production') {
        console.log('🔧 Forcing REST API for Firestore');
        settings.preferRest = true;
      }
      
      initializedFirestore.settings(settings);
    } catch (settingsError) {
      // If settings() fails because it was already called, that's fine
      console.log('Firestore settings already initialized, continuing...');
    }
    
    return initializedFirestore;
  } catch (error) {
    console.error('Error getting Firestore instance:', error);
    throw error;
  }
}

// Initialize storage bucket if we have the storage bucket name
export function getStorageBucket() {
  try {
    const firebaseAdmin = getFirebaseAdmin();
    if (!firebaseAdmin) {
      throw new Error('Firebase Admin SDK failed to initialize');
    }
    
    const envVars = validateEnvVars();
    
    // Only initialize storage bucket if we have a valid storage bucket name
    if (envVars?.storageBucket) {
      return firebaseAdmin.storage().bucket();
    } else {
      console.warn('Firebase storage bucket not configured - storage features will be disabled');
      return null;
    }
  } catch (error) {
    console.warn('Firebase storage bucket not available:', error);
    return null;
  }
}

export default admin;