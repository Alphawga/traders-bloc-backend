'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { trpc } from "@/app/_providers/trpc-provider"



interface AssignInvoicesDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedInvoices: string[]
  onSuccess?: () => void
}

export function AssignInvoicesDialog({
  isOpen,
  onOpenChange,
  selectedInvoices,
  onSuccess
}: AssignInvoicesDialogProps) {
  const { toast } = useToast()
  const { data: creditOpsLeads } = trpc.getCreditOpsLeads.useQuery()

  const { mutate: assignInvoices, isLoading } = trpc.assignInvoicesToAdmin.useMutation({
    onSuccess: () => {
      toast({ description: "Invoices assigned successfully" })
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error) => {
      toast({ 
        description: error.message || "Failed to assign invoices", 
        variant: "destructive" 
      })
    }
  })

  const handleAssignInvoices = (adminId: string) => {
    assignInvoices({
      invoice_ids: selectedInvoices,
      admin_id: adminId,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Invoices to Credit Ops Lead</DialogTitle>
          <DialogDescription>
            Select a Credit Ops Lead to assign {selectedInvoices.length} selected invoice{selectedInvoices.length !== 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {creditOpsLeads?.map((admin) => (
            <div key={admin.id} className="flex items-center justify-between p-2 border rounded">
              <div>
                <p className="font-medium">{admin.name}</p>
                <p className="text-sm text-gray-500">{admin.email}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {admin.pending_invoices} pending invoices
                </span>
                <Button
                  onClick={() => handleAssignInvoices(admin.id)}
                  size="sm"
                  disabled={isLoading}
                >
                  Assign
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
} 