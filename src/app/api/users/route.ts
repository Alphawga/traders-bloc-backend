
import { userRegistrationSchema } from "@/lib/dtos";
import prisma from "@/lib/prisma";
import bcrypt from 'bcrypt';
import { NextRequest, NextResponse } from "next/server";

// POST - Register a new user
export async function POST(req: NextRequest) {
  try {
   
    const body = await req.json();

    const validationResult = userRegistrationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.errors });
    }

    const { email, password, company_name, tax_id, industry } = validationResult.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ status: 400, error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        company_name,
        tax_id,
        industry,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * @swagger
 * /api/user:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Users
 *     requestBody:
 *       description: User registration data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 description: User's password
 *               company_name:
 *                 type: string
 *                 description: Name of the user's company
 *               tax_id:
 *                 type: string
 *                 description: User's tax identification number
 *               industry:
 *                 type: string
 *                 description: Industry of the user's company
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Unique identifier for the created user
 *                 email:
 *                   type: string
 *                 company_name:
 *                   type: string
 *                 tax_id:
 *                   type: string
 *                 industry:
 *                   type: string
 *       400:
 *         description: User already exists or invalid input data
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

// PATCH - Update user details
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, company_name, tax_id, industry } = body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      return NextResponse.json({ status: 404, error: 'User not found' });
    }

    const updatedData = { company_name, tax_id, industry, password };
    if (password) {
      updatedData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: updatedData,
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error('User update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * @swagger
 * /api/user:
 *   patch:
 *     summary: Update user details
 *     tags:
 *       - Users
 *     requestBody:
 *       description: Updated user details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address (required for identification)
 *               password:
 *                 type: string
 *                 description: User's new password
 *               company_name:
 *                 type: string
 *                 description: Updated name of the user's company
 *               tax_id:
 *                 type: string
 *                 description: Updated tax identification number
 *               industry:
 *                 type: string
 *                 description: Updated industry of the user's company
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Unique identifier for the updated user
 *                 email:
 *                   type: string
 *                 company_name:
 *                   type: string
 *                 tax_id:
 *                   type: string
 *                 industry:
 *                   type: string
 *       404:
 *         description: User not found
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

// DELETE - Delete user by email
export async function DELETE(req: NextRequest) {
  try {
    const { email } = await req.json();

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      return NextResponse.json({ status: 404, error: 'User not found' });
    }

    await prisma.user.delete({
      where: { email },
    });

    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('User deletion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * @swagger
 * /api/user:
 *   delete:
 *     summary: Delete user by email
 *     tags:
 *       - Users
 *     requestBody:
 *       description: Email of the user to delete
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address to identify the user for deletion
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: User not found
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
