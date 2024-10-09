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

    const { status, funding_request_id:id } = validationResult.data;

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
 * /api/funding-requests/update:
 *   patch:
 *     summary: Update a funding request
 *     tags:
 *       - Funding Requests
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               funding_request_id:
 *                 type: string
 *                 description: The ID of the funding request to be updated.
 *               status:
 *                 type: string
 *                 description: The new status of the funding request.
 *     responses:
 *       200:
 *         description: Successfully updated the funding request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 status:
 *                   type: string
 *                 review_date:
 *                   type: string
 *                   format: date-time
 *                 reviewed_by:
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