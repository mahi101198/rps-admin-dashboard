import { InvoiceData } from './premium-invoice-pdf-generator';

/**
 * Client-side utilities for interacting with invoice API endpoints
 */

export interface InvoiceAPIResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
  details?: string;
}

export interface SendEmailResponse {
  success: boolean;
  type: string;
  total: number;
  successCount: number;
  failedCount: number;
  results: Array<{
    invoiceNumber: string;
    email: string;
    success: boolean;
    messageId?: string;
    error?: string;
  }>;
  message: string;
}

/**
 * Generates and downloads an invoice PDF
 * @param invoiceData - Optional invoice data (uses mock if not provided)
 * @param filename - Optional custom filename
 */
export async function downloadInvoicePDF(
  invoiceData?: Partial<InvoiceData>,
  filename?: string
): Promise<void> {
  try {
    const response = await fetch('/api/marketing/invoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        invoiceData,
        useMockData: !invoiceData,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate PDF');
    }

    // Get filename from header or use default
    const contentDisposition = response.headers.get('content-disposition');
    let pdfFilename = filename || 'invoice.pdf';

    if (contentDisposition && contentDisposition.includes('filename=')) {
      pdfFilename = contentDisposition
        .split('filename="')[1]
        .split('"')[0];
    }

    // Download the PDF
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = pdfFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading invoice:', error);
    throw error;
  }
}

/**
 * Fetches invoice data as JSON
 * @param invoiceNumber - Optional invoice number
 */
export async function fetchInvoiceData(
  invoiceNumber?: string
): Promise<InvoiceData> {
  try {
    const params = new URLSearchParams();
    if (invoiceNumber) {
      params.append('invoiceNumber', invoiceNumber);
    }

    const response = await fetch(
      `/api/marketing/invoice?${params.toString()}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch invoice data');
    }

    const result = await response.json();
    return {
      ...result.data,
      invoiceDate: new Date(result.data.invoiceDate),
      dueDate: new Date(result.data.dueDate),
    };
  } catch (error) {
    console.error('Error fetching invoice data:', error);
    throw error;
  }
}

/**
 * Sends invoice email to a single recipient
 * @param invoiceData - Optional invoice data (uses mock if not provided)
 */
export async function sendInvoiceEmail(
  invoiceData?: Partial<InvoiceData>
): Promise<SendEmailResponse> {
  try {
    const response = await fetch('/api/marketing/send-invoice-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        invoiceData,
        type: 'single',
        useMockData: !invoiceData,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send invoice email');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending invoice email:', error);
    throw error;
  }
}

/**
 * Sends invoice emails in bulk
 * @param invoiceDataArray - Optional array of invoice data (uses mock if not provided)
 * @param bulkCount - Number of mock invoices to generate if not using custom data
 */
export async function sendBulkInvoiceEmails(
  invoiceDataArray?: Array<Partial<InvoiceData>>,
  bulkCount: number = 5
): Promise<SendEmailResponse> {
  try {
    const response = await fetch('/api/marketing/send-invoice-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        invoiceData: invoiceDataArray,
        type: 'bulk',
        useMockData: !invoiceDataArray,
        bulkCount,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send bulk invoice emails');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending bulk invoice emails:', error);
    throw error;
  }
}

/**
 * Gets a preview of the invoice email as HTML
 * @param invoiceNumber - Optional invoice number
 */
export async function getInvoiceEmailPreview(
  invoiceNumber?: string
): Promise<string> {
  try {
    const params = new URLSearchParams();
    params.append('preview', 'true');
    if (invoiceNumber) {
      params.append('invoiceNumber', invoiceNumber);
    }

    const response = await fetch(
      `/api/marketing/send-invoice-email?${params.toString()}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get email preview');
    }

    return await response.text();
  } catch (error) {
    console.error('Error getting invoice email preview:', error);
    throw error;
  }
}

/**
 * Gets invoice email details as JSON
 * @param invoiceNumber - Optional invoice number
 */
export async function getInvoiceEmailDetails(
  invoiceNumber?: string
): Promise<{
  invoiceNumber: string;
  customerEmail: string;
  subject: string;
  htmlContent: string;
  plainText: string;
}> {
  try {
    const params = new URLSearchParams();
    params.append('preview', 'false');
    if (invoiceNumber) {
      params.append('invoiceNumber', invoiceNumber);
    }

    const response = await fetch(
      `/api/marketing/send-invoice-email?${params.toString()}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get email details');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error getting invoice email details:', error);
    throw error;
  }
}

/**
 * Opens invoice email preview in a new window
 * @param invoiceNumber - Optional invoice number
 */
export async function openInvoiceEmailPreview(
  invoiceNumber?: string
): Promise<void> {
  try {
    const html = await getInvoiceEmailPreview(invoiceNumber);
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  } catch (error) {
    console.error('Error opening invoice email preview:', error);
    throw error;
  }
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}
