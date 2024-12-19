'use client'

import { Card } from '@/components/ui/card'
import { Clock } from 'lucide-react'
import Image from 'next/image'
import { format } from 'date-fns'
import { ActivityAndNotificationsProps } from '@/types/dashboard'

export function ActivityAndNotifications({ dashboardSummary }: ActivityAndNotificationsProps) {
  return (
    <>
      {/* Recent Activity */}
      <div className="w-full md:w-1/2">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {dashboardSummary?.recentActivity.map((activity) => (
            <Card key={activity.id} className="p-4">
              <div className="flex items-center gap-4">
                {activity.type === "MILESTONE_STATUS_UPDATE" && <Clock className="h-4 w-4" />}
                <div>
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(activity.created_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="w-full md:w-1/2">
        <h2 className="text-xl font-bold mb-4">Notifications</h2>
        <div className="space-y-4">
          {dashboardSummary?.unreadNotifications.map((notification) => (
            <Card key={notification.id} className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg overflow-hidden">
                  <Image 
                    src={`/images/not1.png`} 
                    alt="Notification" 
                    width={48} 
                    height={48} 
                  />
                </div>
                <div>
                  <p className="font-medium">{notification.message}</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(notification.created_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </>
  )
} 