'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

// Client-side function to get collections info
async function getCollectionsInfoAction() {
  try {
    // This would typically be a server action, but for now we'll simulate it
    // In a real implementation, this would call a server action
    const response = await fetch('/api/check-data', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting collections info:', error);
    return [];
  }
}

export default function CheckDataPage() {
  const [collectionsInfo, setCollectionsInfo] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCollectionsInfo = async () => {
      try {
        setLoading(true);
        const data = await getCollectionsInfoAction();
        setCollectionsInfo(data);
      } catch (err) {
        console.error('Error fetching collections info:', err);
        setError('Failed to load database information');
      } finally {
        setLoading(false);
      }
    };

    fetchCollectionsInfo();
  }, []);

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">🔍 Firestore Database Analysis</h1>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">🔍 Firestore Database Analysis</h1>
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <h3 className="font-semibold text-destructive">Error Loading Data</h3>
          <p className="text-destructive/80">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🔍 Firestore Database Analysis</h1>
      
      {collectionsInfo.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <p className="text-yellow-800">No collections found or unable to access Firestore.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <p className="text-blue-800">
              📁 Found <strong>{collectionsInfo.length}</strong> collections in your Firestore database
            </p>
          </div>
          
          {collectionsInfo.map((collection, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
              <h2 className="text-xl font-semibold mb-3 text-gray-800">
                📂 Collection: <span className="text-blue-600">{collection.name}</span>
              </h2>
              
              {collection.error ? (
                <div className="bg-red-50 border border-red-200 p-3 rounded">
                  <p className="text-red-600">❌ Error: {collection.error}</p>
                </div>
              ) : (
                <>
                  <p className="text-gray-600 mb-3">
                    📄 Documents found: <strong>{collection.documentCount}</strong>
                  </p>
                  
                  {collection.sampleDocs && collection.sampleDocs.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-medium text-gray-700">📋 Sample Documents:</h3>
                      {collection.sampleDocs.map((doc: any, docIndex: number) => (
                        <div key={docIndex} className="bg-gray-50 p-3 rounded border">
                          <p className="font-medium text-gray-600 mb-2">ID: {doc.id}</p>
                          <div className="bg-white p-2 rounded border text-sm">
                            <pre className="whitespace-pre-wrap text-xs overflow-x-auto">
                              {JSON.stringify(doc.data, null, 2)}
                            </pre>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-8 bg-green-50 border border-green-200 p-4 rounded-lg">
        <h3 className="font-semibold text-green-800 mb-2">✅ Next Steps:</h3>
        <ul className="text-green-700 space-y-1 text-sm">
          <li>• Review existing collections and their data structure</li>
          <li>• Identify missing collections that need to be created</li>
          <li>• Plan the comprehensive admin panel implementation</li>
        </ul>
      </div>
    </div>
  );
}