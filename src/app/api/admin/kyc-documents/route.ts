// File: app/api/admin/kyc-documents/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { withApiAuth } from '@/lib/auth/withAuth';
import { NextApiHandler } from 'next';

// Define the validation schema for KYC document approval/rejection
const approvalSchema = z.object({
  document_id: z.string().uuid('Invalid document ID'),
  status: z.enum(['APPROVED', 'REJECTED'], {
    required_error: 'Status is required',
    invalid_type_error: 'Status must be either APPROVED or REJECTED',
  }),
});

export const POST = withApiAuth(async (req: NextRequest=) => {
   


  await withApiAuth(req as unknown as NextApiHandler);

  try {
    // Parse the JSON request body
    const body = await req.json();

    // Validate the incoming request body
    const validatedData = approvalSchema.parse(body);

    // Find the KYC document by ID
    const kycDocument = await prisma.kYCDocument.findUnique({
      where: {
        id: validatedData.document_id,
      },
    });

    if (!kycDocument) {
      return NextResponse.json({ message: 'KYC document not found' }, { status: 404 });
    }

    // Update the KYC document status
    const updatedDocument = await prisma.kYCDocument.update({
      where: {
        id: validatedData.document_id,
      },
      data: {
        status: validatedData.status,
        review_date: new Date(),
        admin_id: user.id, // Assuming user.id is the ID of the admin approving/rejecting the document
      },
    });

    return NextResponse.json({ message: 'KYC document updated successfully', document: updatedDocument }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation Error', errors: error.errors }, { status: 422 });
    }
    console.error(error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
)
