"use client";


import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { trpc } from "@/app/_providers/trpc-provider";
import { useToast } from "@/hooks/use-toast";
import { Invoice, Milestone } from "@prisma/client"; 
import { milestoneSchema } from "@/lib/dtos";
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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

type MilestoneFormValues = z.infer<typeof milestoneSchema>;

interface MilestoneFormProps {
  milestone: Milestone | null;
  invoice: Invoice ;
  action: 'Add' | 'Edit' | 'Delete';
}

function MilestoneForm({ milestone, invoice, action }: MilestoneFormProps) {

  const { toast } = useToast();
  const isEditing = action === 'Edit';
  const [isOpen, setIsOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>("");
  const utils = trpc.useUtils();

  const form = useForm<MilestoneFormValues>({ 
    resolver: zodResolver(milestoneSchema),
    defaultValues: {
      description: milestone?.description || "",
      supporting_doc: milestone?.supporting_doc || "",
      bank_account_no: milestone?.bank_account_no || "",
      bank_name: milestone?.bank_name || "",
      due_date: milestone?.due_date || new Date(),
      payment_amount: milestone?.payment_amount || 0,
      invoice_id: invoice?.id || "",
    },
  });

  const addMilestone = trpc.createMilestone.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        variant: "default",
        description: "Milestone added successfully"
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


  const updateMilestone = trpc.updateMilestone.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        variant: "default",
        description: "Milestone updated successfully"
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

  const onSubmit = (data: MilestoneFormValues) => {
    if (isEditing) {
      updateMilestone.mutate({ ...data, id: milestone?.id || "", invoice_id: invoice?.id || "" });
    } else {
      addMilestone.mutate({ ...data, invoice_id: invoice?.id || "" });
    }
  };

  const deleteMilestone = trpc.deleteMilestone.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        variant: "default",
        description: "Milestone deleted successfully"
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

  const handleDelete = () => {
    if (milestone?.id) {
      deleteMilestone.mutate({ milestone_id: milestone.id });
    }
  };

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
          form.setValue("supporting_doc", response.url);
          setPreviewUrl(response.url);
        }
      } catch (error) {
        console.error("Error in file upload:", error);
      }
    }
  }

  if(action === "Delete"){
    return (
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">Delete Milestone</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this milestone?</AlertDialogTitle>
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
        <Button variant="outline">{isEditing ? "Edit Milestone" : "Add Milestone"}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Milestone" : "Add New Milestone"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Make changes to your milestone here." : "Fill in the details for the new milestone."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Card>
              <CardContent className="grid gap-4 pt-4">
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
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Detailed milestone description" {...field} rows={4} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                name="supporting_doc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Milestone Supporting document</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="file"
                          {...field}
                          value={undefined}
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
        
      
              </CardContent>
            </Card>
          </form>
        </Form>
        <DialogFooter>
          <Button type="submit" onClick={form.handleSubmit(onSubmit)}>
            {isEditing ? "Update Milestone" : "Add Milestone"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default MilestoneForm;
