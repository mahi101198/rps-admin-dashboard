# Invoice & Email Marketing Module - Complete Guide

This guide explains the invoice generation and email marketing module that has been added to your RPS Dashboard project.

## Overview

The invoice module provides:

1. **PDF Invoice Generation** - Professional, customizable invoice PDFs
2. **Invoice Email Templates** - Beautiful, responsive HTML email templates
3. **Email Sending** - Single and bulk invoice emails with PDF attachments
4. **Mock Data** - Pre-configured test data for development and testing
5. **API Routes** - RESTful endpoints to integrate with your dashboard

---

## Project Structure

### Files Created

```
src/
├── lib/invoice/
│   ├── invoice-pdf-generator.ts         # PDF generation logic
│   ├── invoice-email-generator.ts       # Email template generation
│   ├── invoice-api-client.ts            # Frontend API client utilities
│   └── mock-invoice-data.ts             # Mock data generators
└── app/api/marketing/
    ├── invoice/
    │   └── route.ts                     # PDF generation endpoint
    └── send-invoice-email/
        └── route.ts                     # Email sending endpoint
```

---

## API Endpoints

### 1. Invoice PDF Generation

#### Endpoint: `POST /api/marketing/invoice`

Generate and download an invoice PDF.

**Request:**
```json
{
  "invoiceData": {
    // Optional: Complete InvoiceData object
    // If not provided, uses mock data
  },
  "useMockData": true  // Optional: defaults to true
}
```

**Response:**
- **Status 200**: PDF file (application/pdf)
  - Header: `Content-Disposition: attachment; filename="Invoice_INV-2026-001234.pdf"`
- **Status 400**: Missing required fields
- **Status 500**: Server error

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/marketing/invoice \
  -H "Content-Type: application/json" \
  -d '{"useMockData": true}' \
  --output invoice.pdf
```

---

#### Endpoint: `GET /api/marketing/invoice`

Retrieve invoice data as JSON.

**Query Parameters:**
- `invoiceNumber` (optional): Specific invoice number

**Response:**
```json
{
  "success": true,
  "data": {
    "invoiceNumber": "INV-2026-001234",
    "invoiceDate": "2026-02-16T00:00:00.000Z",
    "dueDate": "2026-03-18T00:00:00.000Z",
    // ... rest of invoice data
  }
}
```

---

### 2. Send Invoice Emails

#### Endpoint: `POST /api/marketing/send-invoice-email`

Send invoice emails with PDF attachments.

**Request:**
```json
{
  "invoiceData": {
    // Optional: Invoice data for single email
  },
  "type": "single",           // "single" or "bulk"
  "useMockData": true,        // Use mock data if not provided
  "bulkCount": 5              // For bulk: number of invoices
}
```

**Response:**
```json
{
  "success": true,
  "type": "single",
  "total": 1,
  "success": 1,
  "failed": 0,
  "results": [
    {
      "invoiceNumber": "INV-2026-001234",
      "email": "customer@example.com",
      "success": true,
      "messageId": "<message-id@zoho.com>"
    }
  ],
  "message": "All invoice emails sent successfully"
}
```

---

#### Endpoint: `GET /api/marketing/send-invoice-email`

Get a preview of the invoice email.

**Query Parameters:**
- `invoiceNumber` (optional): Specific invoice number
- `preview` (default: true): Return HTML preview or JSON

**Response (preview=true):**
- HTML content of the email

**Response (preview=false):**
```json
{
  "success": true,
  "data": {
    "invoiceNumber": "INV-2026-001234",
    "customerEmail": "customer@example.com",
    "subject": "Invoice #INV-2026-001234 - Order #ORD-2026-005678",
    "htmlContent": "...",
    "plainText": "..."
  }
}
```

---

## Frontend Integration

### Using the API Client

The `invoice-api-client.ts` provides easy-to-use functions for frontend integration.

#### 1. Download Invoice PDF

```typescript
import { downloadInvoicePDF } from '@/lib/invoice/invoice-api-client';

// Download with mock data
await downloadInvoicePDF();

