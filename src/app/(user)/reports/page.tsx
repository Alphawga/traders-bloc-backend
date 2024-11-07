'use client'

import { useMemo } from 'react'
import useUserStore from "@/store/user-store"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


function Transaction() {
  const { user } = useUserStore()
  const invoices = user?.invoices || []
  const fundingRequests = user?.funding_requests || []

  const stats = useMemo(() => {
    const totalInvoices = invoices.length
    const totalInvoiceValue = invoices.reduce((sum, inv) => sum + (inv.total_price || 0), 0)
    const totalFundRequested = fundingRequests.reduce((sum, req) => sum + (req.requested_amount || 0), 0)
    const closedInvoices = invoices.filter(inv => inv.status === 'APPROVED').length
    const openInvoices = invoices.filter(inv => inv.status === 'PENDING').length

    return {
      totalInvoices,
      totalInvoiceValue,
      totalFundRequested,
      closedInvoices,
      openInvoices,
    }
  }, [invoices, fundingRequests])

  return (
    <div className="p-6 bg-white rounded-lg">
      <div className="flex justify-between items-center mb-4">
  
        <Select defaultValue="today">
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="relative col-span-2">
          <div className="w-full max-w-[500px] mx-auto aspect-square relative">
            {/* Placeholder for donut chart - in production, use a chart library like recharts or chart.js */}
            <div className="absolute inset-0 rounded-full border-[24px] border-primary/20">
              <div className="absolute inset-0 rounded-full border-[24px] border-primary rotate-[60deg]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)' }} />
              <div className="absolute inset-0 rounded-full border-[24px] border-blue-500 rotate-[180deg]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 30%, 0 30%)' }} />
            </div>
            <div className="absolute inset-[24px] flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold">{stats.totalInvoices}</div>
                <div className="text-sm text-gray-500">Total Invoices</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-1">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">Total Invoices</div>
              <div className="text-2xl font-semibold">{stats.totalInvoices}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Total Value</div>
              <div className="text-2xl font-semibold">${stats.totalInvoiceValue.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Total Fund Requested</div>
              <div className="text-2xl font-semibold">${stats.totalFundRequested.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Closed Invoices</div>
              <div className="text-2xl font-semibold">{stats.closedInvoices}</div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Open Invoices</span>
              <span className="text-sm font-medium text-blue-600">{stats.openInvoices}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Processing Rate</span>
              <span className="text-sm font-medium text-blue-600">
                {stats.totalInvoices ? Math.round((stats.closedInvoices / stats.totalInvoices) * 100) : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Funding Rate</span>
              <span className="text-sm font-medium text-blue-600">
                {stats.totalInvoiceValue ? Math.round((stats.totalFundRequested / stats.totalInvoiceValue) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Transaction