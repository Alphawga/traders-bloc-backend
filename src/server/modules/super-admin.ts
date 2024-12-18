import { superAdminProcedure } from '../trpc';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { createNotification, logAdminActivity } from '@/lib/helper-function';
import { TRPCError } from '@trpc/server';
import { createProcedure } from '../context';
import { BLOCK_PERMISSIONS } from '@/lib/contants';
import { ApprovalStatus, NotificationType, Prisma } from '@prisma/client';
import { createAdminSchema, createRoleSchema } from '@/lib/dtos';
import { sendEmail } from '@/lib/email-service';


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

        },
      });
  
      await logAdminActivity(ctx.session, `Updated admin: ${updatedAdmin.email}`, "INVOICE_UPDATE");
  
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
  
      await logAdminActivity(ctx.session, `Deleted admin: ${deletedAdmin.email}`, "INVOICE_UPDATE");
  
      return { message: 'Admin account deleted' };
    });



export const createAdmin = superAdminProcedure
  .input(createAdminSchema)
  .mutation(async ({ input, ctx }) => {
    const { email, name, password, role } = input;

    // Check if email already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'An admin with this email already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin with role
    const newAdmin = await prisma.admin.create({
      data: {
        email,
        name,
        password: hashedPassword,
        claims: {
          create: {
            role: {
              connect: {
                name: role
              }
            },
            type: 'ROLE'
          }
        }
      },
      include: {
        claims: {
          include: {
            role: true
          }
        }
      }
    });

    // Log activity
    await logAdminActivity(
      ctx.session,
      `Created new admin: ${email} with role: ${role}`,
      "ADMIN_CREATED"
    );

    return {
      id: newAdmin.id,
      email: newAdmin.email,
      name: newAdmin.name,
      role: newAdmin.claims[0]?.role?.name || 'No Role'
    };
  });

const headOfCreditProc = createProcedure(BLOCK_PERMISSIONS.OVERSEE_CREDIT_OPERATIONS_PIPELINE);

export const getStaffsWorkload = headOfCreditProc
  .input(z.object({
    search: z.string().optional(),
    status: z.enum(['all', 'active', 'inactive']).optional(),
    role: z.string().optional(),
    workloadType: z.enum(['all', 'pending', 'approved', 'rejected']).optional(),
    page: z.number().default(1),
    limit: z.number().default(10),
  }))
  .query(async ({ input }) => {
    const { search, status, role, workloadType, page, limit } = input;
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
          role: {
            name: role
          }
        }
      };
    }

    const [total, staffs] = await Promise.all([
      prisma.admin.count({ where }),
      prisma.admin.findMany({
        where,
        include: {
          claims: {
            include: {
              role: true
            }
          },
          assigned_invoices: {
            where: workloadType !== 'all' ? { status: workloadType!.toUpperCase() as ApprovalStatus } : undefined,
            include: {
              vendor: true
            }
          },
          reviewed_milestones: {
            where: workloadType !== 'all' ? { status: workloadType!.toUpperCase() as ApprovalStatus } : undefined,
          },
          reviewed_funding_requests: {
            where: workloadType !== 'all' ? { status: workloadType!.toUpperCase() as ApprovalStatus } : undefined,
          }
        },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' }
      })
    ]);

    const staffWorkloads = staffs.map(staff => ({
      id: staff.id,
      name: staff.name,
      email: staff.email,
      role: staff.claims[0]?.role?.name || 'No Role',
      status: !staff.deleted_at ? 'Active' : 'Inactive',
      workload: {
        invoices: {
          total: staff.assigned_invoices.length,
          pending: staff.assigned_invoices.filter(i => i.status === 'PENDING').length,
          approved: staff.assigned_invoices.filter(i => i.status === 'APPROVED').length,
          rejected: staff.assigned_invoices.filter(i => i.status === 'REJECTED').length,
          totalAmount: staff.assigned_invoices.reduce((sum, inv) => sum + Number(inv.total_price || 0), 0),
          items: staff.assigned_invoices.map(inv => ({
            id: inv.id,
            number: inv.invoice_number,
            amount: Number(inv.total_price || 0),
            status: inv.status,
            dueDate: inv.due_date,
            vendor: inv.vendor
          }))
        },
        milestones: {
          total: staff.reviewed_milestones.length,
          pending: staff.reviewed_milestones.filter(m => m.status === 'PENDING').length,
          approved: staff.reviewed_milestones.filter(m => m.status === 'APPROVED').length,
          rejected: staff.reviewed_milestones.filter(m => m.status === 'REJECTED').length,
          totalAmount: staff.reviewed_milestones.reduce((sum, m) => sum + Number(m.payment_amount), 0),
          items: staff.reviewed_milestones.map(m => ({
            id: m.id,
            title: m.title,
            amount: Number(m.payment_amount),
            status: m.status,
            dueDate: m.due_date
          }))
        },
        fundingRequests: {
          total: staff.reviewed_funding_requests.length,
          pending: staff.reviewed_funding_requests.filter(fr => fr.status === 'PENDING').length,
          approved: staff.reviewed_funding_requests.filter(fr => fr.status === 'APPROVED').length,
          rejected: staff.reviewed_funding_requests.filter(fr => fr.status === 'REJECTED').length,
          totalAmount: staff.reviewed_funding_requests.reduce((sum, fr) => sum + Number(fr.requested_amount), 0),
          items: staff.reviewed_funding_requests.map(fr => ({
            id: fr.id,
            amount: Number(fr.requested_amount),
            status: fr.status,
            dueDate: fr.submission_date
          }))
        }
      }
    }));

    return {
      data: staffWorkloads,
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  });

