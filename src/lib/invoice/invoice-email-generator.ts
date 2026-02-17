import { InvoiceData } from './premium-invoice-pdf-generator';

export interface InvoiceEmailTemplate {
  subject: string;
  htmlContent: string;
  plainText: string;
}

export class PremiumInvoiceEmailGenerator {
  static generateInvoiceEmail(invoiceData: InvoiceData, isPreview: boolean = false): InvoiceEmailTemplate {
    const subject = `Your Order #${invoiceData.orderNumber} - Invoice ${invoiceData.invoiceNumber} | Royal Jewels`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice - Royal Jewels</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Helvetica', Arial, sans-serif; line-height: 1.6; background: #f5f5f5; }
        .email-container { max-width: 650px; margin: 0 auto; background: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        
        /* Header - Vibrant Gradient */
        .header { background: linear-gradient(135deg, #1450A0 0%, #2D8C64 50%, #E69650 100%); color: #ffffff; padding: 40px 20px; text-align: center; position: relative; overflow: hidden; }
        .header::before { content: ''; position: absolute; top: -50%; right: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 20px 20px; opacity: 0.5; }
        .header-content { position: relative; z-index: 1; }
        .logo-container { display: inline-flex; align-items: center; gap: 15px; }
        .logo-circle { width: 60px; height: 60px; background: linear-gradient(135deg, #E69650 0%, #32A0A0 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; color: #ffffff; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
        .company-info h1 { font-size: 28px; margin: 0; letter-spacing: 3px; font-weight: 700; }
        .tagline { font-size: 14px; color: #E8E8E8; margin-top: 5px; font-style: italic; }
        
        /* Content */
        .content { padding: 35px 30px; background: linear-gradient(to bottom, #ffffff 0%, #fafaf8 100%); }
        .greeting { font-size: 22px; color: #1450A0; margin-bottom: 15px; font-weight: 600; }
        .message { color: #555; margin-bottom: 25px; line-height: 1.8; }
        
        /* Invoice Details - Vibrant Card */
        .invoice-details { background: linear-gradient(135deg, #f0f8ff 0%, #f0fff4 100%); border-left: 5px solid #1450A0; border-right: 3px solid #E69650; padding: 25px; margin: 25px 0; border-radius: 10px; box-shadow: 0 2px 10px rgba(20, 80, 160, 0.1); }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid rgba(45, 140, 100, 0.2); }
        .detail-label { font-weight: 700; color: #1450A0; font-size: 14px; }
        .detail-value { color: #333; font-weight: 500; }
        .status-paid { background: linear-gradient(135deg, #E69650 0%, #FF8C42 100%); color: #ffffff; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; box-shadow: 0 2px 8px rgba(230, 150, 80, 0.3); }
        .status-pending { background: linear-gradient(135deg, #32A0A0 0%, #20C997 100%); color: #ffffff; }
        .status-overdue { background: linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%); color: #ffffff; }
        
        /* Products */
        .products-section { margin: 30px 0; }
        .section-title { font-size: 18px; font-weight: 700; color: #1450A0; margin-bottom: 20px; border-bottom: 3px solid #2D8C64; padding-bottom: 8px; position: relative; }
        .section-title::before { content: ''; position: absolute; bottom: -3px; left: 0; width: 40px; height: 3px; background: #E69650; }
        .product-item { display: flex; align-items: flex-start; padding: 18px; border: 2px solid #f0f0f0; margin-bottom: 12px; border-radius: 10px; background: linear-gradient(to right, rgba(45, 140, 100, 0.05) 0%, transparent 100%); transition: all 0.3s ease; }
        .product-item:hover { border-color: #1450A0; box-shadow: 0 4px 15px rgba(20, 80, 160, 0.15); }
        .product-icon { width: 50px; height: 50px; background: linear-gradient(135deg, #E69650 0%, #32A0A0 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 18px; font-size: 22px; flex-shrink: 0; }
        .product-details { flex: 1; }
        .product-name { font-weight: 700; color: #1450A0; margin-bottom: 5px; font-size: 15px; }
        .product-specs { font-size: 13px; color: #666; line-height: 1.5; }
        .product-amount { font-size: 18px; font-weight: 700; color: #E69650; text-align: right; }
        
        /* Summary Table */
        .summary-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e8e8e8; }
        .summary-label { font-weight: 600; color: #1450A0; }
        .summary-value { color: #333; font-weight: 500; }
        .total-row { display: flex; justify-content: space-between; padding: 15px 0; font-size: 16px; font-weight: 700; border-top: 2px solid #2D8C64; }
        
        /* Grand Total */
        .grand-total { background: linear-gradient(135deg, #1450A0 0%, #2D8C64 50%, #E69650 100%); color: #ffffff; padding: 30px; text-align: center; margin: 25px 0; border-radius: 12px; box-shadow: 0 6px 20px rgba(20, 80, 160, 0.3); }
        .grand-total-label { font-size: 16px; margin-bottom: 12px; opacity: 0.95; }
        .grand-total-amount { font-size: 36px; font-weight: 700; letter-spacing: 1px; }
        
        /* Action Buttons */
        .actions { text-align: center; margin: 30px 0; }
        .btn { display: inline-block; padding: 14px 28px; margin: 0 8px 10px 8px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; transition: all 0.3s ease; }
        .btn-primary { background: linear-gradient(135deg, #E69650 0%, #FF8C42 100%); color: #ffffff; box-shadow: 0 4px 15px rgba(230, 150, 80, 0.3); }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(230, 150, 80, 0.4); }
        .btn-secondary { background: #f0f0f0; color: #1450A0; border: 2px solid #1450A0; }
        .btn-secondary:hover { background: #1450A0; color: #ffffff; }
        
        /* Footer */
        .footer { background: linear-gradient(135deg, #1450A0 0%, #0d3a7a 100%); color: #ffffff; padding: 30px 25px; text-align: center; }
        .support-info { margin-bottom: 20px; }
        .contact-detail { margin-bottom: 8px; font-size: 14px; }
        .social-links { margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.2); }
        .social-links a { color: #E69650; text-decoration: none; margin: 0 12px; font-weight: 600; }
        .social-links a:hover { color: #32A0A0; }
        .footer-note { font-size: 12px; color: #B0D0FF; margin-top: 15px; }
        
        @media (max-width: 600px) {
            .content { padding: 20px; }
            .detail-row { flex-direction: column; gap: 5px; }
            .product-item { flex-direction: column; text-align: center; }
            .product-icon { margin-bottom: 10px; margin-right: 0; }
            .actions { flex-direction: column; }
            .btn { width: 100%; margin-bottom: 10px; }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <div class="header-content">
                <div class="logo-container">
                    <div class="logo-circle">✨</div>
                    <div class="company-info">
                        <h1>ROYAL JEWELS</h1>
                        <div class="tagline">Timeless Elegance Since 1998</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Content -->
        <div class="content">
            <div class="greeting">Dear ${invoiceData.customerName},</div>
            
            <div class="message">
                We are delighted to inform you that your recent purchase has successfully confirmed. 
                Your selected pieces reflect timeless craftsmanship and elegance. We are honored to be part of your special moments.
            </div>

            <!-- Invoice Details -->
            <div class="invoice-details">
                <div class="detail-row">
                    <span class="detail-label">Order ID:</span>
                    <span class="detail-value">${invoiceData.orderNumber}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Invoice No:</span>
                    <span class="detail-value">${invoiceData.invoiceNumber}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Order Date:</span>
                    <span class="detail-value">${invoiceData.invoiceDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Estimated Delivery:</span>
                    <span class="detail-value">${invoiceData.dueDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Payment Status:</span>
                    <span class="status-paid ${invoiceData.paymentStatus === 'Pending' ? 'status-pending' : invoiceData.paymentStatus === 'Overdue' ? 'status-overdue' : ''}">${invoiceData.paymentStatus.toUpperCase()}</span>
                </div>
            </div>

            <!-- Products -->
            <div class="products-section">
                <h3 class="section-title">✨ Your Purchased Items</h3>
                ${invoiceData.items.map(item => `
                <div class="product-item">
                    <div class="product-icon">💎</div>
                    <div class="product-details">
                        <div class="product-name">${item.productName}</div>
                        <div class="product-specs">
                            ${item.purity ? `Purity: ${item.purity}` : '22K Gold'} • 
                            ${item.weight ? `Weight: ${item.weight.toFixed(2)} gms` : '15.2g'} • 
                            Making Charges: ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(item.makingCharges || 11060)}
                        </div>
                    </div>
                    <div class="product-amount">
                        ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(item.total)}
                    </div>
                </div>
                `).join('')}
            </div>

            <!-- Grand Total -->
            <div class="grand-total">
                <div class="grand-total-label">💳 GRAND TOTAL</div>
                <div class="grand-total-amount">${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(invoiceData.total)}</div>
            </div>

            <!-- Action Buttons -->
            <div class="actions">
                <a href="#" class="btn btn-primary">📥 Download Invoice PDF</a>
                <a href="#" class="btn btn-secondary">🚚 Track Order</a>
            </div>

            <!-- Payment Info -->
            <div style="background: linear-gradient(135deg, #f0f8ff 0%, #f0f9f4 100%); color: #1450A0; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; border-left: 5px solid #E69650; ">
                <div style="margin-bottom: 8px; font-weight: 700;">💳 Payment Method: <span style="color: #2D8C64;">CARD</span></div>
                <div style="margin-bottom: 12px; font-weight: 600;">Transaction ID: <span style="color: #E69650;">TXN-5689</span></div>
                <div style="background: #1450A0; color: #ffffff; padding: 12px; border-radius: 6px; margin-top: 10px;">
                    <div>📧 Customer Support: support@royaljewels.com</div>
                    <div>📱 Phone: +91 22 5555 1234</div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="support-info">
                <div class="contact-detail"><strong>456, Diamond Road, Mumbai, India</strong></div>
                <div class="contact-detail">GST No: 27ABCDE1234F1Z5</div>
                <div class="contact-detail">www.royaljewels.com</div>
            </div>
            
            <div class="social-links">
                <a href="#">📘 Facebook</a>
                <a href="#">📷 Instagram</a>
                <a href="#">🐦 Twitter</a>
            </div>
            
            <div class="footer-note">
                <em>✨ Thank you for choosing timeless elegance. Your satisfaction is our pride. ✨</em>
            </div>
        </div>
    </div>
</body>
</html>`;

    const plainText = `
ROYAL JEWELS - Timeless Elegance Since 1998

Dear ${invoiceData.customerName},

Your order has been confirmed! Thank you for choosing Royal Jewels.

ORDER DETAILS:
- Order ID: ${invoiceData.orderNumber}
- Invoice No: ${invoiceData.invoiceNumber}
- Order Date: ${invoiceData.invoiceDate.toLocaleDateString('en-IN')}
- Payment Status: ${invoiceData.paymentStatus}

ITEMS PURCHASED:
${invoiceData.items.map(item => `
- ${item.productName}
  Weight: ${item.weight ? item.weight.toFixed(2) + ' gms' : '15.2g'}
  Amount: ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(item.total)}
`).join('')}

TOTAL AMOUNT: ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(invoiceData.total)}

For support, contact us at support@royaljewels.com or +91 22 5555 1234

Royal Jewels
456, Diamond Road, Mumbai, India
www.royaljewels.com

Thank you for choosing timeless elegance.
`;

    return { subject, htmlContent, plainText };
  }

  static generateAccountStatementEmail(invoices: InvoiceData[]): InvoiceEmailTemplate {
    const totalAmount = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const customerName = invoices[0]?.customerName || 'Valued Customer';
    
    const subject = `Your Account Statement - ${invoices.length} Orders | Royal Jewels`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Statement - Royal Jewels</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Helvetica', Arial, sans-serif; line-height: 1.6; background: #f5f5f5; }
        .email-container { max-width: 650px; margin: 0 auto; background: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #1450A0 0%, #2D8C64 50%, #E69650 100%); color: #ffffff; padding: 40px 20px; text-align: center; }
        .logo-circle { width: 60px; height: 60px; background: linear-gradient(135deg, #E69650 0%, #32A0A0 100%); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; color: #ffffff; margin-bottom: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
        h1 { font-size: 28px; letter-spacing: 3px; font-weight: 700; }
        .tagline { color: #E8E8E8; margin-top: 5px; font-style: italic; }
        .content { padding: 35px 30px; background: linear-gradient(to bottom, #ffffff 0%, #fafaf8 100%); }
        .statement-summary { background: linear-gradient(135deg, #f0f8ff 0%, #f0fff4 100%); border-left: 5px solid #1450A0; border-right: 3px solid #E69650; padding: 25px; margin: 20px 0; border-radius: 10px; box-shadow: 0 2px 10px rgba(20, 80, 160, 0.1); }
        .statement-summary strong { color: #1450A0; font-size: 16px; }
        .statement-summary div { margin-bottom: 10px; color: #333; }
        .invoice-list { margin: 20px 0; }
        .invoice-item { padding: 18px; border: 2px solid #f0f0f0; margin-bottom: 12px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; background: linear-gradient(to right, rgba(45, 140, 100, 0.05) 0%, transparent 100%); transition: all 0.3s ease; }
        .invoice-item:hover { border-color: #1450A0; box-shadow: 0 4px 15px rgba(20, 80, 160, 0.15); }
        .invoice-info { flex: 1; }
        .invoice-info strong { color: #1450A0; display: block; margin-bottom: 5px; }
        .invoice-info small { color: #666; }
        .invoice-amount { font-weight: 700; font-size: 18px; color: #E69650; text-align: right; }
        .total-summary { background: linear-gradient(135deg, #1450A0 0%, #2D8C64 50%, #E69650 100%); color: #ffffff; padding: 30px; text-align: center; border-radius: 12px; margin: 20px 0; box-shadow: 0 6px 20px rgba(20, 80, 160, 0.3); }
        .total-summary h2 { font-size: 32px; font-weight: 700; margin-bottom: 10px; }
        .total-summary p { font-size: 14px; opacity: 0.95; }
        .footer { background: linear-gradient(135deg, #1450A0 0%, #0d3a7a 100%); color: #ffffff; padding: 30px 25px; text-align: center; }
        .footer p { margin-bottom: 8px; }
        .social-links { margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.2); }
        .social-links a { color: #E69650; text-decoration: none; margin: 0 12px; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo-circle">✨</div>
            <h1>ROYAL JEWELS</h1>
            <div class="tagline">Account Statement</div>
        </div>

        <div class="content">
            <h2 style="color: #1450A0; margin-bottom: 16px;">Dear ${customerName},</h2>
            <p style="color: #555; margin-bottom: 20px;">Here's your account statement for recent orders with Royal Jewels.</p>

            <div class="statement-summary">
                <strong>📊 Statement Summary</strong><br><br>
                <div>Total Orders: <span style="color: #E69650; font-weight: 700;">${invoices.length}</span></div>
                <div>Statement Period: <span style="color: #2D8C64; font-weight: 700;">Last 30 Days</span></div>
                <div>Total Amount: <span style="color: #1450A0; font-weight: 700; font-size: 18px;">${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totalAmount)}</span></div>
            </div>

            <div class="invoice-list">
                <h3 style="color: #1450A0; margin-bottom: 16px; border-bottom: 3px solid #2D8C64; padding-bottom: 8px;">✨ Recent Orders</h3>
                ${invoices.map(invoice => `
                <div class="invoice-item">
                    <div class="invoice-info">
                        <strong>Invoice ${invoice.invoiceNumber}</strong>
                        <small>📅 ${invoice.invoiceDate.toLocaleDateString('en-IN')}</small><br>
                        <small style="color: ${invoice.paymentStatus === 'Paid' ? '#2D8C64' : invoice.paymentStatus === 'Pending' ? '#E69650' : '#FF6B6B'}; font-weight: 600;">Status: ${invoice.paymentStatus}</small>
                    </div>
                    <div class="invoice-amount">${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(invoice.total)}</div>
                </div>
                `).join('')}
            </div>

            <div class="total-summary">
                <h2>💳 Total Amount</h2>
                <h2>${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totalAmount)}</h2>
                <p style="margin-top: 15px;">Thank you for your continued business with Royal Jewels</p>
            </div>
        </div>

        <div class="footer">
            <p><strong>456, Diamond Road, Mumbai, India</strong></p>
            <p>GST No: 27ABCDE1234F1Z5</p>
            <p>📧 Support: support@royaljewels.com • 📱 +91 22 5555 1234</p>
            <div class="social-links">
                <a href="#">📘 Facebook</a>
                <a href="#">📷 Instagram</a>
                <a href="#">🐦 Twitter</a>
            </div>
            <p style="margin-top: 15px;"><em>✨ Thank you for choosing timeless elegance. ✨</em></p>
        </div>
    </div>
</body>
</html>`;

    const plainText = `
ROYAL JEWELS - Account Statement

Dear ${customerName},

Your account statement for recent orders:

SUMMARY:
- Total Orders: ${invoices.length}
- Total Amount: ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totalAmount)}

RECENT ORDERS:
${invoices.map(invoice => `
Invoice: ${invoice.invoiceNumber}
Date: ${invoice.invoiceDate.toLocaleDateString('en-IN')}
Amount: ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(invoice.total)}
Status: ${invoice.paymentStatus}
`).join('')}

Contact: support@royaljewels.com | +91 22 5555 1234

Thank you for choosing timeless elegance.
Royal Jewels
`;

    return { subject, htmlContent, plainText };
  }
}

export interface InvoiceEmailTemplate {
  subject: string;
  htmlContent: string;
  plainText: string;
}

export class InvoiceEmailGenerator {
  static generateInvoiceEmail(invoiceData: InvoiceData, includeDownloadLink: boolean = true): InvoiceEmailTemplate {
    const subject = `Invoice #${invoiceData.invoiceNumber} - Order #${invoiceData.orderNumber}`;
    const productRows = invoiceData.items
      .map(
        (item) => `
        <tr style="border-bottom: 1px solid #e5e5e5; background-color: #fafafa;">
          <td style="padding: 16px; text-align: left; color: #333; font-size: 14px;">${item.productName}</td>
          <td style="padding: 16px; text-align: center; color: #666; font-size: 14px;">${item.quantity}</td>
          <td style="padding: 16px; text-align: right; color: #333; font-size: 14px; font-weight: 500;">₹${item.unitPrice.toFixed(2)}</td>
          <td style="padding: 16px; text-align: right; color: #333; font-size: 14px; font-weight: 500;">₹${item.total.toFixed(2)}</td>
        </tr>
      `
      )
      .join('');

    const discountRow =
      invoiceData.discount > 0
        ? `
        <tr style="background-color: #fff3e0;">
          <td colspan="3" style="padding: 12px 16px; text-align: right; color: #e65100; font-weight: 600;">Discount:</td>
          <td style="padding: 12px 16px; text-align: right; color: #e65100; font-weight: 600;">-₹${invoiceData.discount.toFixed(2)}</td>
        </tr>
      `
        : '';

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background-color: #f5f5f5;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
        }
        .header {
          background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
          color: white;
          padding: 32px 24px;
          text-align: center;
        }
        .header h1 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .header p {
          font-size: 14px;
          opacity: 0.9;
        }
        .content {
          padding: 32px 24px;
        }
        .greeting {
          font-size: 18px;
          font-weight: 600;
          color: #1976d2;
          margin-bottom: 16px;
        }
        .info-text {
          font-size: 14px;
          color: #666;
          line-height: 1.6;
          margin-bottom: 24px;
        }
        .invoice-details {
          background-color: #f9f9f9;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 24px;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          font-size: 14px;
        }
        .detail-label {
          color: #666;
          font-weight: 500;
        }
        .detail-value {
          color: #333;
          font-weight: 600;
        }
        .items-table {
          width: 100%;
          margin-bottom: 24px;
          border-collapse: collapse;
        }
        .items-table thead {
          background-color: #1976d2;
          color: white;
        }
        .items-table th {
          padding: 16px;
          text-align: left;
          font-weight: 600;
          font-size: 13px;
          text-transform: uppercase;
        }
        .items-table td {
          padding: 16px;
        }
        .summary-table {
          width: 100%;
          margin-bottom: 24px;
          border-collapse: collapse;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #e0e0e0;
          font-size: 14px;
        }
        .summary-label {
          color: #666;
        }
        .summary-value {
          font-weight: 600;
          color: #333;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 16px 0;
          border-top: 2px solid #1976d2;
          border-bottom: 2px solid #1976d2;
          font-size: 16px;
          font-weight: 700;
          color: #1976d2;
          margin-bottom: 24px;
        }
        .status-badge {
          display: inline-block;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .status-paid {
          background-color: #e8f5e9;
          color: #2e7d32;
        }
        .status-pending {
          background-color: #fff3e0;
          color: #e65100;
        }
        .status-overdue {
          background-color: #ffebee;
          color: #c62828;
        }
        .cta-button {
          display: inline-block;
          background-color: #1976d2;
          color: white;
          padding: 12px 32px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          margin: 24px 0;
          text-align: center;
          transition: background-color 0.3s;
        }
        .cta-button:hover {
          background-color: #1565c0;
        }
        .download-section {
          background-color: #e3f2fd;
          border-left: 4px solid #1976d2;
          padding: 16px;
          border-radius: 4px;
          margin-bottom: 24px;
        }
        .download-section p {
          font-size: 14px;
          color: #1565c0;
          margin-bottom: 12px;
          font-weight: 500;
        }
        .customer-info {
          background-color: #f5f5f5;
          padding: 16px;
          border-radius: 6px;
          margin-bottom: 24px;
          font-size: 13px;
        }
        .customer-info-title {
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
        }
        .customer-info-text {
          color: #666;
          line-height: 1.6;
        }
        .footer {
          background-color: #f5f5f5;
          padding: 24px;
          text-align: center;
          font-size: 12px;
          color: #999;
          border-top: 1px solid #e0e0e0;
        }
        .footer a {
          color: #1976d2;
          text-decoration: none;
        }
        .divider {
          height: 1px;
          background-color: #e0e0e0;
          margin: 24px 0;
        }
        @media (max-width: 600px) {
          .container {
            margin: 0;
          }
          .content {
            padding: 20px 16px;
          }
          .detail-row {
            flex-direction: column;
          }
          .detail-value {
            margin-top: 4px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Invoice Received</h1>
          <p>Invoice #${invoiceData.invoiceNumber}</p>
        </div>

        <div class="content">
          <p class="greeting">Hi ${invoiceData.customerName},</p>
          
          <p class="info-text">
            Thank you for your order! Your invoice has been generated and is ready for download and review. 
            Please find the details of your purchase below.
          </p>

          <!-- Invoice Summary -->
          <div class="invoice-details">
            <div class="detail-row">
              <span class="detail-label">Invoice Number:</span>
              <span class="detail-value">#${invoiceData.invoiceNumber}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Order Number:</span>
              <span class="detail-value">#${invoiceData.orderNumber}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Invoice Date:</span>
              <span class="detail-value">${new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }).format(invoiceData.invoiceDate)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Due Date:</span>
              <span class="detail-value">${new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }).format(invoiceData.dueDate)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Payment Status:</span>
              <span class="status-badge ${
                invoiceData.paymentStatus === 'Paid'
                  ? 'status-paid'
                  : invoiceData.paymentStatus === 'Pending'
                    ? 'status-pending'
                    : 'status-overdue'
              }">
                ${invoiceData.paymentStatus || 'Pending'}
              </span>
            </div>
          </div>

          <!-- Order Items -->
          <table class="items-table">
            <thead>
              <tr>
                <th style="text-align: left;">Product</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${productRows}
            </tbody>
          </table>

          <!-- Summary -->
          <div>
            <div class="summary-row">
              <span class="summary-label">Subtotal:</span>
              <span class="summary-value">₹${invoiceData.subtotal.toFixed(2)}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Tax (GST):</span>
              <span class="summary-value">₹${invoiceData.tax.toFixed(2)}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Shipping:</span>
              <span class="summary-value">₹${invoiceData.shipping.toFixed(2)}</span>
            </div>
            ${discountRow}
            <div class="total-row">
              <span>Total Amount:</span>
              <span>₹${invoiceData.total.toFixed(2)}</span>
            </div>
          </div>

          <!-- Download Section -->
          ${
            includeDownloadLink
              ? `
          <div class="download-section">
            <p>📥 Download Your Invoice</p>
            <p style="font-size: 12px; color: #0d47a1;">Click the button below to download the PDF copy of your invoice for your records.</p>
            <a href="#" class="cta-button">Download Invoice PDF</a>
          </div>
          `
              : ''
          }

          <!-- Customer Info -->
          <div class="customer-info">
            <div class="customer-info-title">Billing Address</div>
            <div class="customer-info-text">
              ${invoiceData.customerName}<br>
              ${invoiceData.customerAddress}<br>
              ${invoiceData.customerCity}, ${invoiceData.customerState} ${invoiceData.customerZip}<br>
              Phone: ${invoiceData.customerPhone}
            </div>
          </div>

          ${
            invoiceData.paymentMethod
              ? `
          <div class="customer-info">
            <div class="customer-info-title">Order Information</div>
            <div class="customer-info-text">
              <strong>Payment Method:</strong> ${invoiceData.paymentMethod}<br>
              <strong>Payment Status:</strong> ${invoiceData.paymentStatus}
            </div>
          </div>
          `
              : ''
          }

          ${
            invoiceData.notes
              ? `
          <div class="divider"></div>
          <p class="info-text"><strong>Notes:</strong> ${invoiceData.notes}</p>
          `
              : ''
          }

          <p class="info-text">
            If you have any questions about this invoice, please don't hesitate to contact us at 
            <a href="mailto:${invoiceData.companyEmail}" style="color: #1976d2; text-decoration: none; font-weight: 500;">
              ${invoiceData.companyEmail}
            </a> or call us at ${invoiceData.companyPhone}.
          </p>

          <p class="info-text" style="text-align: center; color: #1976d2; font-weight: 600;">
            Thank you for your business!
          </p>
        </div>

        <div class="footer">
          <p>${invoiceData.companyName} | ${invoiceData.companyAddress}, ${invoiceData.companyCity}, ${invoiceData.companyState}</p>
          <p>
            <a href="mailto:${invoiceData.companyEmail}">${invoiceData.companyEmail}</a> | 
            <a href="tel:${invoiceData.companyPhone}">${invoiceData.companyPhone}</a>
          </p>
          <p style="margin-top: 16px; color: #999;">© ${new Date().getFullYear()} ${invoiceData.companyName}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    const plainText = `
Invoice: #${invoiceData.invoiceNumber}
Order: #${invoiceData.orderNumber}

Hi ${invoiceData.customerName},

Thank you for your order! Your invoice has been generated and is ready for download.

INVOICE DETAILS:
Invoice Date: ${new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(invoiceData.invoiceDate)}
Due Date: ${new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(invoiceData.dueDate)}
Payment Status: ${invoiceData.paymentStatus || 'Pending'}

ORDER ITEMS:
${invoiceData.items
  .map((item) => `- ${item.productName} (Qty: ${item.quantity}) @ ₹${item.unitPrice} = ₹${item.total}`)
  .join('\n')}

SUMMARY:
Subtotal: ₹${invoiceData.subtotal.toFixed(2)}
Tax (GST): ₹${invoiceData.tax.toFixed(2)}
Shipping: ₹${invoiceData.shipping.toFixed(2)}
${invoiceData.discount > 0 ? `Discount: -₹${invoiceData.discount.toFixed(2)}\n` : ''}
TOTAL: ₹${invoiceData.total.toFixed(2)}

BILLING ADDRESS:
${invoiceData.customerName}
${invoiceData.customerAddress}
${invoiceData.customerCity}, ${invoiceData.customerState} ${invoiceData.customerZip}
Phone: ${invoiceData.customerPhone}

If you have any questions, contact us at ${invoiceData.companyEmail} or ${invoiceData.companyPhone}.

Thank you for your business!
    `;

    return {
      subject,
      htmlContent,
      plainText,
    };
  }

  static generateAccountStatementEmail(
    companyName: string,
    customerName: string,
    invoices: Array<{ invoiceNumber: string; date: string; amount: number; status: string }>
  ): InvoiceEmailTemplate {
    const subject = `Account Statement - ${companyName}`;

    const invoiceRows = invoices
      .map(
        (inv) => `
        <tr style="border-bottom: 1px solid #e5e5e5;">
          <td style="padding: 12px 16px; color: #333;">#${inv.invoiceNumber}</td>
          <td style="padding: 12px 16px; color: #666;">${inv.date}</td>
          <td style="padding: 12px 16px; text-align: right; color: #333; font-weight: 600;">₹${inv.amount}</td>
          <td style="padding: 12px 16px; text-align: center;">
            <span class="status-badge ${inv.status === 'Paid' ? 'status-paid' : 'status-pending'}">${inv.status}</span>
          </td>
        </tr>
      `
      )
      .join('');

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${subject}</title>
      <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%); color: white; padding: 32px 24px; text-align: center; }
        .content { padding: 32px 24px; }
        table { width: 100%; border-collapse: collapse; margin: 24px 0; }
        th { background: #1976d2; color: white; padding: 12px 16px; text-align: left; font-weight: 600; }
        td { padding: 12px 16px; }
        .footer { background: #f5f5f5; padding: 24px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #e0e0e0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Account Statement</h1>
        </div>
        <div class="content">
          <p>Hi ${customerName},</p>
          <p>Here is your account statement showing all invoices and their payment status.</p>
          <table>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${invoiceRows}
            </tbody>
          </table>
          <p>Thank you for your continued business!</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    return {
      subject,
      htmlContent,
      plainText: `Account Statement\n\nHi ${customerName},\n\n${invoices.map((inv) => `Invoice #${inv.invoiceNumber} - ${inv.date} - ₹${inv.amount} - ${inv.status}`).join('\n')}\n\nThank you for your continued business!`,
    };
  }
}

export function generateInvoiceEmailHTML(invoiceData: InvoiceData): string {
  return InvoiceEmailGenerator.generateInvoiceEmail(invoiceData).htmlContent;
}

export function generateInvoiceEmailTemplate(invoiceData: InvoiceData): InvoiceEmailTemplate {
  return InvoiceEmailGenerator.generateInvoiceEmail(invoiceData);
}
