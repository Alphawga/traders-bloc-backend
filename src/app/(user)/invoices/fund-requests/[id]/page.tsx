'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { trpc } from "@/app/_providers/trpc-provider"
import { useToast } from "@/hooks/use-toast"
import useUserStore from "@/store/user-store"
import { z } from "zod"
import { useParams } from "next/navigation"
import { fundingRequestSchema } from "@/lib/dtos"
import { Invoice, Milestone } from "@prisma/client"

const SummarySkeleton = () => (
  <div className="grid grid-cols-2 gap-4">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="flex justify-between p-2 bg-gray-50 rounded">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-6 w-24" />
      </div>
    ))}
  </div>
)

const FormSkeleton = () => (
  <div className="space-y-8">
    <div className="space-y-4">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-10 w-full" />
    </div>
    <div className="space-y-4">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-10 w-full" />
    </div>
    <Skeleton className="h-10 w-full" />
  </div>
)

function FundingRequest() {
  const { id } = useParams()
  const { toast } = useToast()
  const { user } = useUserStore()
  const utils = trpc.useUtils()
  const [isLoading, setIsLoading] = useState(true)
  const [invoiceData, setInvoiceData] = useState<{
    invoice: Invoice;
    milestones: Milestone[];
    totalInvoiceAmount: number;
    totalMilestoneAmount: number;
    paymentTerms: string;
    interestRate: number;
  } | null>(null)

  useEffect(() => {
    const fetchInvoiceData = async () => {
      setIsLoading(true)
      try {
        const invoice = user?.invoices.find((inv) => inv.id === id)
        if (!invoice) {
          setInvoiceData(null)
          return
        }

        const milestones = invoice.milestones || []
        const totalInvoiceAmount = invoice.total_price || 0
        const totalMilestoneAmount = milestones.reduce(
          (sum, milestone) => sum + milestone.payment_amount,
          0
        )
        const paymentTerms = invoice.payment_terms || ''
        const interestRate = invoice.interest_rate || 1 // Default to 1% if no interest rate is found

        setInvoiceData({
          invoice,
          milestones,
          totalInvoiceAmount,
          totalMilestoneAmount,
          paymentTerms,
          interestRate,
        })
      } catch (error) {
        console.error('Error fetching invoice data:', error)
        toast({
          title: "Error",
          description: "Failed to load invoice data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchInvoiceData()
    }
  }, [id, user, toast])

  const form = useForm({
    resolver: zodResolver(fundingRequestSchema),
    defaultValues: {
      invoice_id: id as string,
      requested_amount: 0,
      your_contribution: 0,
    },
  })

  const watchedLoanRequest = form.watch('requested_amount')
  const watchedContribution = form.watch('your_contribution')
  
  const interestAmount = invoiceData
    ? (watchedLoanRequest * invoiceData.interestRate) / 100
    : 0
  const profit = invoiceData
    ? invoiceData.totalInvoiceAmount - invoiceData.totalMilestoneAmount - interestAmount
    : 0

  const isFormValid = () => {
    if (!invoiceData) return false
    
    const minimumContribution = watchedLoanRequest * 0.1
    const totalRequestedAmount = watchedLoanRequest + watchedContribution
    
    if (watchedContribution < minimumContribution) {
      return false
    }
    
    if (totalRequestedAmount > invoiceData.totalMilestoneAmount) {
      return false
    }
    
    return true
  }

  const createFundingRequest = trpc.createFundingRequest.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Funding request created successfully",
      })
      utils.getUserData.invalidate()
      form.reset()
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const filteredRequests = user?.funding_requests?.filter(
    (request) => request.invoice_id === id
  )

  const onSubmit = (data: z.infer<typeof fundingRequestSchema>) => {
    if (!isFormValid()) {
      toast({
        title: "Error",
        description: "Invalid contribution amount or total funding request exceeds milestone amount",
        variant: "destructive",
      })
      return
    }
    createFundingRequest.mutate(data)
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
          </CardHeader>
          <CardContent>
            <SummarySkeleton />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent>
            <FormSkeleton />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!invoiceData) {
    return (
      <Alert variant="destructive">
        <AlertTitle>No Invoice Found</AlertTitle>
        <AlertDescription>
          Could not find the invoice you`&apos;`re looking for. Please check the invoice ID and try again.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>#{invoiceData.invoice?.invoice_number} Funding Request Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span>Total Invoice Amount:</span>
              <span className="font-semibold">
                ${invoiceData.totalInvoiceAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span>Total Milestone Cost:</span>
              <span className="font-semibold">
                ${invoiceData.totalMilestoneAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span>Payment Terms:</span>
              <span className="font-semibold">{invoiceData.paymentTerms}</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span>Interest Rate:</span>
              <span className="font-semibold">{invoiceData.interestRate}%</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span>Interest Amount:</span>
              <span className="font-semibold">${interestAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span>Estimated Profit:</span>
              <span className="font-semibold text-green-600">${profit.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Create New Funding Request</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="requested_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Loan Request</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="$0.00"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="your_contribution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Your Contribution Amount (min ${(invoiceData.totalMilestoneAmount * 0.1).toFixed(2)})
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="$0.00"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                disabled={createFundingRequest.isLoading || !isFormValid()}
                className="w-full"
              >
                {createFundingRequest.isLoading ? "Submitting..." : "Submit request"}
              </Button>
              
              {!isFormValid() && watchedLoanRequest > 0 && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {watchedContribution < invoiceData.totalMilestoneAmount * 0.1 
                      ? `Contribution must be at least ${(invoiceData.totalMilestoneAmount * 0.1).toFixed(2)} (10% of loan request)`
                      : `Total funding request (${(watchedLoanRequest + watchedContribution).toFixed(2)}) cannot exceed milestone amount (${invoiceData?.totalMilestoneAmount.toFixed(2)})`
                    }
                  </AlertDescription>
                </Alert>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Funding Requests History</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRequests && filteredRequests.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Loan Request</TableHead>
                  <TableHead>Contribution</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      {new Date(request.submission_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>${request.requested_amount.toFixed(2)}</TableCell>
                    <TableCell>${request.your_contribution.toFixed(2)}</TableCell>
                    <TableCell
                      className={`${
                        request.status === "PENDING"
                          ? "text-yellow-500"
                          : request.status === "APPROVED"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {request.status}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No funding requests found for this invoice
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default FundingRequest