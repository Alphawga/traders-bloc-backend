'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, DollarSign, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ActivityAndNotifications } from './ActivityAndNotifications'
import { DashboardProps } from '@/types/dashboard'

export function CreditOpsLeadDashboard({ dashboardSummary }: DashboardProps) {
  const router = useRouter()

  const leadQuickLinks = [
    {
      title: 'Assigned Invoices',
      icon: <FileText className="h-5 w-5" />,
      href: '/admin/invoices?assigned=true'
    },
    {
      title: 'Pending Co-signs',
      icon: <Clock className="h-5 w-5" />,
      href: '/admin/milestones?status=PENDING&cosign=true'
    },
    {
      title: 'Funding Requests',
      icon: <DollarSign className="h-5 w-5" />,
      href: '/admin/funding-requests?assigned=true'
    }
  ]

  const leadSummaryData = [
    {
      title: 'Assigned Invoices',
      value: dashboardSummary?.assignedInvoices || 0,
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: 'Pending Co-signs',
      value: dashboardSummary?.pendingCosigns || 0,
      icon: <Clock className="h-5 w-5" />,
    },
    {
      title: 'Total Funding Amount',
      value: `$${(dashboardSummary?.totalAssignedFunding || 0).toLocaleString()}`,
      icon: <DollarSign className="h-5 w-5" />,
    },
    {
      title: 'Pending Milestones',
      value: dashboardSummary?.assignedMilestones || 0,
      icon: <Clock className="h-5 w-5" />,
    }
  ]

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Quick Actions</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {leadQuickLinks.map((link, index) => (
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

      <h2 className="text-xl font-bold mb-4">Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {leadSummaryData.map((item, index) => (
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
        <ActivityAndNotifications dashboardSummary={dashboardSummary} />
      </div>
    </>
  )
} 