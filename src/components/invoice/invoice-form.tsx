"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { trpc } from "@/app/_providers/trpc-provider";
import { useToast } from "@/hooks/use-toast";
import { Invoice } from "@prisma/client"; 
import { invoiceSchema } from "@/lib/dtos";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChangeEvent, useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import Image from 'next/image';




type InvoiceFormValues = z.infer<typeof invoiceSchema>;

interface InvoiceFormProps {
  invoice: Invoice | null;
  action: 'Add' | 'Edit' | 'Delete';
}

function InvoiceForm({ invoice, action }: InvoiceFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditing = action === 'Edit';
  const [isOpen, setIsOpen] = useState(false);
  const utils = trpc.useUtils();
  const [previewUrl, setPreviewUrl] = useState<string | null>(invoice?.invoice_file || null);




  const form = useForm<InvoiceFormValues>({ 
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoice_number: invoice?.invoice_number || "",
      description: invoice?.description || "",
      quantity: invoice?.quantity || 0,
      price_per_unit: invoice?.price_per_unit || 0,
      total_price: invoice?.total_price || 0,
      payment_terms: invoice?.payment_terms || "",
      due_date: invoice?.due_date,
      invoice_file: invoice?.invoice_file || "",
      terms_agreed: false,
      vendor_id: invoice?.vendor_id || "",
    },
  });

  const addInvoice = trpc.createInvoice.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        variant: "default",
        description: "Invoice submitted successfully"
      });
      setIsOpen(false);
      utils.getUserData.invalidate();
    },
    onError: (error) => {
      toast({
        title: "Error",
        variant: "destructive",
        description: error.message
      });
    },
  });

  const vendors = trpc.getAllVendor.useQuery();

  const updateInvoice = trpc.updateInvoice.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        variant: "default",
        description: "Invoice updated successfully"
      });
      setIsOpen(false);
      utils.getUserData.invalidate();
    },
    onError: (error) => {
      toast({
        title: "Error",
        variant: "destructive",
        description: error.message
      });
    },
  });
  
  const uploadImageMutation = trpc.uploadImage.useMutation({
    onSuccess: (res) => {
      console.log("Upload successful:", res.url);
    },
    onError: (error) => {
      console.error("Error uploading to Cloudinary:", error);
    },
  });

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files?.[0];
    if (file) {
      
      try {
        const base64File = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file); 
        });
  
        const response = await uploadImageMutation.mutateAsync({ file: base64File });
        if (response.url) {
          console.log("Image uploaded", response.url)
          form.setValue("invoice_file", response.url);
          setPreviewUrl(response.url);
        }
      } catch (error) {
        console.error("Error in file upload:", error);
      }
    }
  }
  const onSubmit = (data: InvoiceFormValues) => {
    if (isEditing) {
      updateInvoice.mutate({ ...data, invoice_id: invoice?.id || "" });
    } else {
      addInvoice.mutate(data);
    }
  };
  const deleteInvoice = trpc.deleteInvoice.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        variant: "default",
        description: "Invoice deleted successfully"
      });
      setIsOpen(false);
      router.push("/invoices");
      utils.getUserData.invalidate();
    },
    onError: (error) => {
      toast({
        title: "Error",
        variant: "destructive",
        description: error.message
      });
    },
  });

  const handleDelete = () => {
    if (invoice?.id) {
      deleteInvoice.mutate({ invoice_id: invoice.id });
    }
  };
  if(action === "Delete"){
    return (
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">Delete Invoice</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{isEditing ? "Edit Invoice" : "Add Invoice"}</Button>
      </DialogTrigger>
      <DialogContent className="md:max-w-[50%] md:max-h-[90vh] md:my-[5vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Invoice" : "Add New Invoice"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Make changes to your invoice here." : "Fill in the details for the new invoice."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="vendor_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>company/instituition</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a company/instituition" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vendors.data?.map((vendor) => (
                          <SelectItem key={vendor.id} value={vendor.id.toString()}>
                            {vendor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="invoice_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Invoice number" {...field} />
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Quantity" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price_per_unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price per Unit</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Price per unit" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="total_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Price</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Total price" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="payment_terms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Terms</FormLabel>
                    <FormControl>
                      <Input placeholder="Payment terms" {...field} />
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
          value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
          onChange={(e) => {
            const date = e.target.value ? new Date(e.target.value) : null;
            field.onChange(date);
          }}
        />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="invoice_file"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice File</FormLabel>
                    <FormControl>
                      <Input type="file" {...field} value={undefined} onChange={handleFileChange} />
                    </FormControl>
                    <FormMessage />
                    {previewUrl && (
                      <div className="mt-2">
                        <p className="text-sm font-medium mb-1">Preview:</p>
                        <Image
                          src={previewUrl}
                          alt="Invoice preview"
                          width={200}
                          height={200}
                          objectFit="contain"
                        />
                      </div>
                    )}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="terms_agreed"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I agree to the terms of service and privacy policy.
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter className="mt-4">
          <Button type="submit" onClick={form.handleSubmit(onSubmit)}>
            {isEditing ? "Update Invoice" : "Submit Invoice"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default InvoiceForm;
