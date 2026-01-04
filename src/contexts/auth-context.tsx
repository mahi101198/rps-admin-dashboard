'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';

// Import Firebase auth methods directly
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, getIdToken } from 'firebase/auth';

// Import the auth instance
import { auth } from '@/lib/firebase.client';

// Auth module loaded

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());
  
  const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds

  useEffect(() => {
    // If auth is not available, set loading to false and user to null
    if (!auth) {
      setLoading(false);
      return;
    }

    // Set up the auth state change listener
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      setUser(user);
      
      // Store/remove auth token in cookie for server-side verification
      if (user) {
        try {
          // Get a fresh token
          const token = await getIdToken(user, true);
          if (token) {
            // Use Secure flag only in production (https), not in development (localhost)
            const isProduction = window.location.protocol === 'https:';
            const secureFlag = isProduction ? '; Secure' : '';
            document.cookie = `__session=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax${secureFlag}`;
          }
        } catch (error) {
          // Silent error handling
        }
      } else {
        document.cookie = '__session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Auto-logout on inactivity
  useEffect(() => {
    if (!user) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
    
    const resetTimer = () => {
      setLastActivity(Date.now());
    };
    
    // Add event listeners for activity tracking
    events.forEach(event => {
      window.addEventListener(event, resetTimer, { passive: true });
    });
    
    // Check for inactivity every minute
    const interval = setInterval(() => {
      const inactive = Date.now() - lastActivity;
      if (inactive > INACTIVITY_TIMEOUT) {
        logout();
        // Show toast notification (optional - requires toast to be available)
        if (typeof window !== 'undefined') {
          window.location.href = '/?timeout=true';
        }
      }
    }, 60000); // Check every minute
    
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
      clearInterval(interval);
    };
  }, [user, lastActivity]);

  const signIn = async (email: string, password: string) => {
    if (!auth) {
      throw new Error('Firebase auth not properly initialized');
    }
    
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // The user will be automatically detected by onAuthStateChanged
      // Don't set loading to false here - let onAuthStateChanged handle it
      // This ensures the user state and cookie are properly set before loading becomes false
    } catch (error: any) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    if (!auth) {
      setUser(null);
      return;
    }
    
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  // Add a function to refresh the token
  const refreshUser = async () => {
    if (context.user && auth) {
      try {
        // Force refresh the token and update the cookie
        const token = await getIdToken(context.user, true);
        if (token) {
          const isProduction = window.location.protocol === 'https:';
          const secureFlag = isProduction ? '; Secure' : '';
          document.cookie = `__session=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax${secureFlag}`;
        }
        return token;
      } catch (error) {
        throw error;
      }
    }
  };
  
  return { ...context, refreshUser };
}