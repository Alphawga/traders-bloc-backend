'use client'

import { useParams } from "next/navigation"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { trpc } from "@/app/_providers/trpc-provider"
import { toast } from "@/hooks/use-toast"
import Image from "next/image"

function KYCDocumentDetails() {
  const params = useParams()
  const id = params.id as string

  const { data: kyc, isLoading, refetch } = trpc.getKYCDocument.useQuery({ id })

  const updateKycStatus = trpc.updateKYCDocument.useMutation({
    onSuccess: () => {
      toast({
        description: "KYC status updated successfully"
      })
      refetch()
    },
    onError: () => {
      toast({
        description: "Failed to update KYC status",
        variant: "destructive"
      })
    }
  })

  const handleApproveReject = (status: 'APPROVED' | 'REJECTED') => {
    updateKycStatus.mutate({ kyc_id: id, status })
  }

  if (isLoading) {
    return <div className="p-6">Loading...</div>
  }

  if (!kyc) {
    return <div className="p-6">KYC document not found</div>
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">KYC Document Review</h1>
            <p className={`mt-2 inline-block px-3 py-1 rounded-full text-sm font-semibold
              ${kyc.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                kyc.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'}`}>
              {kyc.status}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">User Information</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {kyc.user.first_name} {kyc.user.last_name}</p>
              <p><span className="font-medium">Company:</span> {kyc.user.company_name}</p>
              <p><span className="font-medium">Industry:</span> {kyc.user.industry}</p>
              <p><span className="font-medium">Email:</span> {kyc.user.email}</p>
              <p><span className="font-medium">Tax ID:</span> {kyc.user.tax_id}</p>
              <p><span className="font-medium">Document Type:</span> {kyc.document_type}</p>
              <p><span className="font-medium">Submission Date:</span> {format(new Date(kyc.submission_date), 'MMM dd, yyyy')}</p>
              {kyc.review_date && (
                <p><span className="font-medium">Review Date:</span> {format(new Date(kyc.review_date), 'MMM dd, yyyy')}</p>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Document Preview</h2>
            <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              {kyc.document_url ? (
                <Image
                  src={kyc.document_url}
                  alt="KYC Document"
                  width={500}
                  height={300}
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <span className="text-gray-400">No document available</span>
              )}
            </div>
          </div>
        </div>

        {kyc.status === 'PENDING' && (
          <div className="flex gap-4 justify-end mt-8 pt-6 border-t">
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
    </div>
  )
}

export default KYCDocumentDetails
