import nodemailer from 'nodemailer';
import prisma from './prisma';

// Define specific types for different email templates
interface BaseEmailData {
  recipientName: string;
  link: string;
}

interface CollectionAssignmentData extends BaseEmailData {
  invoiceNumber: string;
  vendorName: string;
  totalAmount: string;
  milestones: Array<{
    title: string;
    amount: string;
  }>;
}

interface KYCUpdateData extends BaseEmailData {
  status: string;
  comments?: string;
}

interface InvoiceUpdateData extends BaseEmailData {
  invoiceNumber: string;
  status: string;
  comments?: string;
}

// Add to existing email template types
interface WelcomeEmailData extends BaseEmailData {
  password: string;
  email: string;
  role: string;
}

interface TestEmailData extends BaseEmailData {
  testMessage: string;
}

// Map template names to their data types
export type EmailTemplateDataMap = {
  'collection-assignment': CollectionAssignmentData;
  'kyc-update': KYCUpdateData;
  'invoice-update': InvoiceUpdateData;
  'welcome-email': WelcomeEmailData;
  'test-email': TestEmailData;
  'password-reset': WelcomeEmailData;
  'email-verification': WelcomeEmailData;
};

interface SendEmailProps<T extends keyof EmailTemplateDataMap> {
  to: string;
  subject: string;
  templateName: T;
  data: EmailTemplateDataMap[T];
}

export async function sendEmail<T extends keyof EmailTemplateDataMap>({ 
  to, 
  subject, 
  templateName, 
  data 
}: SendEmailProps<T>) {
  try {
    const template = await prisma.emailTemplate.findUnique({
      where: { name: templateName }
    });

    if (!template) {
      throw new Error(`Email template '${templateName}' not found`);
    }

    // Replace placeholders in template with actual data
    let htmlContent = template.body;
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        htmlContent = htmlContent.replace(
          new RegExp(`{{${key}}}`, 'g'), 
          value
        );
      } else if (Array.isArray(value)) {
        // Handle arrays (like milestones)
        const arrayContent = value.map(item => {
          let template = '{{#each}}';
          for (const [k, v] of Object.entries(item)) {
            template = template.replace(`{{${k}}}`, String(v));
          }
          return template;
        }).join('');
        htmlContent = htmlContent.replace(`{{#each ${key}}}`, arrayContent);
      }
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html: htmlContent,
    });

  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
} 