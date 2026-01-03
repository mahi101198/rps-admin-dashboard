'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  IndianRupee, 
  CreditCard, 
  Hash,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Wallet,
  Tag,
  FileText
} from 'lucide-react';

// Helper function to safely convert timestamps to Date objects
function convertTimestampToDate(timestamp: any): Date | null {
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
    return isNaN(date.getTime()) ? null : date;
  }
  
  // If it's a number (timestamp)
  if (typeof timestamp === 'number') {
    return new Date(timestamp);
  }
  
  // Fallback
  return null;
}

interface PaymentDetailsDialogProps {
  payment: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentDetailsDialog({ payment, open, onOpenChange }: PaymentDetailsDialogProps) {
  const [loading, setLoading] = useState(false);

  const formatDate = (date: Date | undefined): string => {
    if (!date) return 'Not set';
    
    // Convert Firestore timestamp to Date object if needed
    const convertedDate = convertTimestampToDate(date);
    if (!convertedDate) return 'Invalid date';
    
    return convertedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'successful':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'upi':
        return 'bg-purple-100 text-purple-800';
      case 'cod':
        return 'bg-orange-100 text-orange-800';
      case 'card':
        return 'bg-blue-100 text-blue-800';
      case 'netbanking':
        return 'bg-indigo-100 text-indigo-800';
      case 'wallet':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto w-[80vw] max-w-none">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Details
          </DialogTitle>
          <DialogDescription>
            Detailed information about payment #{payment?.paymentId?.slice(-8)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2">
          {/* Payment Summary */}
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Payment Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment ID:</span>
                  <span className="font-mono">#{payment?.paymentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order ID:</span>
                  <span className="font-mono">#{payment?.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">User ID:</span>
                  <span className="font-mono">#{payment?.userId}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-semibold flex items-center gap-1">
                    <IndianRupee className="h-4 w-4" />
                    {payment?.amount?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Currency:</span>
                  <Badge variant="outline">{payment?.currency || 'INR'}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge className={getStatusColor(payment?.status)}>
                    {payment?.status?.charAt(0).toUpperCase() + payment?.status?.slice(1) || 'N/A'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Method:</span>
                  <Badge className={getMethodColor(payment?.method || payment?.paymentMethod)}>
                    {(payment?.method || payment?.paymentMethod)?.toUpperCase() || 'N/A'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Timestamps
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Initiated At:</span>
                  <span>{formatDate(payment?.timestamps?.initiatedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Completed At:</span>
                  <span>{formatDate(payment?.timestamps?.completedAt)}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span>{formatDate(payment?.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Amount Breakdown */}
          {payment?.amountBreakdown && (
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <IndianRupee className="h-4 w-4" />
                Amount Breakdown
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sub Total:</span>
                    <span>₹{payment?.amountBreakdown?.subTotal?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Fee:</span>
                    <span>₹{payment?.amountBreakdown?.deliveryFee?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Discount:</span>
                    <span>-₹{payment?.amountBreakdown?.discount?.toLocaleString() || '0'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Wallet Used:</span>
                    <span>₹{payment?.amountBreakdown?.walletUsed?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Order Amount:</span>
                    <span>₹{payment?.amountBreakdown?.totalOrderAmount?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-semibold">Final Amount:</span>
                    <span className="font-bold">₹{payment?.amountBreakdown?.finalAmount?.toLocaleString() || '0'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Coupon Info */}
          {payment?.couponInfo && (
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Coupon Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Code:</span>
                    <span className="font-mono">{payment?.couponInfo?.code || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Discount Applied:</span>
                    <span>₹{payment?.couponInfo?.discountApplied?.toLocaleString() || '0'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Applied At:</span>
                    <span>{formatDate(payment?.couponInfo?.appliedAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created At:</span>
                    <span>{formatDate(payment?.couponInfo?.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Gateway Information */}
          {(payment?.gateway || payment?.gatewayPaymentId) && (
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Gateway Information
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gateway:</span>
                  <Badge variant="outline">{payment?.gateway || 'N/A'}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gateway Payment ID:</span>
                  <span className="font-mono text-sm">{payment?.gatewayPaymentId || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Payment Details */}
          {payment?.paymentDetails && (
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Payment Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gateway:</span>
                    <span>{payment?.paymentDetails?.gateway || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge className={getStatusColor(payment?.paymentDetails?.status)}>
                      {payment?.paymentDetails?.status?.charAt(0).toUpperCase() + payment?.paymentDetails?.status?.slice(1) || 'N/A'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transaction ID:</span>
                    <span className="font-mono text-sm">{payment?.paymentDetails?.transactionId || 'N/A'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment ID:</span>
                    <span className="font-mono text-sm">{payment?.paymentDetails?.paymentId || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Razorpay Order ID:</span>
                    <span className="font-mono text-sm">{payment?.paymentDetails?.razorpayOrderId || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Transaction Details */}
          {payment?.transactionDetails && (
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Transaction Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="flex items-center gap-1">
                      <IndianRupee className="h-4 w-4" />
                      {payment?.transactionDetails?.amount?.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Currency:</span>
                    <Badge variant="outline">{payment?.transactionDetails?.currency || 'INR'}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Method:</span>
                    <Badge className={getMethodColor(payment?.transactionDetails?.method)}>
                      {payment?.transactionDetails?.method?.toUpperCase() || 'N/A'}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Razorpay Payment ID:</span>
                    <span className="font-mono text-sm">{payment?.transactionDetails?.razorpayPaymentId || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Captured At:</span>
                    <span>{formatDate(payment?.transactionDetails?.capturedAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Updated At:</span>
                    <span>{formatDate(payment?.transactionDetails?.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}