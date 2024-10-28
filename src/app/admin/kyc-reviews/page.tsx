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
import { IKYCFilterParams } from "@/lib/model"
import Image from "next/image"
import { ApprovalStatus } from "@prisma/client"

function KYCReview() {
  const [filters, setFilters] = useState<IKYCFilterParams>({
    search: "",
    status: undefined,
    industry: undefined,
    page: 1,
    limit: 10,
    sortBy: undefined,
    sortOrder: "desc",
  });

  const [, setSelectedKYC] = useState(null);

  const { data: kycData, isLoading, refetch } = trpc.getAllKYCDocuments.useQuery(filters);

  const updateKycStatus = trpc.updateKYCDocument.useMutation({
    onSuccess: () => {
      toast({
        description: "KYC Status updated successfully"
      })
      refetch();
      setSelectedKYC(null);
    },
    onError: () => {
      toast({
        description: "Failed to update KYC Status",
        variant:"destructive"
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

  const handleApproveReject = (status: 'APPROVED' | 'REJECTED', id: string) => {
    updateKycStatus.mutate({ kyc_id: id, status });
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

  return (
    <div className="m-4">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Input
            placeholder="Search by name, company, or email..."
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
            <SelectItem value="company-asc">Company A-Z</SelectItem>
            <SelectItem value="company-desc">Company Z-A</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Company Name</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Email Address</TableHead>
              <TableHead>Company tax ID</TableHead>
              <TableHead>Document Type</TableHead>
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
              kycData?.data.map((kyc) => (
                <TableRow key={kyc.id}>
                  <TableCell>{kyc.user.first_name} {kyc.user.last_name}</TableCell>
                  <TableCell>{kyc.user.company_name}</TableCell>
                  <TableCell>{kyc.user.industry}</TableCell>
                  <TableCell>{kyc.user.email}</TableCell>
                  <TableCell>{kyc.user.tax_id}</TableCell>
                  <TableCell>{kyc.document_type}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(kyc.status)}`}>
                      {kyc.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="bg-black text-white hover:bg-gray-700">View</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>KYC Document</DialogTitle>
                          <DialogDescription>
                            Review the KYC document for {kyc.user.company_name}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <Image
                            src={kyc.document_url}
                            alt="KYC Document"
                            width={500}
                            height={300}
                            className="w-full h-auto"
                          />
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => handleApproveReject('REJECTED', kyc.id)} className="bg-red-500 text-white hover:bg-red-600">Reject</Button>
                          <Button onClick={() => handleApproveReject('APPROVED', kyc.id)} className="bg-green-500 text-white hover:bg-green-600">Approve</Button>
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
          Showing {((filters.page ?? 1) - 1) * (filters.limit ?? 10) + 1} to {Math.min((filters.page ?? 1) * (filters.limit ?? 10), kycData?.metadata.total ?? 0)} of {kycData?.metadata.total ?? 0} entries
        </p>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange((filters.page ?? 1) - 1)}
                className={(filters.page ?? 1) <= 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            {Array.from({ length: kycData?.metadata.totalPages ?? 0 }, (_, i) => i + 1)
              .filter(page => {
                const currentPage = filters.page ?? 1;
                return page === 1 ||
                       page === (kycData?.metadata.totalPages ?? 0) ||
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
                className={(filters.page ?? 1) >= (kycData?.metadata.totalPages ?? 0) ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}

export default KYCReview;