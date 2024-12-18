import prisma from '@/lib/prisma';
import { NotificationType } from '@prisma/client';
import { Session } from 'next-auth';
import { BLOCK_PERMISSIONS } from './contants';
import { EmailTemplateDataMap, sendEmail } from './email-service';
import crypto from 'crypto';
import { addHours } from 'date-fns';


interface NotificationRecipient {
  email: string;
  name: string;
  first_name?: string;
  last_name?: string;
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
        sendEmail({
          to: recipient.email,
          subject: emailTemplate,
          templateName: emailTemplate as keyof EmailTemplateDataMap,
          data: {
            email: recipient.email,
            recipientName: recipient.name || `${recipient.first_name} ${recipient.last_name}`,  
            link: `${process.env.NEXT_PUBLIC_APP_URL}${link}`,
            role: 'User', 
            password: ''
          }
        })
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

  // Send welcome email with new structure
  await sendEmail({
    to: user.email,
    subject: 'Welcome to Traders Bloc - Verify Your Email',
    templateName: 'welcome-email',
    data: {
      recipientName: `${user.first_name} ${user.last_name}`,
      email: user.email,
      link: verificationLink,
      role: 'User', // Default role for new users
      password: '' // Empty for regular users as they set their own password
    }
  } as const);

  // Create welcome notification
  await createNotification(
    `Welcome to Traders Bloc, ${user.first_name}! Please verify your email.`,
    NotificationType.EMAIL_VERIFICATION,
    `/verify-email?token=${verificationToken}`,
    user.id
  );
}

// Add admin welcome email function
export async function sendAdminWelcomeEmail(admin: { 
  email: string; 
  name: string;
  role: string;
  password: string; // Temporary password
}): Promise<void> {
  await sendEmail({
    to: admin.email,
    subject: 'Welcome to Traders Bloc Admin Panel',
    templateName: 'welcome-email',
    data: {
      recipientName: admin.name,
      email: admin.email,
      role: admin.role,
      password: admin.password,
      link: `${process.env.NEXT_PUBLIC_APP_URL}/admin/login`
    }
  } as const);
}

// Update password reset email
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetToken: string
): Promise<void> {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

  await sendEmail({
    to: email,
    subject: 'Password Reset Request',
    templateName: 'password-reset',
    data: {
      recipientName: name,
      link: resetLink,
      email: email,
      role: '', // Not needed for password reset
      password: '' // Not needed for password reset
    }
  } as const);
}

// Update test email function
export async function sendTestEmail(email: string, name: string): Promise<boolean> {
  try {
    await sendEmail({
      to: email,
      subject: 'Test Email from Traders Bloc',
      templateName: 'test-email',
      data: {
        recipientName: name,
        testMessage: 'This is a test email to verify the email functionality.',
        link: process.env.NEXT_PUBLIC_APP_URL || ''
      }
    } as const);

    return true;
  } catch (error) {
    console.error('Failed to send test email:', error);
    return false;
  }
}

// Add email verification reminder
export async function sendEmailVerificationReminder(user: {
  email: string;
  first_name: string;
  last_name: string;
  id: string;
}): Promise<void> {
  const verificationToken = await createVerificationToken(user.id);
  const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`;

  await sendEmail({
    to: user.email,
    subject: 'Please Verify Your Email',
    templateName: 'email-verification',
    data: {
      recipientName: `${user.first_name} ${user.last_name}`,
      link: verificationLink,
      email: user.email,
      role: '', // Not needed for verification
      password: '' // Not needed for verification
    }
  } as const);
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

