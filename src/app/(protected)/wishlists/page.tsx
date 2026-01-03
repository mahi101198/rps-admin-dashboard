'use client';

import { useState, useEffect } from 'react';
import { Wishlist } from '@/lib/types/all-schemas';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

// Helper function to safely convert updatedAt to a Date object
function getUpdatedAtDate(updatedAt: any): Date {
  // If it's already a Date object
  if (updatedAt instanceof Date) {
    return updatedAt;
  }
  
  // If it's a Firestore timestamp object with _seconds
  if (typeof updatedAt === 'object' && '_seconds' in updatedAt) {
    return new Date(updatedAt._seconds * 1000);
  }
  
  // If it's a string, try to parse it
  if (typeof updatedAt === 'string') {
    const date = new Date(updatedAt);
    return isNaN(date.getTime()) ? new Date() : date;
  }
  
  // If it's a number (timestamp)
  if (typeof updatedAt === 'number') {
    return new Date(updatedAt);
  }
  
  // Fallback
  return new Date();
}

interface WishlistWithDetails extends Wishlist {
  userInfo?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  productDetails?: Array<{
    productId: string;
    name: string;
    price: number;
    imageUrl: string;
    brand: string;
    status: string;
  }>;
}

// Client-side function to get wishlists
async function getWishlistsAction(): Promise<Wishlist[]> {
  try {
    // This would typically be a server action
    // For now, we'll simulate it with a fetch call to an API endpoint
    const response = await fetch('/api/wishlists', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch wishlists');
    }
    
    const rawData = await response.json();
    
    // Convert updatedAt fields to Date objects
    return rawData.map((wishlist: any) => ({
      ...wishlist,
      updatedAt: getUpdatedAtDate(wishlist.updatedAt)
    }));
  } catch (error) {
    console.error('Error fetching wishlists:', error);
    return [];
  }
}

function getWishlistStats(wishlists: WishlistWithDetails[]) {
  const totalItems = wishlists.reduce((sum, w) => sum + w.items.length, 0);
  const nonEmptyWishlists = wishlists.filter(w => w.items.length > 0);
  
  return {
    totalUsers: wishlists.length,
    nonEmptyWishlists: nonEmptyWishlists.length,
    emptyWishlists: wishlists.length - nonEmptyWishlists.length,
    totalItems,
    avgItemsPerWishlist: wishlists.length > 0 ? (totalItems / wishlists.length) : 0,
    maxItemsInWishlist: wishlists.length > 0 ? Math.max(...wishlists.map(w => w.items.length)) : 0,
    recentActivity: wishlists.filter(w => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return getUpdatedAtDate(w.updatedAt) > oneWeekAgo;
    }).length
  };
}

function getProductStatusBadge(status: string) {
  switch (status) {
    case 'active':
      return <Badge variant="default">Active</Badge>;
    case 'inactive':
      return <Badge variant="secondary">Inactive</Badge>;
    case 'out_of_stock':
      return <Badge variant="destructive">Out of Stock</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
}

export default function WishlistsPage() {
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [wishlistDetails, setWishlistDetails] = useState<WishlistWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWishlists = async () => {
      try {
        setLoading(true);
        const wishlistsData = await getWishlistsAction();
        setWishlists(wishlistsData);
        
        // In a real implementation, we would fetch wishlist details from the API
        // For now, we'll just use the basic wishlist data
        setWishlistDetails(wishlistsData.map(wishlist => ({
          ...wishlist,
          userInfo: undefined,
          productDetails: []
        })));
      } catch (err) {
        console.error('Error fetching wishlists:', err);
        setError('Failed to load wishlists');
      } finally {
        setLoading(false);
      }
    };

    fetchWishlists();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">💖 Wishlists Management</h1>
            <p className="text-muted-foreground">View and manage customer wishlists</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" disabled>
              📊 Wishlist Analytics
            </Button>
            <Button disabled>
              📧 Send Reminders
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">💖 Wishlists Management</h1>
            <p className="text-muted-foreground">View and manage customer wishlists</p>
          </div>
        </div>
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <h3 className="font-semibold text-destructive">Error Loading Data</h3>
          <p className="text-destructive/80">{error}</p>
        </div>
      </div>
    );
  }

  const stats = getWishlistStats(wishlistDetails);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">💖 Wishlists Management</h1>
          <p className="text-muted-foreground">View and manage customer wishlists</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            📊 Wishlist Analytics
          </Button>
          <Button>
            📧 Send Reminders
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <span className="text-2xl">👥</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">With wishlists</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Wishlists</CardTitle>
            <span className="text-2xl">💖</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.nonEmptyWishlists}</div>
            <p className="text-xs text-muted-foreground">Non-empty wishlists</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <span className="text-2xl">📦</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalItems}</div>
            <p className="text-xs text-muted-foreground">Across all wishlists</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <span className="text-2xl">🔥</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.recentActivity}</div>
            <p className="text-xs text-muted-foreground">Updated in last 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Wishlist Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>📊 Wishlist Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Average Items per Wishlist:</span>
                <span className="font-semibold">{stats.avgItemsPerWishlist.toFixed(1)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Max Items in a Wishlist:</span>
                <span className="font-semibold">{stats.maxItemsInWishlist}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Empty Wishlists:</span>
                <span className="font-semibold">{stats.emptyWishlists}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span>Engagement Rate:</span>
                  <span className="font-semibold">
                    {stats.totalUsers > 0 ? ((stats.nonEmptyWishlists / stats.totalUsers) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🏆 Top Wishlist Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-muted-foreground">Coming soon</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wishlists List */}
      <Card>
        <CardHeader>
          <CardTitle>📋 All Wishlists</CardTitle>
          <CardDescription>Customer wishlist collections</CardDescription>
        </CardHeader>
        <CardContent>
          {wishlistDetails.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">💖</div>
              <h3 className="text-xl font-semibold mb-2">No Wishlists Found</h3>
              <p className="text-muted-foreground mb-4">
                No customer wishlists have been created yet
              </p>
              <Button>📢 Promote Wishlists</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {wishlistDetails.map((wishlist) => (
                <div key={wishlist.userId} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-medium">
                        {wishlist.userInfo 
                          ? `${wishlist.userInfo.firstName} ${wishlist.userInfo.lastName}` 
                          : `User ${wishlist.userId.substring(0, 8)}`}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Updated {getUpdatedAtDate(wishlist.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    {wishlist.items.length > 0 ? (
                      <div className="text-right">
                        <div className="font-medium">{wishlist.items.length} items</div>
                        <div className="text-sm text-muted-foreground">
                          Updated {getUpdatedAtDate(wishlist.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    ) : (
                      <Badge variant="outline">Empty</Badge>
                    )}
                  </div>
                  
                  {wishlist.items.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {wishlist.productDetails?.map((product) => (
                        <div key={product.productId} className="flex items-center gap-3 p-2 border rounded">
                          {product.imageUrl ? (
                            <img 
                              src={product.imageUrl} 
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                              <span className="text-xs">📦</span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{product.name}</div>
                            <div className="text-xs text-muted-foreground">
                              ₹{product.price.toLocaleString()}
                            </div>
                            <div className="text-xs">
                              {getProductStatusBadge(product.status)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      This wishlist is empty
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}