'use client'

import { useParams } from "next/navigation"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { trpc } from "@/app/_providers/trpc-provider"
import { toast } from "@/hooks/use-toast"
import Image from "next/image"

function InvoiceDetails() {
  const params = useParams()
  const id = params.id as string

  const { data: invoice, isLoading, refetch } = trpc.getInvoice.useQuery({ id })

  const updateInvoiceStatus = trpc.updateInvoiceStatus.useMutation({
    onSuccess: () => {
      toast({
        description: "Invoice status updated successfully"
      })
      refetch()
    },
    onError: () => {
      toast({
        description: "Failed to update invoice status",
        variant: "destructive"
      })
    }
  })

  const handleApproveReject = (status: 'APPROVED' | 'REJECTED') => {
    updateInvoiceStatus.mutate({ invoice_id: id, status })
  }

  if (isLoading) {
    return <div className="p-6">Loading...</div>
  }

  if (!invoice) {
    return <div className="p-6">Invoice not found</div>
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">INVOICE</h1>
            <p className="text-gray-600 mt-1">#{invoice.invoice_number}</p>
          </div>
          <div className="w-full sm:w-auto">
            <p className={`inline-block px-3 py-1 rounded-full text-sm font-semibold
              ${invoice.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                invoice.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'}`}>
              {invoice.status}
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-gray-600 font-semibold mb-2">Invoice Image</h3>
          <div className="w-full h-48 sm:h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            {invoice.invoice_file ? (
              <Image
                src={invoice.invoice_file}
                alt="Invoice"
                className="w-full h-full object-contain rounded-lg"
              />
            ) : (
              <span className="text-gray-400">No image available</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mb-8">
          <div>
            <h3 className="text-gray-600 font-semibold mb-2">Invoice Details</h3>
            <div className="space-y-2">
              <p className="flex flex-col sm:flex-row sm:justify-between">
                <span className="font-medium">Description:</span>
                <span className="text-gray-600">{invoice.description}</span>
              </p>
              <p className="flex flex-col sm:flex-row sm:justify-between">
                <span className="font-medium">Created Date:</span>
                <span className="text-gray-600">{format(new Date(invoice.submission_date), 'MMM dd, yyyy')}</span>
              </p>
              <p className="flex flex-col sm:flex-row sm:justify-between">
                <span className="font-medium">Due Date:</span>
                <span className="text-gray-600">
                  {invoice.due_date ? format(new Date(invoice.due_date), 'MMM dd, yyyy') : 'N/A'}
                </span>
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <h3 className="text-gray-600 font-semibold mb-2">Amount</h3>
            <p className="text-2xl sm:text-3xl font-bold text-gray-800">
              ${invoice.total_price?.toFixed(2)}
            </p>
          </div>
        </div>

        {invoice.status === 'PENDING' && (
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end mt-8 pt-6 border-t">
            <Button 
              onClick={() => handleApproveReject('REJECTED')} 
              variant="outline"
              className="w-full sm:w-auto bg-red-500 text-white hover:bg-red-600"
            >
              Reject Invoice
            </Button>
            <Button 
              onClick={() => handleApproveReject('APPROVED')}
              className="w-full sm:w-auto bg-green-500 text-white hover:bg-green-600"
            >
              Approve Invoice
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default InvoiceDetails
