import prisma from '@/lib/prisma';
import { NotificationType, User } from '@prisma/client';
import { Session } from 'next-auth';
import { sendEmail } from './email-service';
import crypto from 'crypto';
import { addHours } from 'date-fns';
import { BLOCK_PERMISSIONS } from './contants';


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
  user_id?: string,
  session?: Session | null,
  admin_ids?: string[]
) => {
  const notification = await prisma.notification.create({
    data: {
      message,
      type,
      link,
      ...(user_id && {
        user: {
          connect: { id: user_id }
        }
      }),
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
    templateName: 'WELCOME_EMAIL',
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
    templateName: 'WELCOME_EMAIL',
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
    templateName: 'PASSWORD_RESET',
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
      templateName: 'TEST_EMAIL',
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
    templateName: 'EMAIL_VERIFICATION',
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
export async function verifyEmail(token: string): Promise<User> {
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

  return verificationToken.user;
}

export function getRelevantRoles(entityType: string): string[] {
  switch (entityType) {
    case 'milestone':
      return [BLOCK_PERMISSIONS.HEAD_OF_CREDIT, BLOCK_PERMISSIONS.CREDIT_OPS_LEAD];
    case 'invoice':
      return [BLOCK_PERMISSIONS.HEAD_OF_CREDIT, BLOCK_PERMISSIONS.CREDIT_OPS_LEAD];
    case 'funding_request':
      return [BLOCK_PERMISSIONS.HEAD_OF_CREDIT];
    case 'kyc':
      return [BLOCK_PERMISSIONS.HEAD_OF_CREDIT];
    default:
      return [];
  }
}

export function getNotificationType(
  entityType: 'milestone' | 'invoice' | 'funding_request' | 'kyc' | 'USER_REGISTRATION' | 'EMAIL_VERIFICATION' | 'KYC_SUBMISSION'
): NotificationType {
  switch (entityType) {
    case 'milestone':
      return NotificationType.MILESTONE_STATUS_UPDATE;
    case 'invoice':
      return NotificationType.INVOICE_STATUS_UPDATE;
    case 'funding_request':
      return NotificationType.FUNDING_STATUS_UPDATE;
    case 'kyc':
    case 'KYC_SUBMISSION':
      return NotificationType.KYC_STATUS_UPDATE;
    case 'EMAIL_VERIFICATION':
      return NotificationType.EMAIL_VERIFICATION;
    case 'USER_REGISTRATION':
      return NotificationType.SYSTEM_ALERT;
    default:
      return NotificationType.SYSTEM_ALERT;
  }
}

export async function notifyAdminsWithPermission(
  action: 'USER_REGISTRATION' | 'EMAIL_VERIFICATION' | 'KYC_SUBMISSION',
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    company_name?: string | null;
    business_address?: string | null;
    business_description?: string | null;
    business_ownership_percentage?: number | null;
    source_of_wealth?: string | null;
  },
  details?: {
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
  }
) {
  // Find admins with HEAD_OF_CREDIT permission
  const admins = await prisma.admin.findMany({
    where: {
      claims: {
        some: {
          OR: [
            {
              permission: {
                action: BLOCK_PERMISSIONS.HEAD_OF_CREDIT
              }
            },
            {
              role: {
                permissions: {
                  some: {
                    permission: {
                      action: BLOCK_PERMISSIONS.HEAD_OF_CREDIT
                    }
                  }
                }
              }
            }
          ]
        }
      },
      is_active: true
    }
  });

  // Create notification and send email to each admin
  for (const admin of admins) {
    // Create notification
    await createNotification(
      `New user action: ${action} - ${user.email}`,
      getNotificationType(action),
      `/admin/users/${user.id}`,
      undefined,
      undefined,
      [admin.id]
    );

    // Send email
    await sendEmail({
      to: admin.email,
      subject: `User Action: ${action}`,
      templateName: 'admin-notification',
      data: {
        recipientName: admin.name,
        userEmail: user.email,
        userName: `${user.first_name} ${user.last_name}`,
        action,
        userDetails: details,
        link: `${process.env.NEXT_PUBLIC_APP_URL}/admin/users/${user.id}`
      }
    } as const);
  }
}
