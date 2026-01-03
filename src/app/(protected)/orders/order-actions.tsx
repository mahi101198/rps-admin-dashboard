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
    </>
  );
}