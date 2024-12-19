'use client'

import { ReportDataGrid } from "@/components/admin/ReportDataGrid"

export default function ReportsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Reports</h1>
      <ReportDataGrid />
    </div>
  )
}
