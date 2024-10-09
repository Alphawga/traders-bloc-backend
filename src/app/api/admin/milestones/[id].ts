import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { milestoneUpdateSchema } from '@/lib/dtos';
import { withAuth } from '@/lib/auth/withAuth';

/**
 * @swagger
 * /api/milestones:
 *   patch:
 *     summary: Update milestone status
 *     tags:
 *       - Milestones
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [PENDING, COMPLETED, CANCELED]
 *     responses:
 *       200:
 *         description: Successfully updated milestone
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 status:
 *                   type: string
 *       400:
 *         description: Bad Request - Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: array
 *                   items:
 *                     type: string
 *       401:
 *         description: Unauthorized - User not logged in
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

async function PATCH(req: NextRequest) {
  if (req.method !== 'PATCH') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await req.json(); // Get data from the request body
    const validationResult = milestoneUpdateSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.errors }, { status: 400 });
    }

    const { id, status } = validationResult.data; // Get id and status from the schema

    const milestone = await prisma.milestone.update({
      where: { id: String(id) },
      data: { status },
    });

    return NextResponse.json(milestone, { status: 200 });
  } catch (error) {
    console.error('Milestone update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export default withAuth(PATCH, ['ADMIN', 'SUPER_ADMIN']);
