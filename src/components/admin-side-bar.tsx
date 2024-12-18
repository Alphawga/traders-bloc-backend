'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { HomeIcon, FileTextIcon, CreditCardIcon, DollarSignIcon, BarChartIcon, UserIcon, LogOutIcon, KeyRoundIcon, UsersIcon } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { usePermission } from "@/hooks/use-permission"

export function AdminSidebar({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const pathname = usePathname()
  const { hasPermission } = usePermission()

  return (
    <div className={cn("pb-12 w-64", className)}>
      <div className="flex flex-col h-screen justify-between py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Traders by bloc
          </h2>
          <div className="space-y-1">
            <h3 className="mb-2 px-4 text-sm font-semibold text-muted-foreground pb-2">Main Menu</h3>
            <Button variant={pathname === '/admin/dashboard' ? 'secondary' : 'ghost'} className="w-full justify-start" asChild>
              <Link href="/admin/dashboard">
                <HomeIcon className="mr-2 h-4 w-4" />
                Admin Dashboard
              </Link>
            </Button>
            <Button variant={pathname === '/admin/kyc-reviews' ? 'secondary' : 'ghost'} className="w-full justify-start" asChild>
              <Link href="/admin/kyc-reviews">
                <FileTextIcon className="mr-2 h-4 w-4" />
                KYC
              </Link>
            </Button>
            <Button variant={pathname === '/admin/access-control' ? 'secondary' : 'ghost'} className="w-full justify-start" asChild>
              <Link href="/admin/access-control">
                <KeyRoundIcon className="mr-2 h-4 w-4" />
                Access Control
              </Link>
            </Button>
            {hasPermission('OVERSEE_CREDIT_OPERATIONS_PIPELINE') && (
              <Button variant={pathname === '/admin/staffs-workload' ? 'secondary' : 'ghost'} className="w-full justify-start" asChild>
                <Link href="/admin/staffs-workload">
                  <UsersIcon className="mr-2 h-4 w-4" />
                  Staff Workload
                </Link>
              </Button>
            )}
            <Button variant={pathname === '/admin/invoices' ? 'secondary' : 'ghost'} className="w-full justify-start" asChild>
              <Link href="/admin/invoices">
                <FileTextIcon className="mr-2 h-4 w-4" />
                Invoices
              </Link>
            </Button>
            <Button variant={pathname === '/admin/milestone' ? 'secondary' : 'ghost'} className="w-full justify-start" asChild>
              <Link href="/admin/milestone">
                <CreditCardIcon className="mr-2 h-4 w-4" />
                Milestones
              </Link>
            </Button>
            <Button variant={pathname === '/admin/funding-requests' ? 'secondary' : 'ghost'} className="w-full justify-start" asChild>
              <Link href="/admin/funding-requests">
                <DollarSignIcon className="mr-2 h-4 w-4" />
                Funding Request
              </Link>
            </Button>
            <Button variant={pathname === '/admin/reports' ? 'secondary' : 'ghost'} className="w-full justify-start" asChild>
              <Link href="/admin/reports">
                <BarChartIcon className="mr-2 h-4 w-4" />
                Reports
              </Link>
            </Button>
          </div>
        </div>
        <div className="px-3 py-2">
          <h3 className="mb-2 px-4 text-sm font-semibold text-muted-foreground">Help & Settings</h3>
          <div className="space-y-1">
            <Button variant={pathname === '/admin/profile' ? 'secondary' : 'ghost'} className="w-full justify-start" asChild>
              <Link href="/admin/profile">
                <UserIcon className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </Button>
            <Button variant={pathname === '/' ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={()=>signOut()} asChild>
              <Link href="/">
                <LogOutIcon className="mr-2 h-4 w-4" />
                Sign Out
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminSidebar