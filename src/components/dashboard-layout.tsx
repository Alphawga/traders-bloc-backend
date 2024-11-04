'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { BellIcon, HomeIcon, FileTextIcon, CreditCardIcon, DollarSignIcon, BarChartIcon, UserIcon, SettingsIcon, SearchIcon } from 'lucide-react'

export function Sidebar({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const pathname = usePathname()

  return (
    <div className={cn("pb-12 w-64", className)}>
      <div className="flex flex-col h-screen justify-between py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Traders by bloc
          </h2>
          <div className="space-y-1">
            <h3 className="mb-2 px-4 text-sm font-semibold text-muted-foreground">Main Menu</h3>
            <Button variant={pathname === '/dashboard' ? 'secondary' : 'ghost'} className="w-full justify-start" asChild>
              <Link href="/dashboard">
                <HomeIcon className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            <Button variant={pathname === '/invoices' ? 'secondary' : 'ghost'} className="w-full justify-start" asChild>
              <Link href="/invoices">
                <FileTextIcon className="mr-2 h-4 w-4" />
                Invoices
              </Link>
            </Button>
            <Button variant={pathname === '/milestone' ? 'secondary' : 'ghost'} className="w-full justify-start" asChild>
              <Link href="/milestone">
                <CreditCardIcon className="mr-2 h-4 w-4" />
                Milestones
              </Link>
            </Button>
            <Button variant={pathname === '/funding-request' ? 'secondary' : 'ghost'} className="w-full justify-start" asChild>
              <Link href="/funding-request">
                <DollarSignIcon className="mr-2 h-4 w-4" />
                Funding Request
              </Link>
            </Button>
            <Button variant={pathname === '/reports' ? 'secondary' : 'ghost'} className="w-full justify-start" asChild>
              <Link href="/reports">
                <BarChartIcon className="mr-2 h-4 w-4" />
                Reports
              </Link>
            </Button>
          </div>
        </div>
        <div className="px-3 py-2">
          <h3 className="mb-2 px-4 text-sm font-semibold text-muted-foreground">Help & Settings</h3>
          <div className="space-y-1">
            <Button variant={pathname === '/profile' ? 'secondary' : 'ghost'} className="w-full justify-start" asChild>
              <Link href="/profile">
                <UserIcon className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </Button>
            <Button variant={pathname === '/settings' ? 'secondary' : 'ghost'} className="w-full justify-start" asChild>
              <Link href="/profile">
                <SettingsIcon className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Header() {
    const pathname = usePathname()
    const segments = pathname.split('/').filter(Boolean);
const title = segments.length === 1 
  ? segments[0] 
  : segments.length >= 3 
    ? segments[1] 
    : '';

const displayTitle = title.charAt(0).toUpperCase() + title.slice(1);
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b">
      <h1 className="text-2xl font-semibold">
      {displayTitle}
      </h1>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <SearchIcon className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search here..."
            className="w-[300px] pl-8"
          />
        </div>
        <Button variant="ghost" size="icon">
          <BellIcon className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>
        <Avatar>
          <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <ScrollArea className="w-64 border-r">
        <Sidebar className="p-4" />
      </ScrollArea>
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
