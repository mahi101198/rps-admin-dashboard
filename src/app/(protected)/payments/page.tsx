'use client';

import { Payment, PaymentMode, PaymentStatus } from '@/lib/types/all-schemas';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { getPaymentsAction } from '@/actions/payment-actions';
import { PaymentsTableWrapper } from './payments-table-wrapper';

function getPaymentStatusBadgeVariant(status: PaymentStatus) {
  switch (status) {
    case 'completed':
      return 'default';
    case 'pending':
      return 'outline';
    case 'failed':
      return 'destructive';
    case 'refunded':
      return 'outline';
    case 'cancelled':
      return 'secondary';
    default:
      return 'outline';
  }
}

function getMethodBadgeVariant(method: PaymentMode) {
  switch (method) {
    case 'upi':
      return 'default';
    case 'cod':
      return 'secondary';
    default:
      return 'outline';
  }
}

function getPaymentStats(payments: Payment[]) {
  return {
    total: payments.length,
    successful: payments.filter(p => p.status === 'completed').length,
    pending: payments.filter(p => p.status === 'pending').length,
    failed: payments.filter(p => p.status === 'failed').length,
    refunded: payments.filter(p => p.status === 'refunded').length,
    totalAmount: payments
      .filter(p => p.status === 'completed')
      .reduce((sum, payment) => sum + payment.amount, 0),
    upiPayments: payments.filter(p => p.paymentMethod === 'upi').length,
    codPayments: payments.filter(p => p.paymentMethod === 'cod').length,
    avgAttempts: payments.length > 0 ? 
      payments.reduce((sum, p) => sum + p.attemptCount, 0) / payments.length : 0
  };
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const paymentsData = await getPaymentsAction();
        setPayments(paymentsData);
      } catch (error) {
        console.error('Error fetching payments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  if (loading) {
    return <div className="p-6">Loading payments...</div>;
  }

  const stats = getPaymentStats(payments);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">💳 Payments Management</h1>
          <p className="text-muted-foreground">Track UPI and COD payment transactions</p>
        </div>
        <Button>
          + Manual Payment
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <span className="text-2xl">💳</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All payment attempts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful</CardTitle>
            <span className="text-2xl">✅</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.successful}</div>
            <p className="text-xs text-muted-foreground">Completed payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <span className="text-2xl">❌</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <p className="text-xs text-muted-foreground">Failed attempts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <span className="text-2xl">💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Successful payments</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods & Status */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>💱 Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="default">UPI</Badge>
                  <span className="text-sm">Digital payments</span>
                </div>
                <span className="font-medium">{stats.upiPayments}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">COD</Badge>
                  <span className="text-sm">Cash on delivery</span>
                </div>
                <span className="font-medium">{stats.codPayments}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📊 Payment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="default">Successful</Badge>
                </div>
                <span className="font-medium">{stats.successful}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Pending</Badge>
                </div>
                <span className="font-medium">{stats.pending}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">Failed</Badge>
                </div>
                <span className="font-medium">{stats.failed}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Refunded</Badge>
                </div>
                <span className="font-medium">{stats.refunded}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Recent Payments</CardTitle>
          <CardDescription>All payment transactions in descending order</CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentsTableWrapper payments={payments} />
        </CardContent>
      </Card>
    </div>
  );
}