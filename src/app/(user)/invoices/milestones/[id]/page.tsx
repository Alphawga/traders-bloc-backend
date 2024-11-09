'use client'

import { Invoice } from "@prisma/client"
import useUserStore from "@/store/user-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import MilestoneForm from "@/components/milestone/milestone-fom"
import CreateMilestoneForm from "@/components/milestone/create-milestone-form"
import { useParams } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

export default function Component() {
  const { id } = useParams()
  const { user } = useUserStore()

  const selectedInvoiceData = user?.invoices.find((invoice) => invoice.id === id as string)
  const milestones = user?.milestones.filter((milestone) => milestone.invoice_id === id as string) || []



  const formatDate = (date: Date) => {
    const d = new Date(date)
    return {
      month: d.toLocaleString('default', { month: 'short' }),
      day: String(d.getDate()).padStart(2, '0'),
      year: d.getFullYear()
    }
  }

  const MilestoneSkeleton = ({ index }: { index: number }) => (
    <div className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'} mb-16`}>
      <div className="w-[calc(50%-2rem)]">
        <Card className="bg-white/50">
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="text-right">
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Card className=" mx-auto px-5">
      <CardHeader>
  <CardTitle className="text-4xl font-bold text-center">
    <span className="text-gray-700">PROJECT</span>
    <span className="text-blue-500 ml-2">MILESTONES</span>
  </CardTitle>
  <p className="text-gray-500 text-center">Invoice #{selectedInvoiceData?.invoice_number}</p>
  <div className="flex justify-center space-x-4 mt-4">
    <Link href="/invoices" className="text-blue-500 hover:text-blue-700 transition-colors">
      View All Invoices
    </Link>
    <Link href={`/invoices/fund-requests/${id}`} className="text-blue-500 hover:text-blue-700 transition-colors">
      View Funding Request
    </Link>
  </div>
</CardHeader>
        <CardContent>
          <div className="relative mt-16">
            {/* Vertical Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-blue-200"></div>

            {/* Milestones or Skeletons */}
            <div className="relative">
            {milestones.length > 0 ? (
  milestones.map((milestone, index) => {
    const createdDate = formatDate(milestone.created_at)
    const approvedDate = milestone.approved_at ? formatDate(milestone.approved_at) : null
    const paidDate = milestone.paid_at ? formatDate(milestone.paid_at) : null
    const isEven = index % 2 === 0

    return (
      <div key={milestone.id} className="relative mb-16">
        {/* Timeline Dot */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
        </div>

        {/* Card */}
        <div className={`flex ${isEven ? 'justify-start' : 'justify-end'}`}>
          <Card className={`w-[calc(50%-2rem)] bg-white`}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{milestone.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{milestone.description}</p>
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-gray-600">Created: {createdDate.month} {createdDate.day}, {createdDate.year}</p>
                    {approvedDate && (
                      <p className="text-sm text-green-600">Approved: {approvedDate.month} {approvedDate.day}, {approvedDate.year}</p>
                    )}
                    {paidDate && (
                      <p className="text-sm text-blue-600">Funded: {paidDate.month} {paidDate.day}, {paidDate.year}</p>
                    )}
                  </div>
                  <div className="mt-4">
                    <MilestoneForm
                      invoice={selectedInvoiceData as Invoice}
                      action="Edit"
                      milestone={milestone}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{createdDate.day}</div>
                  <div className="text-gray-500">{createdDate.month}</div>
                  <div className="text-gray-500">{createdDate.year}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  })
) : (
                // Skeleton UI when no milestones
                <>
                  <MilestoneSkeleton index={0} />
                  <MilestoneSkeleton index={1} />
                  <MilestoneSkeleton index={2} />
                </>
              )}
            </div>
          </div>

          <div className="mt-12">
            <CreateMilestoneForm invoice_id={id as string} is_milestone={!(milestones.length >0)} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}