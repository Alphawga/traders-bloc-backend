'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DollarSign, Clock, AlertTriangle, PieChart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ActivityAndNotifications } from './ActivityAndNotifications'
import { DashboardProps } from '@/types/dashboard'
import { Progress } from '@/components/ui/progress'

export function CollectionsDashboard({ dashboardSummary }: DashboardProps) {
  const router = useRouter()

  const collectionQuickLinks = [
    {
      title: 'Ready for Collection',
      icon: <DollarSign className="h-5 w-5" />,
      href: '/admin/invoices?status=FULLY_DELIVERED'
    },
    {
      title: 'Overdue Payments',
      icon: <AlertTriangle className="h-5 w-5" />,
      href: '/admin/invoices?status=overdue'
    },
    {
      title: 'Collection History',
      icon: <Clock className="h-5 w-5" />,
      href: '/admin/collections/history'
    }
  ]

  const collectionSummaryData = [
    {
      title: 'Ready for Collection',
      value: `$${(dashboardSummary?.readyForCollection || 0).toLocaleString()}`,
      icon: <DollarSign className="h-5 w-5" />,
      subtext: `${dashboardSummary?.readyForCollectionCount || 0} invoices`,
      progress: dashboardSummary?.collectionProgress || 0
    },
    {
      title: 'Overdue Amount',
      value: `$${(dashboardSummary?.overdueAmount || 0).toLocaleString()}`,
      icon: <AlertTriangle className="h-5 w-5" />,
      subtext: `${dashboardSummary?.overdueCount || 0} overdue invoices`,
      secondaryText: `$${(dashboardSummary?.calculatedPenalties || 0).toLocaleString()} in penalties`
    },
    {
      title: 'Due This Month',
      value: `$${(dashboardSummary?.dueThisMonth || 0).toLocaleString()}`,
      icon: <Clock className="h-5 w-5" />,
      subtext: `${dashboardSummary?.dueThisMonthCount || 0} invoices`
    },
    {
      title: 'Total Collections',
      value: `$${(dashboardSummary?.totalCollected || 0).toLocaleString()}`,
      icon: <PieChart className="h-5 w-5" />,
      subtext: 'Revenue collected'
    }
  ]

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Quick Actions</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {collectionQuickLinks.map((link, index) => (
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

      <h2 className="text-xl font-bold mb-4">Collections Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {collectionSummaryData.map((item, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
              {item.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
              <p className="text-xs text-muted-foreground">{item.subtext}</p>
              {item.secondaryText && (
                <p className="text-xs text-red-500 mt-1">{item.secondaryText}</p>
              )}
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