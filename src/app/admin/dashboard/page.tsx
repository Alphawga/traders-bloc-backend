'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, DollarSign, FileText, UserCheck } from 'lucide-react'
import { trpc } from '@/app/_providers/trpc-provider'
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from '@/components/ui/select'


export default function AdminDashboard() {
  const router = useRouter()
  const { data: dashboardSummary, isLoading, error } = trpc.getAdminDashboardSummary.useQuery()
  const [greeting, setGreeting] = useState('')


  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good Morning')
    else if (hour < 18) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')
  }, [])

  // Define quick links based on user's claims
  const quickLinks = [
    {
      title: 'KYC Reviews',
      icon: <UserCheck className="h-5 w-5" />,
      href: '/admin/kyc-reviews'
    },
    {
      title: 'Invoice Approvals',
      icon: <FileText className="h-5 w-5" />,
      href: '/admin/invoices'
    },
    {
      title: 'Funding Requests',
      icon: <DollarSign className="h-5 w-5" />,
      href: '/admin/funding-requests'
    },
  ]

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (error) {
    return <div className="text-red-500">Error loading dashboard data</div>
  }

  const summaryData = [
    {
      title: 'Pending Invoices',
      value: dashboardSummary?.pendingInvoices || 0,
      icon: <FileText className="h-5 w-5" />,
      href: '/admin/invoices?status=PENDING'
    },
    {
      title: 'Pending Funding Request',
      value: dashboardSummary?.pendingFundRequest || 0,
      icon: <DollarSign className="h-5 w-5" />,
      href: '/admin/funding-requests?status=PENDING'
    },
    {
      title: 'Total Funded',
      value: `$${(dashboardSummary?.totalFunded || 0).toLocaleString()}`,
      icon: <DollarSign className="h-5 w-5" />,
      href: '/admin/funding-requests'
    },
    {
      title: 'Pending Milestone Reviews',
      value: dashboardSummary?.pendingMilestone || 0,
      icon: <Clock className="h-5 w-5" />,
      href: '/admin/milestones?status=PENDING'
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">      
      <div className="relative overflow-hidden rounded-lg mb-8">
        <div className="absolute inset-0 bg-black bg-opacity-90">
          <div className="h-full flex flex-col justify-center p-6">
            <h2 className="text-2xl font-bold mb-2 text-white">Welcome Back!</h2>
            <p className="text-gray-300">{greeting}, {dashboardSummary?.admin?.name}</p>
            <p className="text-gray-300">Have a good Day Ahead</p>
          </div>
        </div>
        <Image
          src="/images/rb_89591.png"
          alt="Dashboard background"
          width={1200}
          height={300}
          className="w-full h-auto object-cover opacity-45"
        />
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Quick Links</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {quickLinks.map((link, index) => (
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
        {summaryData.map((item, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
              <div className="mt-2">
                <Button variant="outline" className="w-full justify-start">
                  {item.icon}
                  <span>{item.title}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/2">
          <h2 className="text-xl font-bold mb-4">Notifications</h2>
          <div className="space-y-4">
            {dashboardSummary?.unreadNotifications.slice(0, 2).map((notification, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-lg overflow-hidden">
                  <Image src={`/images/not${index + 1}.png`} alt={`Notification ${index + 1}`} width={48} height={48} />
                </div>
                <div>
                  <p className="font-medium">{notification.type}</p>
                  <p className="text-sm text-gray-500">{notification.message}</p>
                  <p className="text-sm text-gray-500">{notification.created_at.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full md:w-1/2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">All Activities</h2>
            <div className="flex items-center space-x-2">
              <Button variant="default">All Activities</Button>
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            {dashboardSummary?.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-2 bg-gray-100 p-2 rounded">
                {activity.type === "FUNDING_STATUS_UPDATE" && <DollarSign className="h-4 w-4" />}
                {activity.type === "MILESTONE_STATUS_UPDATE" && <Clock className="h-4 w-4" />}
                {activity.type === "KYC_STATUS_UPDATE" && <UserCheck className="h-4 w-4" />}
                {activity.type === "INVOICE_STATUS_UPDATE" && <FileText className="h-4 w-4" />}
                <p className="text-sm">{activity.action}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}