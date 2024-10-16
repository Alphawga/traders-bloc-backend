import { z } from 'zod';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

const kycDocumentSchema = z.object({
  document_type: z.string(),
  document_url: z.string().url(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validationResult = kycDocumentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { document_type, document_url } = validationResult.data;
    const userId = session.user.id;

    const newDocument = await prisma.kYCDocument.create({
      data: {
        user_id: userId,
        document_type,
        document_url,
        status: 'PENDING',
      },
    });

    return NextResponse.json(newDocument, { status: 201 });
  } catch (error) {
    console.error('KYC document submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * @swagger
 * /api/kyc-document:
 *   post:
 *     summary: Submit a KYC document
 *     tags:
 *       - KYC Documents
 *     requestBody:
 *       description: KYC document data to be submitted
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               document_type:
 *                 type: string
 *                 description: Type of the document being submitted (e.g., ID card, passport)
 *               document_url:
 *                 type: string
 *                 format: uri
 *                 description: URL pointing to the KYC document
 *     responses:
 *       201:
 *         description: KYC document submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Unique identifier for the created KYC document
 *                 user_id:
 *                   type: string
 *                   description: ID of the user who submitted the document
 *                 document_type:
 *                   type: string
 *                 document_url:
 *                   type: string
 *                   format: uri
 *                 status:
 *                   type: string
 *                   description: Status of the document submission, defaults to 'PENDING'
 *       400:
 *         description: Invalid input data
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
 *                         type: array
 *                         items:
 *                           type: string
 *                       message:
 *                         type: string
 *       401:
 *         description: Unauthorized access
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
