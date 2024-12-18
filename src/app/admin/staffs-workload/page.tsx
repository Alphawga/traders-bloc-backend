'use client'

import { useState } from "react"
import { IoSearchOutline } from "react-icons/io5"
import { trpc } from "@/app/_providers/trpc-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BLOCK_PERMISSIONS } from "@/lib/contants"
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { usePermission } from "@/hooks/use-permission"
import { format } from "date-fns"

const ROLES = [
  BLOCK_PERMISSIONS.HEAD_OF_CREDIT,
  BLOCK_PERMISSIONS.CREDIT_OPS_LEAD,
  BLOCK_PERMISSIONS.CREDIT_OPS_ANALYST,
  BLOCK_PERMISSIONS.FINANCE,
  BLOCK_PERMISSIONS.COLLECTIONS,
]

const PAGE_SIZES = [10, 20, 50, 100]

interface FilterState {
  search: string
  status: 'all' | 'active' | 'inactive'
  role: string
  workloadType: 'all' | 'pending' | 'approved' | 'rejected'
  page: number
  limit: number
}

export default function StaffsWorkloadPage() {
  const { hasPermission } = usePermission()
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    role: 'all',
    workloadType: 'all',
    page: 1,
    limit: 10,
  })
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'details'>('overview')

  const { data: staffsData } = trpc.getStaffsWorkload.useQuery(filters)
  const { data: roles } = trpc.getRoles.useQuery()

  if (!hasPermission('OVERSEE_CREDIT_OPERATIONS_PIPELINE')) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <p className="text-lg text-gray-500">You don&apos;t have permission to view this page.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <Tabs defaultValue="overview" className="space-y-6" onValueChange={(value) => setActiveTab(value as 'overview' | 'details')}>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Detailed View</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input
                placeholder="Search staff..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
              />
            </div>
            <Select
              value={filters.role}
              onValueChange={(value) => setFilters(prev => ({ ...prev, role: value, page: 1 }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {ROLES.map(role => (
                  <SelectItem key={role} value={role}>
                    {role.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.status}
              onValueChange={(value: 'all' | 'active' | 'inactive') => 
                setFilters(prev => ({ ...prev, status: value, page: 1 }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.workloadType}
              onValueChange={(value: 'all' | 'pending' | 'approved' | 'rejected') => 
                setFilters(prev => ({ ...prev, workloadType: value, page: 1 }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.limit.toString()}
              onValueChange={(value) => setFilters(prev => ({ ...prev, limit: Number(value), page: 1 }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Page size" />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map(size => (
                  <SelectItem key={size} value={size.toString()}>
                    {size} per page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="overview">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Invoices (P/A/R)</TableHead>
                <TableHead>Invoice Amount</TableHead>
                <TableHead>Milestones (P/A/R)</TableHead>
                <TableHead>Milestone Amount</TableHead>
                <TableHead>Funding Requests (P/A/R)</TableHead>
                <TableHead>Funding Amount</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffsData?.data.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{staff.name}</p>
                      <p className="text-sm text-gray-500">{staff.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{staff.role}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      staff.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {staff.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {staff.workload.invoices.pending}/
                    {staff.workload.invoices.approved}/
                    {staff.workload.invoices.rejected}
                  </TableCell>
                  <TableCell>${staff.workload.invoices.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>
                    {staff.workload.milestones.pending}/
                    {staff.workload.milestones.approved}/
                    {staff.workload.milestones.rejected}
                  </TableCell>
                  <TableCell>${staff.workload.milestones.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>
                    {staff.workload.fundingRequests.pending}/
                    {staff.workload.fundingRequests.approved}/
                    {staff.workload.fundingRequests.rejected}
                  </TableCell>
                  <TableCell>${staff.workload.fundingRequests.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedStaff(staff.id)}>
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{staff.name}&apos;s Workload Details</DialogTitle>
                        </DialogHeader>
                        <Tabs defaultValue="invoices" className="mt-4">
                          <TabsList>
                            <TabsTrigger value="invoices">Invoices</TabsTrigger>
                            <TabsTrigger value="milestones">Milestones</TabsTrigger>
                            <TabsTrigger value="funding">Funding Requests</TabsTrigger>
                          </TabsList>
                          <TabsContent value="invoices">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Invoice Number</TableHead>
                                  <TableHead>Vendor</TableHead>
                                  <TableHead>Amount</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead>Due Date</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {staff.workload.invoices.items.map((invoice) => (
                                  <TableRow key={invoice.id}>
                                    <TableCell>{invoice.number}</TableCell>
                                    <TableCell>{invoice.vendor.name}</TableCell>
                                    <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                                    <TableCell>
                                      <span className={`px-2 py-1 rounded-full text-xs ${
                                        invoice.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                        invoice.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                        'bg-red-100 text-red-800'
                                      }`}>
                                        {invoice.status}
                                      </span>
                                    </TableCell>
                                    <TableCell>{format(new Date(invoice.dueDate), 'MMM dd, yyyy')}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TabsContent>
                          {/* Similar tables for milestones and funding requests */}
                        </Tabs>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="details">
          <div className="space-y-8">
            {staffsData?.data.map((staff) => (
              <div key={staff.id} className="mb-8 p-6 border rounded-lg">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{staff.name}</h3>
                    <p className="text-sm text-gray-500">{staff.email}</p>
                    <p className="text-sm">Role: {staff.role}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    staff.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {staff.status}
                  </span>
                </div>

                <Tabs defaultValue="invoices" className="mt-4">
                  <TabsList>
                    <TabsTrigger value="invoices">
                      Invoices ({staff.workload.invoices.total})
                    </TabsTrigger>
                    <TabsTrigger value="milestones">
                      Milestones ({staff.workload.milestones.total})
                    </TabsTrigger>
                    <TabsTrigger value="funding">
                      Funding Requests ({staff.workload.fundingRequests.total})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="invoices">
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">
                        Pending: {staff.workload.invoices.pending} | 
                        Approved: {staff.workload.invoices.approved} | 
                        Rejected: {staff.workload.invoices.rejected} | 
                        Total Amount: ${staff.workload.invoices.totalAmount.toFixed(2)}
                      </p>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Invoice Number</TableHead>
                          <TableHead>Vendor</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Due Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {staff.workload.invoices.items.map((invoice) => (
                          <TableRow key={invoice.id}>
                            <TableCell>{invoice.number}</TableCell>
                            <TableCell>{invoice.vendor.name}</TableCell>
                            <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                invoice.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                invoice.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {invoice.status}
                              </span>
                            </TableCell>
                            <TableCell>{format(new Date(invoice.dueDate), 'MMM dd, yyyy')}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>

                  <TabsContent value="milestones">
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">
                        Pending: {staff.workload.milestones.pending} | 
                        Approved: {staff.workload.milestones.approved} | 
                        Rejected: {staff.workload.milestones.rejected} | 
                        Total Amount: ${staff.workload.milestones.totalAmount.toFixed(2)}
                      </p>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Due Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {staff.workload.milestones.items.map((milestone) => (
                          <TableRow key={milestone.id}>
                            <TableCell>{milestone.title}</TableCell>
                            <TableCell>${milestone.amount.toFixed(2)}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                milestone.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                milestone.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {milestone.status}
                              </span>
                            </TableCell>
                            <TableCell>{format(new Date(milestone.dueDate), 'MMM dd, yyyy')}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>

                  <TabsContent value="funding">
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">
                        Pending: {staff.workload.fundingRequests.pending} | 
                        Approved: {staff.workload.fundingRequests.approved} | 
                        Rejected: {staff.workload.fundingRequests.rejected} | 
                        Total Amount: ${staff.workload.fundingRequests.totalAmount.toFixed(2)}
                      </p>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Submission Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {staff.workload.fundingRequests.items.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell>${request.amount.toFixed(2)}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                request.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                request.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {request.status}
                              </span>
                            </TableCell>
                            <TableCell>{format(new Date(request.dueDate), 'MMM dd, yyyy')}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>
                </Tabs>
              </div>
            ))}
          </div>
        </TabsContent>

        <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-500">
              Showing {((filters.page - 1) * filters.limit) + 1} to {Math.min(filters.page * filters.limit, staffsData?.metadata.total ?? 0)} of {staffsData?.metadata.total ?? 0} entries
            </p>
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                  className={filters.page <= 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              {Array.from({ length: staffsData?.metadata.totalPages ?? 0 }, (_, i) => i + 1)
                .filter(page => {
                  const currentPage = filters.page;
                  return page === 1 ||
                         page === staffsData?.metadata.totalPages ||
                         (page >= currentPage - 1 && page <= currentPage + 1);
                })
                .map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setFilters(prev => ({ ...prev, page }))}
                      isActive={page === filters.page}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                  className={filters.page >= (staffsData?.metadata.totalPages ?? 0) ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </Tabs>
    </div>
  )
}
