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
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

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
  const utils = trpc.useUtils();

  const form = useForm<MilestoneFormValues>({ 
    resolver: zodResolver(milestoneSchema),
    defaultValues: {
      description: milestone?.description || "",
      supporting_doc: milestone?.supporting_doc || "",
      bank_details: milestone?.bank_details || "",
      due_date: milestone?.due_date || new Date(),
      payment_amount: milestone?.payment_amount || 0,
      logistics_amount: milestone?.logistics_amount || 0,
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
                  name="supporting_doc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supporting Document</FormLabel>
                      <FormControl>
                        <Input placeholder="Document link or reference" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bank_details"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Details</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Full bank account information" {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
             
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="payment_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="logistics_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logistics Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
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
