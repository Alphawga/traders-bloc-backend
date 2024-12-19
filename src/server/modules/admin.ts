import { adminUpdateSchema, invoiceUpdateSchema, milestoneAssignSchema, vendorSchema } from '@/lib/dtos';
import { adminProcedure, publicProcedure } from '../trpc';
import { fundingRequestUpdateSchema } from '@/lib/dtos';
import { kycUpdateSchema } from '@/lib/dtos';
import prisma from '@/lib/prisma';
import { milestoneUpdateSchema } from '@/lib/dtos';
import { z } from 'zod';
import { ApprovalStatus, NotificationType, PaymentStatus, Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcrypt'
import { createNotification } from '@/lib/helper-function';
import { BLOCK_PERMISSIONS } from '@/lib/contants';
import { createProcedure } from '../context';
import { getUserPermissions } from '@/lib/permission-utils';


const headOfCreditProc   = createProcedure(BLOCK_PERMISSIONS.ASSIGN_INVOICES_TO_CREDIT_OPS_LEADS);
const assignMilestonesToAnalystsProc = createProcedure(BLOCK_PERMISSIONS.ASSIGN_MILESTONES_TO_ANALYSTS);
const coSignMilestoneProc = createProcedure(BLOCK_PERMISSIONS.CO_SIGN_MILESTONES_TO_TRIGGER_PAYMENTS);


export const getAllMilestones = headOfCreditProc
  .input(
    z.object({
      search: z.string().optional(),
      status: z.nativeEnum(ApprovalStatus).optional(),
      page: z.number().default(1),
      limit: z.number().default(10),
      sortBy: z.string().optional(),
      sortOrder: z.enum(["asc", "desc"]).default("desc"),
      dueDateRange: z.object({
        from: z.date().optional(),
        to: z.date().optional(),
      }).optional(),
      dueDateFilter: z.enum([
        "all",
        "overdue",
        "due-today",
        "due-this-week",
        "due-this-month",
      ]).optional(),
      paymentStatus: z.enum(["paid", "unpaid", "all"]).optional(),
      amountRange: z.object({
        min: z.number().optional(),
        max: z.number().optional(),
      }).optional(),
    })
  )
  .query(async ({ input }) => {
    const {
      search,
      status,
      page,
      limit,
      sortBy,
      sortOrder,
      dueDateRange,
      dueDateFilter,
      paymentStatus,
      amountRange,
    } = input;

    const skip = (page - 1) * limit;
    const where: Prisma.MilestoneWhereInput = {};

    // Search filter
    if (search) {
      where.OR = [
        { description: { contains: search, mode: "insensitive" } },
        { user: { first_name: { contains: search, mode: "insensitive" } } },
        { user: { last_name: { contains: search, mode: "insensitive" } } },
        { invoice: { invoice_number: { contains: search, mode: "insensitive" } } },
        { bank_name: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.status = status as ApprovalStatus;
    }


    // Due date range filter
    if (dueDateRange) {
      where.due_date = {
        ...(dueDateRange.from && { gte: dueDateRange.from }),
        ...(dueDateRange.to && { lte: dueDateRange.to }),
      };
    }

    // Due date preset filters
    if (dueDateFilter) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const filters: Record<string, Prisma.DateTimeFilter> = {
        "overdue": {
          lt: today,
        },
        "due-today": {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
        "due-this-week": {
          gte: today,
          lt: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
        "due-this-month": {
          gte: today,
          lt: new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            0
          ),
        },
      };

      if (dueDateFilter !== "all") {
        where.due_date = filters[dueDateFilter];
      }
    }

    // Payment status filter
    if (paymentStatus && paymentStatus !== "all") {
      where.paid_at = paymentStatus === "paid" ? { not: null } : null;
    }

    // Amount range filter
    if (amountRange) {
      where.payment_amount = {
        ...(amountRange.min !== undefined && { gte: amountRange.min }),
        ...(amountRange.max !== undefined && { lte: amountRange.max }),
      };
    }

    const total = await prisma.milestone.count({ where });
    const orderBy: Prisma.MilestoneOrderByWithRelationInput = sortBy
      ? sortBy === "user"
        ? { user: { first_name: sortOrder } }
        : sortBy === "invoice"
        ? { invoice: { invoice_number: sortOrder } }
        : { [sortBy]: sortOrder }
      : { created_at: "desc" };

    const milestones = await prisma.milestone.findMany({
      where,
      include: {
        user: true,
        invoice: true,
        reviewed_by: true,
      },
      skip,
      take: limit,
      orderBy,
    });

    return {
      data: milestones,
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  });

export const getAdminData = adminProcedure
  .query(async ({ctx}) => { 
    const admin = await prisma.admin.findUnique({
      where:{id: ctx.session.user.id ?? ""},
      include:{
          notifications: true
      }
    });

    if (!admin) {
      throw new Error('No milestones found');
    }

    return admin;
  });

export const updateMilestoneSatus = adminProcedure
  .input(milestoneUpdateSchema)
  .mutation(async ({ input }) => {
    const { id, status } = input;

    const milestone = await prisma.milestone.update({
      where: { id: String(id) },
      data: { status },
    });

    await createNotification(
      `Milestone has been ${status}`,
      NotificationType.MILESTONE_STATUS_UPDATE,
      `${milestone.id}`,
      milestone.user_id
    )

    return milestone;
  });

  export const assignMilestonesToAnalysts = assignMilestonesToAnalystsProc
  .input(milestoneAssignSchema)
  .mutation(async ({ input, ctx }) => {
    const { milestone_id, analyst_id } = input;

    const milestone = await prisma.milestone.update({
      where: { id: milestone_id },
      data: { assigned_to_id: analyst_id, assigned_by_id: ctx.session.user.id },
    });

    return milestone;

  });

  export const getAllAnalysts = assignMilestonesToAnalystsProc
  .query(async () => {
    const analysts = await prisma.admin.findMany({
      where: {
        claims: {
          some: {
            role_name: BLOCK_PERMISSIONS.CREDIT_OPS_ANALYST,
            active: true,
          }
        }
      },
      include: {
        assigned_milestones: {
          where: {
            status: 'PENDING'
          }
        }
      }
    });

    return analysts.map(analyst => ({
      id: analyst.id,
      name: analyst.name,
      email: analyst.email,
      pending_milestones: analyst.assigned_milestones.length
    }));
  });

  export const assignMilestoneToAnalyst = assignMilestonesToAnalystsProc
  .input(z.object({
    milestone_id: z.string(),
    analyst_id: z.string(),
  }))
  .mutation(async ({ input, ctx }) => {
    const { milestone_id, analyst_id } = input;

    // Verify analyst has correct role
    const analystClaim = await prisma.claim.findFirst({
      where: {
        user_id: analyst_id,
        role_name: BLOCK_PERMISSIONS.CREDIT_OPS_ANALYST,
        active: true,
      },
    });

    if (!analystClaim) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Selected user must be a Credit Ops Analyst',
      });
    }

    const milestone = await prisma.milestone.update({
      where: { id: milestone_id },
      data: {
        assigned_to_id: analyst_id,
        assigned_by_id: ctx.session.user.id,
      },
      include: {
        assigned_to: true,
      },
    });

    await createNotification(
      `Milestone has been assigned to ${milestone.assigned_to?.name}`,
      NotificationType.MILESTONE_STATUS_UPDATE,
      milestone_id,
      milestone.user_id,
      ctx.session
    );

    return milestone;
  });

  export const getAllKYCDocuments = adminProcedure
  .input(z.object({
    search: z.string().optional(),
    status: z.nativeEnum(ApprovalStatus).optional(),
    page: z.number().default(1),
    limit: z.number().default(10),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }))
  .query(async ({ input }) => {
    const {
      search,
      status,
      page,
      limit,
      sortBy,
      sortOrder,
    } = input;

    const skip = (page - 1) * limit;


    const where: Prisma.KYCDocumentWhereInput = {};
    
    if (search) {
      where.OR = [
        { user: { first_name: { contains: search, mode: 'insensitive' } } },
        { user: { last_name: { contains: search, mode: 'insensitive' } } },
        { user: { company_name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { industry: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status) {
      where.status = status;
    }



   
    const total = await prisma.kYCDocument.count({ where });

  
    const orderBy: Prisma.KYCDocumentOrderByWithRelationInput = {};
    if (sortBy) {
      if (sortBy === 'company') {
        orderBy.user = { company_name: sortOrder };
      } else {
        orderBy[sortBy as keyof Prisma.KYCDocumentOrderByWithRelationInput] = sortOrder; 
      }
    } else {
      orderBy.submission_date = 'desc';
    }

    const kycDocuments = await prisma.kYCDocument.findMany({
      where,
      include: { user: true },
      skip,
      take: limit,
      orderBy,
    });

    return {
      data: kycDocuments,
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    };
  });

export const getAdminDashboardSummary = createProcedure()
  .query(async ({ ctx }) => {
    const adminId = ctx.session?.user?.id;

    if (!adminId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be logged in to view the dashboard'
      });
    }

    try {
      // Get admin details
      const admin = await prisma.admin.findUnique({
        where: { id: adminId },
        select: {
          id: true,
          name: true,
          email: true,
          claims: {
            where: { active: true },
            include: {
              role: true
            }
          }
        }
      });

      if (!admin) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Admin not found'
        });
      }

      // Get counts based on permissions
      const [
        pendingInvoices,
        pendingFundRequest,
        totalFundedResult,
        pendingMilestone,
        recentActivity,
        unreadNotifications
      ] = await Promise.all([
        // Pending Invoices
        prisma.invoice.count({
          where: {
            status: "PENDING",
            deleted_at: null,
            ...(admin.claims.some(c => c.role?.name === BLOCK_PERMISSIONS.CREDIT_OPS_LEAD) 
              ? { assigned_admin_id: adminId }
              : {})
          },
        }),

        // Pending Fund Requests
        prisma.fundingRequest.count({
          where: {
            status: "PENDING",
            deleted_at: null,
          },
        }),

        // Total Funded Amount
        prisma.fundingRequest.aggregate({
          _sum: {
            requested_amount: true,
          },
          where: {
            status: "APPROVED",
            deleted_at: null,
          },
        }),

        // Pending Milestones
        prisma.milestone.count({
          where: {
            status: "PENDING",
            deleted_at: null,
            ...(admin.claims.some(c => c.role?.name === BLOCK_PERMISSIONS.CREDIT_OPS_ANALYST)
              ? { assigned_to_id: adminId }
              : {})
          },
        }),

        // Recent Activity
        prisma.activityLog.findMany({
          where: {
            admin_id: adminId,
            deleted_at: null,
          },
          orderBy: {
            created_at: "desc",
          },
          take: 10,
        }),

        // Unread Notifications
        prisma.notification.findMany({
          where: {
            admin: {
              some: {
                id: adminId
              }
            },
            is_read: false,
            deleted_at: null,
          },
          orderBy: {
            created_at: "desc",
          },
          take: 5,
        }),
      ]);

      return {
        admin,
        pendingInvoices,
        pendingFundRequest,
        totalFunded: totalFundedResult._sum.requested_amount || 0,
        pendingMilestone,
        recentActivity,
        unreadNotifications,
      };
    } catch (error) {
      console.error("Error fetching admin dashboard summary:", error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve dashboard summary'
      });
    }
  });

