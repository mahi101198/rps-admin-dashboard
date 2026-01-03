// Simple in-memory cache utility
class SimpleCache<T> {
  private cache: Map<string, { value: T; timestamp: number }> = new Map();
  private defaultTtl: number;

  constructor(defaultTtl: number = 5 * 60 * 1000) { // 5 minutes default
    this.defaultTtl = defaultTtl;
  }

  set(key: string, value: T, ttl?: number): void {
    const expiration = Date.now() + (ttl || this.defaultTtl);
    this.cache.set(key, { value, timestamp: expiration });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    if (Date.now() > item.timestamp) {
      // Expired
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }
}

// Create instances for different types of data
export const dashboardCache = new SimpleCache<any>(5 * 60 * 1000); // 5 minutes
export const usersCache = new SimpleCache<any>(5 * 60 * 1000); // 5 minutes
export const settingsCache = new SimpleCache<any>(10 * 60 * 1000); // 10 minutes

export { SimpleCache };