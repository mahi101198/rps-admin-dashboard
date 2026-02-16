'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';
import { Order } from '@/lib/types/all-schemas';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'placed':
      return 'secondary';
    case 'confirmed':
      return 'default'; // Changed to green-like variant
    case 'paid':
      return 'default'; // Changed to green-like variant
    case 'shipped':
      return 'default';
    case 'out_for_delivery':
      return 'default';
    case 'delivered':
      return 'default';
    case 'cancelled':
      return 'destructive';
    default:
      return 'secondary';
  }
};

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'destructive'; // Changed to red
    case 'paid':
      return 'default';
    case 'failed':
      return 'destructive';
    case 'refunded':
      return 'default';
    default:
      return 'secondary';
  }
};

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: 'orderId',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Order ID
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const orderId = row.original.orderId;
      return (
        <div className="font-medium">
          {orderId ? orderId.slice(-8) : 'Unknown'}
        </div>
      );
    }
  },
  {
    accessorKey: 'userId',
    header: 'User ID',
    cell: ({ row }) => {
      const userId = row.original.userId;
      return (
        <div className="text-muted-foreground text-sm">
          {userId ? userId.slice(-8) : 'Unknown'}
        </div>
      );
    }
  },
  {
    accessorKey: 'items',
    header: 'Items',
    cell: ({ row }) => {
      const items = row.original.items || [];
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
      return (
        <div className="text-sm">
          {items.length} item{items.length !== 1 ? 's' : ''} ({totalItems} unit{totalItems !== 1 ? 's' : ''})
        </div>
      );
    }
  },
  {
    accessorKey: 'pricingSummary.subtotalAfterDiscount',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Total
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const total = row.original.pricingSummary?.subtotalAfterDiscount || row.original.pricing?.total || 0;
      return (
        <div className="font-medium">
          ₹{total.toLocaleString()}
        </div>
      );
    }
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Status
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const status = row.original.status;
      const colorVariant = getStatusColor(status);
      return (
        <Badge variant={colorVariant}>
          {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </Badge>
      );
    }
  },
  {
    accessorKey: 'paymentStatus',
    header: 'Payment',
    cell: ({ row }) => {
      const paymentStatus = row.original.paymentStatus;
      const colorVariant = getPaymentStatusColor(paymentStatus);
      return (
        <Badge variant={colorVariant}>
          {paymentStatus.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </Badge>
      );
    }
  },
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }) => {
      const createdAt = row.original.createdAt;
      if (!createdAt) return 'Unknown';
      
      return (
        <div className="text-sm text-muted-foreground">
          {createdAt.toLocaleDateString()}
        </div>
      );
    }
  }
];