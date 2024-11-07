'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Steps } from "@/components/ui/steps"
import { InvoiceFormStage } from "@/components/invoice/invoice-form-stage"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import useUserStore from "@/store/user-store"
import { MilestoneFormStage } from "@/components/milestone/milestone-form-stage"
import { FundingRequestStage } from "@/components/funding-request/funding-request-stage"
import { Milestone } from "@prisma/client"
import { Invoice } from "@prisma/client"
import { toast } from "@/hooks/use-toast"

export default function SubmitInvoicePage() {
  const router = useRouter()
  const { user } = useUserStore()
  const [currentStep, setCurrentStep] = useState(1)
  const [latestInvoice, setLatestInvoice] = useState<Invoice | null>(null)


  const invoiceMilestones = user?.milestones.filter(milestone => milestone.invoice_id === latestInvoice?.id)

  

  const steps = [
    {
      title: "Create Invoice",
      description: "Submit your invoice details",
      status: currentStep >= 2 ? "complete" : currentStep === 1 ? "current" : "upcoming"
    } as const,
    {
      title: "Add Milestones",
      description: "Break down your project into milestones",
      status: currentStep >= 3 ? "complete" : currentStep === 2 ? "current" : "upcoming"
    } as const,
    {
      title: "Request Funding",
      description: "Submit your funding request",
      status: currentStep >= 4 ? "complete" : currentStep === 3 ? "current" : "upcoming"
    } as const,
  ]

  useEffect(() => {
    const formElement = document.getElementById(`step-${currentStep}`);
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentStep]);

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <Card className="mb-6">
          <CardHeader className="py-4">
            <CardTitle className="text-xl font-bold">Submit Your Invoice</CardTitle>
          </CardHeader>
          <CardContent>
            <Steps steps={steps} />
            {currentStep <= 3 && (
              <div className="sm:hidden">
                <p className="text-sm font-medium text-gray-500">Step {currentStep} of 3</p>
                <h2 className="mt-2 text-lg font-medium text-gray-900">{steps[currentStep - 1].title}</h2>
                <p className="mt-1 text-sm text-gray-500">{steps[currentStep - 1].description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card id="step-1" className={currentStep !== 1 ? "opacity-50" : ""}>
          <CardHeader className="py-4">
            <CardTitle className="text-lg font-semibold flex items-center justify-between">
              Step 1: Create Invoice
              {currentStep > 1 && (
                <button 
                  onClick={() => setCurrentStep(1)}
                  className="text-sm text-blue-500 hover:text-blue-700"
                >
                  Edit
                </button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <InvoiceFormStage 
              invoice={null}
              disabled={currentStep !== 1}
              onSuccess={(data) => {
                setLatestInvoice(data)
                setCurrentStep(2)}}
            />
          </CardContent>
        </Card>

        <Card id="step-2" className={currentStep !== 2 ? "opacity-50" : ""}>
          <CardHeader className="py-4">
            <CardTitle className="text-lg font-semibold flex items-center justify-between">
              Step 2: Add Milestones
              {currentStep > 2 && (
                <button 
                  onClick={() => setCurrentStep(2)}
                  className="text-sm text-blue-500 hover:text-blue-700"
                >
                  Edit
                </button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentStep >= 2 && (
             <MilestoneFormStage 
                invoice={latestInvoice as Invoice}
                milestones={invoiceMilestones as Milestone[]}
                onSuccess={() => {
                  setCurrentStep(3)}}
              />
            )}
          </CardContent>
        </Card>

        <Card id="step-3" className={currentStep !== 3 ? "opacity-50" : ""}>
          <CardHeader className="py-4">
            <CardTitle className="text-lg font-semibold flex items-center justify-between">
              Step 3: Request Funding
              {currentStep > 3 && (
                <button 
                  onClick={() => setCurrentStep(3)}
                  className="text-sm text-blue-500 hover:text-blue-700"
                >
                  Edit
                </button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentStep >= 3 && (
              <FundingRequestStage
                invoice={latestInvoice as Invoice}
                milestones={invoiceMilestones as Milestone[]}
                onSuccess={() => {
                
                  setCurrentStep(4)
                toast({
                  title: "Funding Request Submitted",
                  description: "Your funding request is now under review."
                })
                router.push('/invoices')
              }}
              />
            )}
          </CardContent>
        </Card>

        {currentStep === 4 && (
          <Card id="step-4" className="bg-green-50">
            <CardContent className="py-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-green-700 mb-2">
                  All Steps Completed!
                </h3>
                <p className="text-green-600 mb-4">
                  Your funding request is now under review.
                </p>
                <button
                  className="text-blue-500 hover:text-blue-700"
                  onClick={() => router.push('/invoices')}
                >
                  View All Invoices →
                </button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}