export const updateKYCDocument = adminProcedure
  .input(kycUpdateSchema)
  .mutation(async ({ input, ctx }) => {
    const { status, kyc_id } = input;

    const kycDocument = await prisma.kYCDocument.update({
      where: { id: String(kyc_id) },
      data: {
        status,
        review_date: new Date(),
        reviewed_by: {
          connect: { id: ctx.session.user.id }
        },
      },
    });
    await createNotification(
      `KYC document has been ${status}`,
      NotificationType.KYC_STATUS_UPDATE,
      `${kyc_id}`,
      kycDocument.user_id,
      ctx.session
    )

    return kycDocument;
  });


export const updateFundingRequest = adminProcedure
  .input(fundingRequestUpdateSchema)
  .mutation(async ({ input, ctx }) => {
    const { status, funding_request_id: id } = input;

    const fundingRequest = await prisma.fundingRequest.update({
      where: { id: String(id) },
      data: {
        status,
        review_date: new Date(),
        reviewed_by: {
          connect: { id: ctx.session.user.id }
        },
      },
    });

    await createNotification(
      `Funding request has been ${status}`,
      NotificationType.FUNDING_STATUS_UPDATE,
      `${fundingRequest.id}`,
      fundingRequest.user_id,
      ctx.session
    )

    return fundingRequest;
  });

 


