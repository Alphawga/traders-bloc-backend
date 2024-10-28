"use client";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/app/_providers/trpc-provider";
import { fundingRequestSchema } from "@/lib/dtos";
import { useToast } from "@/hooks/use-toast";
import useUserStore from "@/store/user-store";
import { z } from "zod";
import { Label } from "@/components/ui/label";

function FundingRequest() {
 
  const [selectedInvoice, setSelectedInvoice] = useState<string | undefined>(undefined); 
  const [selectedMilestone, setSelectedMilestone] = useState<string | undefined>(undefined); 
  const { toast } = useToast();
  const { user } = useUserStore();
  const utils = trpc.useUtils();

  const createFundingRequest = trpc.createFundingRequest.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Funding request created successfully",
      });
      utils.getUserData.invalidate();
      
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const form = useForm({
    resolver: zodResolver(fundingRequestSchema),
    defaultValues: {
      requested_amount: 0,
      your_contribution: 0,
      milestone_id: selectedMilestone ?? "",
    },
  });

 
  const milestones = selectedInvoice
    ? user?.invoices?.find((invoice) => invoice.id === selectedInvoice)?.milestones || []
    : [];

 
  const filteredRequests = selectedMilestone
    ? user?.funding_requests?.filter((request) => request.milestone_id === selectedMilestone)
    : [];

  const onSubmit = (data: z.infer<typeof fundingRequestSchema>) => {
    createFundingRequest.mutate({...data, milestone_id: selectedMilestone ??""});
  };

  return (
    <div className="">
      <div className="mb-12">
       <Label> Select Invoice </Label>
        <Select onValueChange={setSelectedInvoice} value={selectedInvoice}>
          <SelectTrigger className="w-[200px] mb-4">
            <SelectValue placeholder="Select an invoice" />
          </SelectTrigger>
          <SelectContent>
            {user?.invoices?.map((invoice) => (
              <SelectItem key={invoice.id} value={invoice.id}>
                {invoice.description}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Label> Select Milestone </Label>
        {selectedInvoice && (
          <Select onValueChange={setSelectedMilestone} value={selectedMilestone}>
            <SelectTrigger className="w-[200px] mb-4">
              <SelectValue placeholder="Select a milestone" />
            </SelectTrigger>
            <SelectContent>
              {milestones.map((milestone) => (
                <SelectItem key={milestone.id} value={milestone.id}>
                  {milestone.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

    
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Milestone</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests?.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{new Date(request.submission_date).toLocaleDateString()}</TableCell>
                <TableCell>${request.requested_amount.toFixed(2)}</TableCell>
                <TableCell>{request.milestone.description}</TableCell>
                <TableCell className={`${request.status === "PENDING" ? "text-yellow-500" : status === "APPROVED" ? "text-green-500" : "text-red-500"}`}>{request.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Create New Funding Request</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-md">
            <FormField
              control={form.control}
              name="requested_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Requested funding amount</FormLabel>
                  <FormControl>
                    <Input type="number" 
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
                  <FormLabel>Your contribution amount</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="$0.00" {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}  />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />


            <Button type="submit" disabled={createFundingRequest.isLoading}>
              {createFundingRequest.isLoading ? "Submitting..." : "Submit request"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default FundingRequest;