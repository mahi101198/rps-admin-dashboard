import jsPDF from 'jspdf';

// Premium formatting utilities
class PremiumFormatter {
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  static formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  }

  static formatWeight(weight: number): string {
    return `${weight.toFixed(2)} gms`;
  }

  static formatPurity(purity: string): string {
    return purity.toUpperCase();
  }
}

export interface InvoiceItem {
  itemId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  total: number;
  category?: string;
  purity?: string;
  weight?: number;
  stoneCharges?: number;
  makingCharges?: number;
  hsn?: string;
}

export interface InvoiceData {
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
  companyAddress: string;
  companyCity: string;
  companyState: string;
  companyZip: string;
  companyPhone: string;
  companyEmail: string;
  gstNumber?: string;
  panNumber?: string;

  // Invoice Details
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;

  // Additional Info
  paymentMethod?: string;
  paymentStatus: 'Paid' | 'Pending' | 'Overdue';
  notes?: string;
  terms?: string;
}

export class PremiumInvoicePDFGenerator {
  private pdf: InstanceType<typeof jsPDF>;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number = 15;
  private currentY: number = 0;

  constructor() {
    this.pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    this.pageWidth = this.pdf.internal.pageSize.getWidth();
    this.pageHeight = this.pdf.internal.pageSize.getHeight();
    this.currentY = this.margin;
  }

  private addNewPageIfNeeded(requiredSpace: number): void {
    if (this.currentY + requiredSpace > this.pageHeight - this.margin) {
      this.pdf.addPage();
      this.currentY = this.margin;
    }
  }

  private addHeader(invoiceData: InvoiceData): void {
    // Elegant background header
    this.pdf.setFillColor(45, 45, 55);
    this.pdf.rect(0, 0, this.pageWidth, 50, 'F');

    // Gold accent line
    this.pdf.setFillColor(212, 175, 55);
    this.pdf.rect(0, 47, this.pageWidth, 3, 'F');

    // Company Logo (RJ in circle)
    this.pdf.setFillColor(212, 175, 55);
    this.pdf.circle(25, 25, 12, 'F');
    this.pdf.setFont('Helvetica', 'bold');
    this.pdf.setFontSize(16);
    this.pdf.setTextColor(45, 45, 55);
    this.pdf.text('RJ', 25, 28, { align: 'center' });

    // Company Name
    this.pdf.setFont('Helvetica', 'bold');
    this.pdf.setFontSize(22);
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.text('ROYAL JEWELS', 45, 25);

    // Company Tagline
    this.pdf.setFont('Helvetica', 'normal');
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(212, 175, 55);
    this.pdf.text('Timeless Elegance Since 1998', 45, 33);

    // Invoice Title (Right side)
    this.pdf.setFont('Helvetica', 'bold');
    this.pdf.setFontSize(28);
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.text('INVOICE', this.pageWidth - this.margin, 25, { align: 'right' });

    // Invoice Details Background
    this.pdf.setFillColor(240, 240, 240);
    this.pdf.rect(this.pageWidth - 85, 60, 70, 35, 'F');
    
    // Invoice Details Border
    this.pdf.setDrawColor(212, 175, 55);
    this.pdf.setLineWidth(1);
    this.pdf.rect(this.pageWidth - 85, 60, 70, 35);

    // Invoice Details
    this.pdf.setFont('Helvetica', 'bold');
    this.pdf.setFontSize(9);
    this.pdf.setTextColor(45, 45, 55);

    const invoiceDetails = [
      [`Invoice Number:`, invoiceData.invoiceNumber],
      [`Invoice Date:`, PremiumFormatter.formatDate(invoiceData.invoiceDate)],
      [`Order ID:`, invoiceData.orderNumber],
      [`Due Date:`, PremiumFormatter.formatDate(invoiceData.dueDate)]
    ];

    let detailsY = 67;
    invoiceDetails.forEach(([label, value]) => {
      this.pdf.setFont('Helvetica', 'normal');
      this.pdf.text(label, this.pageWidth - 82, detailsY);
      this.pdf.setFont('Helvetica', 'bold');
      this.pdf.text(value, this.pageWidth - 18, detailsY, { align: 'right' });
      detailsY += 6;
    });

    this.currentY = 105;
  }

  private addCustomerInfo(invoiceData: InvoiceData): void {
    // Customer and Store details side by side
    const leftColumnX = this.margin;
    const rightColumnX = this.pageWidth / 2 + 10;

    // Bill To Section
    this.pdf.setFont('Helvetica', 'bold');
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(45, 45, 55);
    this.pdf.text('BILL TO:', leftColumnX, this.currentY);
    
    // Store Details Section
    this.pdf.text('STORE DETAILS:', rightColumnX, this.currentY);
    this.currentY += 8;

    // Customer Details Box
    this.pdf.setDrawColor(212, 175, 55);
    this.pdf.setLineWidth(0.5);
    this.pdf.rect(leftColumnX, this.currentY - 3, this.pageWidth / 2 - 15, 35);
    
    // Store Details Box
    this.pdf.rect(rightColumnX, this.currentY - 3, this.pageWidth / 2 - 25, 35);

    // Customer Details
    this.pdf.setFont('Helvetica', 'bold');
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(45, 45, 55);
    this.pdf.text(`Customer Name: ${invoiceData.customerName}`, leftColumnX + 3, this.currentY + 3);
    
    this.pdf.setFont('Helvetica', 'normal');
    this.pdf.setFontSize(9);
    const customerLines = [
      `Phone: ${invoiceData.customerPhone}`,
      `Email: ${invoiceData.customerEmail}`,
      `Address: ${invoiceData.customerAddress}`,
      `${invoiceData.customerCity}, ${invoiceData.customerState} ${invoiceData.customerZip}`
    ];

    let customerY = this.currentY + 8;
    customerLines.forEach((line) => {
      this.pdf.text(line, leftColumnX + 3, customerY);
      customerY += 5;
    });

    // Store Details
    this.pdf.setFont('Helvetica', 'bold');
    this.pdf.setFontSize(10);
    this.pdf.text(`Store Name: Royal Jewels`, rightColumnX + 3, this.currentY + 3);
    
    this.pdf.setFont('Helvetica', 'normal');
    this.pdf.setFontSize(9);
    const storeLines = [
      invoiceData.gstNumber ? `GST: ${invoiceData.gstNumber}` : 'GST: 27ABCDE1234F1Z5',
      invoiceData.panNumber ? `PAN: ${invoiceData.panNumber}` : 'PAN: ABCDE1234F',
      `Contact: ${invoiceData.companyPhone}`,
      `Store Address: 456, Diamond Road, Mumbai, India`
    ];

    let storeY = this.currentY + 8;
    storeLines.forEach((line) => {
      this.pdf.text(line, rightColumnX + 3, storeY);
      storeY += 5;
    });

    this.currentY += 45;
  }

