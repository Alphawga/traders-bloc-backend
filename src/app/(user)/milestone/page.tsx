"use client";

import { useState, useMemo } from "react";
import { Invoice } from "@prisma/client";
import useUserStore from "@/store/user-store";
import ViewMilestone from "@/components/milestone/view-milestone"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClockIcon, CheckCircleIcon, DollarSignIcon } from "lucide-react";
import MilestoneForm from "@/components/milestone/milestone-fom";
import CreateMilestoneForm from "@/components/milestone/create-milestone-form";

function Milestones() {
  const { user } = useUserStore();
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>("all");
  const [showNewMilestoneForm, setShowNewMilestoneForm] = useState(false);

  const filteredMilestones = useMemo(() => {
    if (!selectedInvoice || selectedInvoice === 'all') {
      return user?.milestones || [];
    }
    return user?.milestones.filter((milestone) => milestone.invoice_id === selectedInvoice) || [];
  }, [user?.milestones, selectedInvoice]);

  const selectedInvoiceData = user?.invoices.find((invoice) => invoice.id === selectedInvoice);

  return (
    <div className="">


      <div className="flex justify-between items-center mb-6">
        <Select 
          onValueChange={(value) => {
            setSelectedInvoice(value === 'all' ? null : value);
            setShowNewMilestoneForm(false);
          }} 
          value={selectedInvoice || 'all'}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Invoice" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All invoices</SelectItem>
            {user?.invoices?.map((invoice: Invoice) => (
              <SelectItem key={invoice.id} value={invoice.id}>
                {invoice.invoice_number}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={() => {
          setShowNewMilestoneForm(true);
          setTimeout(() => {
            const element = document.getElementById("new-milestone-form");
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
            }
          }, 0);
        }}>New Milestone</Button>
      </div>

      {selectedInvoice && selectedInvoice !== 'all' && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Set up milestones for invoice {selectedInvoiceData?.invoice_number}</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredMilestones.map((milestone, index) => (
              <div key={milestone.id} className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Milestone {index + 1}</h3>
                <div className="flex items-start space-x-4 mb-4">
                  <div className="flex flex-col items-center">
                    <ClockIcon className="w-6 h-6 text-blue-500" />
                    <div className="h-full border-l-2 border-gray-300 mx-3"></div>
                  </div>
                  <div>
                    <p className="font-medium">Requested</p>
                    <p className="text-sm text-gray-500">{new Date(milestone.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 mb-4">
                  <div className="flex flex-col items-center">
                    <CheckCircleIcon className="w-6 h-6 text-green-500" />
                    <div className="h-full border-l-2 border-gray-300 mx-3"></div>
                  </div>
                  <div>
                    <p className="font-medium">Approved</p>
                    <p className="text-sm text-gray-500">{milestone.approved_at ? new Date(milestone.approved_at).toLocaleDateString() : '-'}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 mb-4">
                  <DollarSignIcon className="w-6 h-6 text-yellow-500" />
                  <div>
                    <p className="font-medium">Paid</p>
                    <p className="text-sm text-gray-500">{milestone.paid_at ? new Date(milestone.paid_at).toLocaleDateString() : '-'}</p>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-4">
                  <MilestoneForm
                    invoice={selectedInvoiceData as Invoice}
                    action="Edit"
                    milestone={milestone} 
                  />
                  <ViewMilestone milestone={milestone} index={index} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {showNewMilestoneForm && selectedInvoice && selectedInvoice !== 'all' && (
        <Card id="new-milestone-form">
          <CardHeader>
            <CardTitle>Create New Milestone</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateMilestoneForm 
              invoice={selectedInvoiceData as Invoice}
              onSuccess={() => {
                setShowNewMilestoneForm(false);
              }}
            />
          </CardContent>
        </Card>
      )}

      {(!selectedInvoice || selectedInvoice === 'all') && (
        <p className="text-gray-600">Please select an invoice to view or add milestones.</p>
      )}
    </div>
  );
}

export default Milestones;
