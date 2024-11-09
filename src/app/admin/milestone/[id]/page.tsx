"use client";

import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button"
import { trpc } from "@/app/_providers/trpc-provider"
import { format } from "date-fns";
import Image from "next/image";
import { toast } from "@/hooks/use-toast";

export default function MilestonePage() {
  const params = useParams();
  const id = params.id as string;

  const { data: milestone, isLoading, refetch } = trpc.getMilestone.useQuery({ id });

  const updateMilestoneStatus = trpc.updateMilestoneSatus.useMutation({
    onSuccess: () => {
      toast({
        description: "Milestone status updated successfully"
      });
      refetch();
    },
    onError: () => {
      toast({
        description: "Failed to update milestone status",
        variant: "destructive"
      });
    }
  });

  const handleApproveReject = (status: 'APPROVED' | 'REJECTED') => {
    updateMilestoneStatus.mutate({ id, status });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!milestone) {
    return <div>Milestone not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Milestone Details</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Milestone Information</h2>
            <div className="space-y-3">
              <p><span className="font-medium">Description:</span> {milestone.description}</p>
              <p><span className="font-medium">Invoice Number:</span> {milestone.invoice.invoice_number}</p>
              <p><span className="font-medium">User:</span> {milestone.user.first_name} {milestone.user.last_name}</p>
              <p><span className="font-medium">Payment Amount:</span> ${milestone.payment_amount.toFixed(2)}</p>
              <p><span className="font-medium">Bank Details:</span>
                <span className="block ml-4">{milestone.bank_name}</span>
                <span className="block ml-4">{milestone.bank_account_no}</span>
              </p>
              <p><span className="font-medium">Due Date:</span> {format(new Date(milestone.due_date), 'MMM dd, yyyy')}</p>
              <p><span className="font-medium">Status:</span> {milestone.status}</p>
              {milestone.approved_at && (
                <p><span className="font-medium">Approved At:</span> {format(new Date(milestone.approved_at), 'MMM dd, yyyy HH:mm:ss')}</p>
              )}
              {milestone.paid_at && (
                <p><span className="font-medium">Paid At:</span> {format(new Date(milestone.paid_at), 'MMM dd, yyyy HH:mm:ss')}</p>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Supporting Document</h2>
            {milestone.supporting_doc && (
              <Image
                src={milestone.supporting_doc}
                alt="Supporting Document"
                width={400}
                height={500}
                className="w-full h-auto rounded-lg"
              />
            )}
          </div>
        </div>

        {milestone.status === 'PENDING' && (
          <div className="mt-8 flex gap-4 justify-end">
            <Button 
              variant="outline"
              onClick={() => handleApproveReject('REJECTED')}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Reject
            </Button>
            <Button
              onClick={() => handleApproveReject('APPROVED')}
              className="bg-green-500 text-white hover:bg-green-600"
            >
              Approve
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
