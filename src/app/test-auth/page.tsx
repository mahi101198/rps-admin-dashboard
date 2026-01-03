'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function TestAuthPage() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();
  const [tokenInfo, setTokenInfo] = useState<string | null>(null);
  const [refreshResult, setRefreshResult] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const checkToken = async () => {
    if (user) {
      try {
        const token = await user.getIdToken();
        setTokenInfo(`Token exists, expires: ${new Date(JSON.parse(atob(token.split('.')[1])).exp * 1000).toLocaleString()}`);
      } catch (error) {
        setTokenInfo('Error getting token: ' + (error as Error).message);
      }
    }
  };

  const refreshToken = async () => {
    try {
      await refreshUser();
      setRefreshResult('Token refreshed successfully');
      // Check token again after refresh
      setTimeout(checkToken, 100);
    } catch (error) {
      setRefreshResult('Error refreshing token: ' + (error as Error).message);
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!user) {
    return <div className="p-4">Redirecting to login...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Auth Test Page</h1>
      <div className="mb-4">
        <p>User: {user.email}</p>
        <p>UID: {user.uid}</p>
      </div>
      
      <div className="mb-4">
        <button 
          onClick={checkToken}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
        >
          Check Token
        </button>
        <button 
          onClick={refreshToken}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Refresh Token
        </button>
      </div>
      
      {tokenInfo && (
        <div className="mb-4 p-2 bg-gray-100 rounded">
          <p className="font-semibold">Token Info:</p>
          <p>{tokenInfo}</p>
        </div>
      )}
      
      {refreshResult && (
        <div className="mb-4 p-2 bg-gray-100 rounded">
          <p className="font-semibold">Refresh Result:</p>
          <p>{refreshResult}</p>
        </div>
      )}
      
      <button 
        onClick={() => router.push('/orders')}
        className="bg-purple-500 text-white px-4 py-2 rounded mr-2"
      >
        Go to Orders
      </button>
      
      <button 
        onClick={() => router.push('/')}
        className="bg-gray-500 text-white px-4 py-2 rounded"
      >
        Back to Dashboard
      </button>
    </div>
  );
}