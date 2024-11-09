"use client"

import { useRouter } from "next/navigation"
import Image from 'next/image'
import { useToast } from "@/hooks/use-toast"
import useUserStore from "@/store/user-store"
import { trpc } from "@/app/_providers/trpc-provider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, Clock, Upload } from "lucide-react"

const businessNameKYC = {
  id: 'businessName',
  label: 'Business Name',
  description: 'Official business registration document',
  maxSize: 10 * 1024 * 1024, // 10MB
  acceptedFormats: ['.pdf', '.png', '.jpg', '.jpeg'],
}

const legalAddressKYC = {
  id: 'legalAddress',
  label: 'Legal Address',
  description: 'Proof of business address',
  maxSize: 10 * 1024 * 1024,
  acceptedFormats: ['.pdf', '.png', '.jpg', '.jpeg'],
}

const registrationNumberKYC = {
  id: 'registrationNumber',
  label: 'Registration Number',
  description: 'Business registration number document',
  maxSize: 10 * 1024 * 1024,
  acceptedFormats: ['.pdf', '.png', '.jpg', '.jpeg'],
}

const taxInformationKYC = {
  id: 'taxInformation',
  label: 'Tax Information',
  description: 'Tax registration certificate',
  maxSize: 10 * 1024 * 1024,
  acceptedFormats: ['.pdf', '.png', '.jpg', '.jpeg'],
}

const incorporationDocumentsKYC = {
  id: 'incorporationDocuments',
  label: 'Incorporation Documents',
  description: 'Certificate of incorporation',
  maxSize: 10 * 1024 * 1024,
  acceptedFormats: ['.pdf', '.png', '.jpg', '.jpeg'],
}

const requiredDocuments = [
  businessNameKYC,
  legalAddressKYC,
  registrationNumberKYC,
  taxInformationKYC,
  incorporationDocumentsKYC,
]

const kycDocumentSchema = z.object({
  businessName: z.string().optional(),
  legalAddress: z.string().optional(),
  registrationNumber: z.string().optional(),
  taxInformation: z.string().optional(),
  incorporationDocuments: z.string().optional(),
})

type FormValues = z.infer<typeof kycDocumentSchema>

export default function KYB() {
  const router = useRouter()
  const { user } = useUserStore()
  const { toast } = useToast()
  const [progress, setProgress] = useState(0)
  
  const form = useForm<FormValues>({
    resolver: zodResolver(kycDocumentSchema),
    defaultValues: {
      businessName: '',
      legalAddress: '',
      registrationNumber: '',
      taxInformation: '',
      incorporationDocuments: '',
    }
  })

  useEffect(() => {
    if (user?.kyc_documents) {
      requiredDocuments.forEach((doc) => {
        const userDoc = user.kyc_documents.find(userDoc => userDoc.document_type === doc.id)
        if (userDoc) {
          form.setValue(doc.id as keyof FormValues, userDoc.document_url)
        }
      })
    }
  }, [user, form])

  useEffect(() => {
    const values = form.getValues()
    const completedFields = Object.values(values).filter(Boolean).length
    setProgress((completedFields / requiredDocuments.length) * 100)
  }, [form])

  const uploadImageMutation = trpc.uploadImage.useMutation()
  const upsertKYCDocument = trpc.upsertKYCDocument.useMutation()

  const handleFileChange = async (documentType: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target?.files?.[0]
    if (!file) return

    const docConfig = requiredDocuments.find(doc => doc.id === documentType)
    if (!docConfig) return

    if (file.size > docConfig.maxSize) {
      toast({
        title: "Error",
        description: `File size exceeds the maximum limit of ${docConfig.maxSize / (1024 * 1024)}MB`,
        variant: "destructive",
      })
      return
    }

    if (!docConfig.acceptedFormats.some(format => file.name.toLowerCase().endsWith(format))) {
      toast({
        title: "Error",
        description: `Invalid file format. Accepted formats are: ${docConfig.acceptedFormats.join(', ')}`,
        variant: "destructive",
      })
      return
    }

    try {
      const base64File = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const uploadResponse = await uploadImageMutation.mutateAsync({ file: base64File })
      
      if (uploadResponse.url) {
        form.setValue(documentType as keyof FormValues, uploadResponse.url)
        toast({
          title: "Success",
          description: "Document uploaded successfully"
        })
        // Reset the file input
        event.target.value = ''
      }
    } catch (error) {
      console.error("Error in file upload:", error)
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      })
    }
  }

  const onSubmit = async (data: FormValues) => {
    const allDocumentsUploaded = Object.values(data).every(Boolean)
    
    if (!allDocumentsUploaded) {
      toast({
        title: "Warning",
        description: "Please upload all required documents",
        variant: "destructive",
      })
      return
    }

    try {
      await upsertKYCDocument.mutateAsync(Object.entries(data).map(([key, value]) => ({
        document_type: key,
        document_url: value || '',
        status: 'PENDING'
      })))

      toast({
        title: "Success",
        description: "All documents submitted successfully"
      })

      router.push('/dashboard')
    } catch (error) {
      console.error('Error submitting documents:', error)
      toast({
        title: "Error",
        description: "Failed to submit documents",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Know Your Business (KYB)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Verification Progress</h2>
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">{Math.round(progress)}% complete</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {requiredDocuments.map((doc) => (
                <FormField
                  key={doc.id}
                  control={form.control}
                  name={doc.id as keyof FormValues}
                  render={({ field }) => (
                    <FormItem>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                            <div className="flex-1">
                              <FormLabel className="text-lg font-semibold">{doc.label}</FormLabel>
                              <p className="text-sm text-muted-foreground">{doc.description}</p>
                              <div className="flex items-center mt-2">
                                <Badge variant={field.value ? "default" : "secondary"} className="mr-2">
                                  {field.value ? (
                                    <>
                                      <CheckCircle2 className="w-4 h-4 mr-1" />
                                      Uploaded
                                    </>
                                  ) : (
                                    <>
                                      <AlertCircle className="w-4 h-4 mr-1" />
                                      Not Uploaded
                                    </>
                                  )}
                                </Badge>
                                {field.value && (
                                  <Badge variant="outline">
                                    <Clock className="w-4 h-4 mr-1" />
                                    Pending Review
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <FormControl>
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="file"
                                    id={`${doc.id}-input`}
                                    className="hidden"
                                    onChange={(e) => handleFileChange(doc.id, e)}
                                    accept={doc.acceptedFormats.join(',')}
                                  />
                                  <Button 
                                    type="button" 
                                    variant="outline"
                                    className="cursor-pointer"
                                    onClick={() => document.getElementById(`${doc.id}-input`)?.click()}
                                  >
                                    <Upload className="w-4 h-4 mr-2" />
                                    {field.value ? 'Replace' : 'Upload'}
                                  </Button> 
                                  {field.value && (
                                    <Image
                                      src={field.value}
                                      alt={`${doc.id} preview`}
                                      width={50}
                                      height={50}
                                      objectFit="contain"
                                    />
                                  )}
                                </div>
                              </FormControl>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}

              <div className="flex justify-end mt-6">
                <Button type="submit" size="lg">
                  Submit All Documents
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}