"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAppStore } from '@/lib/store'
import { Users, Clock, Activity } from 'lucide-react'

export function DoctorsPanel() {
  const { doctors } = useAppStore()
  
  const availableDoctors = doctors.filter(d => d.availability)
  const totalPatients = doctors.reduce((sum, doctor) => sum + doctor.currentPatients, 0)
  const avgResponseTime = doctors.reduce((sum, doctor) => sum + (doctor.responseTime || 0), 0) / doctors.length

  return (
    <Card className="border-0 shadow-lg bg-white dark:bg-slate-800 h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-3 text-lg font-semibold">
          <div className="p-2 rounded-lg bg-blue-600 text-white">
            <Users className="h-5 w-5" />
          </div>
          <span className="text-slate-900 dark:text-white">
            Doctors Availability
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-hidden">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4 flex-shrink-0">
          <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
            <div className="text-xl font-bold text-green-600 dark:text-green-400">{availableDoctors.length}</div>
            <div className="text-xs font-medium text-green-700 dark:text-green-300">Available</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
            <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{totalPatients}</div>
            <div className="text-xs font-medium text-blue-700 dark:text-blue-300">Patients</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800">
            <div className="text-xl font-bold text-purple-600 dark:text-purple-400">{Math.round(avgResponseTime)}m</div>
            <div className="text-xs font-medium text-purple-700 dark:text-purple-300">Avg Time</div>
          </div>
        </div>
        
        {/* Doctors List */}
        <div className="space-y-3 overflow-y-auto flex-1 scrollbar-thin scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-800 dark:scrollbar-thumb-slate-600 hover:scrollbar-thumb-slate-400 dark:hover:scrollbar-thumb-slate-500 scrollbar-thumb-rounded-full scrollbar-track-rounded-full pr-2">
          {doctors.map((doctor) => {
            const initials = doctor.name
              .split(' ')
              .map(n => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)
            
            return (
              <div key={doctor.id} className="group flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <Avatar className="h-10 w-10 ring-2 ring-slate-200 dark:ring-slate-700 group-hover:ring-slate-300 dark:group-hover:ring-slate-600 transition-all flex-shrink-0">
                    <AvatarFallback className="text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">{doctor.name}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-medium truncate">{doctor.specialization}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <div className="text-right">
                    <div className="flex items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <Users className="h-3 w-3 mr-1" />
                      {doctor.currentPatients} pts
                    </div>
                    {doctor.responseTime && (
                      <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                        <Clock className="h-3 w-3 mr-1" />
                        {doctor.responseTime}m
                      </div>
                    )}
                  </div>
                  <Badge 
                    variant={doctor.availability ? "success" : "secondary"}
                    className={`px-2 py-1 text-xs font-medium ${
                      doctor.availability 
                        ? 'bg-green-500 text-white border-0 shadow-sm' 
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border-0'
                    }`}
                  >
                    <Activity className="h-3 w-3 mr-1" />
                    {doctor.availability ? 'Available' : 'Busy'}
                  </Badge>
                </div>
              </div>
            )
          })}
        </div>
        
        {doctors.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No doctors data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}