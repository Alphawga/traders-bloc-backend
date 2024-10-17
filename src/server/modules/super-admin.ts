import { superAdminProcedure } from '../trpc';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { logAdminActivity } from '@/lib/helper-function';
import { TRPCError } from '@trpc/server';


const updateAdminSchema = z.object({
    admin_id: z.string(),
    status: z.enum(['ACTIVE', 'SUSPENDED']),
    role: z.enum(['ADMIN']).optional(),
  });
  
  export const updateAdmin = superAdminProcedure
    .input(updateAdminSchema)
    .mutation(async ({ input, ctx }) => {
      const { admin_id, ...updateData } = input;
  
      const updatedAdmin = await prisma.admin.update({
        where: { id: admin_id },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });
  
      await logAdminActivity(ctx.session, `Updated admin: ${updatedAdmin.email}`);
  
      return updatedAdmin;
    });
  
  export const deleteAdmin = superAdminProcedure
    .input(z.object({ admin_id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { admin_id } = input;
  
      const deletedAdmin = await prisma.admin.delete({
        where: { id: admin_id },
        select: { email: true },
      });
  
      if (!deletedAdmin) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Admin not found',
        });
      }
  
      await logAdminActivity(ctx.session, `Deleted admin: ${deletedAdmin.email}`);
  
      return { message: 'Admin account deleted' };
    });
const updatePermissionsSchema = z.object({
  admin_id: z.string(),
  role: z.enum(['ADMIN', 'SUPER_ADMIN']),
});

export const updateAdminPermissions = superAdminProcedure
  .input(updatePermissionsSchema)
  .mutation(async ({ input }) => {
    const { admin_id, role } = input;

    const updatedAdmin = await prisma.admin.update({
      where: { id: admin_id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        // Exclude sensitive fields like password
      },
    });

    if (!updatedAdmin) {
      throw new Error('Admin not found');
    }

    return updatedAdmin;
  });
const createAdminSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(8),
  role: z.enum(['ADMIN']),
});

export const createAdmin = superAdminProcedure
  .input(createAdminSchema)
  .mutation(async ({ input }) => {
    const { email, name, password, role } = input;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await prisma.admin.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role,
      },
    });

    // Omit the password from the returned object
    const { password: _, ...adminWithoutPassword } = newAdmin;
    return adminWithoutPassword;
  });