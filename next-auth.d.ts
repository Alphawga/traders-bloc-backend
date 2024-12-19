import { KYCStatus } from "@prisma/client"
import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: string
      is_email_verified: boolean
      kyc_status: KYCStatus
      can_create_invoice: boolean
      permissions: string[]
    }
  }

  interface User {
    id: string
    name: string
    email: string
    role: string
    is_email_verified: boolean
    kyc_status: KYCStatus
    can_create_invoice: boolean
    permissions: string[]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    name: string
    email: string
    role: string
    is_email_verified: boolean
    kyc_status: KYCStatus
    can_create_invoice: boolean
    permissions: string[]
  }
} 