export const updateInvoiceStatus = adminProcedure
  .input(invoiceUpdateSchema)
  .mutation(async ({ input, ctx }) => {
    const { status, invoice_id: id } = input;

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        status,
        review_date: new Date(),
        admin_id: ctx.session.user.id,
      },
      });

    await createNotification(
      `Invoice has been ${status}`,
      NotificationType.INVOICE_STATUS_UPDATE,
      `${invoice.id}`,
      invoice.user_id,
      ctx.session
    )

    return invoice;
  });

  export const createVendor = adminProcedure
  .input(vendorSchema)
  .mutation(async ({ input, ctx }) => {
    const { name, 
       contact_person, 
       contact_person_phone_number, 
       phone_number, 
       address, 
       email,
       bank_name,
       bank_account_number,
       } = input;

    const vendor = await prisma.vendor.create({
      data: {
        name,
        contact_person,
        contact_person_phone_number,
        bank_name,
        bank_account_number,
        phone_number,
        address,
        email,
        created_by: ctx?.session?.user?.id,
      },
    });

    return vendor;
  });



export const getAllInvoices = createProcedure()
  .input(
    z.object({
      search: z.string().optional(),
      status: z.enum(["PENDING", "APPROVED", "REJECTED", "NOT_SUBMITTED", "FULLY_DELIVERED"]).optional(),
      vendor: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(10),
      sortBy: z.string().optional(),
      sortOrder: z.enum(["asc", "desc"]).default("desc"),
      dueDateRange: z.object({
        from: z.date().optional(),
        to: z.date().optional(),
      }).optional(),
      dueDateFilter: z.enum([
        "all",
        "overdue",
        "due-today",
        "due-this-week",
        "due-this-month",
      ]).optional(),
      assignmentStatus: z.enum(['all', 'assigned', 'unassigned']).optional(),
    })
  )
  .query(async ({ input, ctx }) => {
    const {
      search,
      status,
      vendor,
      page,
      limit,
      sortBy,
      sortOrder,
      dueDateRange,
      dueDateFilter,
      assignmentStatus,
    } = input;
    
    const skip = (page - 1) * limit;
    const where: Prisma.InvoiceWhereInput = {};

    // Check user permissions
    const permissionResult = await getUserPermissions(ctx.session);
    
    // Check if user can only see assigned invoices
    if (permissionResult.hasPermission("MANAGE_ASSIGNED_INVOICES")) {
      where.assigned_admin_id = permissionResult.userId;
    }

    // Add other filters
    if (search) {
      where.OR = [
        { user: { first_name: { contains: search, mode: "insensitive" } } },
        { user: { last_name: { contains: search, mode: "insensitive" } } },
        { description: { contains: search, mode: "insensitive" } },
        { invoice_number: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (vendor) {
      where.vendor = { name: { contains: vendor, mode: "insensitive" } };
    }

    if (dueDateRange) {
      where.due_date = {
        ...(dueDateRange.from && { gte: dueDateRange.from }),
        ...(dueDateRange.to && { lte: dueDateRange.to }),
      };
    }

    if (dueDateFilter && dueDateFilter !== "all") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const filters: Record<string, Prisma.DateTimeFilter> = {
        "overdue": {
          lt: today,
        },
        "due-today": {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
        "due-this-week": {
          gte: today,
          lt: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
        "due-this-month": {
          gte: today,
          lt: new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            0
          ),
        },
      };

      where.due_date = filters[dueDateFilter];
    }

    if (assignmentStatus && assignmentStatus !== 'all') {
      where.assigned_admin_id = assignmentStatus === 'assigned' 
        ? { not: null } 
        : null;
    }

    const [total, invoices] = await Promise.all([
      prisma.invoice.count({ where }),
      prisma.invoice.findMany({
        where,
        include: { 
          user: true, 
          vendor: true, 
          milestones: {
            include: {
              cosigned_by: true,
              assigned_to: true,
              assigned_by: true,
              second_level_co_sign: true
            }
          }, 
          funding_requests: true,
          assigned_to: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          assigned_by: {
            select: {
              id: true,
              name: true,
            }
          }
        },
        skip,
        take: limit,
        orderBy: sortBy
          ? sortBy === "vendor"
            ? { vendor: { name: sortOrder } }
            : { [sortBy]: sortOrder }
          : { submission_date: "desc" },
      })
    ]);

    return {
      data: invoices,
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  });

  export const getAllFundingRequests = adminProcedure
  .input(
    z.object({
      search: z.string().optional(),
      status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
      milestone: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(10),
      sortBy: z.string().optional(),
      sortOrder: z.enum(["asc", "desc"]).default("desc"),
      dateRange: z.object({
        from: z.date().optional(),
        to: z.date().optional(),
      }).optional(),
      amountRange: z.object({
        min: z.number().optional(),
        max: z.number().optional(),
      }).optional(),
      contributionRange: z.object({
        min: z.number().optional(),
        max: z.number().optional(),
      }).optional(),
      reviewStatus: z.enum(["reviewed", "pending", "all"]).optional(),
    })
  )
  .query(async ({ input }) => {
    const {
      search,
      status,
      page,
      limit,
      sortBy,
      sortOrder,
      dateRange,
      amountRange,
      contributionRange,
      reviewStatus,
    } = input;

    const skip = (page - 1) * limit;
    const where: Prisma.FundingRequestWhereInput = {};

    // Search filter
    if (search) {
      where.OR = [
        { user: { first_name: { contains: search, mode: "insensitive" } } },
        { user: { last_name: { contains: search, mode: "insensitive" } } },
        { invoice: { description: { contains: search, mode: "insensitive" } } },
       
      ];
    }

    // Status filter
    if (status) {
      where.status = status as ApprovalStatus;
    }

    // Date range filter
    if (dateRange) {
      where.submission_date = {
        ...(dateRange.from && { gte: dateRange.from }),
        ...(dateRange.to && { lte: dateRange.to }),
      };
    }

    // Requested amount range filter
    if (amountRange) {
      where.requested_amount = {
        ...(amountRange.min !== undefined && { gte: amountRange.min }),
        ...(amountRange.max !== undefined && { lte: amountRange.max }),
      };
    }

    // Contribution amount range filter
    if (contributionRange) {
      where.your_contribution = {
        ...(contributionRange.min !== undefined && { gte: contributionRange.min }),
        ...(contributionRange.max !== undefined && { lte: contributionRange.max }),
      };
    }

    // Review status filter
    if (reviewStatus && reviewStatus !== "all") {
      where.review_date = reviewStatus === "reviewed" ? { not: null } : null;
    }

    const total = await prisma.fundingRequest.count({ where });
    const orderBy: Prisma.FundingRequestOrderByWithRelationInput = sortBy
      ? sortBy === "user"
        ? { user: { first_name: sortOrder } }
        : sortBy === "invoice"
        ? { invoice: { description: sortOrder } }
        : { [sortBy]: sortOrder }
      : { submission_date: "desc" };

    const fundingRequests = await prisma.fundingRequest.findMany({
      where,
      include: {
        user: true,
        invoice: true,
        reviewed_by: true,
      },
      skip,
      take: limit,
      orderBy,
    });

    return {
      data: fundingRequests,
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  });

  export const getAdminProfile = adminProcedure.query
  (async({ctx}) =>{
    const admin = prisma.admin.findUnique({
      where:{ id: ctx.session.user.id??""}
    })
    
    if(!admin){
      console.error("admin not found")
    }
    return admin
  }
)

export const updateAdminData = adminProcedure
  .input(adminUpdateSchema)
  .mutation(async ({  input }) => {
    const { id, email, name,  current_password, new_password } = input;
    
  
    const existingAdmin = await prisma.admin.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        password: true,
      },
    });




    // Handle password update if provided
    let password_hash: string | undefined;
    if (current_password && new_password) {
   
      const isPasswordValid = await bcrypt.compare(
        current_password,
        existingAdmin.password
      );

      if (!isPasswordValid) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Current password is incorrect',
        });
      }

      
      password_hash = await bcrypt.hash(new_password, 12);
    } else if ((current_password && !new_password) || 
               (!current_password && new_password)) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Both current and new passwords must be provided to update password',
      });
    }

    try {
      // Update admin data
      const updatedAdmin = await prisma.admin.update({
        where: { id },
        data: {
          email,
          name,
          ...(password_hash && { password_hash }),
          updated_at: new Date(),
        },
        select: {
          id: true,
          email: true,
         name: true,
          created_at: true,
          updated_at: true,
        },
      });

      return updatedAdmin;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Email already exists',
          });
        }
      }
      
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update admin data',
        cause: error,
      });
    }
  });


  export const getReportData = adminProcedure
  .input(z.object({
    timeRange: z.enum(['week', 'month', 'year'])
  }))
  .query(async ({ input, ctx }) => {
    const { timeRange } = input;
    const permissionResult = await getUserPermissions(ctx.session);
    
    // Calculate date ranges
    const now = new Date();
    const startDate = new Date();
    const previousStartDate = new Date();

    switch (timeRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        previousStartDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        previousStartDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        previousStartDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    // Base where clause for credit ops lead
    const whereClause: Prisma.InvoiceWhereInput = {
      submission_date: { gte: startDate },
      deleted_at: null,
    };

    // Add assigned_admin_id filter for credit ops lead
    if (permissionResult.hasPermission("CREDIT_OPS_LEAD")) {
      whereClause.assigned_admin_id = ctx.session.user.id;
    }

    try {
      const [
        currentData,
        previousData,
        trendData,
        statusData,
        milestoneData
      ] = await Promise.all([
        // Current period metrics with role-based filtering
        prisma.$transaction([
          prisma.invoice.count({ where: whereClause }),
          prisma.milestone.count({
            where: {
              invoice: { ...whereClause },
              created_at: { gte: startDate }
            }
          }),
          prisma.fundingRequest.aggregate({
            where: {
              invoice: { ...whereClause },
              status: 'APPROVED',
              submission_date: { gte: startDate }
            },
            _sum: { requested_amount: true }
          })
        ]),

        // Previous period metrics
        prisma.$transaction([
          prisma.invoice.count({
            where: {
              ...whereClause,
              submission_date: {
                gte: previousStartDate,
                lt: startDate
              }
            }
          }),
          prisma.milestone.count({
            where: {
              invoice: { ...whereClause },
              created_at: {
                gte: previousStartDate,
                lt: startDate
              }
            }
          }),
          prisma.fundingRequest.aggregate({
            where: {
              invoice: { ...whereClause },
              status: 'APPROVED',
              submission_date: {
                gte: previousStartDate,
                lt: startDate
              }
            },
            _sum: { requested_amount: true }
          })
        ]),

        // Invoice trends with role-based filtering
        prisma.invoice.groupBy({
          by: ['submission_date'],
          where: whereClause,
          _count: { id: true },
          _sum: { total_price: true },
          orderBy: { submission_date: 'asc' }
        }),

        // Status distribution
        prisma.invoice.groupBy({
          by: ['status'],
          where: whereClause,
          _count: { id: true }
        }),

        // Milestone progress
        prisma.$transaction([
          prisma.milestone.count({
            where: {
              status: 'APPROVED',
              invoice: { ...whereClause }
            }
          }),
          prisma.milestone.count({
            where: {
              status: 'PENDING',
              invoice: { ...whereClause }
            }
          })
        ])
      ]);

      const [currentInvoices, currentMilestones, currentFunding] = currentData;
      const [previousInvoices, previousMilestones, previousFunding] = previousData;
      const [completedMilestones, pendingMilestones] = milestoneData;

      // Calculate growth percentages
      const calculateGrowth = (current: number, previous: number) => 
        previous === 0 ? 0 : ((current - previous) / previous) * 100;

      return {
        totalInvoices: currentInvoices,
        invoiceGrowth: calculateGrowth(currentInvoices, previousInvoices),
        totalMilestones: currentMilestones,
        milestoneGrowth: calculateGrowth(currentMilestones, previousMilestones),
        totalAmount: currentFunding._sum.requested_amount || 0,
        amountGrowth: calculateGrowth(
          currentFunding._sum.requested_amount || 0,
          previousFunding._sum.requested_amount || 0
        ),
        invoiceTrends: trendData.map(trend => ({
          date: trend.submission_date,
          amount: trend._sum.total_price || 0,
          count: trend._count.id
        })),
        statusDistribution: statusData.map(status => ({
          name: status.status,
          value: status._count.id
        })),
        milestoneProgress: [
          {
            name: 'Milestones',
            completed: completedMilestones,
            pending: pendingMilestones
          }
        ]
      };
    } catch (error) {
      console.error('Error fetching report data:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve report data'
      });
    }
  });

  export const getFundingRequest = adminProcedure.input(z.object({id: z.string()})).query(async ({input}) => {
    const {id} = input
    const fundingRequest = await prisma.fundingRequest.findUnique({where: {id}, include: {user: true, invoice: true}})
    return fundingRequest
  })

  export const getInvoice = adminProcedure.input(z.object({id: z.string()})).query(async ({input}) => {
    const {id} = input
    const invoice = await prisma.invoice.findUnique({where: {id}, include: {user: true, vendor: true}})
    return invoice
  })

  export const getKYCDocument = adminProcedure.input(z.object({id: z.string()})).query(async ({input}) => {
    const {id} = input
    const kycDocument = await prisma.kYCDocument.findUnique({where: {id}, include: {user: true}})
    return kycDocument
  })

  export const getMilestone = adminProcedure.input(z.object({id: z.string()})).query(async ({input}) => {
    const {id} = input
    const milestone = await prisma.milestone.findUnique({where: {id}, include: {user: true, invoice: true}})
    return milestone
  })

