import { adminUpdateSchema, invoiceUpdateSchema, vendorSchema } from '@/lib/dtos';
import { adminProcedure } from '../trpc';
import { fundingRequestUpdateSchema } from '@/lib/dtos';
import { kycUpdateSchema } from '@/lib/dtos';
import prisma from '@/lib/prisma';
import { milestoneUpdateSchema } from '@/lib/dtos';
import { z } from 'zod';
import { ApprovalStatus, Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcrypt'



export const getAllMilestones = adminProcedure
  .input(
    z.object({
      search: z.string().optional(),
      status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
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
      where:{id: ctx.session.user.id ?? ""}
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

    return milestone;
  });

  export const getAllKYCDocuments = adminProcedure
  .input(z.object({
    search: z.string().optional(),
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
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

  export const getAdminDashboardSummary = adminProcedure
  .query(async ({ ctx }) => {
    const adminId = ctx.session?.user?.id;


    if (!adminId) {
      throw new Error("Unauthorized: Admin ID is missing");
    }

    try {

      const admin = await prisma.admin.findUnique({
        where: {
          id: adminId,
        },
      });

      if (!admin) {
        throw new Error("Admin not found");
      }

 
      const pendingInvoices = await prisma.invoice.count({
        where: {
          status: "PENDING",
          deleted_at: null,
        },
      });

  
      const pendingFundRequest = await prisma.fundingRequest.count({
        where: {
          status: "PENDING",
          deleted_at: null,
        },
      });


      const totalFundedResult = await prisma.fundingRequest.aggregate({
        _sum: {
          requested_amount: true, 
        },
        where: {
          status: "APPROVED",
          deleted_at: null,
        },
      });

      const totalFunded = totalFundedResult._sum.requested_amount || 0;

     
      const pendingMilestone = await prisma.milestone.count({
        where: {
          status: "PENDING",
          deleted_at: null,
        },
      });

 
      const recentActivity = await prisma.activityLog.findMany({
        where: {
          admin_id: adminId,
        },
        orderBy: {
          created_at: "desc", 
        },
        take: 10,
      });
  

      const unreadNotifications = await prisma.notification.findMany({
        where: {
          admin_id: adminId,
          is_read: false,
          deleted_at: null,
        },
        orderBy: {
          created_at: "desc",
        }})

        return {
        admin,
        pendingInvoices,
        pendingFundRequest,
        totalFunded,
        pendingMilestone,
        recentActivity,
        unreadNotifications,
      };

    } catch (error) {
      console.error("Error fetching admin dashboard summary:", error);
      throw new Error("Failed to retrieve admin dashboard summary. Please try again later.");
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
        reviewed_by: ctx.session.user.id,
      },
    });

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
        reviewed_by: ctx.session.user.id,
      },
    });

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
        reviewed_by: ctx.session.user.id,
      },
    });

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



export const getAllInvoices = adminProcedure
  .input(
    z.object({
      search: z.string().optional(),
      status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
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
    })
  )
  .query(async ({ input }) => {
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
    } = input;
    
    const skip = (page - 1) * limit;
    const where: Prisma.InvoiceWhereInput = {};
    

    if (search) {
      where.OR = [
        { user: { first_name: { contains: search, mode: "insensitive" } } },
        { user: { last_name: { contains: search, mode: "insensitive" } } },
        { description: { contains: search, mode: "insensitive" } },
        { invoice_number: { contains: search, mode: "insensitive" } },
      ];
    }


    if (status) {
      where.status = status as ApprovalStatus;
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

    const total = await prisma.invoice.count({ where });
    const orderBy: Prisma.InvoiceOrderByWithRelationInput = sortBy
      ? sortBy === "vendor"
        ? { vendor: { name: sortOrder } }
        : { [sortBy]: sortOrder }
      : { submission_date: "desc" };

    const invoices = await prisma.invoice.findMany({
      where,
      include: { user: true, vendor: true },
      skip,
      take: limit,
      orderBy,
    });

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
  .mutation(async ({ ctx, input }) => {
    const { id, email, name,  current_password, new_password } = input;
    
  
    const existingAdmin = await prisma.admin.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        password: true,
        role: true,
      },
    });


    if (existingAdmin.role !== ctx.session.user.role && 
        ctx.session.user.role !== 'SUPER_ADMIN') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Insufficient permissions to modify admin role',
      });
    }

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
          role: true,
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
