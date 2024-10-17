import { invoiceUpdateSchema, vendorSchema } from '@/lib/dtos';
import { adminProcedure } from '../trpc';
import { fundingRequestUpdateSchema } from '@/lib/dtos';
import { kycUpdateSchema } from '@/lib/dtos';
import prisma from '@/lib/prisma';
import { milestoneUpdateSchema } from '@/lib/dtos';


export const getAllMilestones = adminProcedure
  .query(async () => {
    const milestones = await prisma.milestone.findMany({
    });

    if (!milestones || milestones.length === 0) {
      throw new Error('No milestones found');
    }

    return milestones;
  });

export const updateMilestone = adminProcedure
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
  .query(async () => {
    const kycDocuments = await prisma.kYCDocument.findMany({});

    if (!kycDocuments.length) {
      throw new Error('No KYC documents found');
    }

    return kycDocuments;
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


