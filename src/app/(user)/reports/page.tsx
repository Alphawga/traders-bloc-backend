'use client'

import { useMemo } from 'react'
import useUserStore from "@/store/user-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from 'date-fns'

function Transaction() {
  const { user } = useUserStore()
  const payments = user?.funding_requests.filter((request) => request.status === "APPROVED")

  const totalFunding = useMemo(() => {
    return payments?.reduce((sum, payment) => sum + (payment.requested_amount || 0), 0) || 0
  }, [payments])

  const latestDueDate = useMemo(() => {
    if (!payments || payments.length === 0) return null
    return new Date(Math.max(...payments.map(p => new Date(p.submission_date).getTime())))
  }, [payments])

  return (
    <div className="">
    

      <div className="mb-8">
        {payments?.map((payment, index) => (
          <div key={payment.id} className="flex items-start mb-4">
            <div className="mr-4 mt-1">
              <div className="w-3 h-3 bg-black rounded-full"></div>
              {index !== payments.length - 1 && <div className="w-0.5 h-full bg-gray-300 ml-1.5 mt-1"></div>}
            </div>
            <div>
              <p className="font-semibold">Funded ${payment.requested_amount?.toLocaleString()}</p>
              <p className="text-sm text-gray-500">{format(new Date(payment.submission_date), 'MMM d, yyyy')}</p>
            </div>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Funding Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total Funding</p>
              <p className="text-lg font-semibold">${totalFunding.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Due Date</p>
              <p className="text-lg font-semibold">{latestDueDate ? format(latestDueDate, 'MMM d, yyyy') : 'N/A'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-500">Repayment Terms</p>
              <p className="text-lg font-semibold">30 days</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Transaction