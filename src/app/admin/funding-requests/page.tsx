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
import { format } from "date-fns"

type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface FilterState {
  search: string;
  status: ApprovalStatus | undefined;
  page: number;
  limit: number;
  sortBy: string | undefined;
  sortOrder: 'asc' | 'desc';
}

function FundingRequestReview() {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: undefined,
    page: 1,
    limit: 10,
    sortBy: undefined,
    sortOrder: "desc",
  });

  const [, setSelectedFundingRequest] = useState(null);

  const { data: fundingRequestData, isLoading, refetch } = trpc.getAllFundingRequests.useQuery(filters);

  const updateFundingRequestStatus = trpc.updateFundingRequest.useMutation({
    onSuccess: () => {
      toast({
        description: "Funding request status updated successfully"
      })
      refetch();
      setSelectedFundingRequest(null);
    },
    onError: () => {
      toast({
        description: "Failed to update funding request status",
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
    setFilters(prev => ({ ...prev, status: value as ApprovalStatus | undefined, page: 1 }));
  };

  const handleSort = (value: string) => {
    const [sortBy, sortOrder] = value.split('-');
    setFilters(prev => ({ ...prev, sortBy, sortOrder: sortOrder as 'asc' | 'desc' }));
  };

  const handleApproveReject = (status: 'APPROVED' | 'REJECTED', id: string) => {
    updateFundingRequestStatus.mutate({ funding_request_id: id, status });
  };

  const getStatusColor = (status: ApprovalStatus) => {
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

  return (
    <div className="m-4">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Input
            placeholder="Search by milestone ID or invoice number..."
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
        <Select onValueChange={handleSort}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="submission_date-desc">Newest First</SelectItem>
            <SelectItem value="submission_date-asc">Oldest First</SelectItem>
            <SelectItem value="requested_amount-desc">Highest Amount</SelectItem>
            <SelectItem value="requested_amount-asc">Lowest Amount</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Invoice Number</TableHead>
              <TableHead>Milestone</TableHead>
              <TableHead>Requested Amount</TableHead>
              <TableHead>Your Contribution</TableHead>
              <TableHead>Submission Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : (
              fundingRequestData?.data.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.user.first_name} {request.user.last_name}</TableCell>
                  <TableCell>{request.milestone.invoice.invoice_number}</TableCell>
                  <TableCell>{request.milestone.description}</TableCell>
                  <TableCell>${request.requested_amount.toFixed(2)}</TableCell>
                  <TableCell>${request.your_contribution.toFixed(2)}</TableCell>
                  <TableCell>{format(new Date(request.submission_date), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="bg-black text-white hover:bg-gray-700">View</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[700px]">
                        <DialogHeader>
                          <DialogTitle>Funding Request Details</DialogTitle>
                          <DialogDescription>
                            Review the funding request for Milestone ID: {request.milestone.description}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h3 className="font-semibold mb-2">Request Information</h3>
                            <p>User: {request.user.first_name} {request.user.last_name}</p>
                            <p>Milestone ID: {request.milestone.description}</p>
                            <p>Requested Amount: ${request.requested_amount.toFixed(2)}</p>
                            <p>Your Contribution: ${request.your_contribution.toFixed(2)}</p>
                            <p>Submission Date: {format(new Date(request.submission_date), 'MMM dd, yyyy HH:mm:ss')}</p>
                            <p>Status: {request.status}</p>
                            {request.review_date && (
                              <p>Review Date: {format(new Date(request.review_date), 'MMM dd, yyyy HH:mm:ss')}</p>
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold mb-2">Related Invoices</h3>
                            {request.milestone.invoice ? (
                              <ul className="list-disc pl-5">
                             
                                  <li>Invoice #{request.milestone.invoice.invoice_number}</li>
                              
                              </ul>
                            ) : (
                              <p>No related invoices</p>
                            )}
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => handleApproveReject('REJECTED', request.id)} className="bg-red-500 text-white hover:bg-red-600">Reject</Button>
                          <Button onClick={() => handleApproveReject('APPROVED', request.id)} className="bg-green-500 text-white hover:bg-green-600">Approve</Button>
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
          Showing {((filters.page ?? 1) - 1) * (filters.limit ?? 10) + 1} to {Math.min((filters.page ?? 1) * (filters.limit ?? 10), fundingRequestData?.metadata.total ?? 0)} of {fundingRequestData?.metadata.total ?? 0} entries
        </p>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange((filters.page ?? 1) - 1)}
                className={(filters.page ?? 1) <= 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            {Array.from({ length: fundingRequestData?.metadata.totalPages ?? 0 }, (_, i) => i + 1)
              .filter(page => {
                const currentPage = filters.page ?? 1;
                return page === 1 ||
                       page === (fundingRequestData?.metadata.totalPages ?? 0) ||
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
                className={(filters.page ?? 1) >= (fundingRequestData?.metadata.totalPages ?? 0) ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}

export default FundingRequestReview;