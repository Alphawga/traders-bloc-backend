'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Bell, LogOut, Search, User, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import useUserStore from '@/store/user-store'
import { trpc } from '@/app/_providers/trpc-provider'


export function AdminHeader() {
  const [open, setOpen] = useState(false)
  const {user} = useUserStore()
  const pathname = usePathname()
  const router = useRouter()
  const segments = pathname.split('/').filter(Boolean)
  const title = segments.length === 1 
    ? segments[0]    
    : segments.length >= 3 
      ? segments[1] 
      : ''

  const displayTitle = title.charAt(0).toUpperCase() + title.slice(1)

  const utils = trpc.useUtils()
  const { mutate: markAsRead } = trpc.markNotificationAsRead.useMutation({
    onSuccess: () => {
      // Invalidate the admin data query to refresh notifications
      utils.getAdminData.invalidate()
    }
  })

  const handleNotificationClick = (notification_id: string) => {
    markAsRead({ notification_id })
  }

  return (
    <header className="flex items-center justify-between px-4 py-4 border-b lg:px-6">
      <div className="flex items-center">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[300px]">
            {/* Add your sidebar content here */}
            <nav className="flex flex-col space-y-4">
              <Link href="/admin/dashboard" className="text-sm font-medium">Dashboard</Link>
              <Link href="/admin/funding-requests" className="text-sm font-medium">Funding Requests</Link>
              <Link href="/admin/invoices" className="text-sm font-medium">Invoices</Link>
              <Link href="/admin/kyc-reviews" className="text-sm font-medium">KYC Reviews</Link>
              <Link href="/admin/milestones" className="text-sm font-medium">Milestones</Link>
              <Link href="/admin/reports" className="text-sm font-medium">Reports</Link>
            </nav>
          </SheetContent>
        </Sheet>
        <h1 className="text-xl font-semibold lg:text-2xl">
          {displayTitle}
        </h1>
      </div>
      <div className="flex items-center space-x-2 lg:space-x-4">
        <div className="relative hidden lg:block">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-[200px] pl-8 lg:w-[300px]"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-600" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {user?.notifications?.length && user?.notifications?.length > 0 ? (
              user?.notifications.map((notification) => (
                <DropdownMenuItem 
                  key={notification.id}
                  onClick={() => {
                    handleNotificationClick(notification.id)
                    router.push(notification?.link || '')
                  }}
                >
                  {notification.message}
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>No notifications</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
              <AvatarFallback>{user?.first_name?.charAt(0)}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Link href="/admin/profile">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" onClick={() => {
                signOut()
                router.push('/')
              }}/>
              <span className='cursor-pointer' onClick={() => {
                signOut()
                router.push('/')
              }}>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}