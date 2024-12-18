import { createProcedure } from '../context';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { BLOCK_PERMISSIONS } from '@/lib/contants';

// Create procedures with specific permissions
const viewUsersProc = createProcedure(BLOCK_PERMISSIONS.VIEW_USER_LIST);
const viewAdminsProc = createProcedure(BLOCK_PERMISSIONS.VIEW_ADMIN_LIST);
const manageRolesProc = createProcedure(BLOCK_PERMISSIONS.MANAGE_USER_ROLES);
const manageStatusProc = createProcedure(BLOCK_PERMISSIONS.MANAGE_USER_STATUS);

export const getAllUsers = viewUsersProc
  .input(z.object({
    search: z.string().optional(),
    status: z.enum(['all', 'active', 'inactive']).optional(),
    page: z.number().default(1),
    limit: z.number().default(10),
  }))
  .query(async ({ input }) => {
    const { search, status, page, limit } = input;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        { first_name: { contains: search, mode: 'insensitive' } },
        { last_name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status !== 'all') {
      where.deleted_at = status === 'active' ? null : { not: null };
    }

    // Get users with their associated admin roles
    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          is_email_verified: true,
          created_at: true,
          deleted_at: true,
          company_name: true,
          industry: true,
          // We don't include claims directly as it's not part of the User model
        },
        skip,
        take: limit,
        orderBy: {
          created_at: 'desc'
        },
      }),
    ]);


    return {
      data: users,
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  });

export const getAllAdmins = viewAdminsProc
  .input(z.object({
    search: z.string().optional(),
    status: z.enum(['all', 'active', 'inactive']).optional(),
    role: z.string().optional(),
    page: z.number().default(1),
    limit: z.number().default(10),
  }))
  .query(async ({ input }) => {
    const { search, status, role, page, limit } = input;
    const skip = (page - 1) * limit;

    const where: Prisma.AdminWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status !== 'all') {
      where.deleted_at = status === 'active' ? null : { not: null };
    }

    if (role && role !== 'all') {
      where.claims = {
        some: {
          role_name: role,
          active: true,
        },
      };
    }

    const [total, admins] = await Promise.all([
      prisma.admin.count({ where }),
      prisma.admin.findMany({
        where,
        include: {
          claims: {
            include: {
              role: true,
            },
            where: {
              type: 'ROLE',
              active: true,
            },
          },
        },
        skip,
        take: limit,
      }),
    ]);

    return {
      data: admins,
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  });

export const updateUserRole = manageRolesProc
  .input(z.object({
    userId: z.string(),
    role: z.string(),
  }))
  .mutation(async ({ input }) => {
    const { userId, role } = input;

    // First, deactivate any existing role claims
    await prisma.claim.deleteMany({
      where: {
        user_id: userId,
        type: 'ROLE',
      }
    });

    // Create new role claim
    const claim = await prisma.claim.create({
      data: {
        user_id: userId,
        role_name: role,
        type: 'ROLE',
        active: true,
      },
    });

    return claim;
  });

export const updateUserStatus = manageStatusProc
  .input(z.object({
    userId: z.string(),
    isActive: z.boolean(),
  }))
  .mutation(async ({ input }) => {
    const { userId, isActive } = input;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        deleted_at: isActive ? null : new Date(),
      },
    });

    return user;
  });

export const resetUserPassword = manageStatusProc
  .input(z.object({
    userId: z.string(),
  }))
  .mutation(async ({ ctx }) => {

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(resetToken, 10);

    // Update user with reset token
    await prisma.user.update({
      where: { id: ctx.session.user.id ?? "" },
      data: {
        password: hashedToken,
      },
    });

    return true;
  });

export const updateAdminRole = manageRolesProc
  .input(z.object({
    role: z.string(),
  }))
  .mutation(async ({ input, ctx }) => {
    const { role } = input;

    // First, deactivate existing role claims
    await prisma.claim.deleteMany({
      where: {
        user_id: ctx.session.user.id ?? "",
        type: 'ROLE',
      },
    });
    
    // Create new role claim
    const claim = await prisma.claim.create({
      data: {
        user: {
          connect: {
            id: ctx.session.user.id ?? ""
          }
        },
        role: {
          connect: {
            name: role
          }
        },
        type: 'ROLE',
        active: true,
      },
    });

    return claim;
  });

export const updateAdminStatus = manageStatusProc
  .input(z.object({
    isActive: z.boolean(),
  }))
  .mutation(async ({ input, ctx }) => {
    const { isActive } = input;

    const admin = await prisma.admin.update({
      where: { id: ctx.session.user.id ?? "" },
      data: {
        deleted_at: isActive ? null : new Date(),
      },
    });

    return admin;
  });
