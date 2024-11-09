'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import useUserStore from '@/store/user-store'
import Link from 'next/link'

export default function Dashboard() {
  const router = useRouter()
  const { user } = useUserStore()
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good Morning')
    else if (hour < 18) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')
  }, [])

  const quickLinks = [
    { title: 'Submit an invoice', icon: <ArrowRight className="h-5 w-5" />, href: '/submit-invoice' },
    {title: 'View invoices', icon: <ArrowRight className="h-5 w-5" />, href: '/invoices'},
    {title: 'View Reports', icon: <ArrowRight className="h-5 w-5" />, href: '/reports'}
  ]

  const summaryData = [
    { title: 'Invoices', value: user?.invoices?.length || 0, change: '+20%', changeColor: 'text-green-600' },
    { title: 'Funding requests', value: user?.funding_requests?.length || 0, change: '-50%', changeColor: 'text-red-600' },
    { title: 'Total funded', value: `$${user?.invoices?.filter(invoice => invoice.status === 'APPROVED').reduce((acc, invoice) => acc + (invoice.total_price || 0), 0).toLocaleString()}`, change: '+$2,000', changeColor: 'text-green-600' },
    { title: 'Upcoming payments', value: user?.invoices?.filter(invoice => invoice.status === 'PENDING').length || 0, change: '0%', changeColor: 'text-gray-600' },
  ]

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="relative overflow-hidden rounded-lg mb-6 sm:mb-8">
        <div className="absolute inset-0 bg-black bg-opacity-90">
          <div className="h-full flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6">
            <div className="text-white mb-4 sm:mb-0">
              <h2 className="text-xl sm:text-2xl font-bold mb-2">Welcome Back!</h2>
              <p>{greeting}, {user?.first_name}</p>
              <p className="text-gray-300">Have a good Day Ahead</p>
            </div>
            <Link href={"/submit-invoice"} className="bg-white text-black hover:bg-gray-200 p-2 z-50 rounded-sm text-sm sm:text-base">
              Submit Invoice
            </Link>
          </div>
        </div>
        <Image
          src="/images/rb_89591.png"
          alt="Dashboard background"
          width={1200}
          height={300}
          className="w-full h-auto object-cover opacity-45"
        />
      </div>

      <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Quick Links</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {quickLinks.map((link, index) => (
          <Button
            key={index}
            variant="outline"
            className="justify-start h-auto py-3 sm:py-4 px-4 sm:px-6 text-sm sm:text-base"
            onClick={() => router.push(link.href)}
          >
            {link.icon}
            <span className="ml-2">{link.title}</span>
          </Button>
        ))}
      </div>

      <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Summary</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {summaryData.map((item, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{item.value}</div>
              <p className={`text-xs ${item.changeColor}`}>{item.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Notifications</h2>
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden flex-shrink-0">
            <Image src="/images/not1.png" alt="Invoice notification" width={48} height={48} className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="font-medium text-sm sm:text-base">Invoice 123 from Project Alpha</p>
            <p className="text-xs sm:text-sm text-gray-500">Due date: 5/12/24</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden flex-shrink-0">
            <Image src="/images/not2.png" alt="Funding request notification" width={48} height={48} className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="font-medium text-sm sm:text-base">Funding request #456</p>
            <p className="text-xs sm:text-sm text-gray-500">Approved for $3,000</p>
          </div>
        </div>
      </div>
    </div>
  )
}