"use client"

import * as React from "react"
import { DataTable } from "@/components/table/data-table";
import useUserStore from "@/store/user-store"
import { columns } from "./column"
import InvoiceForm from "@/components/invoice/invoice-form"


function InvoiceList() {



const {user} = useUserStore();

  



  return (
    <>
    
      <div className="w-full h-full   items-center justify-center p-[5%]">
        <h1 className="max-md:text-2xl lg:text-3xl font-extrabold max-md:text-center max-sm:tracking-tighter lg:tracking-tight mb-8">
          Invoice List
        </h1>
       
       <DataTable 
       columns={columns} 
       data={user?.invoices || []} 
       action={<InvoiceForm invoice={null} action="Add"/>}
       
       />
      </div>
    </>
  )
}

export default InvoiceList