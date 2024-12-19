import prisma from '@/lib/prisma';
import { NotificationType } from '@prisma/client';
import { Session } from 'next-auth';
import { sendEmail } from './email-service';
import crypto from 'crypto';
import { addHours } from 'date-fns';






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

export const createNotification = async (
  message: string,
  type: NotificationType,
  link: string,
  user_id: string,
  session?: Session | null,
  admin_ids?: string[]
) => {
  const notification = await prisma.notification.create({
    data: {
      message,
      type,
      link,
      user: {
        connect: { id: user_id }
      },
      ...(admin_ids && {
        admin: {
          connect: admin_ids.map(id => ({ id }))
        }
      })
    },
  });

  return notification;
};



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

