import { userRegistrationSchema } from "@/lib/dtos";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from 'bcrypt';
import { z } from "zod";

export async function POST(req: Request) {
    try {
   
      const body = await req.json();
  
 
      const validatedData = userRegistrationSchema.parse(body);
  
  
      const existingUser = await prisma.user.findUnique({
        where: {
          email: validatedData.email,
        },
      });
  
      if (existingUser) {
        return NextResponse.json({ message: 'User already exists' }, { status: 409 });
      }
  
    
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
  
     
      const user = await prisma.user.create({
        data: {
          email: validatedData.email,
          password: hashedPassword,
          company_name: validatedData.company_name,
          tax_id: validatedData.tax_id,
          industry: validatedData.industry,
          is_email_verified: false,
          two_factor_enabled: false, 
        },
      });
  
      return NextResponse.json({ message: 'User registered successfully', user }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ message: 'Validation Error', errors: error.errors }, { status: 422 });
      }
      console.error(error);
      return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
  }