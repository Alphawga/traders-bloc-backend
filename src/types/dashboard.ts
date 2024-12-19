import { ActivityLog, Notification } from '@prisma/client'

export interface DashboardSummary {
  admin: {
    id: string
    name: string
    email: string
    claims: Array<{
      role: {
        name: string
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