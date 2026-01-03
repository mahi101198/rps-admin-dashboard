'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PaymentDetailsDialog } from './payment-details-dialog';
import { EditPaymentDialog } from './edit-payment-dialog';
import { Payment } from '@/lib/types/product';
import { useRouter } from 'next/navigation'; // Add this import

function getPaymentStatusBadgeVariant(status: any) {
  switch (status) {
    case 'successful':
      return 'default';
    case 'pending':
      return 'outline';
    case 'failed':
      return 'destructive';
    case 'refunded':
      return 'outline';
    default:
      return 'outline';
  }
}

function getMethodBadgeVariant(method: any) {
  switch (method) {
    case 'upi':
      return 'default';
    case 'cod':
      return 'secondary';
    default:
      return 'outline';
  }
}

export function PaymentsTableWrapper({ payments }: { payments: Payment[] }) {
  const router = useRouter(); // Add router
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [showEdit, setShowEdit] = useState<string | null>(null);

  const handleDataChange = () => {
    // Use router.refresh() to re-fetch the data without a full page reload
    router.refresh();
  };

  const formatDate = (date: Date | undefined): string => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4">Payment ID</th>
            <th className="text-left py-3 px-4">Order ID</th>
            <th className="text-left py-3 px-4">Method</th>
            <th className="text-left py-3 px-4">Amount</th>
            <th className="text-left py-3 px-4">Status</th>
            <th className="text-left py-3 px-4">Date</th>
            <th className="text-left py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <PaymentRow 
              key={payment.paymentId} 
              payment={payment} 
              formatDate={formatDate}
              showDetails={showDetails}
              setShowDetails={setShowDetails}
              showEdit={showEdit}
              setShowEdit={setShowEdit}
              onDataChange={handleDataChange}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PaymentRow({ 
  payment, 
  formatDate,
  showDetails,
  setShowDetails,
  showEdit,
  setShowEdit,
  onDataChange
}: { 
  payment: Payment; 
  formatDate: (date: Date | undefined) => string;
  showDetails: string | null;
  setShowDetails: (id: string | null) => void;
  showEdit: string | null;
  setShowEdit: (id: string | null) => void;
  onDataChange?: () => void;
}) {
  const handlePaymentUpdated = () => {
    // Refresh the data without a full page reload
    onDataChange?.();
  };

  const isDetailsOpen = showDetails === payment.paymentId;
  const isEditOpen = showEdit === payment.paymentId;

  return (
    <>
      <tr className="border-b hover:bg-muted/50">
        <td className="py-3 px-4 font-mono text-sm">
          {payment.paymentId.slice(0, 8)}...
        </td>
        <td className="py-3 px-4 font-mono text-sm">
          {payment.orderId.slice(0, 8)}...
        </td>
        <td className="py-3 px-4">
          <Badge variant={getMethodBadgeVariant(payment.paymentMethod as any)}>
            {payment.paymentMethod.toUpperCase()}
          </Badge>
        </td>
        <td className="py-3 px-4 font-medium">
          ₹{payment.amount.toLocaleString()}
        </td>
        <td className="py-3 px-4">
          <Badge variant={getPaymentStatusBadgeVariant(payment.status)}>
            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
          </Badge>
        </td>
        <td className="py-3 px-4 text-sm text-muted-foreground">
          {formatDate(payment.timestamps?.initiatedAt)}
        </td>
        <td className="py-3 px-4 flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowDetails(payment.paymentId)}
          >
            View
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => setShowEdit(payment.paymentId)}
          >
            Edit
          </Button>
        </td>
      </tr>
      <PaymentDetailsDialog 
        payment={payment} 
        open={isDetailsOpen} 
        onOpenChange={(open) => setShowDetails(open ? payment.paymentId : null)} 
      />
      <EditPaymentDialog 
        payment={payment} 
        open={isEditOpen} 
        onOpenChange={(open) => setShowEdit(open ? payment.paymentId : null)} 
        onPaymentUpdated={handlePaymentUpdated}
      />
    </>
  );
}