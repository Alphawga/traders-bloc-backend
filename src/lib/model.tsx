import { User, KYCDocument, Invoice, FundingRequest, Milestone, ApprovalStatus, Notification } from '@prisma/client';

export type UserWithRelations = User & {
    kyc_documents: KYCDocument[];
    invoices: (Invoice & { milestones: Milestone[] & { funding_requests: FundingRequest[] &{milestone: Milestone} } })[]; 
    funding_requests: (FundingRequest & {milestone: Milestone})[];
    milestones: Milestone[];
    notifications: Notification[];
};

export type IKYCFilterParams = {
  search?: string;
  status?: ApprovalStatus;
  industry?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};