  private addItemsTable(invoiceData: InvoiceData): void {
    this.addNewPageIfNeeded(80);

    const tableStartX = this.margin;
    const tableStartY = this.currentY;
    const tableWidth = this.pageWidth - (2 * this.margin);
    
    // Define columns with proportional widths
    const col1Width = tableWidth * 0.40;  // Item name: 40%
    const col2Width = tableWidth * 0.10;  // QTY: 10%
    const col3Width = tableWidth * 0.15;  // Weight: 15%
    const col4Width = tableWidth * 0.18;  // Unit Price: 18%
    const col5Width = tableWidth * 0.17;  // Total: 17%

    const col1X = tableStartX;
    const col2X = col1X + col1Width;
    const col3X = col2X + col2Width;
    const col4X = col3X + col3Width;
    const col5X = col4X + col4Width;

    const headerHeight = 7;
    const rowHeight = 8;

    // Draw header
    this.pdf.setFillColor(212, 175, 55);
    this.pdf.rect(tableStartX, tableStartY, tableWidth, headerHeight, 'F');
    
    this.pdf.setTextColor(45, 45, 55);
    this.pdf.setFont('Helvetica', 'bold');
    this.pdf.setFontSize(7);

    this.pdf.text('ITEM NAME', col1X + 2, tableStartY + 4.5);
    this.pdf.text('QTY', col2X + 2, tableStartY + 4.5);
    this.pdf.text('WEIGHT', col3X + 2, tableStartY + 4.5);
    this.pdf.text('UNIT PRICE', col4X + 2, tableStartY + 4.5);
    this.pdf.text('TOTAL', col5X + 2, tableStartY + 4.5);

    // Draw items
    this.pdf.setFont('Helvetica', 'normal');
    this.pdf.setFontSize(6.5);
    let rowY = tableStartY + headerHeight;

    invoiceData.items.forEach((item, itemIdx) => {
      // Alternate row background
      if (itemIdx % 2 === 1) {
        this.pdf.setFillColor(248, 248, 248);
        this.pdf.rect(tableStartX, rowY, tableWidth, rowHeight, 'F');
      }

      // Draw row border
      this.pdf.setDrawColor(200, 200, 200);
      this.pdf.setLineWidth(0.2);
      this.pdf.rect(tableStartX, rowY, tableWidth, rowHeight);

      this.pdf.setTextColor(45, 45, 55);

      // Item Name (truncate if too long to 30 chars)
      const itemName = item.productName.length > 30 ? item.productName.substring(0, 27) + '...' : item.productName;
      this.pdf.text(itemName, col1X + 2, rowY + 4.5, { maxWidth: col1Width - 3 });

      // Quantity (center)
      this.pdf.text(item.quantity.toString(), col2X + col2Width / 2, rowY + 4.5, { align: 'center' });

      // Weight
      const weight = item.weight ? `${item.weight.toFixed(0)}g` : '-';
      this.pdf.text(weight, col3X + 2, rowY + 4.5);

      // Unit Price (right aligned - proper formatting)
      const unitPriceNum = Math.floor(item.unitPrice);
      const unitPriceStr = unitPriceNum.toLocaleString('en-IN');
      this.pdf.text(unitPriceStr, col4X + col4Width - 2, rowY + 4.5, { align: 'right' });

      // Total (right aligned - proper formatting)
      const totalNum = Math.floor(item.total);
      const totalStr = totalNum.toLocaleString('en-IN');
      this.pdf.text(totalStr, col5X + col5Width - 2, rowY + 4.5, { align: 'right' });

      rowY += rowHeight;
    });

    // Draw table outer border
    this.pdf.setLineWidth(0.5);
    this.pdf.setDrawColor(100, 100, 100);
    this.pdf.rect(tableStartX, tableStartY, tableWidth, (invoiceData.items.length * rowHeight) + headerHeight);

    // Subtotal row
    rowY += 2;
    this.pdf.setFillColor(245, 245, 245);
    this.pdf.rect(tableStartX, rowY, tableWidth, rowHeight, 'F');
    this.pdf.setDrawColor(100, 100, 100);
    this.pdf.rect(tableStartX, rowY, tableWidth, rowHeight);
    
    this.pdf.setFont('Helvetica', 'bold');
    this.pdf.setFontSize(7);
    this.pdf.setTextColor(45, 45, 55);
    this.pdf.text('SUBTOTAL', col3X + 2, rowY + 4.5);
    
    const subtotalNum = Math.floor(invoiceData.subtotal);
    const subtotalStr = subtotalNum.toLocaleString('en-IN');
    this.pdf.text(subtotalStr, col5X + col5Width - 2, rowY + 4.5, { align: 'right' });

    this.currentY = rowY + rowHeight + 3;
  }

