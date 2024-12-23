import { ActivityLog, Notification, Claim } from '@prisma/client'

export interface DashboardSummary {
  admin: {
    id: string
    name: string
    email: string
    claims: Array<Claim & {
      role: {
        name: string
        deleted_at: Date | null
        active: boolean
        built_in: boolean
      } | null
    }>
  }
  pendingInvoices: number
  pendingFundRequest: number
  totalFunded: number
  pendingMilestone: number
  recentActivity: Array<ActivityLog>
  unreadNotifications: Array<Notification>
  
  // Credit Ops Analyst specific
  pendingValidations?: number
  completedThisWeek?: number
  validationSuccessRate?: number
  
  // Credit Ops Lead specific
  assignedInvoices?: number
  pendingCosigns?: number
  totalAssignedFunding?: number
  assignedMilestones?: number

  // Finance specific
  totalPayableAmount?: number
  totalInvoiceValue?: number
  totalRevenue?: number
  pendingPaymentsCount?: number
  paymentProgress?: number
  unpaidInvoicesCount?: number

  // Collections specific
  readyForCollection?: number
  readyForCollectionCount?: number
  overdueAmount?: number
  overdueCount?: number
  calculatedPenalties?: number
  totalCollected?: number
  collectionProgress?: number
  dueThisMonth?: number
  dueThisMonthCount?: number
}

export interface ActivityAndNotificationsProps {
  dashboardSummary: {
    recentActivity: Array<{
      id: string
      action: string
      type: string
      created_at: Date
    }>
    unreadNotifications: Array<{
      id: string
      message: string
      created_at: Date
    }>
  }
}

export interface DashboardProps {
  dashboardSummary: DashboardSummary
} 