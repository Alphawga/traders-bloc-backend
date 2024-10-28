import prisma from '@/lib/prisma';
import { NotificationType } from '@prisma/client';
import { Session } from 'next-auth';


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
