import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth/withAuth'; 
import { kycUpdateSchema } from '@/lib/dtos';
import { getServerSession } from 'next-auth';

/**
 * @swagger
 * /api/kyc/documents:
 *   patch:
 *     summary: Update KYC document status
 *     tags:
 *       - KYC
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               kyc_id:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [PENDING, APPROVED, REJECTED]
 *     responses:
 *       200:
 *         description: Successfully updated KYC document
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 userId:
 *                   type: string
 *                 status:
 *                   type: string
 *                 review_date:
 *                   type: string
 *                   format: date-time
 *                 reviewed_by:
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
  try {
    const body = await req.json(); 
    const validationResult = kycUpdateSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.errors }, { status: 400 });
    }

    const { status, kyc_id } = validationResult.data;
    const session = await getServerSession(); 

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const kycDocument = await prisma.kYCDocument.update({
      where: { id: String(kyc_id) }, 
      data: {
        status,
        review_date: new Date(),
        reviewed_by: session.user.id,
      },
    });

    return NextResponse.json(kycDocument, { status: 200 });
  } catch (error) {
    console.error('KYC update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect(); // Disconnect the Prisma client
  }
}

export default withAuth(PATCH, ['ADMIN', 'SUPER_ADMIN']);
