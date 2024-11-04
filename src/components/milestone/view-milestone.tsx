import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LuWatch } from "react-icons/lu";
import { CiCircleCheck, CiMoneyBill } from "react-icons/ci";
import { Milestone } from "@prisma/client";
import { Button } from "../ui/button";

interface ViewMilestoneProps {
  milestone: Milestone;
  index: number;
}

const ViewMilestone: React.FC<ViewMilestoneProps> = ({ milestone, index }) => {
  const formatDate = (date: Date | null | undefined) => {
    return date ? new Date(date).toLocaleDateString() : 'Not set';
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className="text-blue-600 hover:underline">View</Button>
      </DialogTrigger>
      <DialogContent className="md:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Milestone {index + 1}: {milestone.description}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MilestoneStatus
              icon={<LuWatch size={28} />}
              title="Requested"
              date={formatDate(milestone?.created_at)}
            />
            <MilestoneStatus
              icon={<CiCircleCheck size={28} />}
              title={milestone.status === 'APPROVED' ? 'Approved' : 'Pending Approval'}
              date={milestone.status === 'APPROVED' ? formatDate(milestone?.updated_at) : '-'}
            />
            <MilestoneStatus
              icon={<CiMoneyBill size={28} />}
              title={milestone.status === 'PENDING' ? 'Pending' : 'Paid'}
              date={milestone.status === 'PENDING' ? formatDate(milestone.updated_at) : '-'}
            />
            <MilestoneStatus
              icon={<CiMoneyBill size={28} />}
              title={milestone.status === 'REJECTED' ? 'Rejected' : 'Paid'}
              date={milestone.status === 'REJECTED' ? formatDate(milestone.updated_at) : '-'}
            />
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Financial Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Payment Amount" value={`$${milestone.payment_amount || 0}`} />
              <InfoItem label="Due Date" value={formatDate(milestone.due_date)} />
              <InfoItem label="Total Amount" value={`$${(milestone.payment_amount || 0)}`} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const MilestoneStatus: React.FC<{ icon: React.ReactNode; title: string; date: string }> = ({ icon, title, date }) => (
  <div className="flex items-center space-x-4">
    <div className="bg-blue-100 p-3 rounded-full">{icon}</div>
    <div>
      <p className="font-semibold">{title}</p>
      <p className="text-sm text-gray-500">{date}</p>
    </div>
  </div>
);

const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-500">{label}</p>
    <p className="font-medium">{value}</p>
  </div>
);

export default ViewMilestone;
