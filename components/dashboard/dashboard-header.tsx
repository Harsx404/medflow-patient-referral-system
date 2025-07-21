"use client"

import { Bell, Moon, Sun, Settings } from 'lucide-react'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import { UploadReferral } from './upload-referral'

export function DashboardHeader() {
  const { theme, setTheme } = useTheme()
  const { liveUpdates } = useAppStore()
  
  const unreadNotifications = liveUpdates.filter(update => {
    const updateTime = new Date(update.timestamp)
    const now = new Date()
    const diffInMinutes = (now.getTime() - updateTime.getTime()) / (1000 * 60)
    return diffInMinutes < 30 // Consider notifications from last 30 minutes as unread
  }).length

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <Image
                  src="/assets/logos/Group-455.png"
                  alt="MedFlow Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                  priority
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">Patient Referral Management</p>
              </div>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Upload Referral */}
            <UploadReferral />

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="relative bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                >
                  <Bell className="h-4 w-4" />
                  {unreadNotifications > 0 && (
                    <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {unreadNotifications}
                      </span>
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <DropdownMenuLabel className="text-slate-700 dark:text-slate-300">Recent Activity</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
                {liveUpdates.slice(0, 5).map((update) => (
                  <DropdownMenuItem 
                    key={update.id} 
                    className="flex flex-col items-start p-3 hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{update.type}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(update.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {update.patientName} - Dr. {update.doctorName}
                    </span>
                  </DropdownMenuItem>
                ))}
                {liveUpdates.length === 0 && (
                  <DropdownMenuItem disabled className="text-slate-500 dark:text-slate-400">
                    No recent activity
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Settings */}
            <Button 
              variant="outline" 
              size="icon"
              className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}