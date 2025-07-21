"use client"

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Search, Filter, Clock, Activity } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

export default function NotificationsPage() {
  const { liveUpdates } = useAppStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [sortOrder, setSortOrder] = useState('newest')

  const getStatusColor = (type: string) => {
    switch (type) {
      case 'Accepted':
        return 'success'
      case 'Rejected':
        return 'destructive'
      case 'Transferred':
        return 'default'
      case 'Created':
        return 'secondary'
      default:
        return 'outline'
    }
  }
  
  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'Accepted':
        return '✅'
      case 'Rejected':
        return '❌'
      case 'Transferred':
        return '🔄'
      case 'Created':
        return '📝'
      default:
        return '📋'
    }
  }

  // Filter and sort notifications
  const filteredNotifications = liveUpdates
    .filter(update => {
      const matchesSearch = update.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           update.doctorName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFilter = filterType === 'all' || update.type === filterType
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      } else {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      }
    })

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="hover:bg-slate-100 dark:hover:bg-slate-800">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-emerald-500 text-white">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">All Notifications</h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{filteredNotifications.length} total notifications</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Filters */}
        <Card className="mb-6 border-0 shadow-lg bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Filter className="h-5 w-5" />
              <span>Filter & Search</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by patient or doctor name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Accepted">Accepted</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Transferred">Transferred</SelectItem>
                  <SelectItem value="Created">Created</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <Card className="border-0 shadow-lg bg-white dark:bg-slate-800">
          <CardContent className="p-6">
            {filteredNotifications.length > 0 ? (
              <div className="space-y-4">
                {filteredNotifications.map((update) => (
                  <div key={update.id} className="group flex items-start space-x-4 p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                    <div className="text-2xl p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex-shrink-0">
                      {getStatusIcon(update.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-3">
                        <Badge 
                          variant={getStatusColor(update.type) as any} 
                          className={`text-sm font-medium px-3 py-1 ${
                            update.type === 'Accepted' ? 'bg-green-500 text-white border-0' :
                            update.type === 'Rejected' ? 'bg-red-500 text-white border-0' :
                            update.type === 'Transferred' ? 'bg-blue-500 text-white border-0' :
                            update.type === 'Created' ? 'bg-purple-500 text-white border-0' :
                            'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border-0'
                          }`}
                        >
                          {update.type}
                        </Badge>
                        <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                          <Clock className="h-4 w-4 mr-2" />
                          {formatDate(update.timestamp)}
                        </div>
                      </div>
                      <div className="mb-2">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                          Patient: {update.patientName}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                          Handled by {update.doctorName}
                        </p>
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {update.type === 'Accepted' && 'Patient referral has been accepted and is being processed.'}
                        {update.type === 'Rejected' && 'Patient referral has been rejected. Please review the case.'}
                        {update.type === 'Transferred' && 'Patient has been transferred to another department.'}
                        {update.type === 'Created' && 'New patient referral has been created and is pending review.'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <div className="p-6 rounded-full bg-slate-100 dark:bg-slate-800 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <Activity className="h-10 w-10 opacity-50" />
                </div>
                <h3 className="text-lg font-medium mb-2">No notifications found</h3>
                <p className="text-sm">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}