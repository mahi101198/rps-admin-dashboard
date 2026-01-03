import { dashboardCache, usersCache, settingsCache } from '@/lib/cache';

// Cache invalidation functions
export function invalidateDashboardCache() {
  dashboardCache.clear();
}

export function invalidateUsersCache() {
  usersCache.clear();
}

export function invalidateSettingsCache() {
  settingsCache.clear();
}

// Generic cache invalidation
export function invalidateCache(cacheName: string) {
  switch (cacheName) {
    case 'dashboard':
      invalidateDashboardCache();
      break;
    case 'users':
      invalidateUsersCache();
      break;
    case 'settings':
      invalidateSettingsCache();
      break;
    default:
      console.warn(`Unknown cache name: ${cacheName}`);
  }
}

// Invalidate all caches
export function invalidateAllCaches() {
  invalidateDashboardCache();
  invalidateUsersCache();
  invalidateSettingsCache();
}