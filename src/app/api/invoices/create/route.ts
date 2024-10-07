import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { invoiceSchema } from '@/lib/dtos';

export async function POST(req: Request) {
    try {
      
      const body = await req.json();
  
      const validatedData = invoiceSchema.parse(body);
  
     
      const invoice = await prisma.invoice.create({
        data: {
          user_id: validatedData.user_id,
          invoice_number: validatedData.invoice_number,
          amount: validatedData.amount,
          payment_terms: validatedData.payment_terms,
          due_date: validatedData.due_date,
          status: 'PENDING',
          submission_date: new Date(),
        },
      });
  
      return NextResponse.json({ message: 'Invoice created successfully', invoice }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ message: 'Validation Error', errors: error.errors }, { status: 422 });
      }
      console.error(error);
      return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
  }