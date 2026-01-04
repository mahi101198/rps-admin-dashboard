'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Order } from '@/lib/types/all-schemas';
import { updateOrderStatusAction, updatePaymentStatusAction, deleteOrderAction } from '@/actions/order-actions';

interface OrderActionsProps {
  order: Order;
  onDataChange?: () => void;
}

export function OrderActions({ order, onDataChange }: OrderActionsProps) {
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  // Status update states
  const [newStatus, setNewStatus] = useState<string>(order.status);

  // Payment update states
  const [paymentStatus, setPaymentStatus] = useState<string>(order.paymentStatus || 'pending');

  const handleStatusUpdate = async () => {
    setLoading(true);
    try {
      const result = await updateOrderStatusAction(order.orderId, newStatus as any);
      if (result.success) {
        toast.success(result.message);
        setShowStatusDialog(false);
        // Notify parent component to refresh data instead of reloading
        onDataChange?.();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentUpdate = async () => {
    setLoading(true);
    try {
      const result = await updatePaymentStatusAction(order.orderId, paymentStatus as any);
      if (result.success) {
        toast.success(result.message);
        setShowPaymentDialog(false);
        // Notify parent component to refresh data instead of reloading
        onDataChange?.();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to update payment status');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const result = await deleteOrderAction(order.orderId);
      if (result.success) {
        toast.success(result.message);
        setShowDeleteDialog(false);
        // Notify parent component to refresh data instead of reloading
        onDataChange?.();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to delete order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setShowDetailsDialog(true)}>
          View
        </Button>
        <Button variant="outline" size="sm" onClick={() => setShowStatusDialog(true)}>
          Status
        </Button>
        <Button variant="outline" size="sm" onClick={() => setShowPaymentDialog(true)}>
          Payment
        </Button>
        <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)}>
          Delete
        </Button>
      </div>

      {/* Status Update Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change the status of order #{order.orderId ? order.orderId.slice(-8) : 'Unknown'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">Order Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="placed">Placed</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              Current status: <Badge>{order.status}</Badge>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate} disabled={loading}>
              {loading ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Update Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Payment Status</DialogTitle>
            <DialogDescription>
              Change payment status for order #{order.orderId ? order.orderId.slice(-8) : 'Unknown'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="paymentStatus">Payment Status</Label>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              Current status: <Badge>{order.paymentStatus}</Badge>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handlePaymentUpdate} disabled={loading}>
              {loading ? 'Updating...' : 'Update Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete order #{order.orderId ? order.orderId.slice(-8) : 'Unknown'}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? 'Deleting...' : 'Delete Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order #{order.orderId ? order.orderId.slice(-8) : 'Unknown'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Order Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Order ID</Label>
                <p className="font-medium">{order.orderId}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">User ID</Label>
                <p className="font-medium">{order.userId}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <div className="mt-1">
                  <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                    {order.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Payment Status</Label>
                <div className="mt-1">
                  <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'destructive'}>
                    {order.paymentStatus.toUpperCase()}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Payment Mode</Label>
                <p className="font-medium">{order.paymentMode?.toUpperCase() || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Payment ID</Label>
                <p className="font-medium">{order.paymentId || 'N/A'}</p>
              </div>
            </div>

            {/* Items */}
            <div>
              <Label className="text-lg font-semibold">Items</Label>
              <div className="mt-2 space-y-2">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{item.name || item.productName || `Product ${item.productId}`}</p>
                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{((item.totalPrice || item.price * item.quantity) || 0).toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">₹{item.price?.toLocaleString() || 0} each</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No items found</p>
                )}
              </div>
            </div>

            {/* Pricing */}
            <div>
              <Label className="text-lg font-semibold">Pricing</Label>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{order.pricing?.subtotal?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span>₹{order.pricing?.deliveryFee?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>₹{order.pricing?.tax?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="text-red-500">-₹{order.pricing?.discount?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>₹{order.pricing?.total?.toLocaleString() || 0}</span>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div>
              <Label className="text-lg font-semibold">Delivery Address</Label>
              <div className="mt-2 p-3 border rounded-lg">
                {order.deliveryAddress ? (
                  <>
                    <p className="font-medium">{order.deliveryAddress.name || 'N/A'}</p>
                    <p className="text-sm">{order.deliveryAddress.phone || 'N/A'}</p>
                    <p className="text-sm mt-1">
                      {order.deliveryAddress.addressLine1 || ''}
                      {order.deliveryAddress.addressLine2 && `, ${order.deliveryAddress.addressLine2}`}
                    </p>
                    <p className="text-sm">
                      {order.deliveryAddress.city || ''}, {order.deliveryAddress.state || ''} - {order.deliveryAddress.pincode || ''}
                    </p>
                  </>
                ) : (
                  <p className="text-muted-foreground">No address found</p>
                )}
              </div>
            </div>

            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Placed At</Label>
                <p>{order.timestamps?.placedAt ? new Date(order.timestamps.placedAt).toLocaleString() : 'N/A'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Last Updated</Label>
                <p>{order.timestamps?.updatedAt ? new Date(order.timestamps.updatedAt).toLocaleString() : 'N/A'}</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}