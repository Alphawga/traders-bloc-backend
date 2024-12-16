import prisma from '@/lib/prisma';
import { NotificationType } from '@prisma/client';
import { Session } from 'next-auth';
import { BLOCK_PERMISSIONS } from './contants';
import { sendEmail } from './email-service';
import crypto from 'crypto';
import { addHours } from 'date-fns';

interface NotificationRecipient {
  email: string;
  name: string;
  first_name?: string;
  last_name?: string;
}

interface NotificationData {
  recipientName: string;
  message: string;
  link: string;
}

export async function logAdminActivity(session: Session, action: string, type:NotificationType ): Promise<void> {
  if (!session || !session.user) {
    throw new Error('Invalid session or unauthorized user');
  }

  try {
    await prisma.activityLog.create({
      data: {
        action,
        type,
        admin_id: session.user.id ??"",
      },
    });
  } catch (error) {
    console.error('Error logging admin activity:', error);
    throw new Error('Failed to log activity');
  } finally {
    await prisma.$disconnect();
  }
}

export async function createNotification(
  message: string, 
  type: NotificationType, 
  link: string, 
  user_id?: string, 
  session?: Session
): Promise<void> {
  try {
    let recipients: NotificationRecipient[] = [];
    const emailData: NotificationData = {
      recipientName: '',
      message,
      link: `${process.env.NEXT_PUBLIC_APP_URL}${link}`
    };
    let emailTemplate = '';

    switch(type) {
      case NotificationType.INVOICE_ASSIGNED:
        const creditOpsLeads = await prisma.admin.findMany({
          where: {
            claims: {
              some: {
                role_name: BLOCK_PERMISSIONS.CREDIT_OPS_LEAD,
                active: true
              }
            }
          },
          select: {
            id: true,
            email: true,
            name: true
          }
        });
        recipients = creditOpsLeads;
        emailTemplate = 'INVOICE_ASSIGNMENT';
        break;

      case NotificationType.MILESTONE_ASSIGNED:
        const analysts = await prisma.admin.findMany({
          where: {
            claims: {
              some: {
                role_name: BLOCK_PERMISSIONS.CREDIT_OPS_ANALYST,
                active: true
              }
            }
          },
          select: {
            id: true,
            email: true,
            name: true
          }
        });
        recipients = analysts;
        emailTemplate = 'MILESTONE_ASSIGNMENT';
        break;

      // ... handle other cases ...
    }

    // Create notification
    const notification = await prisma.notification.create({
      data: {
        message,
        type,
        link,
        admin: recipients.length > 0 ? {
          connect: recipients.map(r => ({ email: r.email }))
        } : undefined,
        user: user_id ? {
          connect: { id: user_id }
        } : undefined,
        is_read: false,
        email_sent: false
      }
    });

    // Send emails
    if (emailTemplate && recipients.length > 0) {
      const emailPromises = recipients.map(recipient => 
        sendEmail(
          recipient.email,
          emailTemplate,
          {
            ...emailData,
            recipientName: recipient.name || `${recipient.first_name} ${recipient.last_name}`
          }
        )
      );

      await Promise.all(emailPromises);

      // Mark notification as emailed
      await prisma.notification.update({
        where: { id: notification.id },
        data: { is_read: false }
      });
    }

    // Log admin activity if session exists
    if (session) {
      await logAdminActivity(session, message, type);
    }

  } catch (error) {
    if (error instanceof Error) {
      console.error('Error creating notification:', error.message);
      throw error;
    }
    throw new Error('An unknown error occurred while creating notification');
  }
}

// Add this function to test email
export async function testEmail() {
  try {
    await sendEmail(
      'recipient@example.com', // Replace with your test email
      'INVOICE_ASSIGNMENT', // Or any template name you've created
      {
        recipientName: 'Test User',
        message: 'This is a test notification',
        link: '/test-link'
      }
    );
    console.log('Test email sent successfully');
  } catch (error) {
    console.error('Failed to send test email:', error);
  }
}

// Add new function to generate verification token
export async function createVerificationToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = addHours(new Date(), 24); // Token expires in 24 hours

  await prisma.verificationToken.create({
    data: {
      token,
      user_id: userId,
      expires,
    },
  });

  return token;
}

// Add new function to send welcome email
export async function sendWelcomeEmail(user: { 
  id: string; 
  email: string; 
  first_name: string; 
  last_name: string; 
}): Promise<void> {
  const verificationToken = await createVerificationToken(user.id);
  const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`;

  // Send welcome email
  await sendEmail(
    user.email,
    'WELCOME_EMAIL',
    {
      recipientName: `${user.first_name} ${user.last_name}`,
      message: 'Welcome to Traders Bloc!',
      link: verificationLink
    }
  );

  // Create welcome notification
  await createNotification(
    `Welcome to Traders Bloc, ${user.first_name}! Please verify your email.`,
    NotificationType.EMAIL_VERIFICATION,
    `/verify-email?token=${verificationToken}`,
    user.id
  );
}

// Add function to verify email
export async function verifyEmail(token: string): Promise<boolean> {
  const verificationToken = await prisma.verificationToken.findFirst({
    where: {
      token,
      expires: {
        gt: new Date(),
      },
    },
    include: {
      user: true,
    },
  });

  if (!verificationToken) {
    throw new Error('Invalid or expired verification token');
  }

  // Update user's email verification status
  await prisma.user.update({
    where: { id: verificationToken.user_id },
    data: { is_email_verified: true },
  });

  // Delete used token
  await prisma.verificationToken.delete({
    where: { id: verificationToken.id },
  });

  // Create verification success notification
  await createNotification(
    'Email verification successful! Your account is now fully activated.',
    NotificationType.EMAIL_VERIFICATION,
    '/dashboard',
    verificationToken.user_id
  );

  return true;
}

