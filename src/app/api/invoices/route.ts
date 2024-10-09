import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';

const invoiceSchema = z.object({
  invoice_number: z.string(),
  amount: z.number().positive(),
  payment_terms: z.string(),
  due_date: z.string().transform((str) => new Date(str)),
});

export async function POST(req: NextRequest) {
  try {
    // Get session
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the request body
    const body = await req.json();
    const validationResult = invoiceSchema.safeParse(body);

    // Validate input data
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { invoice_number, amount, payment_terms, due_date } = validationResult.data;
    const userId = session.user.id;

    // Create new invoice
    const newInvoice = await prisma.invoice.create({
      data: {
        user_id: userId,
        invoice_number,
        amount,
        payment_terms,
        due_date,
        status: 'PENDING',
      },
    });

    return NextResponse.json(newInvoice, { status: 201 });
  } catch (error) {
    console.error('Invoice creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
/**
 * @swagger
 * /api/invoice:
 *   post:
 *     summary: Create a new invoice
 *     tags:
 *       - Invoices
 *     requestBody:
 *       description: Invoice data to be created
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               invoice_number:
 *                 type: string
 *                 description: Unique identifier for the invoice
 *               amount:
 *                 type: number
 *                 format: float
 *                 description: Amount for the invoice, must be positive
 *               payment_terms:
 *                 type: string
 *                 description: Terms of payment for the invoice
 *               due_date:
 *                 type: string
 *                 format: date
 *                 description: Due date for the invoice in YYYY-MM-DD format
 *     responses:
 *       201:
 *         description: Invoice created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Unique identifier for the created invoice
 *                 invoice_number:
 *                   type: string
 *                 amount:
 *                   type: number
 *                   format: float
 *                 payment_terms:
 *                   type: string
 *                 due_date:
 *                   type: string
 *                   format: date
 *                 status:
 *                   type: string
 *                   description: Status of the invoice, defaults to 'PENDING'
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
 *                         type: string
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
