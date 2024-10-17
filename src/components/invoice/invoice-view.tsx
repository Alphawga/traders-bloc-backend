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
import { Invoice } from "@prisma/client"
import { format } from "date-fns"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface InvoiceViewProps {
  invoice: Invoice
}

export function InvoiceView({ invoice }: InvoiceViewProps) {
    const  router = useRouter()
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">View Invoice</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invoice Details</DialogTitle>
          <DialogDescription>
            Invoice #{invoice.invoice_number}
          </DialogDescription>
        </DialogHeader>
        <div className="relative w-full h-40 mb-4">
          <Image
            src={invoice?.invoice_file || "/placeholder-invoice.png"}
            alt={`Invoice #${invoice.invoice_number}`}
            fill
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold">Description:</span>
            <span className="col-span-3">{invoice.description}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold">Total Price:</span>
            <span className="col-span-3">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(Number(invoice.total_price) || 0)}
            </span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold">Due Date:</span>
            <span className="col-span-3">
              {format(new Date(invoice.due_date), "yyyy-MM-dd")}
            </span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => router.push(`/invoices/${invoice.id}/milestones`)}>View Milestones</Button>
          <Button variant="outline" onClick={() => router.push(`/invoices/${invoice.id}/funding`)}>View Funding</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}