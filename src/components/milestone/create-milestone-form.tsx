import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { trpc } from "@/app/_providers/trpc-provider";
import { useToast } from "@/hooks/use-toast";
import { Invoice } from "@prisma/client";
import { milestoneSchema } from "@/lib/dtos";
import { Textarea } from "@/components/ui/textarea";


type MilestoneFormValues = z.infer<typeof milestoneSchema>;

interface CreateMilestoneFormProps {
  invoice: Invoice;
  onSuccess?: () => void;
}

function CreateMilestoneForm({ invoice, onSuccess }: CreateMilestoneFormProps) {
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const form = useForm<MilestoneFormValues>({
    resolver: zodResolver(milestoneSchema),
    defaultValues: {
      description: "",
      supporting_doc: "",
      bank_details: "",
      due_date: new Date(),
      payment_amount: 0,
      logistics_amount: 0,
      invoice_id: invoice?.id,
    },
  });

  const addMilestone = trpc.createMilestone.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        variant: "default",
        description: "Milestone added successfully"
      });
      utils.getUserData.invalidate();
      if (onSuccess) onSuccess();
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
    addMilestone.mutate({ ...data, invoice_id: invoice.id });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
       
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
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
                    <Input {...field} />
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
                  <FormLabel>Payment Amount</FormLabel>
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
            <FormField
              control={form.control}
              name="logistics_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logistics Amount</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} 
                     onChange={(e) => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
     <Button type="submit" className="bg-black text-white"> Submit</Button>
      </form>
    </Form>
  );
}

export default CreateMilestoneForm;
