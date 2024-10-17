"use client";
import { useState} from "react";
import { useRouter } from "next/navigation";
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

function FundingRequest() {
  const router = useRouter();
  const [selectedMilestone, setSelectedMilestone] = useState("");
const {toast} = useToast();
const {user} = useUserStore();


  const createFundingRequest = trpc.createFundingRequest.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Funding request created successfully",
      });
      router.push("/transaction");
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
      milestone_id: "",
    },
  });

  const onSubmit = (data: z.infer<typeof fundingRequestSchema>) => {
    createFundingRequest.mutate(data);
  };

  const filteredRequests = selectedMilestone
    ? user?.funding_requests?.filter((request) => request.milestone_id === selectedMilestone)
    : user?.funding_requests;

  return (
    <div className="w-full h-full lg:w-[80%] m-auto p-8 flex flex-col items-center justify-center mb-4">
      <h1 className="text-3xl font-extrabold mb-8">Funding Requests</h1>
      
      <div className="w-full mb-12">
        <Select onValueChange={setSelectedMilestone} value={selectedMilestone}>
          <SelectTrigger className="w-[200px] mb-4">
            <SelectValue placeholder="Filter by milestone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All milestones</SelectItem>
            {user?.milestones?.map((milestone) => (
              <SelectItem key={milestone.id} value={milestone.id}>
                {milestone.description}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
                <TableCell>{request.submission_date.toLocaleDateString()}</TableCell>
                <TableCell>${request.requested_amount.toFixed(2)}</TableCell>
                <TableCell>{request.milestone_id}</TableCell>
                <TableCell>{request.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <h2 className="text-2xl font-bold mb-4">Create New Funding Request</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full max-w-md">
          <FormField
            control={form.control}
            name="requested_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Requested funding amount</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="$0.00" {...field} />
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
                  <Input type="number" placeholder="$0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="milestone_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Milestone</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a milestone" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {user?.milestones?.map((milestone) => (
                      <SelectItem key={milestone.id} value={milestone.id}>
                        {milestone.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
  );
}

export default FundingRequest;
