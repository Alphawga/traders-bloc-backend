'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { trpc } from '@/app/_providers/trpc-provider'
import { usePermission } from "@/hooks/use-permission"
import { CreditOpsAnalystDashboard } from '@/components/admin/dashboards/CreditOpsAnalystDashboard'
import { CreditOpsLeadDashboard } from '@/components/admin/dashboards/CreditOpsLeadDashboard'
import { HeadOfCreditDashboard } from '@/components/admin/dashboards/HeadOfCreditDashboard'


export default function AdminDashboard() {
  const { data: dashboardSummary, isLoading, error } = trpc.getAdminDashboardSummary.useQuery()
  const [greeting, setGreeting] = useState('')
  const { hasPermission } = usePermission()

  const isCreditOpsAnalyst = hasPermission('CREDIT_OPS_ANALYST')
  const isCreditOpsLead = hasPermission('CREDIT_OPS_LEAD')
  const isHeadOfCredit = hasPermission('HEAD_OF_CREDIT')

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good Morning')
    else if (hour < 18) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')
  }, [])

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (error) {
    return <div className="text-red-500">Error loading dashboard data</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">      
      <div className="relative overflow-hidden rounded-lg mb-8">
        <div className="absolute inset-0 bg-black bg-opacity-90">
          <div className="h-full flex flex-col justify-center p-6">
            <h2 className="text-2xl font-bold mb-2 text-white">Welcome Back!</h2>
            <p className="text-gray-300">{greeting}, {dashboardSummary?.admin?.name}</p>
            {isCreditOpsAnalyst && (
              <p className="text-gray-300">You have {dashboardSummary?.pendingMilestone} milestones pending review</p>
            )}
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

      {isCreditOpsAnalyst && <CreditOpsAnalystDashboard dashboardSummary={dashboardSummary} />}
      {isCreditOpsLead && <CreditOpsLeadDashboard dashboardSummary={dashboardSummary} />}
      {isHeadOfCredit && <HeadOfCreditDashboard dashboardSummary={dashboardSummary} />}
    </div>
  )
}