import { superAdminProcedure } from '../trpc';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { logAdminActivity } from '@/lib/helper-function';
import { TRPCError } from '@trpc/server';
import { createProcedure } from '../context';
import { BLOCK_PERMISSIONS } from '@/lib/contants';
import { ApprovalStatus, Prisma } from '@prisma/client';


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
      select:{
        email:true
      }
    });


    return newAdmin;
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
      id: true,
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

    // Create notification for collections team
    await createNotification(
      `Invoice #${invoice.invoice_number} is ready for collection. Total amount: $${totalAmount}`,
      NotificationType.INVOICE_STATUS_UPDATE,
      `/admin/invoices/${invoiceId}`,
      // Get collections team users
      await prisma.admin.findMany({
        where: {
          claims: {
            some: {
              role: {
                name: BLOCK_PERMISSIONS.COLLECTIONS
              }
            }
          }
        }
      }).then(admins => admins.map(admin => admin.id))
    );

    // Send email to collections team
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
      await sendEmail({
        to: collector.email,
        subject: `New Collection Assignment - Invoice #${invoice.invoice_number}`,
        template: 'collection-assignment',
        data: {
          recipientName: collector.name,
          invoiceNumber: invoice.invoice_number,
          vendorName: invoice.vendor.name,
          totalAmount: totalAmount,
          milestones: invoice.milestones.map(m => ({
            title: m.title,
            amount: m.payment_amount
          })),
          link: `${process.env.NEXT_PUBLIC_APP_URL}/admin/invoices/${invoiceId}`
        }
      });
    }

    // Log activity
    await logAdminActivity(
      ctx.session,
      `Marked invoice #${invoice.invoice_number} as fully treated and sent to collections`,
      "INVOICE_UPDATE"
    );

    return { success: true };
  });