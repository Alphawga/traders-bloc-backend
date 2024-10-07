import { z } from 'zod';

export const userRegistrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[@$!%*?&]/, 'Password must contain at least one special character'),
  company_name: z.string().min(1, 'Company name is required'),
  tax_id: z.string().min(1, 'Tax ID is required'),
  industry: z.string().min(1, 'Industry is required'),
});

export const kycDocumentSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  document_type: z.string().min(1, 'Document type is required'),
  document_url: z.string().url('Invalid document URL'),
});

export const invoiceSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  invoice_number: z.string().min(1, 'Invoice number is required'),
  amount: z.number().positive('Amount must be greater than 0'),
  payment_terms: z.string().min(1, 'Payment terms are required'),
  due_date: z.date().refine(date => date > new Date(), {
    message: 'Due date must be in the future',
  }),
});