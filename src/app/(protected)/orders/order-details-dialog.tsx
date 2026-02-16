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
  // Extract address fields from deliveryInfo
  const address = order.deliveryInfo?.address || order.deliveryAddress || {};
  const {
    street = '',
    city = '',
    state = '',
    postalCode = '',
    country = '',
    name = '',
    phoneNumber = '',
    email = ''
  } = address;

  // Get pricing information
  const pricingSummary = order.pricingSummary;
  const paymentSummary = order.paymentSummary;

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
      street,
      city,
      state,
      postalCode,
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
                  <span>{formatDate(order.createdAt)}</span>
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
                  <span className="font-bold text-lg">₹{pricingSummary?.subtotalAfterDiscount?.toLocaleString() || 0}</span>
                </div>
              </div>
            </div>
            
            {/* Delivery Address */}
            <div>
              <h3 className="font-semibold mb-2">Delivery Address</h3>
              <div className="space-y-1 text-sm">
                <div className="font-medium">{name}</div>
                <div>{formatFullAddress()}</div>
                {phoneNumber && <div className="text-muted-foreground">Phone: {phoneNumber}</div>}
                {email && <div className="text-muted-foreground">Email: {email}</div>}
              </div>
              
              <h3 className="font-semibold mt-4 mb-2">Payment Information</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mode:</span>
                  <span className="capitalize">{order.paymentMode?.replace('_', ' ')}</span>
                </div>
                {paymentSummary && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Wallet Paid:</span>
                      <span>₹{paymentSummary.walletPaidAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Online Paid:</span>
                      <span>₹{paymentSummary.onlinePaidAmount}</span>
                    </div>
                  </>
                )}
              </div>
              
              {order.deliveryId && (
                <>
                  <h3 className="font-semibold mt-4 mb-2">Delivery ID</h3>
                  <div className="text-sm font-mono">{order.deliveryId}</div>
                </>
              )}
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
                    <div className="col-span-2 text-right">
                      ₹{item.itemMetadata?.currentPriceUsed?.toLocaleString() || 0}
                    </div>
                    <div className="col-span-2 text-right">{item.quantity}</div>
                    <div className="col-span-2 text-right font-medium">
                      ₹{item.itemMetadata?.itemSubtotalAtSellingPrice?.toLocaleString() || 0}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Pricing Summary */}
            <div className="mt-4 space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Order Subtotal:</span>
                <span>₹{pricingSummary?.orderSubtotal?.toLocaleString() || 0}</span>
              </div>
              {pricingSummary?.deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span>Delivery Fee:</span>
                  <span>₹{pricingSummary.deliveryFee.toLocaleString()}</span>
                </div>
              )}
              {pricingSummary?.productDiscount > 0 && (
                <div className="flex justify-between">
                  <span>Product Discount:</span>
                  <span className="text-green-600">-₹{pricingSummary.productDiscount.toLocaleString()}</span>
                </div>
              )}
              {pricingSummary?.couponDiscount > 0 && (
                <div className="flex justify-between">
                  <span>Coupon Discount:</span>
                  <span className="text-green-600">-₹{pricingSummary.couponDiscount.toLocaleString()}</span>
                </div>
              )}
              {pricingSummary?.totalDiscount > 0 && (
                <div className="flex justify-between">
                  <span>Total Discount:</span>
                  <span className="text-green-600">-₹{pricingSummary.totalDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t font-semibold">
                <span>Final Total:</span>
                <span>₹{pricingSummary?.subtotalAfterDiscount?.toLocaleString() || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}