// Download with custom invoice data
await downloadInvoicePDF({
  invoiceNumber: 'INV-2026-001234',
  customerEmail: 'customer@example.com'
});
```

#### 2. Send Single Invoice Email

```typescript
import { sendInvoiceEmail } from '@/lib/invoice/invoice-api-client';

const response = await sendInvoiceEmail();
// or with custom data
const response = await sendInvoiceEmail({
  invoiceNumber: 'INV-2026-001234',
  customerEmail: 'customer@example.com'
});

if (response.success) {
  console.log('Email sent:', response.results[0].messageId);
}
```

#### 3. Send Bulk Invoice Emails

```typescript
import { sendBulkInvoiceEmails } from '@/lib/invoice/invoice-api-client';

// Send 5 mock invoices
const response = await sendBulkInvoiceEmails(undefined, 5);

// Send custom invoices
const invoices = [
  { invoiceNumber: 'INV-001', customerEmail: 'user1@example.com' },
  { invoiceNumber: 'INV-002', customerEmail: 'user2@example.com' }
];
const response = await sendBulkInvoiceEmails(invoices);
```

#### 4. Preview Invoice Email

```typescript
import { 
  getInvoiceEmailPreview,
  openInvoiceEmailPreview 
} from '@/lib/invoice/invoice-api-client';

// Get HTML preview
const html = await getInvoiceEmailPreview('INV-2026-001234');

// Open in new window
await openInvoiceEmailPreview('INV-2026-001234');
```

#### 5. Fetch Invoice Data

```typescript
import { fetchInvoiceData } from '@/lib/invoice/invoice-api-client';

const invoice = await fetchInvoiceData('INV-2026-001234');
console.log(invoice.customerName, invoice.totalAmount);
```

---

## React Component Example

```typescript
'use client';

import { useState } from 'react';
import {
  sendInvoiceEmail,
  downloadInvoicePDF,
  openInvoiceEmailPreview
} from '@/lib/invoice/invoice-api-client';

