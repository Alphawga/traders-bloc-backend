
import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      role: string
      is_email_verified: boolean
      kyc_status: "PENDING" | "SUBMITTED" | "APPROVED" | "REJECTED"
      can_create_invoice: boolean
      permissions: string[]
    }
  }
} 