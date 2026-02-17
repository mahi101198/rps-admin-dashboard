import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import {
  InvoiceData,
  generateInvoicePDF,
} from '@/lib/invoice/premium-invoice-pdf-generator';
import { PremiumInvoiceEmailGenerator } from '@/lib/invoice/invoice-email-generator';
import { generateMockInvoiceData, generateMockBulkInvoices } from '@/lib/invoice/mock-invoice-data';
import { verifyAuth } from '@/lib/auth';

// Zoho SMTP Configuration - Same as zoho-mailer.ts
const getZohoTransporter = () => {
  if (!process.env.ZOHO_MAIL_USER || !process.env.ZOHO_MAIL_PASSWORD) {
    throw new Error('Zoho mail credentials not configured in environment variables');
  }
  
  return nodemailer.createTransport({
    host: 'smtp.zoho.in',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.ZOHO_MAIL_USER,
      pass: process.env.ZOHO_MAIL_PASSWORD,
    },
  });
};

/**
 * POST /api/marketing/send-invoice-email
 * 
 * Generates an invoice PDF and sends it via email with a detailed invoice template.
 * 
 * Request body:
 * {
 *   "invoiceData": InvoiceData (optional - uses mock if not provided),
 *   "type": "single" | "bulk" (optional - defaults to "single"),
 *   "useMockData": boolean (optional - defaults to true for testing),
 *   "bulkCount": number (optional - number of invoices to send in bulk mode, defaults to 5)
 * }
 * 
 * Response:
 * - 200: Email sent successfully
 * - 400: Missing required fields
 * - 401: Unauthorized  
 * - 500: Server error
 */
export async function POST(request: NextRequest) {
  try {
    // Optional: Uncomment to require authentication
    // await verifyAuth();

    const body = await request.json();
    const {
      invoiceData: providedData,
      type = 'single',
      useMockData = true,
      bulkCount = 5,
    } = body;

    let invoiceDataList: InvoiceData[] = [];

    // Prepare invoice data
    if (type === 'single') {
      let invoiceData: InvoiceData;

      if (providedData) {
        invoiceData = {
          ...providedData,
          invoiceDate: new Date(providedData.invoiceDate),
          dueDate: new Date(providedData.dueDate),
        };
      } else if (useMockData) {
        invoiceData = generateMockInvoiceData();
      } else {
        return NextResponse.json(
          { error: 'Invoice data is required when useMockData is false' },
          { status: 400 }
        );
      }

      invoiceDataList = [invoiceData];
    } else if (type === 'bulk') {
      if (useMockData) {
        invoiceDataList = generateMockBulkInvoices(bulkCount);
      } else if (Array.isArray(providedData)) {
        invoiceDataList = (providedData as any[]).map((inv) => ({
          ...inv,
          invoiceDate: new Date(inv.invoiceDate),
          dueDate: new Date(inv.dueDate),
        }));
      } else {
        return NextResponse.json(
          { error: 'Invoice data array is required for bulk sending' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid type. Must be "single" or "bulk"' },
        { status: 400 }
      );
    }

    const results: any[] = [];
    const transporter = getZohoTransporter();

    // Send emails
    for (const invoiceData of invoiceDataList) {
      try {
        console.log('Processing invoice for email:', invoiceData.customerEmail);
        
        // Validate required fields
        if (!invoiceData.invoiceNumber || !invoiceData.customerEmail) {
          console.error('Missing invoice number or customer email:', {
            invoiceNumber: invoiceData.invoiceNumber,
            customerEmail: invoiceData.customerEmail,
          });
          results.push({
            invoiceNumber: invoiceData.invoiceNumber,
            email: invoiceData.customerEmail,
            success: false,
            error: 'Invoice number or customer email missing',
          });
          continue;
        }

        // Generate PDF
        let pdfBytes: Uint8Array;
        try {
          pdfBytes = generateInvoicePDF(invoiceData);
        } catch (pdfError: any) {
          console.error('PDF generation error for invoice', invoiceData.invoiceNumber, pdfError);
          results.push({
            invoiceNumber: invoiceData.invoiceNumber,
            email: invoiceData.customerEmail,
            success: false,
            error: `PDF generation failed: ${pdfError.message}`,
          });
          continue;
        }
        
        const pdfBuffer = Buffer.from(pdfBytes);

        // Generate email template
        const emailTemplate = PremiumInvoiceEmailGenerator.generateInvoiceEmail(invoiceData);

        // Send email with PDF attachment
        console.log('Sending email to:', invoiceData.customerEmail);
        const info = await transporter.sendMail({
          from: process.env.ZOHO_MAIL_USER, // Use authenticated email as sender (Zoho requirement)
          to: invoiceData.customerEmail,
          cc: invoiceData.companyEmail || undefined,
          subject: emailTemplate.subject,
          html: emailTemplate.htmlContent,
          text: emailTemplate.plainText,
          replyTo: invoiceData.companyEmail || process.env.ZOHO_MAIL_USER,
          attachments: [
            {
              filename: `Invoice_${invoiceData.invoiceNumber}.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf',
            },
          ],
        });

        console.log('Email sent successfully to:', invoiceData.customerEmail, 'MessageID:', info.messageId);

        results.push({
          invoiceNumber: invoiceData.invoiceNumber,
          email: invoiceData.customerEmail,
          success: true,
          messageId: info.messageId,
        });

        console.log('Invoice email sent:', {
          invoiceNumber: invoiceData.invoiceNumber,
          email: invoiceData.customerEmail,
          messageId: info.messageId,
        });
      } catch (emailError: any) {
        results.push({
          invoiceNumber: invoiceData.invoiceNumber,
          email: invoiceData.customerEmail,
          success: false,
          error: emailError.message,
        });

        console.error('Error sending invoice email:', emailError);
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: successCount > 0,
      type,
      total: invoiceDataList.length,
      successCount,
      failureCount: failureCount,
      results,
      message:
        failureCount === 0
          ? `All invoice emails sent successfully`
          : `${successCount} invoices sent, ${failureCount} failed`,
    });
  } catch (error: any) {
    console.error('Error in send-invoice-email endpoint:', error);
    return NextResponse.json(
      {
        error: 'Failed to send invoice emails',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/marketing/send-invoice-email
 * 
 * Returns a preview of the invoice email that would be sent.
 * 
 * Query parameters:
 * - invoiceNumber: string (optional)
 * - preview: boolean (default: true)
 * 
 * Response:
 * - 200: Preview of invoice email
 * - 500: Server error
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const invoiceNumber = searchParams.get('invoiceNumber');
    const previewMode = searchParams.get('preview') !== 'false';

    let invoiceData: InvoiceData;

    if (invoiceNumber) {
      invoiceData = generateMockInvoiceData({ invoiceNumber });
    } else {
      invoiceData = generateMockInvoiceData();
    }

    const emailTemplate = PremiumInvoiceEmailGenerator.generateInvoiceEmail(invoiceData, true);

    if (previewMode) {
      // Return HTML preview
      return new NextResponse(emailTemplate.htmlContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    }

    // Return JSON with email details
    return NextResponse.json({
      success: true,
      data: {
        invoiceNumber: invoiceData.invoiceNumber,
        customerEmail: invoiceData.customerEmail,
        subject: emailTemplate.subject,
        htmlContent: emailTemplate.htmlContent,
        plainText: emailTemplate.plainText,
      },
    });
  } catch (error: any) {
    console.error('Error in send-invoice-email GET:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate invoice email preview',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
