'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
import { updatePaymentDetailsAction } from '@/actions/payment-actions';
import { toast } from 'sonner';
import { Payment, PaymentStatus } from '@/lib/types/product';
import { useRouter } from 'next/navigation';

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

interface EditPaymentDialogProps {
  payment: Payment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentUpdated: () => void;
}

export function EditPaymentDialog({ payment, open, onOpenChange, onPaymentUpdated }: EditPaymentDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Basic payment fields
  const [status, setStatus] = useState<PaymentStatus>(payment.status || 'pending');
  const [method, setMethod] = useState(payment.method || payment.paymentMethod || 'cod');
  const [amount, setAmount] = useState(payment.amount?.toString() || '');
  const [currency, setCurrency] = useState(payment.currency || 'INR');
  const [gateway, setGateway] = useState(payment.gateway || '');
  const [transactionId, setTransactionId] = useState(payment.transactionId || '');

  // Amount breakdown fields
  const [amountBreakdown, setAmountBreakdown] = useState({
    deliveryFee: payment.amountBreakdown?.deliveryFee?.toString() || '',
    discount: payment.amountBreakdown?.discount?.toString() || '',
    finalAmount: payment.amountBreakdown?.finalAmount?.toString() || '',
    subTotal: payment.amountBreakdown?.subTotal?.toString() || '',
    totalOrderAmount: payment.amountBreakdown?.totalOrderAmount?.toString() || '',
    walletUsed: payment.amountBreakdown?.walletUsed?.toString() || ''
  });

  // Coupon info fields
  const [couponInfo, setCouponInfo] = useState({
    code: payment.couponInfo?.code || '',
    discountApplied: payment.couponInfo?.discountApplied?.toString() || '',
    appliedAt: payment.couponInfo?.appliedAt ? convertTimestampToDate(payment.couponInfo.appliedAt) : new Date(),
    createdAt: payment.couponInfo?.createdAt ? convertTimestampToDate(payment.couponInfo.createdAt) : new Date()
  });

  // Payment details fields
  const [paymentDetails, setPaymentDetails] = useState({
    gateway: payment.paymentDetails?.gateway || '',
    status: payment.paymentDetails?.status || '',
    transactionId: payment.paymentDetails?.transactionId || '',
    paymentId: payment.paymentDetails?.paymentId || '',
    razorpayOrderId: payment.paymentDetails?.razorpayOrderId || ''
  });

  // Transaction details fields
  const [transactionDetails, setTransactionDetails] = useState({
    amount: payment.transactionDetails?.amount?.toString() || '',
    currency: payment.transactionDetails?.currency || 'INR',
    method: payment.transactionDetails?.method || '',
    razorpayPaymentId: payment.transactionDetails?.razorpayPaymentId || '',
    capturedAt: payment.transactionDetails?.capturedAt ? convertTimestampToDate(payment.transactionDetails.capturedAt) : new Date(),
    updatedAt: payment.transactionDetails?.updatedAt ? convertTimestampToDate(payment.transactionDetails.updatedAt) : new Date(),
    userId: payment.transactionDetails?.userId || payment.userId || ''
  });

  const handleUpdatePayment = async () => {
    setLoading(true);
    try {
      // Prepare the update data
      const updateData: any = {
        status,
        method,
        paymentMethod: method,
        amount: parseFloat(amount) || 0,
        currency,
        gateway,
        transactionId
      };

      // Add amount breakdown if any field is filled
      if (Object.values(amountBreakdown).some(val => val)) {
        updateData.amountBreakdown = {
          deliveryFee: parseFloat(amountBreakdown.deliveryFee) || undefined,
          discount: parseFloat(amountBreakdown.discount) || undefined,
          finalAmount: parseFloat(amountBreakdown.finalAmount) || undefined,
          subTotal: parseFloat(amountBreakdown.subTotal) || undefined,
          totalOrderAmount: parseFloat(amountBreakdown.totalOrderAmount) || undefined,
          walletUsed: parseFloat(amountBreakdown.walletUsed) || undefined
        };
      }

      // Add coupon info if any field is filled
      if (couponInfo.code || couponInfo.discountApplied) {
        updateData.couponInfo = {
          code: couponInfo.code,
          discountApplied: parseFloat(couponInfo.discountApplied) || undefined,
          appliedAt: couponInfo.appliedAt,
          createdAt: couponInfo.createdAt
        };
      }

      // Add payment details if any field is filled
      if (Object.values(paymentDetails).some(val => val)) {
        updateData.paymentDetails = {
          gateway: paymentDetails.gateway,
          status: paymentDetails.status,
          transactionId: paymentDetails.transactionId,
          paymentId: paymentDetails.paymentId,
          razorpayOrderId: paymentDetails.razorpayOrderId
        };
      }

      // Add transaction details if any field is filled
      if (Object.values(transactionDetails).some(val => val)) {
        updateData.transactionDetails = {
          amount: parseFloat(transactionDetails.amount) || undefined,
          currency: transactionDetails.currency,
          method: transactionDetails.method,
          razorpayPaymentId: transactionDetails.razorpayPaymentId,
          capturedAt: transactionDetails.capturedAt,
          updatedAt: transactionDetails.updatedAt,
          userId: transactionDetails.userId
        };
      }

      const result = await updatePaymentDetailsAction(payment.paymentId, updateData);

      if (result.success) {
        toast.success(result.message);
        onPaymentUpdated();
        onOpenChange(false);
        // Use router.refresh() to update data without full page reload
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to update payment details');
      console.error('Error updating payment:', error);
    } finally {
      setLoading(false);
    }
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
            Edit Payment Details
          </DialogTitle>
          <DialogDescription>
            Update information for payment #{payment.paymentId?.slice(-8)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Payment Information */}
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as PaymentStatus)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="pending">Pending</option>
                    <option value="successful">Successful</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="method">Payment Method</Label>
                  <select
                    id="method"
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="upi">UPI</option>
                    <option value="cod">Cash on Delivery</option>
                    <option value="card">Card</option>
                    <option value="netbanking">Net Banking</option>
                    <option value="wallet">Wallet</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-8"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    placeholder="INR"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Gateway Information */}
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Gateway Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gateway">Gateway</Label>
                <Input
                  id="gateway"
                  value={gateway}
                  onChange={(e) => setGateway(e.target.value)}
                  placeholder="Razorpay, Stripe, etc."
                />
              </div>
              <div>
                <Label htmlFor="transactionId">Transaction ID</Label>
                <Input
                  id="transactionId"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Gateway transaction ID"
                />
              </div>
            </div>
          </div>

          {/* Amount Breakdown */}
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <IndianRupee className="h-4 w-4" />
              Amount Breakdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div>
                  <Label htmlFor="subTotal">Sub Total</Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="subTotal"
                      type="number"
                      value={amountBreakdown.subTotal}
                      onChange={(e) => setAmountBreakdown({...amountBreakdown, subTotal: e.target.value})}
                      className="pl-8"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="deliveryFee">Delivery Fee</Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="deliveryFee"
                      type="number"
                      value={amountBreakdown.deliveryFee}
                      onChange={(e) => setAmountBreakdown({...amountBreakdown, deliveryFee: e.target.value})}
                      className="pl-8"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="discount">Discount</Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="discount"
                      type="number"
                      value={amountBreakdown.discount}
                      onChange={(e) => setAmountBreakdown({...amountBreakdown, discount: e.target.value})}
                      className="pl-8"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <Label htmlFor="walletUsed">Wallet Used</Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="walletUsed"
                      type="number"
                      value={amountBreakdown.walletUsed}
                      onChange={(e) => setAmountBreakdown({...amountBreakdown, walletUsed: e.target.value})}
                      className="pl-8"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="totalOrderAmount">Total Order Amount</Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="totalOrderAmount"
                      type="number"
                      value={amountBreakdown.totalOrderAmount}
                      onChange={(e) => setAmountBreakdown({...amountBreakdown, totalOrderAmount: e.target.value})}
                      className="pl-8"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="finalAmount">Final Amount</Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="finalAmount"
                      type="number"
                      value={amountBreakdown.finalAmount}
                      onChange={(e) => setAmountBreakdown({...amountBreakdown, finalAmount: e.target.value})}
                      className="pl-8"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Coupon Information */}
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Coupon Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="couponCode">Coupon Code</Label>
                <Input
                  id="couponCode"
                  value={couponInfo.code}
                  onChange={(e) => setCouponInfo({...couponInfo, code: e.target.value})}
                  placeholder="SUMMER20"
                />
              </div>
              <div>
                <Label htmlFor="discountApplied">Discount Applied</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="discountApplied"
                    type="number"
                    value={couponInfo.discountApplied}
                    onChange={(e) => setCouponInfo({...couponInfo, discountApplied: e.target.value})}
                    className="pl-8"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Payment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div>
                  <Label htmlFor="paymentGateway">Gateway</Label>
                  <Input
                    id="paymentGateway"
                    value={paymentDetails.gateway}
                    onChange={(e) => setPaymentDetails({...paymentDetails, gateway: e.target.value})}
                    placeholder="Razorpay, Stripe, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="paymentStatus">Status</Label>
                  <Input
                    id="paymentStatus"
                    value={paymentDetails.status}
                    onChange={(e) => setPaymentDetails({...paymentDetails, status: e.target.value})}
                    placeholder="successful, pending, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="paymentTransactionId">Transaction ID</Label>
                  <Input
                    id="paymentTransactionId"
                    value={paymentDetails.transactionId}
                    onChange={(e) => setPaymentDetails({...paymentDetails, transactionId: e.target.value})}
                    placeholder="Transaction ID"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <Label htmlFor="paymentId">Payment ID</Label>
                  <Input
                    id="paymentId"
                    value={paymentDetails.paymentId}
                    onChange={(e) => setPaymentDetails({...paymentDetails, paymentId: e.target.value})}
                    placeholder="Gateway payment ID"
                  />
                </div>
                <div>
                  <Label htmlFor="razorpayOrderId">Razorpay Order ID</Label>
                  <Input
                    id="razorpayOrderId"
                    value={paymentDetails.razorpayOrderId}
                    onChange={(e) => setPaymentDetails({...paymentDetails, razorpayOrderId: e.target.value})}
                    placeholder="Order ID"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Transaction Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div>
                  <Label htmlFor="transactionAmount">Amount</Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="transactionAmount"
                      type="number"
                      value={transactionDetails.amount}
                      onChange={(e) => setTransactionDetails({...transactionDetails, amount: e.target.value})}
                      className="pl-8"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="transactionCurrency">Currency</Label>
                  <Input
                    id="transactionCurrency"
                    value={transactionDetails.currency}
                    onChange={(e) => setTransactionDetails({...transactionDetails, currency: e.target.value})}
                    placeholder="INR"
                  />
                </div>
                <div>
                  <Label htmlFor="transactionMethod">Method</Label>
                  <Input
                    id="transactionMethod"
                    value={transactionDetails.method}
                    onChange={(e) => setTransactionDetails({...transactionDetails, method: e.target.value})}
                    placeholder="upi, card, etc."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <Label htmlFor="razorpayPaymentId">Razorpay Payment ID</Label>
                  <Input
                    id="razorpayPaymentId"
                    value={transactionDetails.razorpayPaymentId}
                    onChange={(e) => setTransactionDetails({...transactionDetails, razorpayPaymentId: e.target.value})}
                    placeholder="Payment ID"
                  />
                </div>
                <div>
                  <Label htmlFor="userId">User ID</Label>
                  <Input
                    id="userId"
                    value={transactionDetails.userId}
                    onChange={(e) => setTransactionDetails({...transactionDetails, userId: e.target.value})}
                    placeholder="User ID"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdatePayment} disabled={loading}>
            {loading ? 'Updating...' : 'Update Payment'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}