"use client"

import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import InvoiceForm from "@/components/invoice/invoice-form";
import { format } from "date-fns";
import { trpc } from "@/app/_providers/trpc-provider";
import Link from "next/link";

export default function InvoiceList() {


const {data:invoices} = trpc.getUserInvoices.useQuery()


  return (
    <div className="w-full h-full">
      <InvoiceForm action="Add" invoice={null} />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Checkbox />
            </TableHead>
            <TableHead>Invoice Number</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Total Price</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices?.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell>
                <Checkbox />
                </TableCell>
                <TableCell>{invoice.invoice_number}</TableCell>
                <TableCell>{invoice.description}</TableCell>
                <TableCell className="text-right">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(invoice.total_price ?? 0)}
                </TableCell>
                <TableCell>
                  {invoice.due_date ? format(new Date(invoice.due_date), "yyyy-MM-dd") : "N/A"}
                </TableCell>
                <TableCell>
                  <span
                    className={`${
                      invoice.status === "PENDING"
                        ? "text-yellow-500"
                        : invoice.status === "APPROVED"
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {invoice.status}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                       <Link href={"/invoices/milestones/" + invoice.id}>View Milestones</Link> 
                      </DropdownMenuItem>  
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                      <Link href={"/invoices/fund-requests/" + invoice.id}>View Fund Requests</Link> 
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <InvoiceForm invoice={invoice} action="Edit" />
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <InvoiceForm invoice={invoice} action="Delete" />
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
