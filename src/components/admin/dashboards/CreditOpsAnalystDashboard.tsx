'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ActivityAndNotifications } from './ActivityAndNotifications'
import { DashboardProps } from '@/types/dashboard'

export function CreditOpsAnalystDashboard({ dashboardSummary }: DashboardProps) {
  const router = useRouter()

  const analystQuickLinks = [
    {
      title: 'Assigned Milestones',
      icon: <Clock className="h-5 w-5" />,
      href: '/admin/milestones?assigned=true'
    },
    {
      title: 'Pending Validations',
      icon: <FileText className="h-5 w-5" />,
      href: '/admin/milestones?status=PENDING'
    },
    {
      title: 'Completed Reviews',
      icon: <CheckCircle className="h-5 w-5" />,
      href: '/admin/milestones?status=APPROVED'
    }
  ]

  const analystSummaryData = [
    {
      title: 'Assigned Milestones',
      value: dashboardSummary?.pendingMilestone || 0,
      icon: <Clock className="h-5 w-5" />,
      href: '/admin/milestones?assigned=true'
    },
    {
      title: 'Pending Validations',
      value: dashboardSummary?.pendingValidations || 0,
      icon: <AlertCircle className="h-5 w-5" />,
      href: '/admin/milestones?status=PENDING'
    },
    {
      title: 'Completed This Week',
      value: dashboardSummary?.completedThisWeek || 0,
      icon: <CheckCircle className="h-5 w-5" />,
      href: '/admin/milestones?status=APPROVED'
    },
    {
      title: 'Validation Success Rate',
      value: `${dashboardSummary?.validationSuccessRate || 0}%`,
      icon: <FileText className="h-5 w-5" />,
      href: '/admin/milestones?status=ALL'
    }
  ]

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Quick Actions</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {analystQuickLinks.map((link, index) => (
          <Button
            key={index}
            variant="outline"
            className="justify-start h-auto py-4 px-6"
            onClick={() => router.push(link.href)}
          >
            {link.icon}
            <span className="ml-2">{link.title}</span>
          </Button>
        ))}
      </div>

      <h2 className="text-xl font-bold mb-4">Validation Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {analystSummaryData.map((item, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
              {item.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Activity and Notifications sections */}
        <ActivityAndNotifications dashboardSummary={dashboardSummary} />
      </div>
    </>
  )
} 