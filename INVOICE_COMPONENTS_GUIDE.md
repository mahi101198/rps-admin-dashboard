# Invoice Components - Integration Guide

## 📦 Available Components

Pre-built React components for quick integration into your dashboard.

### File Location
```
src/components/invoice-components.tsx
```

---

## 🎯 Components Overview

### 1. **InvoiceActionsDialog**
Simple component with action buttons for a single invoice.

**Props:**
```typescript
interface Props {
  invoiceNumber?: string;
}
```

**Features:**
- Download PDF button
- Send Email button
- Preview button
- Status messages
- Loading state

**Usage:**
```typescript
import { InvoiceActionsDialog } from '@/components/invoice-components';

export default function Page() {
  return <InvoiceActionsDialog invoiceNumber="INV-2026-001" />;
}
```

---

### 2. **InvoiceManager**
Displays invoice details with all information and actions.

**Props:**
```typescript
interface Props {
  invoiceNumber?: string;
}
```

**Features:**
- Load invoice data
- Display customer info
- Show all items
- Display financial summary
- Action buttons
- Error handling

**Usage:**
```typescript
import { InvoiceManager } from '@/components/invoice-components';

export default function Page() {
  return <InvoiceManager invoiceNumber="INV-2026-001" />;
}
```

---

### 3. **BulkInvoiceSender**
Send multiple invoices in bulk.

**Features:**
- Configurable invoice count
- Batch processing
- Result display
- Success/error tracking
- Detailed results list

**Usage:**
```typescript
import { BulkInvoiceSender } from '@/components/invoice-components';

export default function Page() {
  return <BulkInvoiceSender />;
}
```

---

### 4. **InvoiceEmailPreview**
Preview email before sending.

**Props:**
```typescript
interface Props {
  invoiceNumber?: string;
}
```

**Usage:**
```typescript
import { InvoiceEmailPreview } from '@/components/invoice-components';

export default function Page() {
  return <InvoiceEmailPreview invoiceNumber="INV-2026-001" />;
}
```

---

### 5. **InvoiceDashboard**
Complete dashboard with all features combined.

**Features:**
- All components in one view
- Responsive grid layout
- Full invoice management

**Usage:**
```typescript
import { InvoiceDashboard } from '@/components/invoice-components';

export default function Page() {
  return <InvoiceDashboard />;
}
```

---

## 📋 Integration Examples

### Example 1: Add to Existing Page

```typescript
// src/app/(protected)/marketing/invoices/page.tsx
'use client';

import { InvoiceActionsDialog } from '@/components/invoice-components';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function InvoicesPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Invoice Management</h1>
        <p className="text-gray-600">Generate, send, and manage invoices</p>
      </div>

      <InvoiceActionsDialog invoiceNumber="INV-2026-001" />
    </div>
  );
}
```

### Example 2: Create Invoice List with Actions

```typescript
'use client';

import { useState } from 'react';
import { InvoiceActionsDialog } from '@/components/invoice-components';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  amount: number;
  date: string;
}

const mockInvoices: Invoice[] = [
  { id: '1', invoiceNumber: 'INV-2026-001', customerName: 'John Doe', amount: 5000, date: '2026-02-16' },
  { id: '2', invoiceNumber: 'INV-2026-002', customerName: 'Jane Smith', amount: 7500, date: '2026-02-15' },
];

export default function InvoiceList() {
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Recent Invoices</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invoice List */}
        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mockInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  onClick={() => setSelectedInvoice(invoice.invoiceNumber)}
                  className={`p-3 border rounded cursor-pointer ${
                    selectedInvoice === invoice.invoiceNumber
                      ? 'bg-blue-50 border-blue-300'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <p className="font-semibold">{invoice.invoiceNumber}</p>
                  <p className="text-sm text-gray-600">{invoice.customerName}</p>
                  <p className="text-sm font-medium">₹{invoice.amount}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Invoice Actions */}
        {selectedInvoice && (
          <InvoiceActionsDialog invoiceNumber={selectedInvoice} />
        )}
      </div>
    </div>
  );
}
```

### Example 3: Invoice Management Dashboard

```typescript
// src/app/(protected)/dashboard/invoices/page.tsx
'use client';

import { InvoiceDashboard } from '@/components/invoice-components';
import { PageHeader } from '@/components/ui/page-header';

export default function InvoiceManagementPage() {
  return (
    <div>
      <PageHeader
        title="Invoice Management"
        description="Create, send, and manage invoices for your business"
      />
      <InvoiceDashboard />
    </div>
  );
}
```

---

## 🎨 Styling & Customization

### Using Tailwind CSS

All components use Tailwind CSS for styling. They're compatible with shadcn/ui components.

### Customizing Component Appearance

**Example: Override card styling**
```typescript
import { InvoiceActionsDialog } from '@/components/invoice-components';

export function CustomInvoiceComponent() {
  return (
    <div className="max-w-md mx-auto">
      <InvoiceActionsDialog invoiceNumber="INV-001" />
    </div>
  );
}
```

---

## 🔗 Navigation Integration

### Add to Sidebar

```typescript
// src/components/sidebar.tsx
import Link from 'next/link';

export function Sidebar() {
  return (
    <nav className="space-y-4">
      {/* ... other nav items ... */}
      
      <Link href="/marketing/invoices">
        📋 Invoices
      </Link>
    </nav>
  );
}
```

### Add to Dashboard Grid

```typescript
// src/app/(protected)/dashboard/page.tsx
import { InvoiceActionsDialog } from '@/components/invoice-components';
import QuickStatCard from '@/components/ui/quick-stat-card';

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      <QuickStatCard title="Total Invoices" value="1,234" />
      <QuickStatCard title="Pending" value="45" />
      <QuickStatCard title="Sent Today" value="12" />
      
      <div className="lg:col-span-3">
        <InvoiceActionsDialog />
      </div>
    </div>
  );
}
```

---

## 🧩 Combining Components

### Example: Full Invoice Page

```typescript
'use client';

import { 
  InvoiceManager, 
  BulkInvoiceSender, 
  InvoiceActionsDialog 
} from '@/components/invoice-components';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function InvoicePage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Invoice Management</h1>

      <Tabs defaultValue="single">
        <TabsList>
          <TabsTrigger value="single">Single Invoice</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Sending</TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="space-y-6">
          <InvoiceManager />
          <InvoiceActionsDialog />
        </TabsContent>

        <TabsContent value="bulk">
          <BulkInvoiceSender />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

## 📱 Responsive Design

All components are fully responsive and work on:
- ✅ Mobile devices
- ✅ Tablets
- ✅ Desktop screens

### Layout Example
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <InvoiceActionsDialog />
  <BulkInvoiceSender />
  <InvoiceManager />
</div>
```

---

## 🎯 State Management

Components handle their own state internally. No external state management needed.

### If You Need Shared State

Use React Context or Zustand:

```typescript
'use client';

import { createContext, useState } from 'react';

export const InvoiceContext = createContext();

export function InvoiceProvider({ children }) {
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  return (
    <InvoiceContext.Provider value={{ selectedInvoice, setSelectedInvoice }}>
      {children}
    </InvoiceContext.Provider>
  );
}
```

---

## 🔒 Authentication

Components work with the existing auth system. Optional auth verification:

```typescript
// Uncomment in route.ts if you want to verify auth
// await verifyAuth();
```

---

## 📊 Data Flow

```
Component
    ↓
API Client (invoice-api-client.ts)
    ↓
API Routes (marketing/invoice/*)
    ↓
Business Logic (generators, email)
    ↓
Response back to Component
    ↓
UI Update
```

---

## 🚀 Quick Setup Checklist

- [ ] Copy components from `src/components/invoice-components.tsx`
- [ ] Create new page in `src/app/(protected)/marketing/invoices/page.tsx`
- [ ] Import and use `InvoiceActionsDialog` or `InvoiceDashboard`
- [ ] Add navigation link to sidebar
- [ ] Test with mock data
- [ ] Configure real invoice data
- [ ] Deploy!

---

## 📚 Related Files

- **API Client**: `src/lib/invoice/invoice-api-client.ts`
- **Mock Data**: `src/lib/invoice/mock-invoice-data.ts`
- **Utilities**: `src/lib/invoice/invoice-*-generator.ts`
- **Routes**: `src/app/api/marketing/**/route.ts`

---

## 💡 Tips

1. **Start Simple**: Use `InvoiceActionsDialog` for a quick setup
2. **Build Up**: Add more features with `InvoiceManager`
3. **Customize**: Modify CSS classes to match your design
4. **Test**: Always test with mock data first
5. **Monitor**: Check server logs for any errors

---

**Ready to add to your dashboard? Start with Example 1 above!**
