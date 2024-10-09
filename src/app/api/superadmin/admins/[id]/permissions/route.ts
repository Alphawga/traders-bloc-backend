import { withAuth } from '@/lib/auth/withAuth'; // Use your existing withAuth function
import prisma from '@/lib/prisma';
import { getSession } from 'next-auth/react';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';


const updatePermissionsSchema = z.object({
  admin_id: z.string(),
  role: z.enum(['ADMIN', 'SUPER_ADMIN']),
});


async function handler(req: NextRequest) {
  
  if (req.method !== 'PATCH') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
  
    const session = await getSession();
    if (!session || !session.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }


    const validationResult = updatePermissionsSchema.safeParse(await req.json());
    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.errors }, { status: 400 });
    }

    
    const updatedPermissions = await prisma.admin.update({
      where: { id: String(validationResult.data.admin_id) },
      data: { role: validationResult.data.role },
    });

    // Return the updated permissions
    return NextResponse.json(updatedPermissions, { status: 200 });
  } catch (error) {
    console.error('Error updating admin permissions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Export the handler wrapped with authorization
export default withAuth(handler, ['SUPER_ADMIN']);



/**
 * @swagger
 * /api/superadmin/updatePermissions:
 *   patch:
 *     summary: Update an admin's role
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
 *               role:
 *                 type: string
 *                 enum:
 *                   - ADMIN
 *                   - SUPER_ADMIN
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
 *                 role:
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