export const getAllVendors = adminProcedure
  .input(
    z.object({
      search: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(10),
      sortBy: z.string().optional(),
      sortOrder: z.enum(["asc", "desc"]).default("asc"),
    })
  )
  .query(async ({ input }) => {
    const { search, page, limit, sortBy, sortOrder } = input;
    const skip = (page - 1) * limit;
    const where: Prisma.VendorWhereInput = {};

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { contact_person: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone_number: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get total count for pagination
    const total = await prisma.vendor.count({ where });

    // Build order by object
    const orderBy: Prisma.VendorOrderByWithRelationInput = sortBy
      ? { [sortBy]: sortOrder }
      : { name: "asc" };

    // Get paginated and filtered vendors
    const vendors = await prisma.vendor.findMany({
      where,
      skip,
      take: limit,
      orderBy,
    });

    return {
      data: vendors,
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  });

export const updateVendor = adminProcedure.input(vendorSchema).mutation(async ({input}) => {
  const {vendor_id, ...data} = input
  const vendor = await prisma.vendor.update({where: {id: vendor_id}, data})
  return vendor
})

export const markNotificationAsRead = adminProcedure
  .input(z.object({ notification_id: z.string() }))
  .mutation(async ({ input }) => {
    const { notification_id } = input;

    const notification = await prisma.notification.update({
      where: { id: notification_id },
      data: { is_read: true },
    });

    return notification;
  });

export const assignInvoicesToAdmin = headOfCreditProc
  .input(
    z.object({
      invoice_ids: z.array(z.string()),
      admin_id: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const { invoice_ids, admin_id } = input;

    // Verify admin is CREDIT_OPS_LEAD
    const adminClaim = await prisma.claim.findFirst({
      where: {
        user_id: admin_id,
        role_name: BLOCK_PERMISSIONS.CREDIT_OPS_LEAD,
        active: true,
      },
    });

    if (!adminClaim) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Selected admin must be a Credit Ops Lead',
      });
    }

    // Update invoices
    await prisma.invoice.updateMany({
      where: {
        id: {
          in: invoice_ids,
        },
      },
      data: {
        assigned_admin_id: admin_id,
      },
    });

    return true;
  });

