"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"
import { trpc } from "@/app/_providers/trpc-provider"
import { format } from "date-fns";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { EntityNotes } from '@/components/admin/EntityNotes'
import { Card } from "@/components/ui/card"

export default function MilestoneDetails() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id as string;

  const { data: milestone, refetch } = trpc.getMilestone.useQuery({ id });

  const updateMilestoneStatus = trpc.updateMilestoneSatus.useMutation({
    onSuccess: () => {
      toast({
        description: "Milestone status updated successfully"
      });
      refetch();
    },
    onError: () => {
      toast({
        description: "Failed to update Milestone status",
        variant: "destructive"
      });
    }
  });

  const handleApproveReject = (status: 'APPROVED' | 'REJECTED') => {
    updateMilestoneStatus.mutate({ id, status });
  };

  if (!milestone) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button
        variant="outline"
        onClick={() => router.back()}
        className="mb-6"
      >
        ← Back to Milestones
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">Milestone Details</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Description</h3>
              <p>{milestone.description}</p>
            </div>
            <div>
              <h3 className="font-semibold">Invoice Number</h3>
              <p>{milestone.invoice.invoice_number}</p>
            </div>
            <div>
              <h3 className="font-semibold">User</h3>
              <p>{milestone.user.first_name} {milestone.user.last_name}</p>
            </div>
            <div>
              <h3 className="font-semibold">Payment Amount</h3>
              <p>${milestone.payment_amount.toFixed(2)}</p>
            </div>
            <div>
              <h3 className="font-semibold">Bank Details</h3>
              <p>{milestone.bank_name}</p>
              <p>{milestone.bank_account_no}</p>
            </div>
            <div>
              <h3 className="font-semibold">Due Date</h3>
              <p>{format(new Date(milestone.due_date), 'MMM dd, yyyy')}</p>
            </div>
            <div>
              <h3 className="font-semibold">Status</h3>
              <p>{milestone.status}</p>
            </div>
            {milestone.approved_at && (
              <div>
                <h3 className="font-semibold">Approved At</h3>
                <p>{format(new Date(milestone.approved_at), 'MMM dd, yyyy HH:mm:ss')}</p>
              </div>
            )}
            {milestone.paid_at && (
              <div>
                <h3 className="font-semibold">Paid At</h3>
                <p>{format(new Date(milestone.paid_at), 'MMM dd, yyyy HH:mm:ss')}</p>
              </div>
            )}
          </div>

          {milestone.status === 'PENDING' && (
            <div className="flex gap-4 mt-6">
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
        </Card>

        <div className="space-y-8">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">Supporting Document</h2>
            {milestone.supporting_doc ? (
              <Image
                src={milestone.supporting_doc}
                alt="Supporting Document"
                width={400}
                height={400}
                className="w-full h-auto"
              />
            ) : (
              <p>No supporting document available</p>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">Notes</h2>
            <EntityNotes
              entityId={milestone.id}
              entityType="milestone"
              onNoteAdded={refetch}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
