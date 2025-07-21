"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { Activity, Clock, RefreshCw } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export function LiveUpdatesPanel() {
  const { liveUpdates } = useAppStore()
  
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

  const handleViewAllNotifications = () => {
    // Navigate to notifications page
    window.location.href = '/notifications'
  }

  return (
    <Card className="border-0 shadow-lg bg-white dark:bg-slate-800 h-full flex flex-col">
      <CardHeader className="pb-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-3 text-lg font-semibold">
            <div className="p-2 rounded-lg bg-green-600 text-white">
              <Activity className="h-5 w-5" />
            </div>
            <span className="text-slate-900 dark:text-white">
              Live Updates
            </span>
          </CardTitle>
          <Button variant="outline" size="sm" className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-3 scrollbar-thin scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-800 dark:scrollbar-thumb-slate-600 hover:scrollbar-thumb-slate-400 dark:hover:scrollbar-thumb-slate-500 scrollbar-thumb-rounded-full scrollbar-track-rounded-full pr-2">
          {liveUpdates.length > 0 ? (
            <>
              {liveUpdates.slice(0, 4).map((update) => (
                <div key={update.id} className="group flex items-start space-x-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                  <div className="text-lg p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex-shrink-0">
                    {getStatusIcon(update.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <Badge 
                        variant={getStatusColor(update.type) as any} 
                        className={`text-xs font-medium px-2 py-0.5 ${
                          update.type === 'Accepted' ? 'bg-green-500 text-white border-0' :
                          update.type === 'Rejected' ? 'bg-red-500 text-white border-0' :
                          update.type === 'Transferred' ? 'bg-blue-500 text-white border-0' :
                          update.type === 'Created' ? 'bg-purple-500 text-white border-0' :
                          'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border-0'
                        }`}
                      >
                        {update.type}
                      </Badge>
                      <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDate(update.timestamp)}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate mb-0.5">
                      {update.patientName}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      by {update.doctorName}
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Activity className="h-6 w-6 opacity-50" />
              </div>
              <p className="text-sm font-medium mb-1">No recent activity</p>
              <p className="text-xs">Updates will appear here in real-time</p>
            </div>
          )}
        </div>
        
        {liveUpdates.length > 4 && (
          <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-700 mt-4 flex-shrink-0">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 w-full"
              onClick={handleViewAllNotifications}
            >
              View All Notifications ({liveUpdates.length})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}