export const getCreditOpsLeads = coSignMilestoneProc
  .query(async () => {
    const creditOpsLeads = await prisma.admin.findMany({
      where: {
        claims: {
          some: {
            role_name: BLOCK_PERMISSIONS.CREDIT_OPS_LEAD,
            active: true,
          },
        },
      },
      include: {
        assigned_invoices: {
          where: {
            status: 'PENDING',
          },
        },
      },
    });
   
    return creditOpsLeads.map(admin => ({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      pending_invoices: admin.assigned_invoices.length,
    }));
  });

export const coSignMilestone = coSignMilestoneProc
  .input(z.object({
    milestone_id: z.string(),
  }))
  .mutation(async ({ input, ctx }) => {
    const { milestone_id } = input;

    const permissionResult = await getUserPermissions(ctx.session);
    
    const isHeadOfCredit = permissionResult.hasPermission("HEAD_OF_CREDIT")
    const isCreditOpsLead = permissionResult.hasPermission("CREDIT_OPS_LEAD")

    // Check if milestone is approved
    const milestone = await prisma.milestone.findFirst({
      where: {
        id: milestone_id,
        status: ApprovalStatus.APPROVED,
      },
      include: {
        user: true,
        cosigned_by: true,
        second_level_co_sign: true,
      },
    });

    if (!milestone) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Milestone must be approved before co-signing',
      });
    }

    // Handle Credit Ops Lead co-signing
    if (isCreditOpsLead) {
      if (milestone.cosigned_by_id) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Milestone has already been co-signed by a Credit Ops Lead',
        });
      }

      const updatedMilestone = await prisma.milestone.update({
        where: { id: milestone_id },
        data: {
          cosigned_by_id: ctx.session.user.id,
        },
      });

      // Notify Head of Credit admins
      const headOfCreditAdmins = await prisma.admin.findMany({
        where: {
          claims: {
            some: {
              role_name: BLOCK_PERMISSIONS.HEAD_OF_CREDIT,
              active: true,
            }
          }
        }
      });

      for (const admin of headOfCreditAdmins) {
        await createNotification(
          `Milestone requires second level co-signing`,
          NotificationType.MILESTONE_COSIGNED,
          milestone_id,
          milestone.user_id,
          ctx.session,
          [admin.id]
        );
      }

      return updatedMilestone;
    }

    // Handle Head of Credit co-signing
    if (isHeadOfCredit) {
      if (!milestone.cosigned_by_id) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Milestone must be co-signed by Credit Ops Lead first',
        });
      }

      if (milestone.second_level_co_sign_id) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Milestone has already been co-signed by Head of Credit',
        });
      }

      const updatedMilestone = await prisma.milestone.update({
        where: { id: milestone_id },
        data: {
          second_level_co_sign_id: ctx.session.user.id,
          payment_status: PaymentStatus.APPROVED,
        },
      });

      // Notify Finance admins
      const financeAdmins = await prisma.admin.findMany({
        where: {
          claims: {
            some: {
              role_name: BLOCK_PERMISSIONS.FINANCE_ROLE,
              active: true,
            }
          }
        }
      });

      for (const admin of financeAdmins) {
        await createNotification(
          `Milestone has been fully co-signed and is ready for payment`,
          NotificationType.PAYMENT_APPROVED,
          milestone_id,
          milestone.user_id,
          ctx.session,
          [admin.id]
        );
      }

      return updatedMilestone;
    }

    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You do not have permission to co-sign milestones',
    });
  });

