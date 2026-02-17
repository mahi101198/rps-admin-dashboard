'use client';

import React, { useState } from 'react';
import { Mail, Send, Check, AlertCircle, Loader2 } from 'lucide-react';
import { generateMockInvoiceData } from '@/lib/invoice/mock-invoice-data';

interface SendResult {
  success: boolean;
  message: string;
  details?: any;
}

export default function InvoiceTesting() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);
  const [invoicePreview, setInvoicePreview] = useState<any>(null);

  const generateTestInvoice = () => {
    const mockInvoice = generateMockInvoiceData({
      customerEmail: email || 'test@example.com',
    });
    setInvoicePreview(mockInvoice);
    return mockInvoice;
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setResult({
        success: false,
        message: 'Please enter an email address',
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setResult({
        success: false,
        message: 'Please enter a valid email address',
      });
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      // Generate test invoice with provided email
      const testInvoice = generateMockInvoiceData({
        customerEmail: email,
      });

      console.log('Sending invoice to email:', email);
      console.log('Invoice data email:', testInvoice.customerEmail);

      // Call send-invoice-email API
      const response = await fetch('/api/marketing/send-invoice-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceData: {
            ...testInvoice,
            invoiceDate: testInvoice.invoiceDate.toISOString(),
            dueDate: testInvoice.dueDate.toISOString(),
          },
          type: 'single',
          useMockData: false,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult({
          success: true,
          message: `✓ Test invoice email sent successfully to ${email}`,
          details: data.results?.[0],
        });
        setInvoicePreview(testInvoice);
      } else {
        setResult({
          success: false,
          message: data.error || 'Failed to send test email',
          details: data.details,
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Error sending test email: ' + String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewEmail = async () => {
    try {
      const testInvoice = generateTestInvoice();
      // Open email preview in new window
      const response = await fetch(
        `/api/marketing/send-invoice-email?preview=true&invoiceNumber=${testInvoice.invoiceNumber}`
      );
      const html = await response.text();
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(html);
        win.document.close();
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Error opening preview: ' + String(error),
      });
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const testInvoice = generateTestInvoice();
      const response = await fetch('/api/marketing/invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceData: {
            ...testInvoice,
            invoiceDate: testInvoice.invoiceDate.toISOString(),
            dueDate: testInvoice.dueDate.toISOString(),
          },
          useMockData: false,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice_${testInvoice.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setResult({
        success: true,
        message: `✓ Invoice PDF downloaded: Invoice_${testInvoice.invoiceNumber}.pdf`,
      });
    } catch (error) {
      setResult({
        success: false,
        message: 'Error downloading PDF: ' + String(error),
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Test Invoice Email Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Send Test Email Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Invoice Email Testing</h3>
                <p className="text-sm text-gray-600">Send a comprehensive test invoice email with all details</p>
              </div>
            </div>

            <form onSubmit={handleSendTest} className="space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="customer@example.com"
                    disabled={loading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
                  />
                  <Mail className="absolute right-4 top-3.5 w-5 h-5 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Enter the email address where you want to receive the test invoice
                </p>
              </div>

              {/* Invoice Preview Info */}
              {invoicePreview && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-medium text-blue-900">📋 Test Invoice Details:</p>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• <strong>Invoice #:</strong> {invoicePreview.invoiceNumber}</li>
                    <li>• <strong>Order #:</strong> {invoicePreview.orderNumber}</li>
                    <li>• <strong>Customer:</strong> {invoicePreview.customerName}</li>
                    <li>• <strong>Items:</strong> {invoicePreview.items.length} products</li>
                    <li>• <strong>Amount:</strong> ₹{invoicePreview.total.toLocaleString('en-IN')}</li>
                  </ul>
                </div>
              )}

              {/* Result Message */}
              {result && (
                <div
                  className={`flex items-start gap-3 p-4 rounded-lg border ${
                    result.success
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  {result.success ? (
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        result.success ? 'text-green-900' : 'text-red-900'
                      }`}
                    >
                      {result.message}
                    </p>
                    {result.details?.messageId && (
                      <p className="text-xs text-gray-600 mt-1">
                        Message ID: {result.details.messageId}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all font-medium shadow-md hover:shadow-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Test Email
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handlePreviewEmail}
                  disabled={loading || !email.trim()}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                >
                  👁️ Preview
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  disabled={loading || !email.trim()}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                >
                  📥 Download PDF
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Quick Stats & Info */}
        <div className="space-y-4">
          {/* Test Data Info */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-lg">📊</span> Test Data Included
            </h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>5 diverse products with varying prices</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>GST Tax calculations included</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Shipping & discount details</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Payment status tracking</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Complete company information</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Professional PDF invoice</span>
              </li>
            </ul>
          </div>

          {/* Email Features */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-lg">📧</span> Email Features
            </h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                Responsive design
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                Mobile-friendly
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                PDF attachment
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                Custom branding
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                Download button
              </li>
            </ul>
          </div>

          {/* Info Alert */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-xs text-amber-900">
              <strong>ℹ️ Note:</strong> This uses mock data for testing. Make sure Zoho mail credentials are configured in <code className="bg-white px-1.5 py-0.5 rounded text-xs">.env.local</code>
            </p>
          </div>
        </div>
      </div>

      {/* Invoice Format Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Email Format</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm">1</span>
              Invoice Summary
            </h4>
            <p className="text-sm text-gray-600 space-y-2">
              <span className="block">✓ Invoice & Order Numbers</span>
              <span className="block">✓ Invoice & Due Dates</span>
              <span className="block">✓ Payment Status Badge</span>
              <span className="block">✓ Quick Links</span>
            </p>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm">2</span>
              Product Details
            </h4>
            <p className="text-sm text-gray-600 space-y-2">
              <span className="block">✓ Product Names & Categories</span>
              <span className="block">✓ Quantities & Unit Prices</span>
              <span className="block">✓ Tax per Item</span>
              <span className="block">✓ Line Totals</span>
            </p>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm">3</span>
              Financial Breakdown
            </h4>
            <p className="text-sm text-gray-600 space-y-2">
              <span className="block">✓ Subtotal</span>
              <span className="block">✓ GST Tax Amount</span>
              <span className="block">✓ Shipping Charges</span>
              <span className="block">✓ Discount Applied</span>
              <span className="block">✓ Final Total Amount</span>
            </p>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm">4</span>
              Additional Info
            </h4>
            <p className="text-sm text-gray-600 space-y-2">
              <span className="block">✓ Billing Address</span>
              <span className="block">✓ Payment Method</span>
              <span className="block">✓ Shipping Method & Tracking</span>
              <span className="block">✓ Custom Notes & Terms</span>
              <span className="block">✓ Company Contact Info</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
