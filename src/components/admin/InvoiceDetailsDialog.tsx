'use client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { ApprovalStatus, Invoice } from "@prisma/client"
import Image from "next/image"

interface InvoiceDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  invoice: Invoice & {
    user: { first_name: string; last_name: string }
    vendor: { name: string }
  }
  onMarkDelivered?: (id: string) => void
  canMarkDelivered?: boolean
}

export function InvoiceDetailsDialog({ 
  isOpen, 
  onClose, 
  invoice, 
  onMarkDelivered,
  canMarkDelivered 
}: InvoiceDetailsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Invoice Details</DialogTitle>
          <DialogDescription>
            Review the invoice for {invoice.vendor.name}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2">Invoice Information</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Invoice Number:</span> {invoice.invoice_number}</p>
              <p><span className="font-medium">User:</span> {invoice.user.first_name} {invoice.user.last_name}</p>
              <p><span className="font-medium">Description:</span> {invoice.description}</p>
              <p><span className="font-medium">Quantity:</span> {invoice.quantity}</p>
              <p><span className="font-medium">Price per Unit:</span> ${invoice.price_per_unit.toFixed(2)}</p>
              <p><span className="font-medium">Total Price:</span> ${(invoice?.total_price??0).toFixed(2)}</p>
              <p><span className="font-medium">Payment Terms:</span> {invoice.payment_terms}</p>
              <p><span className="font-medium">Due Date:</span> {format(new Date(invoice.due_date), 'MMM dd, yyyy')}</p>
              <p><span className="font-medium">Submission Date:</span> {format(new Date(invoice.submission_date), 'MMM dd, yyyy')}</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Invoice Image</h3>
            {invoice.invoice_file ? (
              <div className="relative h-[400px] w-full">
                <Image
                  src={invoice.invoice_file}
                  alt="Invoice"
                  fill
                  className="object-contain rounded-md"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px] bg-gray-100 rounded-md">
                <p className="text-gray-500">No invoice image available</p>
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="gap-2">
          {invoice.status === ApprovalStatus.APPROVED && canMarkDelivered && onMarkDelivered && (
            <Button 
              onClick={() => onMarkDelivered(invoice.id)}
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              Mark as Delivered
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}