export const approveMilestonePayment = headOfCreditProc
  .input(z.object({
    milestone_id: z.string(),
  }))
  .mutation(async ({ input, ctx }) => {
    const { milestone_id } = input;

    const permissionResult = await getUserPermissions(ctx.session);
    
    const isHeadOfCredit = permissionResult.hasPermission("HEAD_OF_CREDIT")
    const isCreditOpsLead = permissionResult.hasPermission("CREDIT_OPS_LEAD")

    // Check if milestone is co-signed
    const milestone = await prisma.milestone.findFirst({
      where: {
        id: milestone_id,
        status: ApprovalStatus.APPROVED,
        ...(isHeadOfCredit ? {cosigned_by_id: ctx.session.user.id} : {}),
        ...(isCreditOpsLead ? {second_level_co_sign_id: ctx.session.user.id} : {}),
        payment_approved: false,
      },
    });

    if (!milestone) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Milestone must be co-signed before approving payment',
      });
    }

    if(isHeadOfCredit){
    await prisma.milestone.update({
      where: { id: milestone_id },
      data: {
        payment_status: 'APPROVED',
        payment_approved: true,
        payment_approved_at: new Date(),
        payment_approved_by_id: ctx.session.user.id,
      },
    });
    }

    return milestone;
  });

export const markInvoiceDelivered = createProcedure(BLOCK_PERMISSIONS.MARK_OFF_INVOICES_AS_DELIVERED)
  .input(z.object({
    invoice_id: z.string(),
  }))
  .mutation(async ({ input, ctx }) => {
    const { invoice_id } = input;

    // Check if invoice exists and is in APPROVED status
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoice_id,
        status: ApprovalStatus.APPROVED,
      },
      include: {
        user: true,
      },
    });

    if (!invoice) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Invoice must be approved before marking as delivered',
      });
    }

    // Update invoice status
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoice_id },
      data: {
        status: ApprovalStatus.FULLY_DELIVERED,
      },
    });

    // Create notification for Collections team
    await createNotification(
      `Invoice ${invoice.invoice_number} has been marked as delivered and is ready for collection`,
      NotificationType.INVOICE_STATUS_UPDATE,
      invoice_id,
      invoice.user_id,
      ctx.session
    );

    return updatedInvoice;
  });


  export const checkPermission = publicProcedure.input(z.object({
    permission: z.string(),
  })).query(async ({input, ctx}) => {
    const {permission} = input
    const userPermission = await prisma.claim.findFirst({where: {role_name: permission, user_id: ctx.session?.user.id ?? '', active: true}})
    return userPermission ? true : false
  })
