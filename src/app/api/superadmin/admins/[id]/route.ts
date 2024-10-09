// pages/api/superadmin/updateAdmin.ts

import { logAdminActivity } from '@/lib/helper-function';
import prisma from '@/lib/prisma';
import { getSession } from 'next-auth/react';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/withAuth';

/**
 * @swagger
 * /api/superadmin/updateAdmin:
 *   patch:
 *     summary: Update an admin's status or role
 *     tags:
 *       - Super Admin
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum:
 *                   - ACTIVE
 *                   - SUSPENDED
 *               role:
 *                 type: string
 *                 enum:
 *                   - ADMIN
 *     responses:
 *       200:
 *         description: Successfully updated admin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 email:
 *                   type: string
 *                 status:
 *                   type: string
 *       400:
 *         description: Bad request - validation errors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       path:
 *                         type: string
 *                       message:
 *                         type: string
 *       401:
 *         description: Unauthorized - User not logged in or not a SUPER_ADMIN
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: Admin not found
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

const updateAdminSchema = z.object({
  admin_id: z.string(),
  status: z.enum(['ACTIVE', 'SUSPENDED']),
  role: z.enum(['ADMIN']).optional(),
});

async function handler(req: NextRequest) {
  if (!['PATCH', 'DELETE'].includes(req.method!)) {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const session = await getSession();
    if (!session || !session.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requestBody = await req.json(); // Get the request body
    const validationResult = updateAdminSchema.safeParse(requestBody);
    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.errors }, { status: 400 });
    }

    if (req.method === 'PATCH') {
      const updatedAdmin = await prisma.admin.update({
        where: { id: String(validationResult.data.admin_id) },
        data: validationResult.data,
      });
      await logAdminActivity(session, `Updated admin role: ${updatedAdmin.email}`);

      return NextResponse.json(updatedAdmin, { status: 200 });
    }

    if (req.method === 'DELETE') {
      await prisma.admin.delete({
        where: { id: String(validationResult.data.admin_id) },
      });

      return NextResponse.json({ message: 'Admin account deleted' }, { status: 200 });
    }
  } catch (error) {
    console.error('Error managing admin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }

  // Ensure the function always returns a NextResponse
  return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
}

export default withAuth(handler, ['SUPER_ADMIN']);
