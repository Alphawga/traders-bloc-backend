import { User, KYCDocument, Invoice, FundingRequest, Milestone } from '@prisma/client';

export type UserWithRelations = User & {
    kyc_documents: KYCDocument[];
    invoices: Invoice[];
    funding_requests: FundingRequest[];
    milestones: Milestone[];
  };