"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import useUserStore from '@/store/user-store'
import { useUserData } from '@/hooks/use-user-data'
import { UserWithRelations } from '@/lib/model'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { MenuIcon } from 'lucide-react'
import AdminSidebar from '@/components/admin-side-bar'
import { AdminHeader } from '@/components/admin-header'

interface UserLayoutProps {
  children: React.ReactNode
}

export default function UserLayout({ children }: UserLayoutProps) {
  const router = useRouter()
  const { status, data: session } = useSession()
  const { user, setUser } = useUserStore()
  const { data: userData } = useUserData(session?.user?.id, "ADMIN")
  const [isMobile, setIsMobile] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    if (status === "authenticated" && userData) {
      setUser(userData as unknown as UserWithRelations)
    } else if (!user) {
      setUser(userData as unknown as UserWithRelations)
    }
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, userData, user, router, setUser])

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768) 
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)

    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])
  if(status === "loading"){
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2 animate-typing animate-bounce overflow-hidden whitespace-nowrap text-gray-500">
            Traders by bloc
          </h1>
        </div>
      </div>
    )
  }
  return (
    <div className="flex h-screen overflow-hidden">
      {isMobile ? (
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="fixed top-4 left-4 z-40"
            >
              <MenuIcon className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <ScrollArea className="h-full">
              <AdminSidebar />
            </ScrollArea>
          </SheetContent>
        </Sheet>
      ) : (
        <ScrollArea className="w-64 border-r">
          <AdminSidebar />
        </ScrollArea>
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}