export const getRoles = headOfCreditProc.query(async () => {
  const roles = await prisma.role.findMany({
    where: {
      active: true
    },
    select: {
      name: true
    }
  });
  return roles;
});

export const completeInvoiceAndNotifyCollections = headOfCreditProc
  .input(z.object({
    invoiceId: z.string(),
  }))
  .mutation(async ({ input, ctx }) => {
    const { invoiceId } = input;

    // Get invoice with milestones
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        milestones: true,
        vendor: true,
      }
    });

    if (!invoice) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Invoice not found',
      });
    }

    // Verify all milestones are approved
    const allMilestonesApproved = invoice.milestones.every(m => m.status === 'APPROVED');
    if (!allMilestonesApproved) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'All milestones must be approved before completing the invoice',
      });
    }

    // Calculate total amount and revenue splits
    const totalAmount = invoice.milestones.reduce((sum, m) => sum + Number(m.payment_amount), 0);
    
    // Update invoice status
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: 'FULLY_DELIVERED',
      },
    });

    const collectionsTeam = await prisma.admin.findMany({
      where: {
        claims: {
          some: {
            role: {
              name: BLOCK_PERMISSIONS.COLLECTIONS
            }
          }
        }
      }
    });

    for (const collector of collectionsTeam) {  
      // Create notification for collections team
      await createNotification(
        `Invoice #${invoice.invoice_number} is ready for collection. Total amount: $${totalAmount}`,
        NotificationType.INVOICE_STATUS_UPDATE,
        `/admin/invoices/${invoiceId}`,
        collector.id  
      );
    }

    // Send email to collections team
    for (const collector of collectionsTeam) {
      await sendEmail({
        to: collector.email,
        subject: `New Collection Assignment - Invoice #${invoice.invoice_number}`,
        templateName: 'collection-assignment',
        data: {
          recipientName: collector.name,
          invoiceNumber: invoice.invoice_number,
          vendorName: invoice.vendor.name,
          totalAmount: totalAmount.toFixed(2),
          milestones: invoice.milestones.map(m => ({
            title: m.title,
            amount: Number(m.payment_amount).toFixed(2)
          })),
          link: `${process.env.NEXT_PUBLIC_APP_URL}/admin/invoices/${invoiceId}`
        }
      } as const);
    }

    // Log activity
    await logAdminActivity(
      ctx.session,
      `Marked invoice #${invoice.invoice_number} as fully treated and sent to collections`,
      "INVOICE_UPDATE"
    );

    return { success: true };
  });

export const createRole = headOfCreditProc
  .input(createRoleSchema)
  .mutation(async ({ input, ctx }) => {
    const { name, permissions } = input;

    // Check if role already exists
    const existingRole = await prisma.role.findUnique({
      where: { name },
    });

    if (existingRole) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'A role with this name already exists',
      });
    }

    // Create role with permissions
    const newRole = await prisma.role.create({
      data: {
        name,
        permissions: {
          create: permissions.map(permissionId => ({
            active: true,
            permission: {
              connect: {
                id: permissionId
              }
            }
          }))
        }
      },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    });

    // Log activity
    await logAdminActivity(
      ctx.session,
      `Created new role: ${name} with ${permissions.length} permissions`,
      "ADMIN_CREATED"
    );

    return newRole;
  });

export const getAllPermissions = headOfCreditProc.query(async () => {
  return prisma.permission.findMany({
    where: {
      active: true
    },
    orderBy: {
      module: 'asc'
    }
  });
});