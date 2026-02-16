// Utility functions for sending marketing emails from actions or server-side code

import { sendEmail, sendBulkEmails } from './zoho-mailer';
import { getTemplateById } from './templates';

interface SendTemplateEmailOptions {
  templateId: string;
  to: string | string[];
  subject?: string;
  data?: Record<string, any>;
}

interface SendCustomEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
}

/**
 * Send an email using a pre-built template
 * @example
 * await sendTemplateEmail({
 *   templateId: 'flash-sale',
 *   to: 'customer@example.com',
 *   data: {
 *     customerName: 'John',
 *     endTime: '24 Hours',
 *     shopUrl: 'https://store.com',
 *     products: [...]
 *   }
 * });
 */
export async function sendTemplateEmail(options: SendTemplateEmailOptions) {
  try {
    const template = getTemplateById(options.templateId);
    if (!template) {
      throw new Error(`Template not found: ${options.templateId}`);
    }

    const html = template.template(options.data || {});
    const subject = options.subject || `${template.name} - ${new Date().toLocaleDateString()}`;

    return await sendEmail({
      to: options.to,
      subject,
      html,
    });
  } catch (error: any) {
    console.error('Error sending template email:', error);
    throw error;
  }
}

/**
 * Send a custom email with HTML content
 * @example
 * await sendCustomEmail({
 *   to: 'customer@example.com',
 *   subject: 'Order Confirmation',
 *   html: '<h1>Your order has been confirmed</h1>'
 * });
 */
export async function sendCustomEmail(options: SendCustomEmailOptions) {
  return await sendEmail({
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
}

/**
 * Send bulk template emails
 * @example
 * await sendBulkTemplateEmails({
 *   templateId: 'weekly-deals',
 *   recipients: ['user1@example.com', 'user2@example.com'],
 *   data: { deals: [...] }
 * });
 */
export async function sendBulkTemplateEmails(
  templateId: string,
  recipients: string[],
  data?: Record<string, any>,
  subject?: string
) {
  try {
    const template = getTemplateById(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const html = template.template(data || {});
    const finalSubject = subject || `${template.name} - ${new Date().toLocaleDateString()}`;

    return await sendBulkEmails(recipients, finalSubject, html);
  } catch (error: any) {
    console.error('Error sending bulk template emails:', error);
    throw error;
  }
}

/**
 * Get all available templates
 */
export function getAvailableTemplates() {
  const { getAllTemplates } = require('./templates');
  return getAllTemplates().map((t: any) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    category: t.category,
  }));
}

/**
 * Validate email addresses
 */
export function validateEmails(emails: string | string[]): string[] {
  const emailList = Array.isArray(emails) ? emails : [emails];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailList
    .map(e => e.trim())
    .filter(e => e && emailRegex.test(e));
}

/**
 * Send flash sale email to customers
 */
export async function sendFlashSaleEmail(
  recipients: string[],
  saleData: {
    endTime: string;
    products: Array<{
      name: string;
      image: string;
      originalPrice: number;
      salePrice: number;
      discount: number;
    }>;
    shopUrl: string;
  }
) {
  const validEmails = validateEmails(recipients);
  if (validEmails.length === 0) {
    throw new Error('No valid email addresses provided');
  }

  return await sendBulkTemplateEmails(
    'flash-sale',
    validEmails,
    {
      ...saleData,
      customerName: 'Valued Customer', // Can be personalized
    },
    `🎉 FLASH SALE IS LIVE! - Don't Miss Out`
  );
}

/**
 * Send new product announcement email
 */
export async function sendNewProductEmail(
  recipients: string[],
  productData: {
    productName: string;
    productImage: string;
    productDescription: string;
    features?: string[];
    price: number;
    originalPrice?: number;
    shopUrl: string;
  }
) {
  const validEmails = validateEmails(recipients);
  if (validEmails.length === 0) {
    throw new Error('No valid email addresses provided');
  }

  return await sendBulkTemplateEmails(
    'new-product',
    validEmails,
    {
      ...productData,
      customerName: 'Valued Customer',
    },
    `🎉 New Product Launch - ${productData.productName}`
  );
}

/**
 * Send weekly deals email
 */
export async function sendWeeklyDealsEmail(
  recipients: string[],
  deals: Array<{
    name: string;
    price: number;
    discount: number;
    category: string;
  }>,
  shopUrl: string
) {
  const validEmails = validateEmails(recipients);
  if (validEmails.length === 0) {
    throw new Error('No valid email addresses provided');
  }

  return await sendBulkTemplateEmails(
    'weekly-deals',
    validEmails,
    {
      deals,
      shopUrl,
      customerName: 'Valued Customer',
    },
    `🎁 Weekly Deals - This Week's Best Bargains`
  );
}

/**
 * Send seasonal promotion email
 */
export async function sendSeasonalPromoEmail(
  recipients: string[],
  promoData: {
    seasonTitle: string;
    seasonSubtitle: string;
    discount: number;
    promoCode: string;
    validUntil: string;
    shopUrl: string;
    message?: string;
    offerDescription?: string;
  }
) {
  const validEmails = validateEmails(recipients);
  if (validEmails.length === 0) {
    throw new Error('No valid email addresses provided');
  }

  return await sendBulkTemplateEmails(
    'seasonal',
    validEmails,
    {
      ...promoData,
      customerName: 'Valued Customer',
    },
    `🎊 ${promoData.seasonTitle} - ${promoData.discount}% OFF`
  );
}

/**
 * Send abandoned cart recovery email
 */
export async function sendAbandonedCartEmail(
  recipient: string,
  cartData: {
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    subtotal: number;
    total: number;
    cartUrl: string;
    discount?: number;
    specialOffer?: string;
  }
) {
  const validEmails = validateEmails(recipient);
  if (validEmails.length === 0) {
    throw new Error('No valid email address provided');
  }

  return await sendTemplateEmail({
    templateId: 'abandoned-cart',
    to: validEmails[0],
    subject: '🛒 You Left Items in Your Cart - Complete Your Purchase',
    data: {
      ...cartData,
      customerName: 'Valued Customer',
    },
  });
}
