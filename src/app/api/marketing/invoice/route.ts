import { NextRequest, NextResponse } from 'next/server';
import { InvoiceData } from '@/lib/invoice/premium-invoice-pdf-generator';
import { generateInvoicePDF } from '@/lib/invoice/premium-invoice-pdf-generator';
import { generateMockInvoiceData } from '@/lib/invoice/mock-invoice-data';
import { verifyAuth } from '@/lib/auth';

/**
 * POST /api/marketing/invoice
 * 
 * Generates an invoice PDF and returns it as a downloadable file.
 * 
 * Request body:
 * {
 *   "invoiceData": InvoiceData (optional - uses mock if not provided),
 *   "useMockData": boolean (optional - defaults to true for testing)
 * }
 * 
 * Response:
 * - 200: PDF file as application/pdf
 * - 400: Missing required fields
 * - 401: Unauthorized
 * - 500: Server error
 */
export async function POST(request: NextRequest) {
  try {
    // Optional: Uncomment to require authentication
    // await verifyAuth();

    const body = await request.json();
    const { invoiceData: providedData, useMockData = true } = body;

    let invoiceData: InvoiceData;

    if (providedData) {
      // Use provided invoice data
      invoiceData = {
        ...providedData,
        invoiceDate: new Date(providedData.invoiceDate),
        dueDate: new Date(providedData.dueDate),
      };
    } else if (useMockData) {
      // Use mock data for testing
      invoiceData = generateMockInvoiceData();
    } else {
      return NextResponse.json(
        { error: 'Invoice data is required when useMockData is false' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!invoiceData.invoiceNumber || !invoiceData.customerEmail) {
      return NextResponse.json(
        { error: 'Invoice number and customer email are required' },
        { status: 400 }
      );
    }

    // Generate PDF
    const pdfBytes = generateInvoicePDF(invoiceData);
    const pdfBuffer = Buffer.from(pdfBytes);

    // Return PDF file
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Invoice_${invoiceData.invoiceNumber}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate invoice PDF', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * GET /api/marketing/invoice
 * 
 * Returns invoice data as JSON (for preview purposes).
 * 
 * Query parameters:
 * - invoiceNumber: string (optional - generates mock if not provided)
 * 
 * Response:
 * - 200: Invoice data as JSON
 * - 500: Server error
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const invoiceNumber = searchParams.get('invoiceNumber');

    let invoiceData: InvoiceData;

    if (invoiceNumber) {
      // For now, generate mock data with the provided invoice number
      invoiceData = generateMockInvoiceData({ invoiceNumber });
    } else {
      // Generate default mock data
      invoiceData = generateMockInvoiceData();
    }

    // Convert dates to ISO strings for JSON serialization
    return NextResponse.json({
      success: true,
      data: {
        ...invoiceData,
        invoiceDate: invoiceData.invoiceDate.toISOString(),
        dueDate: invoiceData.dueDate.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error retrieving invoice data:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve invoice data', details: String(error) },
      { status: 500 }
    );
  }
}
