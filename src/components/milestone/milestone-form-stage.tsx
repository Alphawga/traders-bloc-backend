'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Invoice, Milestone } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useState, ChangeEvent } from "react"
import { trpc } from "@/app/_providers/trpc-provider"
import { useToast } from "@/hooks/use-toast"
import { milestoneSchema } from "@/lib/dtos"
import { z } from "zod"
import Image from "next/image"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type MilestoneFormValues = z.infer<typeof milestoneSchema>;

interface MilestoneFormStageProps {
  invoice: Invoice
  milestones: Milestone[]
  disabled?: boolean
  onSuccess?: () => void
}

export function MilestoneFormStage({ invoice, milestones, onSuccess }: MilestoneFormStageProps) {
  const { toast } = useToast()
  const [previewUrl, setPreviewUrl] = useState<string | null>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const utils = trpc.useUtils()

  const form = useForm<MilestoneFormValues>({
    resolver: zodResolver(milestoneSchema),
    defaultValues: {
      description: "",
      supporting_doc: "",
      bank_account_no: "",
      bank_name: "",
      due_date: new Date(),
      payment_amount: 0,
      invoice_id: invoice.id,
      id: undefined,
      title: "",
    },
  })

  const resetForm = () => {
    form.reset({
      id: undefined,
      title: "",
      description: "",
      supporting_doc: "",
      bank_account_no: "",
      bank_name: "",
      due_date: new Date(),
      invoice_id: invoice.id,
      payment_amount: 0
    })
    setPreviewUrl("")
  }

  const addMilestone = trpc.createMilestone.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        variant: "default",
        description: "Milestone added successfully"
      })
      utils.getUserData.invalidate()
      resetForm()
    },
    onError: (error) => {
      toast({
        title: "Error",
        variant: "destructive",
        description: error.message
      })
    },
  })

  const uploadImageMutation = trpc.uploadImage.useMutation({
    onSuccess: (res) => {
      console.log("Upload successful:", res.url)
    },
    onError: (error) => {
      console.error("Error uploading to Cloudinary:", error)
    },
  })

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files?.[0]
    if (file) {
      try {
        const base64File = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })

        const response = await uploadImageMutation.mutateAsync({ file: base64File })
        if (response.url) {
          form.setValue("supporting_doc", response.url)
          setPreviewUrl(response.url)
        }
      } catch (error) {
        console.error("Error in file upload:", error)
      }
    }
  }

  const onSubmit = async (data: MilestoneFormValues) => {
    if (isSubmitting) return
    
    setIsSubmitting(true)
    try {
      await addMilestone.mutateAsync({ ...data, invoice_id: invoice.id })
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Milestone Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Milestone Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bank_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bank_account_no"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Account No</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="due_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                          onChange={(e) => field.onChange(new Date(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="payment_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Amount ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="supporting_doc"
                render={({  }) => (
                  <FormItem>
                    <FormLabel>Supporting Document</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="file"
                          onChange={handleFileChange}
                          accept="image/*,.pdf"
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                        />
                        {previewUrl && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(previewUrl, '_blank')}
                          >
                            View File
                          </Button>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                    {previewUrl && (
                      <div className="mt-2">
                        <p className="text-sm font-medium mb-1">Preview:</p>
                        <Image
                          src={previewUrl}
                          alt="Document preview"
                          width={200}
                          height={200}
                          objectFit="contain"
                        />
                      </div>
                    )}
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add Milestone'}
                </Button>
              </div>
            </form>
          </Form>

          {/* Existing Milestones Table */}
          {milestones && milestones.length > 0 ? (
            <div className="mt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Payment Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {milestones.map((milestone) => (
                    <TableRow key={milestone.id}>
                      <TableCell>{milestone.title}</TableCell>
                      <TableCell>{milestone.description}</TableCell>
                      <TableCell>
                        {new Date(milestone.due_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>${milestone.payment_amount}</TableCell>
                      <TableCell>{milestone.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No milestones added yet
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onSuccess} disabled={!milestones || milestones.length === 0} className="w-full bg-blue-500 hover:bg-blue-600 text-white">Continue to Funding Request</Button>
      </div>
    </div>
  )
} 