  private addTotalsSection(invoiceData: InvoiceData): void {
    this.addNewPageIfNeeded(60);

    // Totals section positioned on the right
    const sectionWidth = 65;
    const totalsSectionX = this.pageWidth - this.margin - sectionWidth;
    
    // Background for totals
    this.pdf.setFillColor(250, 250, 250);
    this.pdf.rect(totalsSectionX, this.currentY, sectionWidth, 48, 'F');
    
    // Gold border
    this.pdf.setDrawColor(212, 175, 55);
    this.pdf.setLineWidth(0.8);
    this.pdf.rect(totalsSectionX, this.currentY, sectionWidth, 48);

    // Totals breakdown
    this.pdf.setFont('Helvetica', 'normal');
    this.pdf.setFontSize(7);
    this.pdf.setTextColor(45, 45, 55);

    let labelY = this.currentY + 3;
    const labelX = totalsSectionX + 2;
    const amountX = totalsSectionX + sectionWidth - 2;
    const lineHeight = 5.5;

    // Subtotal
    this.pdf.text('Subtotal:', labelX, labelY);
    const subtotalNum = Math.floor(invoiceData.subtotal);
    this.pdf.text(subtotalNum.toLocaleString('en-IN'), amountX, labelY, { align: 'right' });
    labelY += lineHeight;

    // Making Charges
    this.pdf.text('Making:', labelX, labelY);
    const makingNum = Math.floor(invoiceData.tax * 2.1);
    this.pdf.text(makingNum.toLocaleString('en-IN'), amountX, labelY, { align: 'right' });
    labelY += lineHeight;

    // Hallmark Charges
    this.pdf.text('Hallmark:', labelX, labelY);
    this.pdf.text('4,500', amountX, labelY, { align: 'right' });
    labelY += lineHeight;

    // GST
    this.pdf.text('GST (3%):', labelX, labelY);
    const taxNum = Math.floor(invoiceData.tax);
    this.pdf.text(taxNum.toLocaleString('en-IN'), amountX, labelY, { align: 'right' });
    labelY += lineHeight;

    // Discount
    this.pdf.text('Discount:', labelX, labelY);
    const discountNum = Math.floor(invoiceData.discount);
    this.pdf.text('-' + discountNum.toLocaleString('en-IN'), amountX, labelY, { align: 'right' });

    // Grand Total section
    this.pdf.setFillColor(212, 175, 55);
    this.pdf.rect(totalsSectionX, this.currentY + 33, sectionWidth, 12, 'F');
    
    this.pdf.setFont('Helvetica', 'bold');
    this.pdf.setFontSize(8);
    this.pdf.setTextColor(45, 45, 55);
    this.pdf.text('TOTAL:', labelX, this.currentY + 39);
    
    const grandNum = Math.floor(invoiceData.total);
    const grandStr = grandNum.toLocaleString('en-IN');
    this.pdf.setFontSize(9);
    this.pdf.text(grandStr, amountX, this.currentY + 39, { align: 'right' });

    this.currentY += 48;

    // Payment section
    this.pdf.setFont('Helvetica', 'normal');
    this.pdf.setFontSize(7);
    this.pdf.setTextColor(45, 45, 55);
    this.pdf.text('Payment: Card', this.margin, this.currentY);
    this.pdf.text('TXN ID: TXN-5689', this.margin, this.currentY + 5);
    
    // Payment status badge
    const statusColor = invoiceData.paymentStatus === 'Paid' ? [34, 139, 34] : 
                       invoiceData.paymentStatus === 'Pending' ? [255, 140, 0] : [220, 20, 60];
    this.pdf.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
    this.pdf.rect(totalsSectionX, this.currentY, 20, 7, 'F');
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFont('Helvetica', 'bold');
    this.pdf.setFontSize(6);
    this.pdf.text(invoiceData.paymentStatus.toUpperCase(), totalsSectionX + 10, this.currentY + 4, { align: 'center' });

    this.currentY += 12;
  }

