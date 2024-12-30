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

// Add new email template types
interface AdminNotificationData extends BaseEmailData {
  userEmail: string;
  userName: string;
  action: 'USER_REGISTRATION' | 'EMAIL_VERIFICATION' | 'KYC_SUBMISSION';
  userDetails?: {
    documents?: Array<{
      type: string;
      status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_SUBMITTED';
    }>;
    company_details?: {
      company_name?: string;
      business_address?: string;
      business_description?: string;
      business_ownership_percentage?: number;
      source_of_wealth?: string;
    };
    verification_status?: boolean;
    registration_details?: {
      industry?: string;
      tax_id?: string;
    };
  };
}

// Map template names to their data types
export type EmailTemplateDataMap = {
  'COLLECTION_ASSIGNMENT': CollectionAssignmentData;
  'KYC_UPDATE': KYCUpdateData;
  'INVOICE_UPDATE': InvoiceUpdateData;
  'WELCOME_EMAIL': WelcomeEmailData;
  'TEST_EMAIL': TestEmailData;
  'PASSWORD_RESET': WelcomeEmailData;
  'EMAIL_VERIFICATION': WelcomeEmailData;
  'admin-notification': AdminNotificationData;
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