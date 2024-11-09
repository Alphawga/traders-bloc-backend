'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { trpc } from "@/app/_providers/trpc-provider"
import { useToast } from "@/hooks/use-toast"
import { Invoice, Milestone } from "@prisma/client"
import { fundingRequestSchema } from "@/lib/dtos"
import { z } from "zod"

interface FundingRequestStageProps {
  invoice: Invoice
  milestones: Milestone[]
  disabled?: boolean
  onSuccess?: () => void
}

export function FundingRequestStage({ invoice, milestones, onSuccess }: FundingRequestStageProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()

  const totalMilestoneAmount = milestones.reduce(
    (sum, milestone) => sum + milestone.payment_amount,
    0
  )
  const interestRate = invoice.interest_rate || 1

  const form = useForm({
    resolver: zodResolver(fundingRequestSchema),
    defaultValues: {
      invoice_id: invoice.id,
      requested_amount: 0,
      your_contribution: 0,
    },
  })

  const watchedLoanRequest = form.watch('requested_amount')
  const watchedContribution = form.watch('your_contribution')
  
  const interestAmount = (watchedLoanRequest * interestRate) / 100
  const profit = (invoice?.total_price ?? 0) - totalMilestoneAmount - interestAmount

  const isFormValid = () => {
    const minimumContribution = watchedLoanRequest * 0.1
    const totalRequestedAmount = watchedLoanRequest + watchedContribution
    
    return watchedContribution >= minimumContribution && 
           totalRequestedAmount <= totalMilestoneAmount
  }

  const createFundingRequest = trpc.createFundingRequest.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Funding request created successfully",
      })
      utils.getUserData.invalidate()
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

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Funding Request Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
         
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span>Total Invoice Amount:</span>
              <span className="font-semibold">${invoice?.total_price?.toFixed(2) ?? 0}</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span>Total Milestone Cost:</span>
              <span className="font-semibold">${totalMilestoneAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span>Interest Rate:</span>
              <span className="font-semibold">{interestRate}%</span>
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
          <CardTitle>Create Funding Request</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Form fields */}
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
                      Your Contribution Amount (min ${(totalMilestoneAmount * 0.1).toFixed(2)})
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
                Submit Request
              </Button>
              
              {!isFormValid() && watchedLoanRequest > 0 && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {watchedContribution < totalMilestoneAmount * 0.1 
                      ? `Contribution must be at least ${(totalMilestoneAmount * 0.1).toFixed(2)} (10% of loan request)`
                      : `Total funding request (${(watchedLoanRequest + watchedContribution).toFixed(2)}) cannot exceed milestone amount (${totalMilestoneAmount.toFixed(2)})`
                    }
                  </AlertDescription>
                </Alert>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
} 