'use client';

import { useState, useEffect } from 'react';
import { getAllCartsAction, getCartDetailsAction } from '@/actions/cart-actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

// Helper function to safely convert timestamps to Date objects
function convertTimestampToDate(timestamp: any): Date {
  // If it's already a Date object
  if (timestamp instanceof Date) {
    return timestamp;
  }
  
  // If it's a Firestore timestamp object with _seconds
  if (typeof timestamp === 'object' && '_seconds' in timestamp) {
    return new Date(timestamp._seconds * 1000);
  }
  
  // If it's a string, try to parse it
  if (typeof timestamp === 'string') {
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? new Date() : date;
  }
  
  // If it's a number (timestamp)
  if (typeof timestamp === 'number') {
    return new Date(timestamp);
  }
  
  // Fallback
  return new Date();
}

function CartDetailsModal({ cart }: { cart: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [cartDetails, setCartDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchCartDetails = async () => {
    if (!isOpen) return;
    
    setLoading(true);
    try {
      const result = await getCartDetailsAction(cart.userId);
      if (result.success) {
        setCartDetails(result.data);
      } else {
        toast.error(result.error || 'Failed to load cart details');
      }
    } catch (error) {
      toast.error('Failed to load cart details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartDetails();
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          View Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cart Details</DialogTitle>
          <DialogDescription>
            Detailed information about {cart.userInfo ? `${cart.userInfo.firstName} ${cart.userInfo.lastName}` : cart.userId}'s cart
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="text-2xl">Loading cart details...</div>
          </div>
        ) : cartDetails ? (
          <>
            {/* User Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>User Information</CardTitle>
                </CardHeader>
                <CardContent>
                  {cartDetails.userInfo ? (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span>{cartDetails.userInfo.firstName} {cartDetails.userInfo.lastName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span>{cartDetails.userInfo.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">User ID:</span>
                        <span className="font-mono text-sm">{cartDetails.userId}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-muted-foreground">
                      User information not available
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Cart Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Items:</span>
                      <span className="font-bold">{cartDetails.totalItems}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cart Value:</span>
                      <span className="font-bold text-green-600">₹{cartDetails.totalValue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Updated:</span>
                      <span>{convertTimestampToDate(cartDetails.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Products in Cart */}
            <Card>
              <CardHeader>
                <CardTitle>Products in Cart ({cartDetails.productDetails.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {cartDetails.productDetails.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Subtotal</TableHead>
                        <TableHead>Added</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cartDetails.productDetails.map((product: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>₹{product.price.toLocaleString()}</TableCell>
                          <TableCell>{product.quantity}</TableCell>
                          <TableCell className="font-medium">₹{product.subtotal.toLocaleString()}</TableCell>
                          <TableCell>{convertTimestampToDate(product.addedAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No products in cart
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline">Send Reminder</Button>
              <Button>Convert to Order</Button>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-red-500">
            Failed to load cart details
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function CartsPage() {
  const [cartDetails, setCartDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCarts: 0,
    activeCarts: 0,
    emptyCarts: 0,
    totalItems: 0,
    totalValue: 0,
    avgCartValue: 0
  });

  const fetchCartData = async () => {
    try {
      setLoading(true);
      const result = await getAllCartsAction();
      if (result.success && result.data) {
        setCartDetails(result.data);
        
        const newStats = {
          totalCarts: result.data.length,
          activeCarts: result.data.filter((cart: any) => cart.totalItems > 0).length,
          emptyCarts: result.data.filter((cart: any) => cart.totalItems === 0).length,
          totalItems: result.data.reduce((sum: number, cart: any) => sum + cart.totalItems, 0),
          totalValue: result.data.reduce((sum: number, cart: any) => sum + cart.totalValue, 0),
          avgCartValue: result.data.length > 0 
            ? result.data.reduce((sum: number, cart: any) => sum + cart.totalValue, 0) / result.data.length 
            : 0
        };
        
        setStats(newStats);
      } else {
        toast.error(result.error || 'Failed to load carts');
      }
    } catch (error) {
      toast.error('Failed to load carts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">🛍️ Cart Management</h1>
            <p className="text-muted-foreground">Monitor user shopping carts and abandoned items</p>
          </div>
          <Button disabled>
            📧 Send Cart Reminders
          </Button>
        </div>
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🛒</div>
          <h3 className="font-semibold mb-2">Loading Carts...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">🛍️ Cart Management</h1>
          <p className="text-muted-foreground">Monitor user shopping carts and abandoned items</p>
        </div>
        <Button>
          📧 Send Cart Reminders
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Carts</CardTitle>
            <span className="text-2xl">🛒</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCarts}</div>
            <p className="text-xs text-muted-foreground">All user carts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Carts</CardTitle>
            <span className="text-2xl">🔥</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.activeCarts}</div>
            <p className="text-xs text-muted-foreground">Carts with items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <span className="text-2xl">📦</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalItems}</div>
            <p className="text-xs text-muted-foreground">Items in all carts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cart Value</CardTitle>
            <span className="text-2xl">💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total cart value</p>
          </CardContent>
        </Card>
      </div>

      {/* Cart Status Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>📊 Cart Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="default">Active Carts</Badge>
                  <span className="text-sm text-muted-foreground">
                    {stats.activeCarts} users have items in cart
                  </span>
                </div>
                <span className="font-bold text-orange-600">
                  {stats.totalCarts > 0 ? ((stats.activeCarts / stats.totalCarts) * 100).toFixed(1) : 0}%
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Empty Carts</Badge>
                  <span className="text-sm text-muted-foreground">
                    {stats.emptyCarts} users have empty carts
                  </span>
                </div>
                <span className="font-bold text-blue-600">
                  {stats.totalCarts > 0 ? ((stats.emptyCarts / stats.totalCarts) * 100).toFixed(1) : 0}%
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Avg Items</Badge>
                  <span className="text-sm text-muted-foreground">
                    Average items per active cart
                  </span>
                </div>
                <span className="font-bold">
                  {stats.activeCarts > 0 ? (stats.totalItems / stats.activeCarts).toFixed(1) : 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>💰 Revenue Potential</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Cart Value</span>
                <span className="font-bold text-green-600">₹{stats.totalValue.toLocaleString()}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Average Cart Value</span>
                <span className="font-bold">₹{stats.avgCartValue.toFixed(0)}</span>
              </div>
              
              <div className="pt-2">
                <div className="text-sm text-muted-foreground mb-1">
                  Potential Revenue if All Carts Converted
                </div>
                <div className="text-2xl font-bold text-green-600">
                  ₹{stats.totalValue.toLocaleString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Carts Table */}
      <Card>
        <CardHeader>
          <CardTitle>🛒 Active User Carts</CardTitle>
          <CardDescription>Users with items currently in their shopping cart</CardDescription>
        </CardHeader>
        <CardContent>
          {cartDetails.filter(cart => cart.totalItems > 0).length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-muted-foreground">User</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Items</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Value</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Last Updated</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cartDetails.filter(cart => cart.totalItems > 0).map((cart: any) => (
                    <tr key={cart.userId} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <div className="font-medium">
                          {cart.userInfo 
                            ? `${cart.userInfo.firstName} ${cart.userInfo.lastName}` 
                            : cart.userId.substring(0, 8)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {cart.userInfo?.email || 'No email'}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium">{cart.totalItems} items</div>
                        <div className="text-sm text-muted-foreground">
                          {cart.items.length} products
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-green-600">
                          ₹{cart.totalValue.toLocaleString()}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm text-muted-foreground">
                          {convertTimestampToDate(cart.updatedAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <CartDetailsModal cart={cart} />
                          <Button variant="outline" size="sm">
                            Send Reminder
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🛒</div>
              <h3 className="font-semibold mb-2">No Active Carts</h3>
              <p className="text-muted-foreground mb-4">
                No users currently have items in their cart
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Empty Carts Summary */}
      {stats.emptyCarts > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📋 Empty Carts</CardTitle>
            <CardDescription>Users with empty carts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <div className="text-3xl font-bold text-muted-foreground">
                {stats.emptyCarts}
              </div>
              <p className="text-muted-foreground">
                Users have empty carts - potential for marketing campaigns
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cart Abandonment Insights */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Cart Insights</CardTitle>
          <CardDescription>Key metrics for cart conversion</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {stats.totalCarts > 0 ? ((stats.activeCarts / stats.totalCarts) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Cart Fill Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                ₹{stats.avgCartValue.toFixed(0)}
              </div>
              <div className="text-sm text-muted-foreground">Avg Cart Value</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {stats.activeCarts > 0 ? (stats.totalItems / stats.activeCarts).toFixed(1) : 0}
              </div>
              <div className="text-sm text-muted-foreground">Items per Cart</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {stats.activeCarts}
              </div>
              <div className="text-sm text-muted-foreground">Abandonment Risk</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}