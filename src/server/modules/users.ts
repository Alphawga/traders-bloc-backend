import { z } from 'zod';
import { publicProcedure } from '@/server/trpc';
import prisma from '@/lib/prisma';
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcrypt';
import { fundingRequestSchema, invoiceSchema, milestoneSchema, userRegistrationSchema, userUpdateSchema } from '@/lib/dtos';
import { v2 as cloudinary } from "cloudinary";
import { NotificationType, Prisma } from '@prisma/client';
import { createNotification, sendWelcomeEmail, verifyEmail } from '@/lib/helper-function';








// KYC document schema
const kycDocumentSchema = z.array(z.object({
  document_type: z.string(),
  document_url: z.string().url(),
  file_name: z.string().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'NOT_SUBMITTED']).default('PENDING')
}));

export const registerUser = publicProcedure
  .input(userRegistrationSchema)
  .mutation(async ({ input }) => {
    try {
      const { first_name, last_name, phone_number, email, password, company_name, tax_id, industry } = input;

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'User already exists',
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await prisma.user.create({
        data: {
          first_name,
          last_name,
          phone_number,
          email,
          password: hashedPassword,
          company_name,
          tax_id,
          industry,
        },
      });

      // Send welcome email and create notifications
      await sendWelcomeEmail(newUser);

      return {
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred during registration',
      });
    }
  });

export const upsertKYCDocument = publicProcedure
  .input(kycDocumentSchema)
  .mutation(async ({ input, ctx }) => {
    if (!ctx.session?.user?.id) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be logged in to submit KYC documents',
      });
    }

    const userId = ctx.session.user.id;

    try {
      const result = await prisma.$transaction(
        input.map((doc) =>
          prisma.kYCDocument.upsert({
            where: {
              user_document_type: {
                user_id: userId,
                document_type: doc.document_type,
              },
            },
            update: {
              document_url: doc.document_url,
              file_name: doc.file_name,
              status: 'PENDING',
            },
            create: {
              user_id: userId,
              document_type: doc.document_type,
              document_url: doc.document_url,
              file_name: doc.file_name,
              status: 'PENDING',
            },
          })
        )
      );

      return result;
    } catch (error) {
      console.error('KYC documents submission error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to submit KYC documents',
      });
    }
  });


  
  export const createInvoice = publicProcedure
    .input(invoiceSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session || !ctx.session.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to create an invoice',
        });
      }
  
      const { invoice_number,
         vendor_id, 
         payment_terms, 
         due_date,
          description, 
          quantity, 
          price_per_unit, 
          total_price, 
          invoice_file 
          } = input;
      const userId = ctx.session.user.id;
  
      try {
    
        const newInvoice = await prisma.invoice.create({
          data: {
            user_id: userId,
            invoice_number,
            vendor_id,
            description,
            quantity,
            price_per_unit,
            total_price,
            invoice_file,
            payment_terms,
            due_date,
            status: 'PENDING',
          },
        });

        const admin_ids = await prisma.admin.findMany({
          where: {
            claims: {
              some: { role_name: "HEAD_OF_CREDIT" }
            }
          }
        });

        await createNotification(
          `New invoice has been created`,
          NotificationType.INVOICE_UPDATE,
          `/invoices/${newInvoice.id}`,
          userId,
          ctx.session,
          admin_ids.map(admin => admin.id)
        )
  
        return newInvoice;
      } catch (error) {
        console.error('Invoice creation error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create invoice',
        });
      } finally {
        await prisma.$disconnect();
      }
    });


    export const updateInvoice = publicProcedure
    .input(invoiceSchema)
    .mutation(async ({ input, ctx }) => {

      if (!ctx.session || !ctx.session.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to update an invoice',
        });
      }
      const { 
         invoice_id: id,
         invoice_number, 
         description,
          quantity, 
          price_per_unit, 
          total_price, 
          payment_terms, 
          due_date, 
          invoice_file, 
           } = input;

      const invoice = await prisma.invoice.update({
        where: { id },
        data: {
          invoice_number,
          description,
          quantity,
          price_per_unit,
          total_price,
          payment_terms,
          due_date,
          invoice_file,
       

        },
      });
      const admin_ids = await prisma.admin.findMany({
        where: {
          claims: {
            some: { role_name: { in: ["HEAD_OF_CREDIT", "CREDIT_OPS_LEAD"] } }
          },
          OR: [
            {
              assigned_invoices: {
                some: { id: invoice.id }
              }
            }
          ]
        }
      });
      await createNotification(
        `Invoice has been updated`,
        NotificationType.INVOICE_UPDATE,
        `/invoices/${invoice.id}`,
        ctx.session?.user?.id ?? '',
        ctx.session,
        admin_ids.map(admin => admin.id)
      )

      return invoice;
    });
    

 




