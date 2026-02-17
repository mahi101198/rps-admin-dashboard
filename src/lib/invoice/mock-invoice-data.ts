import { InvoiceData, InvoiceItem } from './invoice-pdf-generator';

export function generateMockInvoiceData(
  overrides?: Partial<InvoiceData>
): InvoiceData {
  const mockItems: InvoiceItem[] = [
    {
      itemId: 'jewel-001',
      productName: '22K Gold Diamond Solitaire Engagement Ring - 1.5 CT',
      quantity: 1,
      unitPrice: 125000,
      tax: 22500,
      total: 147500,
      category: 'Rings',
    },
    {
      itemId: 'jewel-002',
      productName: 'Platinum Emerald & Ruby Necklace with Micro-Pave Setting',
      quantity: 1,
      unitPrice: 89500,
      tax: 16110,
      total: 105610,
      category: 'Necklaces',
    },
    {
      itemId: 'jewel-003',
      productName: '18K Gold Pearl Studs Earrings with Diamond Accents',
      quantity: 2,
      unitPrice: 34999,
      tax: 12600,
      total: 95198,
      category: 'Earrings',
    },
    {
      itemId: 'jewel-004',
      productName: 'Gold Tennis Bracelet - 7 Inches Premium Quality',
      quantity: 1,
      unitPrice: 45000,
      tax: 8100,
      total: 53100,
      category: 'Bracelets',
    },
    {
      itemId: 'jewel-005',
      productName: 'Kundan & Pearl Wedding Bangle Set (2 Pieces)',
      quantity: 1,
      unitPrice: 22499,
      tax: 4050,
      total: 26549,
      category: 'Bangles',
    },
  ];

  const subtotal = mockItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const tax = mockItems.reduce((sum, item) => sum + item.tax, 0);
  const shipping = 500;
  const discount = 2000;
  const total = subtotal + tax + shipping - discount;

  const today = new Date();
  const dueDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  return {
    invoiceNumber: 'INV-2026-001234',
    invoiceDate: today,
    dueDate: dueDate,
    orderNumber: 'ORD-2026-005678',

    // Customer Info
    customerName: 'Anjali Sharma',
    customerEmail: 'anjali.sharma@email.com',
    customerPhone: '+91-9876543210',
    customerAddress: '789 Maple Avenue, Bandra',
    customerCity: 'Mumbai',
    customerState: 'Maharashtra',
    customerZip: '400050',

    // Company Info
    companyName: 'ABC Jewellery',
    companyEmail: 'orders@abcjewellery.com',
    companyPhone: '+91-9876-JEWEL-1',
    companyAddress: '789 Diamond Plaza, Jewelry District',
    companyCity: 'Mumbai',
    companyState: 'Maharashtra',
    companyZip: '400002',
    companyWebsite: 'www.abcjewellery.com',

    // Order Details
    items: mockItems,
    subtotal,
    tax,
    shipping,
    discount,
    total,

    // Additional Info
    paymentMethod: 'Credit Card (XXXX-XXXX-XXXX-4532)',
    paymentStatus: 'Pending',
    shippingMethod: 'Express Courier (2-3 Business Days)',
    trackingNumber: 'TRK-98765432101',
    notes: 'All jewelry items come with certified authenticity. Please retain this invoice for warranty claims. All precious metal weights are post-processing certified weights.',
    terms:
      'All items are authenticated and hallmarked. Exchanges available within 30 days with original invoice. Customization services available upon request. Payment due upon order confirmation.',
    ...overrides,
  } as InvoiceData;
}

export function generateMockInvoicesForCustomer(
  customerName: string,
  email: string,
  count: number = 5
): Array<InvoiceData> {
  const invoices: InvoiceData[] = [];

  for (let i = 0; i < count; i++) {
    const daysAgo = i * 30;
    const invoiceDate = new Date();
    invoiceDate.setDate(invoiceDate.getDate() - daysAgo);

    const dueDate = new Date(invoiceDate);
    dueDate.setDate(dueDate.getDate() + 30);

    const invoiceData = generateMockInvoiceData({
      invoiceNumber: `INV-2026-${String(1000 + i).padStart(4, '0')}`,
      orderNumber: `ORD-2026-${String(5000 + i).padStart(4, '0')}`,
      customerName,
      customerEmail: email,
      invoiceDate,
      dueDate,
      paymentStatus: i === 0 ? 'Pending' : i % 3 === 0 ? 'Overdue' : 'Paid',
    });

    invoices.push(invoiceData);
  }

  return invoices;
}

export function generateMockBulkInvoices(count: number = 10): Array<InvoiceData> {
  const companies = [
    'TechCorp Solutions',
    'Global Industries',
    'Innovation Labs',
    'Digital Ventures',
    'Prime Consulting',
  ];
  const customers = [
    { name: 'Priya Sharma', email: 'priya.sharma@email.com' },
    { name: 'Amit Patel', email: 'amit.patel@email.com' },
    { name: 'Neha Verma', email: 'neha.verma@email.com' },
    { name: 'Vikram Singh', email: 'vikram.singh@email.com' },
    { name: 'Anjali Gupta', email: 'anjali.gupta@email.com' },
    { name: 'Rohan Desai', email: 'rohan.desai@email.com' },
    { name: 'Sneha Iyer', email: 'sneha.iyer@email.com' },
    { name: 'Arjun Reddy', email: 'arjun.reddy@email.com' },
  ];

  const invoices: InvoiceData[] = [];

  for (let i = 0; i < count; i++) {
    const customer = customers[i % customers.length];
    const invoiceData = generateMockInvoiceData({
      invoiceNumber: `INV-2026-${String(1234 + i).padStart(4, '0')}`,
      orderNumber: `ORD-2026-${String(5678 + i).padStart(4, '0')}`,
      customerName: customer.name,
      customerEmail: customer.email,
      paymentStatus: i % 3 === 0 ? 'Paid' : i % 5 === 0 ? 'Overdue' : 'Pending',
    });

    invoices.push(invoiceData);
  }

  return invoices;
}

export const MOCK_INVOICE = generateMockInvoiceData();
