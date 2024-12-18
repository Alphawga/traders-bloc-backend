'use client'

import { useParams } from "next/navigation"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { trpc } from "@/app/_providers/trpc-provider"
import { toast } from "@/hooks/use-toast"

function FundingRequestDetails() {
  const params = useParams()
  const id = params.id as string

  const { data: request, isLoading, refetch } = trpc.getFundingRequest.useQuery({ id })

  const updateFundingRequestStatus = trpc.updateFundingRequest.useMutation({
    onSuccess: () => {
      toast({
        description: "Funding request status updated successfully"
      })
      refetch()
    },
    onError: () => {
      toast({
        description: "Failed to update funding request status",
        variant: "destructive"
      })
    }
  })

  const handleApproveReject = (status: 'APPROVED' | 'REJECTED') => {
    updateFundingRequestStatus.mutate({ funding_request_id: id, status })
  }

  if (isLoading) {
    return <div className="p-6">Loading...</div>
  }

  if (!request) {
    return <div className="p-6">Funding request not found</div>
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Funding Request Details</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Request Information</h2>
          <div className="space-y-2">
            <p><span className="font-medium">User:</span> {request.user.first_name} {request.user.last_name}</p>
            <p><span className="font-medium">Invoice Number:</span> {request.invoice.invoice_number}</p>
            <p><span className="font-medium">Invoice Description:</span> {request.invoice.description}</p>
            
            <p><span className="font-medium">Requested Amount:</span> ${request.requested_amount.toFixed(2)}</p>
            <p><span className="font-medium">Your Contribution:</span> ${request.your_contribution.toFixed(2)}</p>
            <p><span className="font-medium">Submission Date:</span> {format(new Date(request.submission_date), 'MMM dd, yyyy HH:mm:ss')}</p>
            <p><span className="font-medium">Status:</span> {request.status}</p>
            {request.review_date && (
              <p><span className="font-medium">Review Date:</span> {format(new Date(request.review_date), 'MMM dd, yyyy HH:mm:ss')}</p>
            )}
          </div>
        </div>
      </div>

      {request.status === 'PENDING' && (
        <div className="flex gap-4">
          <Button 
            onClick={() => handleApproveReject('REJECTED')} 
            variant="outline"
            className="bg-red-500 text-white hover:bg-red-600"
          >
            Reject
          </Button>
          <Button 
            onClick={() => handleApproveReject('APPROVED')}
            className="bg-green-500 text-white hover:bg-green-600"
          >
            Approve
          </Button>
        </div>
      )}
    </div>
  )
}

export default FundingRequestDetails
