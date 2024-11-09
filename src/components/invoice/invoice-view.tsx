
"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Invoice } from "@prisma/client"
import { format } from "date-fns"
import { useRouter } from 'next/navigation'
import {  pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'
import Image from 'next/image'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

interface InvoiceViewProps {
  invoice: Invoice
}

export function InvoiceView({ invoice }: InvoiceViewProps) {
  const router = useRouter()


  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">View Invoice</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[90vh]">
        <DialogHeader>
          <DialogTitle>Invoice Details</DialogTitle>
          <DialogDescription>
            Invoice #{invoice.invoice_number}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col md:flex-row gap-4 h-full overflow-hidden">
          <div className="flex-1 overflow-hidden relative">
            <Image 
              src={invoice?.invoice_file || "/placeholder-invoice.png"} 
              alt={`Invoice ${invoice.invoice_number}`} 
              fill 
              className="object-cover"
            /> 
          </div>
          <div className="w-full md:w-64 space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Invoice Summary</h3>
              <div className="text-sm">
                <p><span className="font-medium">Description:</span> {invoice.description}</p>
                <p><span className="font-medium">Total Price:</span> {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(Number(invoice.total_price) || 0)}</p>
                <p><span className="font-medium">Due Date:</span> {format(new Date(invoice.due_date), "yyyy-MM-dd")}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Button className="w-full" onClick={() => {}}>Save As</Button>
              <Button className="w-full" onClick={() => window.print()}>Print</Button>
            </div>
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => router.push(`/milestone`)}>View Milestones</Button>
            <Button variant="outline" onClick={() => router.push(`/funding-request`)}>View Funding</Button>
          </div>
   
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
