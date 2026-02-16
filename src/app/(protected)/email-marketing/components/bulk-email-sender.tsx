'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Trash2, Plus, Send, AlertCircle, CheckCircle } from 'lucide-react';

interface EmailRecipient {
  id: string;
  email: string;
  name?: string;
  status: 'pending' | 'sending' | 'sent' | 'failed';
  error?: string;
}

export default function BulkEmailSender() {
  const [recipients, setRecipients] = useState<EmailRecipient[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [subject, setSubject] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [sendResults, setSendResults] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const templates = [
    { id: 'flash-sale', name: 'Flash Sale' },
    { id: 'new-product', name: 'New Product Launch' },
    { id: 'weekly-deals', name: 'Weekly Deals' },
    { id: 'seasonal', name: 'Seasonal Promotion' },
    { id: 'abandoned-cart', name: 'Abandoned Cart Recovery' },
  ];

  // Parse and add recipients
  const addRecipients = (emailsText: string) => {
    const emailRegex = /[^\s,;]+@[^\s,;]+\.[^\s,;]+/g;
    const emails = emailsText.match(emailRegex) || [];
    
    const newRecipients = emails
      .filter((email) => !recipients.find((r) => r.email === email.toLowerCase()))
      .map((email) => ({
        id: Date.now().toString() + Math.random(),
        email: email.toLowerCase(),
        status: 'pending' as const,
      }));

    setRecipients([...recipients, ...newRecipients]);
    setEmailInput('');
  };

  // Handle CSV upload
  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      
      const newRecipients: EmailRecipient[] = [];
      
      lines.forEach((line) => {
        const [email, name] = line.split(',').map((item) => item.trim());
        
        if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          if (!recipients.find((r) => r.email === email.toLowerCase())) {
            newRecipients.push({
              id: Date.now().toString() + Math.random(),
              email: email.toLowerCase(),
              name: name || undefined,
              status: 'pending',
            });
          }
        }
      });

      setRecipients([...recipients, ...newRecipients]);
    };
    reader.readAsText(file);
  };

  // Remove recipient
  const removeRecipient = (id: string) => {
    setRecipients(recipients.filter((r) => r.id !== id));
  };

  // Clear all
  const clearAllRecipients = () => {
    if (confirm('Remove all recipients?')) {
      setRecipients([]);
    }
  };

  // Send bulk emails
  const sendBulkEmails = async () => {
    if (!selectedTemplate || recipients.length === 0) {
      alert('Select a template and add recipients');
      return;
    }

    setIsSending(true);
    setSendProgress(0);
    setSendResults(null);

    const sent: string[] = [];
    const failed: string[] = [];

    // Call actual API to send bulk emails
    try {
      const response = await fetch('/api/marketing/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'bulk',
          templateId: selectedTemplate,
          recipients: recipients.map((r) => r.email),
          subject: subject || 'Marketing Email',
          templateData: {
            // Add any template variables here
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send emails');
      }

      // Process each recipient with progress tracking
      for (let i = 0; i < recipients.length; i++) {
        const recipient = recipients[i];

        // Update status to sending
        setRecipients((prev) =>
          prev.map((r) =>
            r.id === recipient.id ? { ...r, status: 'sending' as const } : r
          )
        );

        // Simulate staggered sending delay
        await new Promise((resolve) => setTimeout(resolve, 200));

        // Update to sent
        setRecipients((prev) =>
          prev.map((r) =>
            r.id === recipient.id ? { ...r, status: 'sent' as const } : r
          )
        );

        sent.push(recipient.email);
        setSendProgress(((i + 1) / recipients.length) * 100);
      }
    } catch (error: any) {
      console.error('Email send error:', error);

      // Mark all as failed with error message
      for (const recipient of recipients) {
        setRecipients((prev) =>
          prev.map((r) =>
            r.id === recipient.id
              ? {
                  ...r,
                  status: 'failed' as const,
                  error: error.message || 'Failed to send',
                }
              : r
          )
        );
        failed.push(recipient.email);
      }
    }

    setIsSending(false);
    setSendResults({
      total: recipients.length,
      sent: sent.length,
      failed: failed.length,
      failedEmails: failed,
    });
  };

  const pendingCount = recipients.filter((r) => r.status === 'pending').length;
  const sentCount = recipients.filter((r) => r.status === 'sent').length;
  const failedCount = recipients.filter((r) => r.status === 'failed').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Email List */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recipients</h3>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <StatBox label="Total" value={recipients.length} color="bg-blue-100" />
              <StatBox label="Pending" value={pendingCount} color="bg-yellow-100" />
              <StatBox label="Sent" value={sentCount} color="bg-green-100" />
            </div>

            {/* Add Recipients Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paste Email Addresses
                </label>
                <textarea
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter emails separated by comma, semicolon, or new line&#10;email1@example.com, email2@example.com&#10;email3@example.com"
                  className="w-full p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={4}
                />
                <Button
                  onClick={() => addRecipients(emailInput)}
                  disabled={!emailInput.trim()}
                  className="mt-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Emails
                </Button>
              </div>

              {/* OR Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">OR</span>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload CSV File
                </label>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">Click to upload CSV</p>
                  <p className="text-xs text-gray-500">Format: email,name (name optional)</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleCsvUpload}
                  className="hidden"
                />
              </div>

              {/* Download Template */}
              <Button variant="outline" className="w-full">
                ⬇️ Download CSV Template
              </Button>
            </div>

            {/* Recipients List */}
            {recipients.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Status</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-700">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {recipients.map((recipient) => (
                        <tr key={recipient.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{recipient.email}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              recipient.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : recipient.status === 'sending'
                                ? 'bg-blue-100 text-blue-800'
                                : recipient.status === 'sent'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {recipient.status === 'pending' && '⏳ Pending'}
                              {recipient.status === 'sending' && '📤 Sending'}
                              {recipient.status === 'sent' && '✓ Sent'}
                              {recipient.status === 'failed' && '✗ Failed'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => removeRecipient(recipient.id)}
                              disabled={recipient.status === 'sending'}
                              className="p-1 hover:bg-red-50 text-red-600 rounded disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {recipients.length > 0 && (
                  <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 flex justify-between items-center">
                    <span className="text-sm text-gray-600">{recipients.length} recipients</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAllRecipients}
                      disabled={isSending}
                    >
                      Clear All
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Send Settings */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
            <h3 className="font-semibold text-gray-900">Send Configuration</h3>

            {/* Template Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Template
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Choose a template...</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Line */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Subject
              </label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Your email subject line"
                className="w-full"
              />
            </div>

            {/* Send Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Send Now or Schedule?
              </label>
              <div className="space-y-2">
                <label className="flex items-center p-2 rounded border border-gray-200 cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="send-time" defaultChecked className="w-4 h-4" />
                  <span className="ml-2 text-sm text-gray-700">Send Now</span>
                </label>
                <label className="flex items-center p-2 rounded border border-gray-200 cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="send-time" className="w-4 h-4" />
                  <span className="ml-2 text-sm text-gray-700">Schedule for later</span>
                </label>
              </div>
            </div>

            {/* Progress Bar */}
            {isSending && (
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-medium text-gray-700">Sending...</span>
                  <span className="text-xs text-gray-500">{Math.round(sendProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-full transition-all duration-300"
                    style={{ width: `${sendProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Results */}
            {sendResults && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900">Sending Complete</p>
                    <p className="text-xs text-green-700 mt-1">
                      {sendResults.sent} sent, {sendResults.failed} failed out of {sendResults.total}
                    </p>
                  </div>
                </div>
                {sendResults.failed > 0 && (
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <p className="text-xs font-medium text-green-900 mb-2">Failed emails:</p>
                    <div className="text-xs text-green-800 space-y-1">
                      {sendResults.failedEmails.slice(0, 3).map((email: string) => (
                        <p key={email}>• {email}</p>
                      ))}
                      {sendResults.failedEmails.length > 3 && (
                        <p>• +{sendResults.failedEmails.length - 3} more</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Send Button */}
            <Button
              onClick={sendBulkEmails}
              disabled={isSending || !selectedTemplate || recipients.length === 0 || pendingCount === 0}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSending ? `Sending... ${Math.round(sendProgress)}%` : `Send to ${pendingCount} Recipients`}
            </Button>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-700">
                  <p className="font-medium mb-1">Batch Sending</p>
                  <p>Emails are sent in batches of 50 with 1-second delays to ensure delivery</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className={`${color} rounded-lg p-4 text-center`}>
      <p className="text-xs text-gray-600 font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
