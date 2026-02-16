import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, sendBulkEmails } from '@/lib/email/zoho-mailer';
import { getTemplateById } from '@/lib/email/templates';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await verifyAuth();

    const {
      type,
      templateId,
      recipients,
      subject,
      htmlContent,
      templateData,
    } = await request.json();

    if (!type) {
      return NextResponse.json(
        { error: 'Type is required (single or bulk)' },
        { status: 400 }
      );
    }

    if (!recipients || recipients.length === 0) {
      return NextResponse.json(
        { error: 'Recipients are required' },
        { status: 400 }
      );
    }

    let finalSubject = subject;
    let finalHtml = htmlContent;

    // If using a template, compile it
    if (templateId) {
      const template = getTemplateById(templateId);
      if (!template) {
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 400 }
        );
      }
      finalSubject = subject || `${template.name} - ${new Date().toLocaleDateString()}`;
      finalHtml = template.template(templateData || {});
    }

    if (!finalSubject || !finalHtml) {
      return NextResponse.json(
        { error: 'Subject and HTML content are required' },
        { status: 400 }
      );
    }

    let result;

    if (type === 'single') {
      if (recipients.length !== 1) {
        return NextResponse.json(
          { error: 'Single type should have exactly one recipient' },
          { status: 400 }
        );
      }

      result = await sendEmail({
        to: recipients[0],
        subject: finalSubject,
        html: finalHtml,
      });

      return NextResponse.json({
        success: true,
        message: 'Email sent successfully',
        data: result,
      });
    } else if (type === 'bulk') {
      const results = await sendBulkEmails(
        recipients,
        finalSubject,
        finalHtml,
        50 // batch size
      );

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;

      return NextResponse.json({
        success: true,
        message: `Bulk emails sent`,
        data: {
          total: recipients.length,
          success: successCount,
          failed: failureCount,
          details: results,
        },
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid type. Must be "single" or "bulk"' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await verifyAuth();

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'templates') {
      const { getAllTemplates } = await import('@/lib/email/templates');
      const templates = getAllTemplates();
      const templatesList = templates.map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        category: t.category,
      }));

      return NextResponse.json({
        success: true,
        templates: templatesList,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}
