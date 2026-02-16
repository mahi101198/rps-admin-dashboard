'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Send, Upload, Eye, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface TemplateData {
  [key: string]: any;
}

export function MarketingEmailComposer() {
  const [sendType, setSendType] = useState<'single' | 'bulk'>('bulk');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [subject, setSubject] = useState('');
  const [customHtml, setCustomHtml] = useState('');
  const [recipients, setRecipients] = useState('');
  const [templateData, setTemplateData] = useState<TemplateData>({});
  const [compiledHtml, setCompiledHtml] = useState('');

  // Load templates
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const response = await fetch('/api/marketing/send-email?action=templates');
        const data = await response.json();
        if (data.success) {
          setTemplates(data.templates);
        }
      } catch (error) {
        console.error('Failed to load templates:', error);
        setError('Failed to load email templates');
      }
    };

    loadTemplates();
  }, []);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSubject(`${template.name} - ${new Date().toLocaleDateString()}`);
      // Reset template data
      setTemplateData({});
    }
  };

  const handleSendEmail = async () => {
    setError(null);

    // Validation
    if (!recipients.trim()) {
      setError('Please enter at least one recipient email');
      return;
    }

    if (sendType === 'single' && recipients.split(',').length > 1) {
      setError('Single send mode accepts only one email address');
      return;
    }

    if (!selectedTemplate && !customHtml) {
      setError('Please either select a template or enter custom HTML content');
      return;
    }

    if (!subject) {
      setError('Please enter an email subject');
      return;
    }

    setLoading(true);

    try {
      const recipientList = recipients
        .split(',')
        .map(e => e.trim())
        .filter(e => e && e.includes('@'));

      if (recipientList.length === 0) {
        setError('No valid email addresses found');
        setLoading(false);
        return;
      }

      const payload = {
        type: sendType,
        templateId: selectedTemplate || undefined,
        recipients: recipientList,
        subject: subject,
        htmlContent: customHtml || undefined,
        templateData: selectedTemplate ? templateData : undefined,
      };

      const response = await fetch('/api/marketing/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send email');
      }

      setShowSuccess(true);
      // Reset form
      setSelectedTemplate('');
      setSubject('');
      setCustomHtml('');
      setRecipients('');
      setTemplateData({});
      setCompiledHtml('');

      setTimeout(() => setShowSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  const renderTemplateDataInputs = () => {
    if (!selectedTemplate) return null;

    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) return null;

    const commonFields = [
      { key: 'customerName', label: 'Customer Name', type: 'text' },
      { key: 'shopUrl', label: 'Shop URL', type: 'text' },
    ];

    const templateSpecificFields: { [key: string]: Array<{ key: string; label: string; type: string }> } = {
      'flash-sale': [
        { key: 'endTime', label: 'Sale End Time', type: 'text' },
        { key: 'products', label: 'Products (JSON array)', type: 'textarea' },
      ],
      'new-product': [
        { key: 'productName', label: 'Product Name', type: 'text' },
        { key: 'productImage', label: 'Product Image URL', type: 'text' },
        { key: 'productDescription', label: 'Product Description', type: 'textarea' },
        { key: 'price', label: 'Price', type: 'text' },
        { key: 'originalPrice', label: 'Original Price (Optional)', type: 'text' },
      ],
      'weekly-deals': [
        { key: 'deals', label: 'Deals (JSON array)', type: 'textarea' },
      ],
      'seasonal': [
        { key: 'seasonTitle', label: 'Season Title', type: 'text' },
        { key: 'seasonSubtitle', label: 'Season Subtitle', type: 'text' },
        { key: 'discount', label: 'Discount Percentage', type: 'text' },
        { key: 'promoCode', label: 'Promo Code', type: 'text' },
        { key: 'validUntil', label: 'Valid Until', type: 'text' },
        { key: 'message', label: 'Message', type: 'textarea' },
      ],
      'abandoned-cart': [
        { key: 'items', label: 'Cart Items (JSON array)', type: 'textarea' },
        { key: 'subtotal', label: 'Subtotal', type: 'text' },
        { key: 'total', label: 'Total', type: 'text' },
        { key: 'cartUrl', label: 'Cart URL', type: 'text' },
      ],
    };

    const fieldsToShow = [
      ...commonFields,
      ...(templateSpecificFields[selectedTemplate] || []),
    ];

    return (
      <div className="space-y-4 mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Mail className="w-4 h-4" />
          Template Data
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fieldsToShow.map(field => (
            <div key={field.key}>
              <Label className="text-sm">{field.label}</Label>
              {field.type === 'textarea' ? (
                <Textarea
                  placeholder={`Enter ${field.label.toLowerCase()}...`}
                  value={templateData[field.key] || ''}
                  onChange={(e) =>
                    setTemplateData({
                      ...templateData,
                      [field.key]: e.target.value,
                    })
                  }
                  className="mt-1 min-h-20"
                />
              ) : (
                <Input
                  type="text"
                  placeholder={`Enter ${field.label.toLowerCase()}...`}
                  value={templateData[field.key] || ''}
                  onChange={(e) =>
                    setTemplateData({
                      ...templateData,
                      [field.key]: e.target.value,
                    })
                  }
                  className="mt-1"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Mail className="w-8 h-8" />
            Marketing Email Campaign
          </h1>
          <p className="text-muted-foreground mt-1">
            Send promotional emails using pre-built templates or custom HTML
          </p>
        </div>
      </div>

      {/* Alerts */}
      {showSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Email campaign sent successfully!
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="composer" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="composer">Email Composer</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="composer" className="space-y-4">
          {/* Send Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Send Type</CardTitle>
              <CardDescription>Choose how to send this email</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant={sendType === 'single' ? 'default' : 'outline'}
                  onClick={() => setSendType('single')}
                  className="h-24 flex flex-col items-center justify-center"
                >
                  <Mail className="w-6 h-6 mb-2" />
                  <span>Single Email</span>
                </Button>
                <Button
                  variant={sendType === 'bulk' ? 'default' : 'outline'}
                  onClick={() => setSendType('bulk')}
                  className="h-24 flex flex-col items-center justify-center"
                >
                  <Send className="w-6 h-6 mb-2" />
                  <span>Bulk Email</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recipients */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recipients</CardTitle>
              <CardDescription>
                {sendType === 'single'
                  ? 'Enter one email address'
                  : 'Enter email addresses separated by commas'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder={
                  sendType === 'single'
                    ? 'user@example.com'
                    : 'user1@example.com, user2@example.com, user3@example.com'
                }
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                className="min-h-24"
              />
            </CardContent>
          </Card>

          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Email Template</CardTitle>
              <CardDescription>Select a pre-built template</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {templates.map(template => (
                  <Button
                    key={template.id}
                    variant={selectedTemplate === template.id ? 'default' : 'outline'}
                    onClick={() => handleTemplateSelect(template.id)}
                    className="h-auto py-3 flex flex-col items-start justify-start"
                  >
                    <div className="font-semibold text-left">{template.name}</div>
                    <div className="text-xs text-left opacity-75 mt-1">
                      {template.description}
                    </div>
                  </Button>
                ))}
              </div>

              {selectedTemplate && renderTemplateDataInputs()}
            </CardContent>
          </Card>

          {/* Custom Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Email Subject</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Enter email subject..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </CardContent>
          </Card>

          {!selectedTemplate && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Custom HTML Content</CardTitle>
                <CardDescription>
                  Paste your custom HTML email content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="<html>...</html>"
                  value={customHtml}
                  onChange={(e) => setCustomHtml(e.target.value)}
                  className="font-mono text-sm min-h-48"
                />
              </CardContent>
            </Card>
          )}

          {/* Send Button */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setPreviewMode(true)}
              disabled={!selectedTemplate && !customHtml}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={loading}
              className="min-w-32"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Campaign
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Email Preview</CardTitle>
              <CardDescription>
                This is how your email will appear to recipients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg bg-white p-4">
                <div className="text-xs text-muted-foreground mb-4 pb-4 border-b">
                  <div>
                    <strong>Subject:</strong> {subject || '(No subject)'}
                  </div>
                  <div className="mt-2">
                    <strong>Recipients:</strong>{' '}
                    {recipients.split(',').length} recipient(s)
                  </div>
                </div>
                <div
                  className="text-sm"
                  dangerouslySetInnerHTML={{
                    __html:
                      selectedTemplate && templateData
                        ? (() => {
                            try {
                              const { getAllTemplates } = require('@/lib/email/templates');
                              const allTemplates = getAllTemplates();
                              const template = allTemplates.find(
                                (t: any) => t.id === selectedTemplate
                              );
                              return template ? template.template(templateData) : customHtml;
                            } catch {
                              return customHtml;
                            }
                          })()
                        : customHtml,
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
