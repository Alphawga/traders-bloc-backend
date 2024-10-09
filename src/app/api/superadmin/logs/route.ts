// pages/api/superadmin/logs.ts

import { withAuth } from '@/lib/auth/withAuth';
import prisma from '@/lib/prisma';
import {  NextResponse } from 'next/server';
import { getSession } from 'next-auth/react';

/**
 * @swagger
 * /api/superadmin/logs:
 *   get:
 *     summary: Retrieve activity logs for admins
 *     tags:
 *       - Super Admin
 *     responses:
 *       200:
 *         description: Successfully retrieved logs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   action:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   adminId:
 *                     type: string
 *       401:
 *         description: Unauthorized - User not logged in or not a SUPER_ADMIN
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       405:
 *         description: Method not allowed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

async function handler() {
  
  try {
    const session = await getSession();
    if (!session || !session.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const logs = await prisma.activityLog.findMany({
      where: { admin: { role: 'ADMIN' } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(logs, { status: 200 });
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export default withAuth(handler, ['SUPER_ADMIN']);
