/**
 * Centralized Authentication Utilities
 * 
 * This module provides a unified auth system for the entire application.
 * It handles both client-side and server-side authentication with Firebase.
 */

import { cookies } from 'next/headers';
import admin from 'firebase-admin';
import { getFirebaseAdmin } from '@/data/firebase.admin';

export interface AuthUser {
  uid: string;
  email: string | undefined;
  displayName?: string | null;
  role?: string;
}

export class AuthError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Verify authentication token from cookies (Server-side only)
 * This is the centralized auth verification function used by all server actions and API routes
 * 
 * @throws {AuthError} If authentication fails
 * @returns {Promise<AuthUser>} The authenticated user
 */
export async function verifyAuth(): Promise<AuthUser> {
  try {
    // Ensure Firebase Admin is initialized
    getFirebaseAdmin();
    
    const cookieStore = await cookies();
    const token = cookieStore.get('__session')?.value;
    
    if (!token) {
      throw new AuthError('No authentication token found. Please log in.', 'no-token');
    }
    
    // Verify the token with Firebase Admin SDK
    // checkRevoked is set to true to ensure the token hasn't been revoked
    const decodedToken = await admin.auth().verifyIdToken(token, true);
    
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      displayName: decodedToken.name,
      role: decodedToken.role
    };
  } catch (error) {
    // Handle AuthError instances
    if (error instanceof AuthError) {
      throw error;
    }
    
    // Handle Firebase-specific auth errors
    if (error && typeof error === 'object' && 'code' in error) {
      const firebaseError = error as { code: string; message: string };
      
      switch (firebaseError.code) {
        case 'auth/id-token-expired':
          throw new AuthError('Your session has expired. Please log in again.', 'token-expired');
        case 'auth/id-token-revoked':
          throw new AuthError('Your session has been revoked. Please log in again.', 'token-revoked');
        case 'auth/argument-error':
          throw new AuthError('Invalid authentication token. Please log in again.', 'invalid-token');
        case 'auth/user-disabled':
          throw new AuthError('Your account has been disabled.', 'user-disabled');
        case 'auth/user-not-found':
          throw new AuthError('User account not found. Please log in again.', 'user-not-found');
        default:
          throw new AuthError(
            `Authentication failed: ${firebaseError.message}`,
            firebaseError.code
          );
      }
    }
    
    // Handle general errors
    const message = error instanceof Error ? error.message : 'Unknown authentication error';
    throw new AuthError(`Authentication failed: ${message}`, 'unknown-error');
  }
}

/**
 * Optional authentication - returns null if not authenticated instead of throwing
 * Useful for endpoints that work differently for authenticated vs non-authenticated users
 * 
 * @returns {Promise<AuthUser | null>} The authenticated user or null
 */
export async function getOptionalAuth(): Promise<AuthUser | null> {
  try {
    return await verifyAuth();
  } catch (error) {
    // Return null instead of throwing
    return null;
  }
}

/**
 * Check if a user has admin role
 * 
 * @param {AuthUser} user - The authenticated user
 * @returns {boolean} True if user is admin
 */
export function isAdmin(user: AuthUser): boolean {
  return user.role === 'admin';
}

/**
 * Verify admin role - throws if user is not admin
 * 
 * @throws {AuthError} If user is not an admin
 * @returns {Promise<AuthUser>} The authenticated admin user
 */
export async function verifyAdmin(): Promise<AuthUser> {
  const user = await verifyAuth();
  
  if (!isAdmin(user)) {
    throw new AuthError('Access denied. Admin privileges required.', 'insufficient-permissions');
  }
  
  return user;
}

/**
 * Wrapper for server actions with automatic auth verification
 * Handles auth errors and provides user context to the action
 * 
 * @param {Function} action - The server action to wrap
 * @param {Object} options - Options for the wrapper
 * @returns {Function} Wrapped action with auth
 */
export function withAuth<TArgs extends any[], TReturn>(
  action: (user: AuthUser, ...args: TArgs) => Promise<TReturn>,
  options: { requireAdmin?: boolean } = {}
): (...args: TArgs) => Promise<TReturn> {
  return async (...args: TArgs): Promise<TReturn> => {
    try {
      // Verify authentication
      const user = options.requireAdmin 
        ? await verifyAdmin()
        : await verifyAuth();
      
      // Execute the action with user context
      return await action(user, ...args);
    } catch (error) {
      // Re-throw AuthError instances
      if (error instanceof AuthError) {
        throw error;
      }
      
      // Wrap other errors
      throw error;
    }
  };
}

/**
 * Format auth error for client display
 * 
 * @param {unknown} error - The error to format
 * @returns {string} User-friendly error message
 */
export function formatAuthError(error: unknown): string {
  if (error instanceof AuthError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
}

