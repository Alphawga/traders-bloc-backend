"use client"
import MilestoneForm from "@/components/milestone/milestone-fom";
import ViewMilestone from "@/components/milestone/view-milestone";
import useUserStore from "@/store/user-store";
import { Invoice } from "@prisma/client";
import { useParams } from "next/navigation";

export default function MilestonesPage() {
  const { user } = useUserStore();
  const { id } = useParams();
const milestones = user?.milestones.filter((milestone) => milestone.invoice_id === id);
  return (
    <div className="container mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold text-center mb-8">
      Supply Chain Milestones
    </h1>
    <div className="max-w-3xl mx-auto mb-8">
      <p className="text-lg font-bold text-center mb-4">
        Milestones for Invoice: {user?.invoices.find((invoice) => invoice.id === id)?.invoice_number}
      </p>
          {milestones?.map((milestone, index) => (
              <div key={milestone.id} className="flex justify-between items-center mb-4 p-4 bg-gray-100 rounded">
                <span>Milestone {index + 1}: {milestone.description}</span>
                <div className="flex space-x-2">
               <MilestoneForm
                  invoice={user?.invoices.find((invoice) => invoice.id === id) as Invoice}
                  action="Edit"
                  milestone={milestone} 
                />
                  <ViewMilestone milestone={milestone} index={index} />
                </div>
              </div>
            ))}
        </div>
        </div>
  )
}