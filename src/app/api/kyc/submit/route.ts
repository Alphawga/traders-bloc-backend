

import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { kycDocumentSchema } from '@/lib/dtos';




export async function POST(req: Request) {
  try {
    
    const body = await req.json();


    const validatedData = kycDocumentSchema.parse(body);


    const kycDocument = await prisma.kYCDocument.create({
      data: {
        user_id: validatedData.user_id,
        document_type: validatedData.document_type,
        document_url: validatedData.document_url,
        status: 'PENDING', 
        submission_date: new Date(),
      },
    });

    return NextResponse.json({ message: 'KYC document submitted successfully', kycDocument }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation Error', errors: error.errors }, { status: 422 });
    }
    console.error(error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
