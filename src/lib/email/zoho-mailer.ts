import nodemailer from 'nodemailer';

// Zoho SMTP Configuration
const getZohoTransporter = () => {
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

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
}

export async function sendEmail(options: EmailOptions) {
  try {
    const transporter = getZohoTransporter();
    
    const info = await transporter.sendMail({
      from: process.env.ZOHO_MAIL_USER, // Use authenticated email as sender (Zoho requirement)
      to: options.to,
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo || process.env.ZOHO_MAIL_USER,
      cc: options.cc,
      bcc: options.bcc,
    });
    
    console.log('Email sent successfully:', info.messageId);
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: any) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

export async function sendBulkEmails(
  recipients: string[],
  subject: string,
  html: string,
  batchSize: number = 50
) {
  const results = [];
  
  try {
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      for (const recipient of batch) {
        try {
          const result = await sendEmail({
            to: recipient,
            subject,
            html,
          });
          results.push({ recipient, success: true, messageId: result.messageId });
        } catch (error: any) {
          results.push({ recipient, success: false, error: error.message });
        }
      }
      
      // Add delay between batches to avoid rate limiting
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  } catch (error: any) {
    console.error('Error in bulk email sending:', error);
    throw error;
  }
}
