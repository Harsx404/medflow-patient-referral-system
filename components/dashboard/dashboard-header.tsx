"use client"

import { Bell, Moon, Sun, Settings, Sparkles, Activity, User, LogOut } from 'lucide-react'
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
    <header className="relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border-b border-slate-200/50 dark:border-slate-700/50 sticky top-0 z-50">
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-transparent to-purple-50/30 dark:from-blue-950/20 dark:via-transparent dark:to-purple-950/20" />
      
      <div className="relative container mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          {/* Enhanced Logo and Title */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                <div className="relative p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <Image
                    src="/assets/logos/Group-455.png"
                    alt="MedFlow Logo"
                    width={32}
                    height={32}
                    className="object-contain filter brightness-0 invert"
                    priority
                  />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                    MedFlow Dashboard
                  </h1>
                  <div className="flex items-center gap-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                    <Sparkles className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Pro</span>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                  Advanced Patient Referral Management System
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Right Side Actions */}
          <div className="flex items-center space-x-2">
            {/* Upload Referral - Enhanced */}
            <div className="hidden md:block">
              <UploadReferral />
            </div>

            {/* Activity Indicator */}
            <Button
              variant="ghost"
              size="sm"
              className="hidden lg:flex items-center gap-2 px-3 py-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 transition-all duration-200"
            >
              <Activity className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-medium">Live</span>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            </Button>

            {/* Enhanced Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 transition-all duration-200 hover:scale-105"
                >
                  <Bell className="h-5 w-5" />
                  {unreadNotifications > 0 && (
                    <>
                      <div className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white text-xs font-bold">
                          {unreadNotifications > 9 ? '9+' : unreadNotifications}
                        </span>
                      </div>
                      <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full animate-ping opacity-75" />
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-96 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl">
                <DropdownMenuLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300 px-4 py-3">
                  <Activity className="h-4 w-4" />
                  Recent Activity
                  {unreadNotifications > 0 && (
                    <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs">
                      {unreadNotifications} new
                    </Badge>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-200/50 dark:bg-slate-700/50" />
                <div className="max-h-80 overflow-y-auto">
                  {liveUpdates.slice(0, 8).map((update) => (
                    <DropdownMenuItem 
                      key={update.id} 
                      className="flex flex-col items-start p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-colors duration-200 border-b border-slate-100/50 dark:border-slate-800/50 last:border-0"
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            update.type === 'Accepted' ? 'bg-emerald-500' :
                            update.type === 'Rejected' ? 'bg-red-500' :
                            update.type === 'Transferred' ? 'bg-blue-500' :
                            'bg-amber-500'
                          }`} />
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{update.type}</span>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {new Date(update.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        <span className="font-medium">{update.patientName}</span> • Dr. {update.doctorName}
                      </div>
                    </DropdownMenuItem>
                  ))}
                  {liveUpdates.length === 0 && (
                    <DropdownMenuItem disabled className="text-slate-500 dark:text-slate-400 p-4 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Bell className="h-8 w-8 opacity-50" />
                        <span>No recent activity</span>
                      </div>
                    </DropdownMenuItem>
                  )}
                </div>
                <DropdownMenuSeparator className="bg-slate-200/50 dark:bg-slate-700/50" />
                <DropdownMenuItem className="p-3 text-center text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 font-medium">
                  View all notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Enhanced Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 transition-all duration-200 hover:scale-105"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Enhanced User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 transition-all duration-200 hover:scale-105"
                >
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl">
                <DropdownMenuLabel className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-700 dark:text-slate-300">Admin User</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">admin@medflow.com</p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-200/50 dark:bg-slate-700/50" />
                <DropdownMenuItem className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50/80 dark:hover:bg-slate-800/80">
                  <Settings className="h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50/80 dark:hover:bg-slate-800/80">
                  <User className="h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-200/50 dark:bg-slate-700/50" />
                <DropdownMenuItem className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30">
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}