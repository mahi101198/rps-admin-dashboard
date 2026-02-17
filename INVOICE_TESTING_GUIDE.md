# 📋 Invoice Testing Tab - Usage Guide

## 🎯 Where to Find It

**Location**: Email Marketing Hub → Invoice Test Tab

**URL**: `http://localhost:3000/email-marketing`

Then click the **"Invoice Test"** tab (6th tab after Analytics)

---

## 🚀 How to Test Invoice Email

### **Step 1: Enter Email Address**
1. Go to Invoice Test tab
2. Enter test email in the input box: `your-email@example.com`
3. Email must be valid format

### **Step 2: Preview (Optional)**
Click **"👁️ Preview"** to see:
- How the email looks in browser
- Responsive design on mobile
- All formatting and styling

### **Step 3: Download PDF (Optional)**
Click **"📥 Download PDF"** to:
- Generate invoice PDF
- Download to your computer
- Verify PDF contains all details

### **Step 4: Send Test Email**
Click **"📧 Send Test Email"** to:
- Generate comprehensive invoice
- Create professional email
- Attach PDF to email
- Send to your address

---

## 📊 What's Included in Test Invoice

### Invoice Details
```
✓ Invoice #: INV-2026-001234
✓ Order #: ORD-2026-005678
✓ Dates: Generated & Due dates
✓ Customer: Rajesh Kumar Singh
✓ Company: RPS Enterprise Solutions
```

### Products (5 Items)
```
✓ Premium Office Desk - Qty: 2 @ ₹15,999
✓ Ergonomic Office Chair - Qty: 1 @ ₹8,499
✓ LED Desk Lamp 40W - Qty: 3 @ ₹1,299
✓ Wireless Keyboard & Mouse - Qty: 1 @ ₹2,499
✓ Desk Organizer - Qty: 2 @ ₹599
```

### Financial Summary
```
✓ Subtotal: ₹68,371
✓ GST Tax: ₹12,287
✓ Shipping: ₹500
✓ Discount: ₹2,000
✓ Total: ₹79,158
```

### Additional Details
```
✓ Payment Method: Credit Card (XXXX-4532)
✓ Payment Status: Pending
✓ Shipping Method: Express Courier
✓ Tracking Number: TRK-98765432101
✓ Custom Notes & Terms
✓ Complete Company Info
```

---

## ✉️ Email Features

The test email includes:
- ✅ Professional HTML design
- ✅ Responsive layout (works on phone/tablet/desktop)
- ✅ Invoice summary section
- ✅ Itemized product table
- ✅ Financial breakdown
- ✅ Download button (to get PDF)
- ✅ Shipping information
- ✅ Payment status badge
- ✅ Company contact details
- ✅ PDF attachment with invoice

---

## 🧪 Test Scenarios

### **Scenario 1: Preview Email Only**
```
✓ Enter email: yourself@example.com
✓ Click "Preview"
✓ Browser opens new tab with email HTML
✓ No email actually sent
✓ Perfect for checking design
```

### **Scenario 2: Download PDF Only**
```
✓ Enter email: yourself@example.com
✓ Click "Download PDF"
✓ PDF file downloads
✓ Open and verify content
✓ No email sent
```

### **Scenario 3: Send Real Email (With Configuration)**
```
✓ Setup .env.local with Zoho credentials:
   ZOHO_MAIL_USER=your-email@zoho.com
   ZOHO_MAIL_PASSWORD=your-password
✓ Restart dev server
✓ Enter test email
✓ Click "Send Test Email"
✓ Check your inbox (30 sec delay possible)
```

### **Scenario 4: Full Test Flow**
```
1. Preview email
2. Download PDF
3. Check both are good
4. Send test email
5. Verify email received
6. Done! ✓
```

---

## 📱 Response Messages

### ✅ Success Message
```
✓ Test invoice email sent successfully to customer@example.com
Message ID: <msg-id@zoho.com-123456>
```

### ❌ Error Messages

**Invalid Email**
```
Please enter a valid email address
```

**Missing Email**
```
Please enter an email address
```

**Sending Failed**
```
Failed to send test email
Details: [error message]
```

**PDF Generation Failed**
```
Error downloading PDF: [error details]
```

---

## 🔧 Configuration

### Prerequisites
For email sending to work, configure `.env.local`:

```env
ZOHO_MAIL_USER=your-email@zoho.com
ZOHO_MAIL_PASSWORD=your-app-specific-password
```

**Steps:**
1. Open `.env.local` in project root
2. Add/update Zoho credentials
3. Save file
4. Restart `npm run dev`
5. Test invoice email should now send

### Without Configuration
Features still available:
- ✅ Preview email
- ✅ Download PDF
- ❌ Send email (will fail)

---

## 💡 Tips

1. **Always Preview First** - Check email design before sending
2. **Test PDF Before Email** - Verify PDF quality separately
3. **Check Spam Folder** - Test emails sometimes go to spam
4. **Use Your Own Email** - Easiest way to verify reception
5. **Check Server Logs** - Terminal shows email sending status
6. **Wait 30 Seconds** - Email delivery has slight delay

---

## 🎯 Real-World Usage

After testing with mock data, you can:

### 1. **Send to Actual Customers**
Replace mock data with real invoice information:
```typescript
const invoice = {
  invoiceNumber: 'INV-2026-12345',
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  items: [...real items...],
  totalAmount: 45000,
  // ... other real data
};
```

### 2. **Integrate with Order System**
Load invoice data from database:
```typescript
// Get invoice from database
const invoice = await db.collection('invoices').doc(id).get();

// Generate and send
await sendInvoiceEmail(invoice.data());
```

### 3. **Bulk Send to Multiple Customers**
```typescript
// Get list of invoices
const invoices = await db.collection('invoices').get();

// Send to all
for (const doc of invoices.docs) {
  await sendInvoiceEmail(doc.data());
}
```

---

## 📛 Info Box - Test Data References

The side panels show:
- ✓ What test data is included
- ✓ Email features provided
- ✓ Invoice format breakdown
- ℹ️ Configuration reminder

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Email input won't work | Make sure you've entered valid email format |
| Preview doesn't open | Check if popup blocker is enabled |
| PDF download fails | Check browser console for errors, try refresh |
| Email not sending | Verify Zoho credentials in .env.local |
| Email in spam | Add sender to contacts, check spam filter |
| No response message | Check network and server logs |
| CSS looks broken | Clear browser cache or hard refresh (Ctrl+F5) |

---

## 🚀 Quick Test (5 Minutes)

1. Open: `http://localhost:3000/email-marketing`
2. Click: "Invoice Test" tab
3. Enter: `test@example.com`
4. Click: "Preview" → opens email
5. Click: "Download PDF" → saves invoice
6. Click: "Send Test Email" → result shows

**Done!** You've tested the complete invoice system. ✅

---

## 📚 Related Documentation

- **INVOICE_MODULE_GUIDE.md** - Complete invoice API reference
- **INVOICE_QUICK_START.md** - Quick start guide
- **IMPLEMENTATION_COMPLETE.md** - Technical details
- **INVOICE_COMPONENTS_GUIDE.md** - Component integration

---

## 🎉 Done!

The invoice testing feature is fully integrated and ready to use. Test it now! 🚀
