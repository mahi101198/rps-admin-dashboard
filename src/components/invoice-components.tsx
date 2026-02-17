'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  downloadInvoicePDF,
  sendInvoiceEmail,
  sendBulkInvoiceEmails,
  openInvoiceEmailPreview,
  fetchInvoiceData,
} from '@/lib/invoice/invoice-api-client';
import { Loader2, Download, Mail, Eye, CheckCircle, AlertCircle } from 'lucide-react';

interface InvoiceComponentProps {
  invoiceNumber?: string;
}

/**
 * Simple Invoice Actions Component
 * Provides buttons to download PDF and send email
 */
export function InvoiceActionsDialog({ invoiceNumber }: InvoiceComponentProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleDownload = async () => {
    try {
      setLoading(true);
      setMessage('');
      await downloadInvoicePDF({ invoiceNumber });
      setSuccess(true);
      setMessage('Invoice downloaded successfully');
    } catch (error) {
      setSuccess(false);
      setMessage('Error: ' + String(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    try {
      setLoading(true);
      setMessage('');
      const result = await sendInvoiceEmail({ invoiceNumber });
      setSuccess(result.success);
      setMessage(result.message || 'Email sent successfully');
    } catch (error) {
      setSuccess(false);
      setMessage('Error: ' + String(error));
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    try {
      await openInvoiceEmailPreview(invoiceNumber);
    } catch (error) {
      setSuccess(false);
      setMessage('Error opening preview: ' + String(error));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice Actions</CardTitle>
        <CardDescription>
          {invoiceNumber ? `Invoice: ${invoiceNumber}` : 'Invoice Management'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleDownload}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Download PDF
          </Button>

          <Button
            onClick={handleSendEmail}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Mail className="w-4 h-4 mr-2" />
            )}
            Send Email
          </Button>

          <Button
            onClick={handlePreview}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
        </div>

        {message && (
          <div
            className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
              success
                ? 'bg-green-50 text-green-900 border border-green-200'
                : 'bg-red-50 text-red-900 border border-red-200'
            }`}
          >
            {success ? (
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            )}
            <span>{message}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Invoice Manager Component
 * Shows invoice details and actions
 */
export function InvoiceManager({ invoiceNumber }: InvoiceComponentProps) {
  const [loading, setLoading] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [error, setError] = useState('');

  const loadInvoice = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchInvoiceData(invoiceNumber);
      setInvoiceData(data);
    } catch (err) {
      setError('Failed to load invoice: ' + String(err));
    } finally {
      setLoading(false);
    }
  };

  if (!invoiceData && !loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={loadInvoice} disabled={loading}>
            {loading ? 'Loading...' : 'Load Invoice'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-red-600 py-4">{error}</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice #{invoiceData?.invoiceNumber}</CardTitle>
        <CardDescription>
          Order: {invoiceData?.orderNumber}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Customer Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Customer</p>
            <p className="text-sm font-semibold">{invoiceData?.customerName}</p>
            <p className="text-xs text-gray-500">{invoiceData?.customerEmail}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Amount</p>
            <p className="text-lg font-bold text-green-600">
              ₹{invoiceData?.total?.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Items */}
        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">Items</p>
          <div className="space-y-2">
            {invoiceData?.items?.map((item: any, idx: number) => (
              <div
                key={idx}
                className="flex justify-between text-sm p-2 bg-gray-50 rounded"
              >
                <span>{item.productName}</span>
                <span>
                  {item.quantity} × ₹{item.unitPrice}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-1 p-3 bg-gray-50 rounded">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>₹{invoiceData?.subtotal?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax:</span>
            <span>₹{invoiceData?.taxAmount?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Shipping:</span>
            <span>₹{invoiceData?.shippingCost?.toFixed(2)}</span>
          </div>
          {invoiceData?.discountAmount > 0 && (
            <div className="flex justify-between text-sm text-red-600">
              <span>Discount:</span>
              <span>-₹{invoiceData?.discountAmount?.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <InvoiceActionsDialog invoiceNumber={invoiceData?.invoiceNumber} />
      </CardContent>
    </Card>
  );
}

/**
 * Bulk Invoice Sender Component
 * Send multiple invoices at once
 */
export function BulkInvoiceSender() {
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(5);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSend = async () => {
    try {
      setLoading(true);
      setError('');
      setResult(null);
      const response = await sendBulkInvoiceEmails(undefined, count);
      setResult(response);
    } catch (err) {
      setError('Error: ' + String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Invoice Sending</CardTitle>
        <CardDescription>Send multiple invoices at once</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div>
            <label className="text-sm font-medium">Number of Invoices</label>
            <input
              type="number"
              min="1"
              max="100"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 1)}
              className="mt-1 w-20 px-3 py-2 border border-gray-300 rounded"
              disabled={loading}
            />
          </div>

          <Button
            onClick={handleSend}
            disabled={loading}
            className="mt-6"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Send Invoices
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-900 border border-red-200 rounded text-sm">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm font-semibold text-blue-900">
                {result.message}
              </p>
              <p className="text-xs text-blue-800 mt-1">
                Total: {result.total} | Success: {result.successCount} | Failed:{' '}
                {result.failureCount}
              </p>
            </div>

            {result.results && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {result.results.map((r: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-2 text-xs rounded border ${
                      r.success
                        ? 'bg-green-50 border-green-200 text-green-900'
                        : 'bg-red-50 border-red-200 text-red-900'
                    }`}
                  >
                    <p className="font-semibold">{r.invoiceNumber}</p>
                    <p>{r.email}</p>
                    {r.error && <p className="text-red-700">{r.error}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Invoice Email Preview Component
 * Preview email before sending
 */
export function InvoiceEmailPreview({ invoiceNumber }: InvoiceComponentProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePreview = async () => {
    try {
      setLoading(true);
      const html = await openInvoiceEmailPreview(invoiceNumber);
      // Note: openInvoiceEmailPreview opens in new window
      // For iframe preview, use getInvoiceEmailPreview instead
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={handlePreview} disabled={loading}>
          {loading ? 'Loading...' : 'View Email Preview'}
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * Invoice Dashboard
 * Complete dashboard with all invoice features
 */
export function InvoiceDashboard() {
  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InvoiceActionsDialog />
        <BulkInvoiceSender />
      </div>

      <InvoiceManager />

      <InvoiceEmailPreview />
    </div>
  );
}
