'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Order } from '@/lib/types/all-schemas';

interface OrderDetailsDialogProps {
  order: Order;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetailsDialog({ order, open, onOpenChange }: OrderDetailsDialogProps) {
  // Extract address fields
  const {
    line1 = '',
    line2 = '',
    city = '',
    state = '',
    pincode = '',
    country = '',
    recipientName = ''
  } = order.deliveryAddress || {};

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'placed': return 'bg-orange-100 text-orange-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'out_for_delivery': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-red-100 text-red-800'; // Red for pending
      case 'paid':
        return 'bg-green-100 text-green-800'; // Green for paid
      case 'failed':
        return 'bg-red-100 text-red-800'; // Red for failed
      case 'refunded':
        return 'bg-orange-100 text-orange-800'; // Orange for refunded
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format full address for display
  const formatFullAddress = () => {
    const parts = [
      line1,
      line2,
      city,
      state,
      pincode,
      country
    ].filter(part => part);
    
    return parts.join(', ');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>
            Detailed information for order #{order.orderId ? order.orderId.slice(-8) : 'Unknown'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6">
          {/* Order Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Order Information</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order ID:</span>
                  <span className="font-mono">{order.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">User ID:</span>
                  <span className="font-mono">{order.userId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{formatDate(order.timestamps?.placedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span>{formatDate(order.updatedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment:</span>
                  <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                    {order.paymentStatus.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-semibold">Total Amount:</span>
                  <span className="font-bold text-lg">₹{order.pricing?.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            {/* Delivery Address */}
            <div>
              <h3 className="font-semibold mb-2">Delivery Address</h3>
              <div className="space-y-1 text-sm">
                <div className="font-medium">{recipientName}</div>
                <div>{formatFullAddress()}</div>
              </div>
              
              <h3 className="font-semibold mt-4 mb-2">Payment Method</h3>
              <div className="text-sm capitalize">
                {order.paymentMode?.replace('_', ' ')}
              </div>
            </div>
          </div>
          
          {/* Order Items */}
          <div>
            <h3 className="font-semibold mb-3">Order Items</h3>
            <div className="border rounded-lg">
              <div className="grid grid-cols-12 gap-2 p-3 bg-muted text-sm font-medium">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-2 text-right">Qty</div>
                <div className="col-span-2 text-right">Total</div>
              </div>
              <div className="divide-y">
                {order.items?.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 p-3 text-sm">
                    <div className="col-span-6">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-muted-foreground text-xs">{item.productId}</div>
                    </div>
                    <div className="col-span-2 text-right">₹{item.price.toLocaleString()}</div>
                    <div className="col-span-2 text-right">{item.quantity}</div>
                    <div className="col-span-2 text-right font-medium">₹{item.subtotal.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Pricing Summary */}
            <div className="mt-4 space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{order.pricing?.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee:</span>
                <span>₹{order.pricing?.deliveryFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount:</span>
                <span className="text-green-600">-₹{order.pricing?.discount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t font-semibold">
                <span>Total:</span>
                <span>₹{order.pricing?.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}