export const getUserData = publicProcedure
  .input(z.string())
  .query(async ({ input: userId }) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          invoices: {include: {milestones: true,}},
          funding_requests: true,
          milestones: true,
          kyc_documents: true,  
          notifications: true
        },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      return user;
    } catch (error) {
      console.error('Get user data error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve user data',
      });
    } finally {
      await prisma.$disconnect();
    }
  });

export const createMilestone = publicProcedure
  .input(milestoneSchema)
  .mutation(async ({ ctx, input }) => {
    try {
      const { description, 
        supporting_doc, 
        bank_account_no,
        bank_name, 
        payment_amount, 
        due_date, 
        title,
        invoice_id } = input;
      const userId = ctx?.session?.user?.id ?? '';

      const newMilestone = await prisma.milestone.create({
        data: {
          title,
          description,
          supporting_doc,
          bank_account_no,
          bank_name,
          payment_amount,
          due_date,
          status: 'PENDING',
          user: { connect: { id: userId } },
          invoice: { connect: { id: invoice_id } },
        },
      });

      const admin_ids = await prisma.admin.findMany({
        where: {
          claims: {
            some: { role_name: "CREDIT_OPS_LEAD" }
          },
          assigned_invoices: {
            some: {
              id: invoice_id
            }
          }
        }
      });

      await createNotification(
        `New milestone has been created`,
        NotificationType.MILESTONE_UPDATE,
        `/milestone/${newMilestone.id}`,
        userId,
        ctx.session,
        admin_ids.map(admin => admin.id)
      )

      return newMilestone;
    } catch (error) {
      console.error('Milestone creation error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create milestone',
      });
    } finally {
      await prisma.$disconnect();
    }
  });

export const updateMilestone = publicProcedure
  .input(milestoneSchema)
  .mutation(async ({ input, ctx }) => {
    try {
      const { id, ...data } = input;
      const updatedMilestone = await prisma.milestone.update({
        where: { id },
        data,
      });
      const admin_ids = await prisma.admin.findMany({
        where: {
          claims: {
            some: { role_name: { in: ["CREDIT_OPS_LEAD", "CREDIT_OPS_ANALYST"] } }
          },
          OR: [
            {
              assigned_invoices: {
                some: {
                  id: updatedMilestone.invoice_id
                }
              }
            },
            {
              assigned_milestones: {
                some: {
                  id: updatedMilestone.id
                }
              }
            }
          ]
        }
      });

      await createNotification(
        `Milestone has been updated`,
        NotificationType.MILESTONE_UPDATE,
        `/milestone/${updatedMilestone.id}`,
        ctx.session?.user?.id ?? '',
        ctx.session,
        admin_ids.map(admin => admin.id)
      )

      return updatedMilestone;
    } catch (error) {
      console.error('Milestone update error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update milestone',
      });
    } finally {
      await prisma.$disconnect();
    }
  });

  export const updateUser = publicProcedure
  .input(userUpdateSchema)
  .mutation(async ({ input }) => {
    const { id, current_password, new_password, ...data } = input;

    try {
      // Check if user exists
      const user = await prisma.user.findUniqueOrThrow({
        where: { id },
        select: {
          id: true,
          password: true,
          email: true,
        },
      });

      // Prepare update data
      let updateData: { 
        first_name?: string; 
        last_name?: string; 
        phone_number?: string; 
        email?: string; 
        company_name?: string; 
        tax_id?: string; 
        industry?: string; 
        password?: string; 
      } = { ...data };

      // Handle password update if current_password is provided
      if (current_password) {
        // Verify current password is provided with new password
        if (!new_password) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'New password must be provided when updating password',
          });
        }

        // Verify current password
        const passwordMatch = await bcrypt.compare(current_password, user.password);
        if (!passwordMatch) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Current password is incorrect',
          });
        }

       
        updateData = {
          ...updateData,
          password: await bcrypt.hash(new_password, 12),
        };
      } else if (new_password) {
        // If new_password is provided without current_password
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Current password is required to update password',
        });
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          ...updateData,
          updated_at: new Date(),
        },
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          created_at: true,
          updated_at: true,
        },
      });

      return updatedUser;

    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Email already exists',
          });
        }
        if (error.code === 'P2025') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          });
        }
      }

      console.error('User update error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update user',
      });
    }
  });

  export const getAllVendor = publicProcedure
  .query(async () => {
    try {
      const vendors = await prisma.vendor.findMany({
        where: {
          deleted_at: null,
        },
      });
      return vendors;
    } catch (error) {
      console.error('Get all vendors error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve vendors',
      });
    } finally {
      await prisma.$disconnect();
    }
  });
  

  export const deleteInvoice = publicProcedure
  .input(z.object({ invoice_id: z.string() }))
  .mutation(async ({ input, ctx }) => {
    const { invoice_id } = input;

    try {
      await prisma.invoice.update({
        where: { id: invoice_id },
        data: {
          deleted_at: new Date(),
        },
      });

      const admin_ids = await prisma.admin.findMany({
        where: {
          claims: {
            some: { role_name: { in: ["HEAD_OF_CREDIT", "CREDIT_OPS_LEAD"] } }
          },
          OR: [
            {
              assigned_invoices: {
                some: {
                  id: invoice_id
                }
              }
            }
          ]
        }
      });

      await createNotification(
        `Invoice has been deleted`,
        NotificationType.INVOICE_UPDATE,
        `/invoices/${invoice_id}`,
        ctx.session?.user?.id ?? '',
        ctx.session,
        admin_ids.map(admin => admin.id)
      )

      return { success: true };
    } catch (error) {
      console.error('Delete invoice error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete invoice',
      });
    } finally {
      await prisma.$disconnect();
    }
  });



cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImageSchema = z.object({ 
  file: z.string().min(1, "File is required"),
  fileName: z.string().optional()
});


export const uploadImage = publicProcedure
  .input(uploadImageSchema)
  .mutation(async (opts) => {
    try {
      const result = await cloudinary.uploader.upload(opts.input.file, { 
        upload_preset: "traders-bloc",
        public_id: opts.input.fileName
      });

      return { 
        url: result.secure_url,
        fileName: opts.input.fileName 
      }; 
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      throw new Error("Internal server error");
    }
  });

  export const deleteMilestone = publicProcedure
  .input(z.object({ milestone_id: z.string() }))
  .mutation(async ({ input, ctx }) => {
    const { milestone_id } = input;

    try {
      await prisma.milestone.update({
        where: { id: milestone_id },
        data: {
          deleted_at: new Date(),
        },
      });

      const admin_ids = await prisma.admin.findMany({
        where: {
          claims: {
            some: { role_name: { in: ["CREDIT_OPS_LEAD", "CREDIT_OPS_ANALYST"] } }
          },
          OR: [
            {
              assigned_milestones: {
                some: { id: milestone_id }
              }
            }
          ]
        }
      });

      await createNotification(
        `Milestone has been deleted`,
        NotificationType.MILESTONE_UPDATE,
        `/milestone/${milestone_id}`,
        ctx.session?.user?.id ?? '',
        ctx.session,
        admin_ids.map(admin => admin.id)
      )

      return { success: true };
    } catch (error) {
      console.error('Delete milestone error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete milestone',
      });
    } finally {
      await prisma.$disconnect();
    }
  });
  
export const createFundingRequest = publicProcedure
  .input(fundingRequestSchema)
  .mutation(async ({ ctx, input }) => {
    try {
      const { invoice_id, requested_amount, your_contribution } = input;
      const userId = ctx?.session?.user?.id ?? '';

      const newFundingRequest = await prisma.fundingRequest.create({
        data: {
          user_id: userId,
          invoice_id,
          requested_amount,
          your_contribution,
          status: 'PENDING',
        },
      }); 

      const admin_ids = await prisma.admin.findMany({
        where: {
          claims: {
            some: { role_name: "HEAD_OF_CREDIT" }
          }
        }
      });

      await createNotification(
        `New funding request has been created`,
        NotificationType.FUNDING_UPDATE,
        `/funding-requests/${newFundingRequest.id}`,
        ctx.session?.user?.id ?? '',
        ctx.session,
        admin_ids.map(admin => admin.id)
      )

      return newFundingRequest;
    } catch (error) {
      console.error('Funding request creation error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create funding request',
      });
    } finally {
      await prisma.$disconnect();
    }
  });


  export const getUserInvoices = publicProcedure
  .query(async({ctx})=>{
    const invoices = await prisma.invoice.findMany({
      where: {user_id: ctx.session?.user.id??""}
    })
    return invoices
  })

export const updateNotification = publicProcedure
  .input(z.object({notification_id: z.string(), is_read: z.boolean()}))
  .mutation(async({input})=>{
    const {notification_id, is_read} = input
    await prisma.notification.update({
      where: {id: notification_id}, data: {is_read}
    })
  })

// Add new procedure for email verification
export const verifyEmailToken = publicProcedure
  .input(z.object({
    token: z.string(),
  }))
  .mutation(async ({ input }) => {
    try {
      await verifyEmail(input.token);
      return {
        success: true,
        message: 'Email verified successfully',
      };
    } catch (error) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: error instanceof Error ? error.message : 'Failed to verify email',
      });
    }
  });

export const resendVerification = publicProcedure
  .mutation(async ({ ctx }) => {
    if (!ctx.session?.user?.id) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be logged in'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: ctx.session.user.id }
    });

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found'
      });
    }

    if (user.is_email_verified) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Email already verified'
      });
    }

    await sendWelcomeEmail({
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name
    });

    return { success: true };
  });

