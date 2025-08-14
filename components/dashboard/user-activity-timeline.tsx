'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserIcon, ActivityIcon, ClockIcon, FilterIcon } from 'lucide-react'
import { AuditLog } from '@/lib/models/audit-log'

interface UserActivityTimelineProps {
  userId?: string
  className?: string
}

export function UserActivityTimeline({ userId, className }: UserActivityTimelineProps) {
  const [activities, setActivities] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState(userId || '')
  const [timeRange, setTimeRange] = useState('24h')

  useEffect(() => {
    if (selectedUser) {
      fetchUserActivities()
    }
  }, [selectedUser, timeRange])

  const fetchUserActivities = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        userId: selectedUser,
        limit: '50'
      })

      // Add time range filter
      const now = new Date()
      let startDate = new Date()
      
      switch (timeRange) {
        case '1h':
          startDate.setHours(now.getHours() - 1)
          break
        case '24h':
          startDate.setDate(now.getDate() - 1)
          break
        case '7d':
          startDate.setDate(now.getDate() - 7)
          break
        case '30d':
          startDate.setDate(now.getDate() - 30)
          break
        default:
          startDate.setDate(now.getDate() - 1)
      }

      params.append('startDate', startDate.toISOString())

      const response = await fetch(`/api/action-logs?${params}`)
      const data = await response.json()
      setActivities(data.logs || [])
    } catch (error) {
      console.error('Error fetching user activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActionIcon = (action: string) => {
    if (action.includes('login')) return '🔐'
    if (action.includes('logout')) return '🚪'
    if (action.includes('created')) return '➕'
    if (action.includes('updated')) return '✏️'
    if (action.includes('deleted')) return '🗑️'
    if (action.includes('uploaded')) return '📤'
    if (action.includes('downloaded')) return '📥'
    return '📋'
  }

  const getActionColor = (action: string) => {
    if (action.includes('created')) return 'bg-green-100 text-green-800'
    if (action.includes('updated')) return 'bg-blue-100 text-blue-800'
    if (action.includes('deleted')) return 'bg-red-100 text-red-800'
    if (action.includes('login')) return 'bg-purple-100 text-purple-800'
    if (action.includes('logout')) return 'bg-gray-100 text-gray-800'
    return 'bg-gray-100 text-gray-800'
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60)
      return `${diffInMinutes} minutes ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
    }
  }

  const groupActivitiesByDate = (activities: AuditLog[]) => {
    const groups: Record<string, AuditLog[]> = {}
    
    activities.forEach(activity => {
      const date = new Date(activity.timestamp).toLocaleDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(activity)
    })
    
    return groups
  }

  const groupedActivities = groupActivitiesByDate(activities)

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            User Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Controls */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Select User</label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a user..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin User</SelectItem>
                  <SelectItem value="doctor1">Dr. Smith</SelectItem>
                  <SelectItem value="doctor2">Dr. Johnson</SelectItem>
                  <SelectItem value="nurse1">Nurse Williams</SelectItem>
                  <SelectItem value="receptionist1">Receptionist Brown</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Time Range</label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading activities...</p>
            </div>
          )}

          {!loading && activities.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <ActivityIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No activities found for this user in the selected time range.</p>
            </div>
          )}

          {!loading && activities.length > 0 && (
            <div className="space-y-6">
              {Object.entries(groupedActivities).map(([date, dayActivities]) => (
                <div key={date} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-4 w-4 text-gray-500" />
                    <h3 className="font-medium text-gray-900">{date}</h3>
                    <Badge variant="secondary">{dayActivities.length} activities</Badge>
                  </div>
                  
                  <div className="space-y-3 ml-6">
                    {dayActivities.map((activity, index) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm">
                          {getActionIcon(activity.action)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getActionColor(activity.action)}>
                              {activity.action.replace(/_/g, ' ')}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {formatTimestamp(activity.timestamp)}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-700 mb-1">
                            {activity.details}
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Resource: {activity.resourceName}</span>
                            <span>Type: {activity.resourceType}</span>
                            {activity.ipAddress && (
                              <span>IP: {activity.ipAddress}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Activity Summary */}
          {!loading && activities.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Activity Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-blue-600 font-medium">Total Actions:</span>
                  <span className="ml-2">{activities.length}</span>
                </div>
                <div>
                  <span className="text-blue-600 font-medium">Unique Resources:</span>
                  <span className="ml-2">
                    {new Set(activities.map(a => a.resourceType)).size}
                  </span>
                </div>
                <div>
                  <span className="text-blue-600 font-medium">Action Types:</span>
                  <span className="ml-2">
                    {new Set(activities.map(a => a.action)).size}
                  </span>
                </div>
                <div>
                  <span className="text-blue-600 font-medium">Time Range:</span>
                  <span className="ml-2">{timeRange}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 