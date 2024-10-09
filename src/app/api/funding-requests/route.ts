import { NextRequest, NextResponse } from 'next/server'; 
import prisma from '@/lib/prisma';
import { fundingRequestUpdateSchema } from '@/lib/dtos';
import { getServerSession } from 'next-auth'; 

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json(); 
    const validationResult = fundingRequestUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.errors }, { status: 400 });
    }

    const session = await getServerSession(); 
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status, funding_request_id: id } = validationResult.data;

    const fundingRequest = await prisma.fundingRequest.update({
      where: { id: String(id) },
      data: {
        status,
        review_date: new Date(),
        reviewed_by: session.user.id,
      },
    });

    return NextResponse.json(fundingRequest, { status: 200 });
  } catch (error) {
    console.error('Funding request update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect(); 
  }
}

/**
 * @swagger
 * /api/funding-request:
 *   patch:
 *     summary: Update a funding request
 *     tags:
 *       - Funding Requests
 *     requestBody:
 *       description: Funding request data to be updated
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               funding_request_id:
 *                 type: string
 *                 description: Unique identifier for the funding request
 *               status:
 *                 type: string
 *                 description: New status for the funding request
 *     responses:
 *       200:
 *         description: Funding request updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Unique identifier for the updated funding request
 *                 status:
 *                   type: string
 *                 review_date:
 *                   type: string
 *                   format: date-time
 *                   description: Date when the request was reviewed
 *                 reviewed_by:
 *                   type: string
 *                   description: ID of the user who reviewed the request
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
