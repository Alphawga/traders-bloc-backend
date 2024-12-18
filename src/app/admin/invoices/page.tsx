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
import { toast } from "@/hooks/use-toast"
import { format, isBefore, isToday, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns"
import { ApprovalStatus, Invoice, Milestone, Vendor } from "@prisma/client"
import {  MoreHorizontal, Eye, FileText, CreditCard, Check } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { MilestoneDetailsDialog } from "@/components/admin/MilestoneDetailsDialog"
import { InvoiceDetailsDialog } from "@/components/admin/InvoiceDetailsDialog"
import { usePermission } from "@/hooks/use-permission"
import { CompleteInvoiceDialog } from "@/components/admin/CompleteInvoiceDialog"
import { AssignAnalystDialog } from "@/components/admin/AssignAnalystDialog"
import { AssignInvoicesDialog } from "@/components/admin/AssignInvoicesDialog"


type DueDateFilter = 'all' | 'overdue' | 'due-today' | 'due-this-week' | 'due-this-month';

interface DueDateRange {
  from?: Date;
  to?: Date;
}

interface FilterState {
  search: string;
  status: ApprovalStatus | undefined;
  vendor: string | undefined;
  page: number;
  limit: number;
  sortBy: string | undefined;
  sortOrder: 'asc' | 'desc';
  dueDateRange?: DueDateRange;
  dueDateFilter?: DueDateFilter;
  assignmentStatus: 'all' | 'assigned' | 'unassigned';
}

interface ExpandedState {
  [key: string]: {
    milestones: boolean;
    fundingRequests: boolean;
  };
}

interface InvoiceWithRelations extends Invoice {
  milestones: Milestone[]
  vendor: Vendor
  user: {
    first_name: string
    last_name: string
  }
}

function InvoiceReview() {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: undefined,
    vendor: undefined,
    page: 1,
    limit: 10,
    sortBy: undefined,
    sortOrder: "desc",
    dueDateFilter: 'all',
    assignmentStatus: 'all',
  });

  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [showMilestoneDialog, setShowMilestoneDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithRelations | null>(null);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [showAssignAnalystDialog, setShowAssignAnalystDialog] = useState(false);
  const [selectedMilestoneForAssignment, setSelectedMilestoneForAssignment] = useState<string | null>(null);

  const { data: invoiceData, isLoading, refetch } = trpc.getAllInvoices.useQuery(filters);
  const { hasPermission } = usePermission();
  const canMarkDelivered = hasPermission("MARK_OFF_INVOICES_AS_DELIVERED");
  const canAssignInvoices = hasPermission("ASSIGN_INVOICES_TO_CREDIT_OPS_LEADS");
  const canCoSignMilestone = hasPermission("CO_SIGN_MILESTONES_TO_TRIGGER_PAYMENTS");
  const canUpdateInvoiceStatus = hasPermission("MANAGE_ASSIGNED_INVOICES");
  const canAssignMilestones = hasPermission("ASSIGN_MILESTONES_TO_ANALYSTS");

  const utils = trpc.useUtils();
  const updateInvoiceStatus = trpc.updateInvoiceStatus.useMutation({
    onSuccess: () => {
      toast({ description: "Invoice status updated successfully" })
      refetch()
    },
    onError: (error) => {
      toast({ description: error.message || "Failed to update invoice status", variant: "destructive" })
    }
  })




  const handleUpdateInvoiceStatus = (invoiceId: string, status: ApprovalStatus) => {
    updateInvoiceStatus.mutate({ invoice_id: invoiceId, status });
  };


  const markInvoiceDelivered = trpc.markInvoiceDelivered.useMutation({
    onSuccess: () => {
      toast({
        description: "Invoice marked as delivered successfully"
      })
      refetch();
      setSelectedInvoice(null);
      setShowInvoiceDialog(false);
    },
    onError: (error) => {
      toast({
        description: error.message || "Failed to mark invoice as delivered",
        variant: "destructive"
      })
    }
  });

  const handleMarkDelivered = async (invoiceId: string) => {
    await markInvoiceDelivered.mutate({ invoice_id: invoiceId });
  };

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

  const coSignMilestone = trpc.coSignMilestone.useMutation({
    onSuccess: () => {
      toast({ description: "Milestone co-signed successfully" })
      refetch()
    },
    onError: (error) => {
      toast({ 
        description: error.message || "Failed to co-sign milestone", 
        variant: "destructive" 
      })
    }
  })

  const handleCoSign = (milestoneId: string) => {
    coSignMilestone.mutate({ milestone_id: milestoneId })
  }

  const getStatusColor = (status: ApprovalStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'FULLY_DELIVERED':
        return 'bg-blue-100 text-blue-800';
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

  const toggleSection = (invoiceId: string, section: 'milestones' | 'fundingRequests') => {
    setExpanded(prev => ({
      ...prev,
      [invoiceId]: {
        ...prev[invoiceId],
        [section]: !prev[invoiceId]?.[section]
      }
    }));
  };



  const areAllMilestonesApproved = (invoice: InvoiceWithRelations) => {
    return invoice.milestones?.every((m: Milestone) => m.status === 'APPROVED')
  }



  return (
    <div className="m-4">
     {canAssignInvoices && (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {selectedInvoices.length} invoices selected
          </p>
          <Button
            onClick={() => setShowAssignDialog(true)}
            className="bg-black text-white"
            disabled={selectedInvoices.length === 0}
          >
            Assign to Credit Ops Lead
          </Button>
        </div>
      )}

      <AssignInvoicesDialog
        isOpen={showAssignDialog}
        onOpenChange={setShowAssignDialog}
        selectedInvoices={selectedInvoices}
        onSuccess={() => {
          setSelectedInvoices([])
          refetch()
        }}
      />

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Input
            placeholder="Search by invoice number, vendor, or user..."
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
            <SelectItem value="FULLY_DELIVERED">Fully Delivered</SelectItem>
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
            <SelectItem value="submission_date-desc">Newest First</SelectItem>
            <SelectItem value="submission_date-asc">Oldest First</SelectItem>
            <SelectItem value="total_price-desc">Highest Amount</SelectItem>
            <SelectItem value="total_price-asc">Lowest Amount</SelectItem>
            <SelectItem value="due_date-asc">Due Date (Earliest)</SelectItem>
            <SelectItem value="due_date-desc">Due Date (Latest)</SelectItem>
          </SelectContent>
        </Select>
        <Select 
          onValueChange={(value) => setFilters(prev => ({ 
            ...prev, 
            assignmentStatus: value as 'all' | 'assigned' | 'unassigned' 
          }))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Assignment Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Invoices</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedInvoices.length === invoiceData?.data.length}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedInvoices(invoiceData?.data.map(i => i.id) ?? []);
                    } else {
                      setSelectedInvoices([]);
                    }
                  }}
                />
              </TableHead>
              <TableHead>Invoice Number</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Total Price</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              {canAssignInvoices && (
                <TableHead>Assigned To</TableHead>
              )}
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : (
              invoiceData?.data.map((invoice) => (
                <>
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedInvoices.includes(invoice.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedInvoices([...selectedInvoices, invoice.id]);
                          } else {
                            setSelectedInvoices(selectedInvoices.filter(id => id !== invoice.id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>{invoice.invoice_number}</TableCell>
                    <TableCell>{invoice.user.first_name} {invoice.user.last_name}</TableCell>
                    <TableCell>{invoice.vendor.name}</TableCell>
                    <TableCell>{invoice.description}</TableCell>
                    <TableCell>${(invoice?.total_price??0).toFixed(2)}</TableCell>
                    <TableCell className={getDueDateColor(new Date(invoice.due_date))}>
                      {format(new Date(invoice.due_date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                        {hasPermission('OVERSEE_CREDIT_OPERATIONS_PIPELINE') && 
                         invoice.status === 'APPROVED' &&
                         areAllMilestonesApproved(invoice) && (
                          <CompleteInvoiceDialog
                            invoice={invoice}
                            onSuccess={() => {
                              utils.getAllInvoices.invalidate()
                            }}
                          />
                        )}
                      </div>
                    </TableCell>
                    {canAssignInvoices && (
                      <TableCell>
                        {invoice.assigned_to ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium">{invoice.assigned_to.name}
                            <p className="text-xs text-gray-500 pt-1">
                              Assigned by {invoice?.assigned_by?.name ?? ''}
                            </p>
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                            Assigned
                          </span>
                        </div>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                          Unassigned
                          </span>
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setShowInvoiceDialog(true);
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => toggleSection(invoice.id, 'milestones')}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            {expanded[invoice.id]?.milestones ? 'Hide Milestones' : 'Show Milestones'}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => toggleSection(invoice.id, 'fundingRequests')}
                          >
                            <CreditCard className="mr-2 h-4 w-4" />
                            {expanded[invoice.id]?.fundingRequests ? 'Hide Funding Requests' : 'Show Funding Requests'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {(invoice.status === 'APPROVED' && canMarkDelivered) && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleMarkDelivered(invoice.id)}
                                className="text-green-600"
                              >
                                Mark as Fully Delivered
                              </DropdownMenuItem>
                            </>
                          )}
                          {canUpdateInvoiceStatus && (
                            <>
                                                          <DropdownMenuItem
                                onClick={() => handleUpdateInvoiceStatus(invoice.id, "APPROVED")}
                                className="text-green-600"
                              >
                                Approve Invoice
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleUpdateInvoiceStatus(invoice.id, "REJECTED")}
                                className="text-red-600"
                            >
                                Reject Invoice
                              </DropdownMenuItem>
                            

                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>

                  {/* Milestones Section */}
                  {expanded[invoice.id]?.milestones && (
                    <TableRow>
                      <TableCell colSpan={8} className="bg-gray-50">
                        <div className="p-4">
                          <h4 className="font-semibold mb-2">Milestones</h4>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Description</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Assigned To</TableHead>
                                <TableHead>Action</TableHead>

                                
                                {canCoSignMilestone && (
                                  <TableHead>Co-Sign</TableHead>
                                )}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {invoice.milestones.map((milestone) => (
                                <TableRow key={milestone.id}>
                                  <TableCell>{milestone.description}</TableCell>
                                  <TableCell>${milestone.payment_amount.toFixed(2)}</TableCell>
                                  <TableCell>{format(new Date(milestone.due_date), 'MMM dd, yyyy')}</TableCell>
                                  <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(milestone.status)}`}>
                                      {milestone.status}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    {milestone.assigned_to ? (
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">{milestone.assigned_to.name}</span>
                                        <span className="text-xs text-gray-500">
                                          Assigned by {milestone.assigned_by?.name}
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-xs text-gray-500">Unassigned</span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          setSelectedMilestone(milestone);
                                          setShowMilestoneDialog(true);
                                        }}
                                      >
                                        View Details
                                      </Button>
                                      {canAssignMilestones && !milestone.assigned_to && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            setSelectedMilestoneForAssignment(milestone.id);
                                            setShowAssignAnalystDialog(true);
                                          }}
                                        >
                                          Assign
                                        </Button>
                                      )}
                                    </div>
                                  </TableCell>
                                 
                                    
                                  {canCoSignMilestone && (
                                  <TableCell>
                                     <Button variant="ghost" size="sm" className="text-green-600 flex items-center gap-2" onClick={() => handleCoSign(milestone.id)}>
                                      <Check className="h-4 w-4" />
                                      Co-Sign
                                    </Button>
                                  </TableCell>
                                  )}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}

                  {/* Funding Requests Section */}
                  {expanded[invoice.id]?.fundingRequests && (
                    <TableRow>
                      <TableCell colSpan={8} className="bg-gray-50">
                        <div className="p-4">
                          <h4 className="font-semibold mb-2">Funding Requests</h4>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Requested Amount</TableHead>
                                <TableHead>Contribution</TableHead>
                                <TableHead>Submission Date</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {invoice.funding_requests.map((request) => (
                                <TableRow key={request.id}>
                                  <TableCell>${request.requested_amount.toFixed(2)}</TableCell>
                                  <TableCell>${request.your_contribution.toFixed(2)}</TableCell>
                                  <TableCell>{format(new Date(request.submission_date), 'MMM dd, yyyy')}</TableCell>
                                  <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(request.status)}`}>
                                      {request.status}
                                    </span>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-500">
          Showing {((filters.page ?? 1) - 1) * (filters.limit ?? 10) + 1} to {Math.min((filters.page ?? 1) * (filters.limit ?? 10), invoiceData?.metadata.total ?? 0)} of {invoiceData?.metadata.total ?? 0} entries
        </p>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange((filters.page ?? 1) - 1)}
                className={(filters.page ?? 1) <= 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            {Array.from({ length: invoiceData?.metadata.totalPages ?? 0 }, (_, i) => i + 1)
              .filter(page => {
                const currentPage = filters.page ?? 1;
                return page === 1 ||
                       page === (invoiceData?.metadata.totalPages ?? 0) ||
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
                className={(filters.page ?? 1) >= (invoiceData?.metadata.totalPages ?? 0) ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {selectedMilestone && (
        <MilestoneDetailsDialog
          isOpen={showMilestoneDialog}
          onClose={() => {
            setShowMilestoneDialog(false);
            setSelectedMilestone(null);
          }}
          milestone={selectedMilestone}
          invoice={(invoiceData?.data.find(i => i.id === selectedMilestone?.invoice_id) ?? null) as unknown as Invoice}
        />
      )}

      {selectedInvoice && (
        <InvoiceDetailsDialog
          isOpen={showInvoiceDialog}
          onClose={() => {
            setShowInvoiceDialog(false);
            setSelectedInvoice(null);
          }}
          invoice={selectedInvoice as unknown as Invoice & {
            user: { first_name: string; last_name: string }
            vendor: { name: string }
          }}
          onMarkDelivered={handleMarkDelivered}
          canMarkDelivered={canMarkDelivered}
        />
      )}

    
      <AssignAnalystDialog
        isOpen={showAssignAnalystDialog}
        onOpenChange={setShowAssignAnalystDialog}
        milestoneId={selectedMilestoneForAssignment}
        onSuccess={() => {
          setSelectedMilestoneForAssignment(null)
          refetch()
        }}
      />
    </div>
  );
}

export default InvoiceReview;