export function InvoiceActions() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSendEmail = async () => {
    try {
      setLoading(true);
      const result = await sendInvoiceEmail();
      setMessage(result.message);
    } catch (error) {
      setMessage('Error: ' + String(error));
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setLoading(true);
      await downloadInvoicePDF();
      setMessage('PDF downloaded successfully');
    } catch (error) {
      setMessage('Error: ' + String(error));
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewEmail = async () => {
    try {
      await openInvoiceEmailPreview();
    } catch (error) {
      setMessage('Error: ' + String(error));
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Invoice Actions</h2>
      
      <div className="flex gap-4 mb-4">
        <button
          onClick={handleDownloadPDF}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          📥 Download PDF
        </button>

        <button
          onClick={handleSendEmail}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          📧 Send Email
        </button>

        <button
          onClick={handlePreviewEmail}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          👁️ Preview Email
        </button>
      </div>

      {message && <p className="text-sm text-gray-600">{message}</p>}
    </div>
  );
}
```

---

## Invoice Data Structure

### InvoiceData Interface

```typescript
interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  orderNumber: string;

  // Customer Info
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  customerState: string;
  customerZip: string;

  // Company Info
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  companyCity: string;
  companyState: string;
  companyZip: string;
  companyWebsite?: string;

  // Order Details
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  discountAmount: number;
  totalAmount: number;

  // Additional Info
  paymentMethod?: string;
  paymentStatus?: 'Paid' | 'Pending' | 'Overdue';
  shippingMethod?: string;
  trackingNumber?: string;
  notes?: string;
  terms?: string;
}

interface InvoiceItem {
  itemId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  total: number;
  category?: string;
}
```

---

## Mock Data Generators

### Generate Single Mock Invoice

```typescript
import { generateMockInvoiceData } from '@/lib/invoice/mock-invoice-data';

const invoice = generateMockInvoiceData();
// or with overrides
const customInvoice = generateMockInvoiceData({
  invoiceNumber: 'INV-2026-999999',
  customerEmail: 'custom@example.com'
});
```

### Generate Multiple Mock Invoices

```typescript
import { generateMockBulkInvoices } from '@/lib/invoice/mock-invoice-data';

// Generate 10 mock invoices with different customers
const invoices = generateMockBulkInvoices(10);
```

### Generate Invoices for Specific Customer

```typescript
import { generateMockInvoicesForCustomer } from '@/lib/invoice/mock-invoice-data';

// Generate 5 invoices for same customer
const invoices = generateMockInvoicesForCustomer(
  'Rajesh Kumar Singh',
  'rajesh@example.com',
  5
);
```

---

## PDF Features

The generated invoices include:

- ✨ Professional header with company branding
- 📄 Invoice and order numbers with dates
- 👤 Billing address
- 📦 Detailed product table with:
  - Product names
  - Quantities
  - Unit prices
  - Tax breakdown
  - Item totals
- 💰 Financial summary:
  - Subtotal
  - Tax (GST)
  - Shipping
  - Discounts
  - Total amount
- ℹ️ Additional information:
  - Payment method
  - Payment status
  - Shipping method
  - Tracking number
  - Notes and terms
- 📅 Auto-generated timestamp
- 📱 Responsive margins and formatting

---

## Email Template Features

The invoice email template includes:

- 🎨 Professional gradient header
- 📧 Personalized greeting
- 📋 Invoice summary box
- 📊 Items table with pricing
- 💵 Financial breakdown
- 🔘 Download PDF button
- 🏢 Billing address section
- 📦 Order information
- 💬 Custom notes
- 📞 Contact information footer
- 🎯 Call-to-action button
- ✅ Responsive design (mobile-friendly)
- 🌐 HTML and plain text versions

---

## Environment Setup

Make sure you have these environment variables in `.env.local`:

```env
# Zoho Mail Configuration
ZOHO_MAIL_USER=your-email@zoho.com
ZOHO_MAIL_PASSWORD=your-zoho-password

# Optional: Firebase config (if using Firebase)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
```

---

## Testing

### Test with Mock Data (No Real Emails Sent)

```bash
# Download PDF with mock data
curl -X POST http://localhost:3000/api/marketing/invoice \
  -H "Content-Type: application/json" \
  -d '{"useMockData": true}' \
  --output test-invoice.pdf

# Get invoice data as JSON
curl http://localhost:3000/api/marketing/invoice

# Get email preview (HTML)
curl http://localhost:3000/api/marketing/send-invoice-email?preview=true
```

### Test Sending Real Emails

```bash
# Send single invoice email
curl -X POST http://localhost:3000/api/marketing/send-invoice-email \
  -H "Content-Type: application/json" \
  -d '{"type": "single", "useMockData": true}'

# Send 5 bulk invoice emails
curl -X POST http://localhost:3000/api/marketing/send-invoice-email \
  -H "Content-Type: application/json" \
  -d '{"type": "bulk", "useMockData": true, "bulkCount": 5}'
```

---

## Troubleshooting

### PDF Not Downloading

- Ensure `jspdf` and `html2canvas` are installed: `npm install jspdf html2canvas`
- Check browser console for CORS or fetch errors
- Verify API endpoint is accessible

### Emails Not Sending

- Verify Zoho credentials in `.env.local`
- Check firewall/network restrictions
- Review server logs for detailed error messages
- Ensure customer email addresses are valid

### Module Not Found Errors

- Make sure all files are created in correct paths
- Run `npm install` to ensure all dependencies are installed
- Restart the development server

### Invoice Data Missing

- Verify mock data generators are working
- Check that custom invoice data is properly formatted
- Ensure dates are JavaScript Date objects

---

## Next Steps

1. **Integrate with Dashboard UI** - Add invoice management page
2. **Connect to Database** - Store invoice history in Firestore
3. **Add Order History** - Load invoices from previous orders
4. **Customize Branding** - Update company info and styling
5. **Advanced Features**:
   - Recurring invoice reminders
   - Payment status tracking
   - Invoice templates library
   - Multiple currency support
   - Custom invoice numbering

---

## Support

For issues or questions:
1. Check the API response error messages
2. Review server console logs
3. Verify environment variables are set
4. Test with mock data first before using real data

---

**Created:** February 16, 2026  
**Module Version:** 1.0.0  
**Status:** Ready for Production
