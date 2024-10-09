
import { withAuth } from '@/lib/auth/withAuth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

async function GET(req: NextRequest) {

    req.json()
  try {
    const session = await getServerSession(); 

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const kycDocument = await prisma.kYCDocument.findMany({});

    if (!kycDocument) {
      return NextResponse.json({ error: 'KYC document not found' }, { status: 404 });
    }

    return NextResponse.json(kycDocument, { status: 200 });
  } catch (error) {
    console.error('Error fetching KYC document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect(); 
  }
}

export default withAuth(GET, ['ADMIN', 'SUPER_ADMIN']);

/**
 * @swagger
 * /api/kyc/documents:
 *   get:
 *     summary: Fetch KYC documents
 *     tags:
 *       - KYC
 *     responses:
 *       200:
 *         description: Successfully retrieved KYC documents
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   userId:
 *                     type: string
 *                   documentType:
 *                     type: string
 *                   documentUrl:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized - User not logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: No KYC documents found
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
