'use client'
import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { IoSearchOutline } from "react-icons/io5"
import { trpc } from "@/app/_providers/trpc-provider"
import { toast } from "@/hooks/use-toast"
import { BLOCK_PERMISSIONS } from '@/lib/contants'
import { CreateAdminDialog } from "@/components/admin/CreateAdminDialog"
import { usePermission } from "@/hooks/use-permission"
import { notFound } from 'next/navigation'
import { CreateRoleDialog } from "@/components/admin/CreateRoleDialog"

interface FilterState {
  search: string
  status: 'all' | 'active' | 'inactive'
  role: string
  page: number
  limit: number
}

export default function AccessControl() {
  const [userFilters, setUserFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    role: 'all',
    page: 1,
    limit: 10,
  })

  const [adminFilters, setAdminFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    role: 'all',
    page: 1,
    limit: 10,
  })
  const adminRefetch = trpc.useUtils().getAllAdmins.invalidate;
  const userRefetch = trpc.useUtils().getAllUsers.invalidate;

  const { data: usersData, isLoading: isLoadingUsers } = 
    trpc.getAllUsers.useQuery(userFilters)
  
  const { data: adminsData, isLoading: isLoadingAdmins } = 
    trpc.getAllAdmins.useQuery(adminFilters)
   
  const updateAdminStatus = trpc.updateAdminStatus.useMutation({
    onSuccess: () => {
      toast({ description: "Admin status updated successfully" })
      adminRefetch()
    },
    onError: () => {
      toast({ description: "Failed to update admin status", variant: "destructive" })
    }
  })

  const updateAdminRole = trpc.updateAdminRole.useMutation({
    onSuccess: () => {
      toast({ description: "Admin role updated successfully" })
      adminRefetch()
    },
    onError: () => {
      toast({ description: "Failed to update admin role", variant: "destructive" })
    }
  })

  const updateUserStatus = trpc.updateUserStatus.useMutation({
    onSuccess: () => {
      toast({ description: "User status updated successfully" })
      userRefetch()
    },
    onError: () => {
      toast({ description: "Failed to update user status", variant: "destructive" })
    }
  })

  const resetPassword = trpc.resetUserPassword.useMutation({
    onSuccess: () => {
      toast({ description: "Password reset email sent successfully" })
      userRefetch()
    },
    onError: () => {
      toast({ description: "Failed to send password reset email", variant: "destructive" })
    }
  })

  const handleRoleChange = async (newRole: string) => {
        await updateAdminRole.mutateAsync({ role: newRole })
  }

  const handleStatusChange = async (userId: string, isActive: boolean) => {
    await updateUserStatus.mutateAsync({ userId, isActive })
  }

  const handleAdminStatusChange = async (isActive: boolean) => {
    await updateAdminStatus.mutateAsync({ isActive })
  }

  const handlePasswordReset = async (userId: string) => {
    await resetPassword.mutateAsync({ userId })
  }

  const roles = [
    { value: BLOCK_PERMISSIONS.HEAD_OF_CREDIT, label: 'Head of Credit' },
    { value: BLOCK_PERMISSIONS.CREDIT_OPS_LEAD, label: 'Credit Ops Lead' },
    { value: BLOCK_PERMISSIONS.CREDIT_OPS_ANALYST, label: 'Credit Ops Analyst' },
    { value: BLOCK_PERMISSIONS.FINANCE, label: 'Finance' },
    { value: BLOCK_PERMISSIONS.COLLECTIONS, label: 'Collections' },
  ]

  const utils = trpc.useUtils()
  const { hasPermission } = usePermission()

  if (!hasPermission('VIEW_ACCESS_CONTROL')) {
    return notFound()
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Access Control</h1>
      <div className="flex justify-end gap-4">
        <CreateRoleDialog 
          onSuccess={() => {
            utils.getRoles.invalidate()
          }}
        />
        <CreateAdminDialog 
          onSuccess={() => {
            utils.getAllAdmins.invalidate()
          }}
        />
      </div>
      
      <Tabs defaultValue="users" className="w-full">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="admins">Admins</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          {/* Users Filter Section */}
          <div className="my-4 flex gap-4">
            <div className="relative flex-grow">
              <Input
                placeholder="Search users..."
                value={userFilters.search}
                onChange={(e) => setUserFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
              <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            <Select 
              onValueChange={(value) => setUserFilters(prev => ({ 
                ...prev, 
                status: value as 'all' | 'active' | 'inactive' 
              }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

          </div>

          {/* Users Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingUsers ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : (
                usersData?.data.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.first_name} {user.last_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.company_name}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        !user.deleted_at ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {!user.deleted_at ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleStatusChange(user.id, !!user.deleted_at)}
                        >
                          {user.deleted_at ? 'Activate' : 'Deactivate'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handlePasswordReset(user.id)}
                        >
                          Reset Password
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="admins">
          {/* Admins Filter Section */}
          <div className="my-4 flex gap-4">
            <div className="relative flex-grow">
              <Input
                placeholder="Search admins..."
                value={adminFilters.search}
                onChange={(e) => setAdminFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
              <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            <Select 
              onValueChange={(value) => setAdminFilters(prev => ({ 
                ...prev, 
                status: value as 'all' | 'active' | 'inactive' 
              }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              onValueChange={(value) => setAdminFilters(prev => ({ ...prev, role: value }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Admins Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingAdmins ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : (
                adminsData?.data.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell>{admin.name}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>
                      {admin.claims?.[0]?.role?.name || 'No Role'}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        !admin.deleted_at ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {!admin.deleted_at ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">Change Role</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Update Admin Role</DialogTitle>
                              <DialogDescription>
                                Select a new role for {admin.name}
                              </DialogDescription>
                            </DialogHeader>
                            <Select onValueChange={(value) => handleRoleChange( value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                {roles.map((role) => (
                                  <SelectItem key={role.value} value={role.value}>
                                    {role.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <DialogFooter>
                              <Button type="submit">Save changes</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleAdminStatusChange(!!admin.deleted_at)}
                        >
                          {admin.deleted_at ? 'Activate' : 'Deactivate'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
     
    </div>
  )
}
