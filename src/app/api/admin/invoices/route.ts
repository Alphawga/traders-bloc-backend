
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { invoiceUpdateSchema } from '@/lib/dtos';
import { withAuth } from '@/lib/auth/withAuth';



async function PATCH(req: NextRequest) {


  try {
    const body = await req.json(); // Parse the JSON body
    const validationResult = invoiceUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.errors }, { status: 400 });
    }

    const { status, invoice_id:id } = validationResult.data;

    const session = await getServerSession(); // Use getServerSession for session management
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        status,
        review_date: new Date(),
        reviewed_by: session.user.id,
      },
    });

    return NextResponse.json(invoice, { status: 200 });
  } catch (error) {
    console.error('Invoice update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect(); // Ensure the Prisma client disconnects
  }
}

export default withAuth(PATCH, ['ADMIN', 'SUPER_ADMIN']);