/**
 * Re-export centralized auth utilities for backward compatibility
 * All new code should import directly from '@/lib/auth'
 */

export { verifyAuth, getOptionalAuth, isAdmin, verifyAdmin, withAuth, AuthError, formatAuthError, type AuthUser } from '@/lib/auth';
