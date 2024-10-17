"use client";
import React, { useState } from "react";
import MainHeader from "@/components/headers/mainHeader";
import { Invoice } from "@prisma/client";
import useUserStore from "@/store/user-store";
import MilestoneForm from "@/components/milestone/milestone-fom";
import ViewMilestone from "@/components/milestone/view-milestone";

function Milestones() {


  const { user} = useUserStore();
 
const [selectedInvoice, setSelectedInvoice] = useState("");

  

 



  return (
    <>
      <MainHeader />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Supply Chain Milestones
        </h1>

        <select
          title="Select an invoice"
          value={selectedInvoice}
          onChange={(e) => setSelectedInvoice(e.target.value)}
          className="w-full max-w-md mx-auto mb-8 p-2 border rounded"
        >
          <option value="">Select an invoice</option>
          {user?.invoices.map((invoice: Invoice) => (
            <option key={invoice.id} value={invoice.id}>
              {invoice.invoice_number}
            </option>
          ))}
        </select>

        <div className="max-w-3xl mx-auto mb-8">
          {user?.milestones
            .filter((milestone) => milestone.invoice_id === selectedInvoice)
            .map((milestone, index) => (
              <div key={milestone.id} className="flex justify-between items-center mb-4 p-4 bg-gray-100 rounded">
                <span>Milestone {index + 1}: {milestone.description}</span>
                <div className="flex space-x-2">
               <MilestoneForm
                  invoice={user?.invoices.find((invoice) => invoice.id === selectedInvoice) as Invoice}
                  action="Edit"
                  milestone={milestone} 
                />
                  <ViewMilestone milestone={milestone} index={index} />
                </div>
              </div>
            ))}
        </div>

        {selectedInvoice && (
          <div className="text-center">
           <MilestoneForm 
            invoice={user?.invoices.find((invoice) => invoice.id === selectedInvoice) as Invoice}
            action="Add"
            milestone={null} 
          />
          </div>
        )}

        
      </div>
    </>
  );
}

export default Milestones;
