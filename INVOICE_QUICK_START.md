# Invoice Module - Quick Start Reference

## 📦 What's Included

### New Files Created
```
✅ src/lib/invoice/invoice-pdf-generator.ts
✅ src/lib/invoice/invoice-email-generator.ts
✅ src/lib/invoice/invoice-api-client.ts
✅ src/lib/invoice/mock-invoice-data.ts
✅ src/app/api/marketing/invoice/route.ts
✅ src/app/api/marketing/send-invoice-email/route.ts
```

### Dependencies Installed
```
✅ jspdf - PDF generation
✅ html2canvas - HTML to canvas conversion
```

---

## 🚀 Quick Start

### 1. Download Invoice PDF
```typescript
import { downloadInvoicePDF } from '@/lib/invoice/invoice-api-client';

// Download with mock data
await downloadInvoicePDF();

// Download with custom data
await downloadInvoicePDF({ invoiceNumber: 'INV-123' });
```

### 2. Send Invoice Email
```typescript
import { sendInvoiceEmail, sendBulkInvoiceEmails } from '@/lib/invoice/invoice-api-client';

// Single email
await sendInvoiceEmail();

// Bulk emails (5 invoices)
await sendBulkInvoiceEmails(undefined, 5);
```

### 3. Preview Email
```typescript
import { openInvoiceEmailPreview } from '@/lib/invoice/invoice-api-client';

// Opens in new browser window
await openInvoiceEmailPreview();
```

### 4. Get Invoice Data
```typescript
import { fetchInvoiceData } from '@/lib/invoice/invoice-api-client';

const invoice = await fetchInvoiceData('INV-2026-001234');
console.log(invoice.customerName, invoice.totalAmount);
```

---

## 📋 API Endpoints

### Invoice Generation
```
POST /api/marketing/invoice          → Download PDF
GET  /api/marketing/invoice          → Get JSON data
```

### Invoice Email
```
POST /api/marketing/send-invoice-email   → Send email
GET  /api/marketing/send-invoice-email   → Preview email
```

---

## 💡 Use Cases

### Scenario 1: E-commerce Order Invoice
```typescript
const invoice = {
  invoiceNumber: 'INV-2026-001',
  orderNumber: 'ORD-2026-005678',
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  items: [{
    productName: 'Premium Chair',
    quantity: 2,
    unitPrice: 5000,
    tax: 1800,
    total: 10800
  }],
  subtotal: 10000,
  taxAmount: 1800,
  shippingCost: 500,
  discountAmount: 0,
  totalAmount: 12300
};

// Send invoice email with PDF attachment
await sendInvoiceEmail(invoice);
```

### Scenario 2: Bulk Invoice Sending
```typescript
// Send 10 invoices to different customers
await sendBulkInvoiceEmails(undefined, 10);
```

### Scenario 3: Manual PDF Download
```typescript
// User clicks download button
button.onClick = async () => {
  await downloadInvoicePDF({ invoiceNumber: 'INV-2026-001234' });
};
```

---

## 🎨 PDF Features

- Professional header with company branding
- Invoice/Order numbers
- Detailed items table
- Tax breakdown
- Discount support
- Payment status badge
- Shipping information
- Custom notes & terms
- Auto-generated timestamp

---

## ✉️ Email Features

- Responsive HTML template
- Personalized greeting
- Invoice summary box
- Items table
- Financial breakdown
- Download button
- Contact information
- Mobile-friendly design
- Plain text fallback

---

## 🧪 Testing

### With Mock Data (No Real Emails)
```bash
curl -X POST http://localhost:3000/api/marketing/invoice \
  -H "Content-Type: application/json" \
  -d '{"useMockData": true}'
```

### Send Test Email
```bash
curl -X POST http://localhost:3000/api/marketing/send-invoice-email \
  -H "Content-Type: application/json" \
  -d '{"type": "single", "useMockData": true}'
```

---

## 🔧 Configuration

### Zoho Mail Setup (.env.local)
```env
ZOHO_MAIL_USER=your-email@zoho.com
ZOHO_MAIL_PASSWORD=your-password
```

---

## 📊 Mock Data Available

```typescript
import { 
  generateMockInvoiceData,
  generateMockBulkInvoices,
  generateMockInvoicesForCustomer,
  MOCK_INVOICE 
} from '@/lib/invoice/mock-invoice-data';

// Single mock invoice
const inv = generateMockInvoiceData();

// 10 mock invoices
const invoices = generateMockBulkInvoices(10);

// 5 invoices for same customer
const customerInvoices = generateMockInvoicesForCustomer(
  'Rajesh Kumar Singh',
  'rajesh@example.com',
  5
);
```

---

## 🎯 Next: Create UI Component

```typescript
'use client';

import { sendInvoiceEmail, downloadInvoicePDF } from '@/lib/invoice/invoice-api-client';

export function InvoiceCard({ invoiceNumber }) {
  return (
    <div className="p-4 border rounded">
      <h3>{invoiceNumber}</h3>
      
      <button onClick={() => downloadInvoicePDF({ invoiceNumber })}>
        📥 Download
      </button>
      
      <button onClick={() => sendInvoiceEmail({ invoiceNumber })}>
        📧 Send Email
      </button>
    </div>
  );
}
```

---

## ❓ Common Questions

**Q: Do I need Firebase?**  
A: No, the invoice module is independent. Optional auth can be enabled.

**Q: Can I customize the invoice design?**  
A: Yes, edit `invoice-pdf-generator.ts` to change colors, fonts, layout.

**Q: How do I use real data?**  
A: Pass your invoice data to the functions instead of using `useMockData: true`.

**Q: Can I add more invoice items?**  
A: Yes, the items array can contain any number of products.

**Q: How long do PDFs take to generate?**  
A: Usually < 1 second per PDF.

---

## 🚨 Troubleshooting

| Problem | Solution |
|---------|----------|
| Module not found | Run `npm install jspdf html2canvas` |
| Emails not sending | Check `.env.local` has Zoho credentials |
| PDF downloading blank | Check browser console for errors |
| Invoice data missing | Verify all required fields are provided |
| Dates are strings | Ensure dates are JavaScript Date objects |

---

**Ready to use! Start with the Quick Start section above.**
