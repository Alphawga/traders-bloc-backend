'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DollarSign, FileText, Clock, PieChart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ActivityAndNotifications } from './ActivityAndNotifications'
import { DashboardProps } from '@/types/dashboard'
import { Progress } from '@/components/ui/progress'

export function FinanceDashboard({ dashboardSummary }: DashboardProps) {
  const router = useRouter()

  const financeQuickLinks = [
    {
      title: 'Pending Payments',
      icon: <DollarSign className="h-5 w-5" />,
      href: '/admin/milestone?status=APPROVED&payment=pending'
    },
    {
      title: 'All Invoices',
      icon: <FileText className="h-5 w-5" />,
      href: '/admin/invoices'
    },
    {
      title: 'Payment History',
      icon: <Clock className="h-5 w-5" />,
      href: '/admin/milestone?payment=completed'
    }
  ]

  const financeSummaryData = [
    {
      title: 'Total Payable Amount',
      value: `$${(dashboardSummary?.totalPayableAmount || 0).toLocaleString()}`,
      icon: <DollarSign className="h-5 w-5" />,
      subtext: `${dashboardSummary?.pendingPaymentsCount || 0} payments pending`,
      progress: dashboardSummary?.paymentProgress || 0
    },
    {
      title: 'Total Invoice Value',
      value: `$${(dashboardSummary?.totalInvoiceValue || 0).toLocaleString()}`,
      icon: <FileText className="h-5 w-5" />,
      subtext: `${dashboardSummary?.unpaidInvoicesCount || 0} invoices unpaid`
    },
    {
      title: 'Due This Month',
      value: `$${(dashboardSummary?.dueThisMonth || 0).toLocaleString()}`,
      icon: <Clock className="h-5 w-5" />,
      subtext: `${dashboardSummary?.dueThisMonthCount || 0} milestones`
    },
    {
      title: 'Total Revenue',
      value: `$${(dashboardSummary?.totalRevenue || 0).toLocaleString()}`,
      icon: <PieChart className="h-5 w-5" />,
      subtext: 'Collected payments'
    }
  ]

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Quick Actions</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {financeQuickLinks.map((link, index) => (
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

      <h2 className="text-xl font-bold mb-4">Financial Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {financeSummaryData.map((item, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
              {item.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
              <p className="text-xs text-muted-foreground">{item.subtext}</p>
              {item.progress !== undefined && (
                <Progress value={item.progress} className="mt-2" />
              )}
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