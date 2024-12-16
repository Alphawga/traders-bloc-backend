import nodemailer from 'nodemailer';
import prisma from './prisma';

interface EmailData {
  recipientName: string;
  message: string;
  link: string;
  [key: string]: string; // For any additional template variables
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

export async function sendEmail(
  to: string,
  templateName: string,
  data: EmailData
) {
  try {
    const template = await prisma.emailTemplate.findUnique({
      where: { name: templateName },
    });

    if (!template) {
      throw new Error(`Email template ${templateName} not found`);
    }

    let subject = template.subject;
    let body = template.body;

    // Replace placeholders with actual data
    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, value);
      body = body.replace(regex, value);
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html: body,
    });

  } catch (error) {
    if (error instanceof Error) {
      console.error('Error sending email:', error.message);
      throw error;
    }
    throw new Error('An unknown error occurred while sending email');
  }
} 