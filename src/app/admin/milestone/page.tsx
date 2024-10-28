'use client'

import React, { useState } from "react"
import { IoSearchOutline } from "react-icons/io5"
import { trpc } from "@/app/_providers/trpc-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import Image from "next/image"
import { format, isBefore, isToday, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns"
import { ApprovalStatus } from "@prisma/client"

type DueDateFilter = 'all' | 'overdue' | 'due-today' | 'due-this-week' | 'due-this-month';

interface DueDateRange {
  from?: Date;
  to?: Date;
}

interface FilterState {
  search: string;
  status: ApprovalStatus | undefined;
  page: number;
  limit: number;
  sortBy: string | undefined;
  sortOrder: 'asc' | 'desc';
  dueDateRange?: DueDateRange;
  dueDateFilter?: DueDateFilter;
}

function MilestoneReview() {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: undefined,
    page: 1,
    limit: 10,
    sortBy: undefined,
    sortOrder: "desc",
    dueDateFilter: 'all',
  });

  const [, setSelectedMilestone] = useState(null);

  const { data: milestoneData, isLoading, refetch } = trpc.getAllMilestones.useQuery(filters);

  const updateMilestoneStatus = trpc.updateMilestoneSatus.useMutation({
    onSuccess: () => {
      toast({
        description: "Milestone status updated successfully"
      })
      refetch();
      setSelectedMilestone(null);
    },
    onError: () => {
      toast({
        description: "Failed to update Milestone status",
        variant: "destructive"
      })
    }
  });

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }));
  };


  const handleStatusFilter = (value: string) => {
    setFilters(prev => ({ ...prev, status: value as ApprovalStatus, page: 1 }));
  };

  const handleSort = (value: string) => {
    const [sortBy, sortOrder] = value.split('-');
    setFilters(prev => ({ ...prev, sortBy, sortOrder: sortOrder as 'asc' | 'desc' }));
  };

  const handleDueDateFilter = (value: DueDateFilter) => {
    const now = new Date();
    let dueDateRange: DueDateRange = {};

    switch (value) {
      case 'overdue':
        dueDateRange = { to: startOfDay(now) };
        break;
      case 'due-today':
        dueDateRange = { from: startOfDay(now), to: endOfDay(now) };
        break;
      case 'due-this-week':
        dueDateRange = { from: startOfWeek(now), to: endOfWeek(now) };
        break;
      case 'due-this-month':
        dueDateRange = { from: startOfMonth(now), to: endOfMonth(now) };
        break;
      default:
        dueDateRange = {};
    }

    setFilters(prev => ({ ...prev, dueDateFilter: value, dueDateRange, page: 1 }));
  };

  const handleApproveReject = (status: 'APPROVED' | 'REJECTED', id: string) => {
    updateMilestoneStatus.mutate({ id, status });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDueDateColor = (dueDate: Date) => {
    const now = new Date();
    if (isBefore(dueDate, now)) {
      return 'text-red-600 font-bold';
    }
    if (isToday(dueDate)) {
      return 'text-yellow-600 font-bold';
    }
    return '';
  };

  return (
    <div className="m-4">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Input
            placeholder="Search by description, invoice number or user..."
            value={filters.search}
            onChange={handleSearch}
            className="pl-10"
          />
          <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        <Select onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={handleDueDateFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Due Date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="due-today">Due Today</SelectItem>
            <SelectItem value="due-this-week">Due This Week</SelectItem>
            <SelectItem value="due-this-month">Due This Month</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={handleSort}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at-desc">Newest First</SelectItem>
            <SelectItem value="created_at-asc">Oldest First</SelectItem>
            <SelectItem value="payment_amount-desc">Highest Amount</SelectItem>
            <SelectItem value="payment_amount-asc">Lowest Amount</SelectItem>
            <SelectItem value="due_date-asc">Due Date (Earliest)</SelectItem>
            <SelectItem value="due_date-desc">Due Date (Latest)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Invoice Number</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Payment Amount</TableHead>
              <TableHead>Logistics Amount</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : (
              milestoneData?.data.map((milestone) => (
                <TableRow key={milestone.id}>
                  <TableCell>{milestone.description}</TableCell>
                  <TableCell>{milestone.invoice.invoice_number}</TableCell>
                  <TableCell>{milestone.user.first_name} {milestone.user.last_name}</TableCell>
                  <TableCell>${milestone.payment_amount.toFixed(2)}</TableCell>
                  <TableCell>${milestone.logistics_amount.toFixed(2)}</TableCell>
                  <TableCell className={getDueDateColor(new Date(milestone.due_date))}>
                    {format(new Date(milestone.due_date), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(milestone.status)}`}>
                      {milestone.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="bg-black text-white hover:bg-gray-700">View</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[700px]">
                        <DialogHeader>
                          <DialogTitle>Milestone Details</DialogTitle>
                          <DialogDescription>
                            Review the milestone for Invoice #{milestone.invoice.invoice_number}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h3 className="font-semibold mb-2">Milestone Information</h3>
                            <p>Description: {milestone.description}</p>
                            <p>Invoice Number: {milestone.invoice.invoice_number}</p>
                            <p>User: {milestone.user.first_name} {milestone.user.last_name}</p>
                            <p>Payment Amount: ${milestone.payment_amount.toFixed(2)}</p>
                            <p>Logistics Amount: ${milestone.logistics_amount.toFixed(2)}</p>
                            <p>Bank Details: {milestone.bank_details}</p>
                            <p>Due Date: {format(new Date(milestone.due_date), 'MMM dd, yyyy')}</p>
                            <p>Status: {milestone.status}</p>
                            {milestone.approved_at && (
                              <p>Approved At: {format(new Date(milestone.approved_at), 'MMM dd, yyyy HH:mm:ss')}</p>
                            )}
                            {milestone.paid_at && (
                              <p>Paid At: {format(new Date(milestone.paid_at), 'MMM dd, yyyy HH:mm:ss')}</p>
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold mb-2">Supporting Document</h3>
                            {milestone.supporting_doc && (
                              <Image
                                src={milestone.supporting_doc}
                                alt="Supporting Document"
                                width={300}
                                height={400}
                                className="w-full h-auto"
                              />
                            )}
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => handleApproveReject('REJECTED', milestone.id)} className="bg-red-500 text-white hover:bg-red-600">Reject</Button>
                          <Button onClick={() => handleApproveReject('APPROVED', milestone.id)} className="bg-green-500 text-white hover:bg-green-600">Approve</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-500">
          Showing {((filters.page ?? 1) - 1) * (filters.limit ?? 10) + 1} to {Math.min((filters.page ?? 1) * (filters.limit ?? 10), milestoneData?.metadata.total ?? 0)} of {milestoneData?.metadata.total ?? 0} entries
        </p>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange((filters.page ?? 1) - 1)}
                className={(filters.page ?? 1) <= 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            {Array.from({ length: milestoneData?.metadata.totalPages ?? 0 }, (_, i) => i + 1)
              .filter(page => {
                const currentPage = filters.page ?? 1;
                return page === 1 ||
                       page === (milestoneData?.metadata.totalPages ?? 0) ||
                       (page >= currentPage - 1 && page <= currentPage + 1);
              })
              .map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => handlePageChange(page)}
                    isActive={page === (filters.page ?? 1)}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange((filters.page ?? 1) + 1)}
                className={(filters.page ?? 1) >= (milestoneData?.metadata.totalPages ?? 0) ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}

export default MilestoneReview;