  private addAdditionalInfo(invoiceData: InvoiceData): void {
    this.addNewPageIfNeeded(50);

    // Policy section with elegant styling
    this.pdf.setFont('Helvetica', 'bold');
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(45, 45, 55);
    this.pdf.text('RETURN & EXCHANGE POLICY:', this.margin, this.currentY);
    this.pdf.text('Within 15 days with original receipt.', this.margin + 70, this.currentY);
    this.currentY += 8;
    
    this.pdf.text('HALLMARK CERTIFICATION:', this.margin, this.currentY);
    this.pdf.setFont('Helvetica', 'normal');
    this.pdf.text('All gold items are BIS Hallmarked.', this.margin + 70, this.currentY);
    this.currentY += 8;
    
    this.pdf.setFont('Helvetica', 'bold');
    this.pdf.text('WARRANTY:', this.margin, this.currentY);
    this.pdf.setFont('Helvetica', 'normal');
    this.pdf.text('1-year manufacturing warranty.', this.margin + 70, this.currentY);
    this.currentY += 12;

    // Elegant thank you message
    this.pdf.setFont('Helvetica', 'italic');
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(212, 175, 55);
    this.pdf.text('Thank you for choosing timeless elegance.', this.pageWidth / 2, this.currentY, { align: 'center' });
    this.currentY += 8;

    // Social media icons placeholder (using text)
    this.pdf.setFont('Helvetica', 'normal');
    this.pdf.setFontSize(8);
    this.pdf.setTextColor(100, 100, 100);
    this.pdf.text('Follow us: @royaljewels | facebook.com/royaljewels | instagram.com/royaljewels', this.pageWidth / 2, this.currentY, { align: 'center' });
    
    if (invoiceData.notes) {
      this.currentY += 10;
      this.pdf.setFont('Helvetica', 'bold');
      this.pdf.setFontSize(9);
      this.pdf.setTextColor(45, 45, 55);
      this.pdf.text('Additional Notes:', this.margin, this.currentY);
      this.currentY += 5;
      this.pdf.setFont('Helvetica', 'normal');
      this.pdf.text(invoiceData.notes, this.margin, this.currentY);
    }
  }

  private addFooter(): void {
    const footerY = this.pageHeight - 25;
    
    // Elegant footer background
    this.pdf.setFillColor(45, 45, 55);
    this.pdf.rect(0, footerY - 5, this.pageWidth, 30, 'F');
    
    // Gold accent line
    this.pdf.setFillColor(212, 175, 55);
    this.pdf.rect(0, footerY - 5, this.pageWidth, 2, 'F');
    
    // Footer content
    this.pdf.setFont('Helvetica', 'bold');
    this.pdf.setFontSize(9);
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.text('Customer Support: support@royaljewels.com', this.pageWidth / 2, footerY + 5, { align: 'center' });
    
    this.pdf.setFont('Helvetica', 'normal');
    this.pdf.setFontSize(8);
    this.pdf.setTextColor(212, 175, 55);
    this.pdf.text('Phone: +91 22 5555 1234', this.pageWidth / 2, footerY + 10, { align: 'center' });
    
    this.pdf.setTextColor(200, 200, 200);
    this.pdf.text('456, Diamond Road, Mumbai, India', this.pageWidth / 2, footerY + 15, { align: 'center' });
    this.pdf.text('GST No: 27ABCDE1234F1Z5', this.pageWidth / 2, footerY + 19, { align: 'center' });
    this.pdf.text('www.royaljewels.com', this.pageWidth / 2, footerY + 23, { align: 'center' });
  }

  public generate(invoiceData: InvoiceData): jsPDF {
    this.addHeader(invoiceData);
    this.addCustomerInfo(invoiceData);
    this.addItemsTable(invoiceData);
    this.addTotalsSection(invoiceData);
    this.addAdditionalInfo(invoiceData);
    this.addFooter();

    return this.pdf;
  }

  public getBuffer(): Buffer {
    return Buffer.from(this.pdf.output('arraybuffer'));
  }

  public getPdfBytes(): Uint8Array {
    const arrayBuffer = this.pdf.output('arraybuffer') as ArrayBuffer;
    return new Uint8Array(arrayBuffer);
  }
}

export function generateInvoicePDF(invoiceData: InvoiceData): Uint8Array {
  const generator = new PremiumInvoicePDFGenerator();
  generator.generate(invoiceData);
  return generator.getPdfBytes();
}