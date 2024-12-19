'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { trpc } from "@/app/_providers/trpc-provider"
import { format } from "date-fns"
import * as XLSX from 'xlsx'
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePermission } from "@/hooks/use-permission"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, BarChart, Bar,
  ResponsiveContainer
} from "recharts"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

export function ReportDataGrid() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month')
  const { data: reportData, isLoading } = trpc.getReportData.useQuery({ timeRange })
  const { hasPermission } = usePermission()

  const isCreditOpsLead = hasPermission('CREDIT_OPS_LEAD')
  const isHeadOfCredit = hasPermission('HEAD_OF_CREDIT')
  const isFinance = hasPermission('FINANCE_ROLE')

  const exportToExcel = () => {
    if (!reportData) return

    const workbook = XLSX.utils.book_new()

    // Summary Sheet
    const summaryData = [
      ['Metric', 'Value', 'Growth'],
      ['Total Invoices', reportData.totalInvoices, `${reportData.invoiceGrowth}%`],
      ['Total Milestones', reportData.totalMilestones, `${reportData.milestoneGrowth}%`],
      ['Total Amount', reportData.totalAmount, `${reportData.amountGrowth}%`],
    ]
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

    // Role-specific sheets
    if (isCreditOpsLead || isHeadOfCredit) {
      const invoiceTrendsData = reportData.invoiceTrends.map(trend => ({
        Date: format(new Date(trend.date), 'yyyy-MM-dd'),
        Amount: trend.amount,
        Count: trend.count
      }))
      const invoiceTrendsSheet = XLSX.utils.json_to_sheet(invoiceTrendsData)
      XLSX.utils.book_append_sheet(workbook, invoiceTrendsSheet, 'Invoice Trends')
    }

    // Status Distribution Sheet
    const statusSheet = XLSX.utils.json_to_sheet(reportData.statusDistribution)
    XLSX.utils.book_append_sheet(workbook, statusSheet, 'Status Distribution')

    // Milestone Progress Sheet
    const milestoneSheet = XLSX.utils.json_to_sheet(reportData.milestoneProgress)
    XLSX.utils.book_append_sheet(workbook, milestoneSheet, 'Milestone Progress')

    // Save the file
    XLSX.writeFile(workbook, `report_${timeRange}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`)
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Select 
          value={timeRange} 
          onValueChange={(value: 'week' | 'month' | 'year') => setTimeRange(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last Week</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={exportToExcel}>
          Export to Excel
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Summary Card - Visible to all roles */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Summary</h3>
          <div className="space-y-2">
            <p>Total Invoices: {reportData?.totalInvoices}</p>
            <p>Growth: {reportData?.invoiceGrowth.toFixed(2)}%</p>
            <p>Total Amount: ${reportData?.totalAmount.toFixed(2)}</p>
            <p>Growth: {reportData?.amountGrowth.toFixed(2)}%</p>
          </div>
        </Card>

        {/* Invoice Trends - Visible to Credit Ops Lead and Head of Credit */}
        {(isCreditOpsLead || isHeadOfCredit) && (
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Invoice Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reportData?.invoiceTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => format(new Date(date), 'MMM dd')} 
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="amount" stroke="#8884d8" name="Amount" />
                <Line type="monotone" dataKey="count" stroke="#82ca9d" name="Count" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Status Distribution - Visible to all roles */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={reportData?.statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {reportData?.statusDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Milestone Progress - Visible to all roles but with different focus */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">
            {isFinance ? 'Payment Status' : 'Milestone Progress'}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportData?.milestoneProgress}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" fill="#82ca9d" name="Completed" />
              <Bar dataKey="pending" fill="#8884d8" name="Pending" />
              {isFinance && (
                <Bar dataKey="paid" fill="#ffc658" name="Paid" />
              )}
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Finance-specific metrics */}
        {isFinance && (
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Payment Analytics</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reportData?.invoiceTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => format(new Date(date), 'MMM dd')} 
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#8884d8" 
                  name="Pending Payments" 
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>
    </div>
  )
} 