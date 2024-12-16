'use client'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { ApprovalStatus, Invoice, Milestone } from "@prisma/client"
import { trpc } from "@/app/_providers/trpc-provider"
import { toast } from "@/hooks/use-toast"
import Image from "next/image"
import { useState } from "react"
import { Dialog as ImageDialog } from "@/components/ui/dialog"

interface MilestoneDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  milestone: Milestone & {
    cosigned_by?: { name: string } | null
  }
  invoice: Invoice
}

export function MilestoneDetailsDialog({ isOpen, onClose, milestone, invoice }: MilestoneDetailsDialogProps) {
  const [showImageDialog, setShowImageDialog] = useState(false);
  const utils = trpc.useUtils()
  
  const coSignMilestone = trpc.coSignMilestone.useMutation({
    onSuccess: () => {
      toast({ description: "Milestone co-signed successfully" })
      utils.getAllMilestones.invalidate()
      onClose()
    },
    onError: (error) => {
      toast({ 
        description: error.message || "Failed to co-sign milestone", 
        variant: "destructive" 
      })
    }
  })

  const handleCoSign = () => {
    coSignMilestone.mutate({ milestone_id: milestone.id })
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl">


          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Milestone Information</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p className="text-gray-500">Title:</p>
                <p>{milestone.title}</p>
                <p className="text-gray-500">Description:</p>
                <p>{milestone.description}</p>
                <p className="text-gray-500">Amount:</p>
                <p>${milestone.payment_amount.toFixed(2)}</p>
                <p className="text-gray-500">Due Date:</p>
                <p>{format(new Date(milestone.due_date), 'MMM dd, yyyy')}</p>
                <p className="text-gray-500">Status:</p>
                <p>{milestone.status}</p>
                <p className="text-gray-500">Co-signed:</p>
                <p>{milestone.is_cosigned ? `Yes - by ${milestone.cosigned_by?.name}` : 'No'}</p>
              </div>

              {/* Supporting Document Preview */}
              {milestone.supporting_doc && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Supporting Document</h4>
                  <div 
                    className="relative w-full h-48 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setShowImageDialog(true)}
                  >
                    <Image
                      src={milestone.supporting_doc}
                      alt="Supporting Document"
                      fill
                      className="object-cover rounded-md"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-20 transition-all">
                      <span className="text-white opacity-0 hover:opacity-100">Click to view</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Invoice Information</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p className="text-gray-500">Invoice Number:</p>
                <p>{invoice.invoice_number}</p>
                <p className="text-gray-500">Total Amount:</p>
                <p>${invoice.total_price?.toFixed(2) ?? 0}</p>
                <p className="text-gray-500">Status:</p>
                <p>{invoice.status}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            {milestone.status === ApprovalStatus.APPROVED && !milestone.is_cosigned && (
              <Button onClick={handleCoSign}>
                Co-sign Milestone
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Full Image Dialog */}
      <ImageDialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Supporting Document</DialogTitle>
          </DialogHeader>
          <div className="relative w-full h-full">
            {milestone.supporting_doc && (
              <Image
                src={milestone.supporting_doc}
                alt="Supporting Document"
                fill
                className="object-contain"
                quality={100}
              />
            )}
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowImageDialog(false)}
            className="absolute top-2 right-2"
          >
            Close
          </Button>
        </DialogContent>
      </ImageDialog>
    </>
  )
} 