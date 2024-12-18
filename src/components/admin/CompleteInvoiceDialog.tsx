'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { trpc } from "@/app/_providers/trpc-provider"
import { Milestone } from "@prisma/client"

interface CompleteInvoiceDialogProps {
  invoiceId: string
  invoiceNumber: string
  milestones: Milestone[]
  onSuccess?: () => void
}

export function CompleteInvoiceDialog({ 
  invoiceId, 
  invoiceNumber,
  milestones,
  onSuccess 
}: CompleteInvoiceDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()
  const utils = trpc.useContext()

  const { mutate: completeInvoice, isLoading } = trpc.completeInvoiceAndNotifyCollections.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Invoice marked as completed and sent to collections",
      })
      setIsOpen(false)
      onSuccess?.()
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const allMilestonesCompleted = milestones.every(m => m.status === 'APPROVED')
  const totalAmount = milestones.reduce((sum, m) => sum + Number(m.payment_amount), 0)

  if (!allMilestonesCompleted) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Complete & Send to Collections
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete Invoice #{invoiceNumber}</DialogTitle>
          <DialogDescription>
            All milestones are completed. This action will mark the invoice as fully treated
            and send it to the collections department.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2">Milestone Summary</h4>
            {milestones.map((milestone) => (
              <div key={milestone.id} className="flex justify-between text-sm">
                <span>{milestone.title}</span>
                <span>${Number(milestone.payment_amount).toFixed(2)}</span>
              </div>
            ))}
            <div className="mt-2 pt-2 border-t flex justify-between font-medium">
              <span>Total Amount</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={() => completeInvoice({ invoiceId })}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Complete & Send"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 