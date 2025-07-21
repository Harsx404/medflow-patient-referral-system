"use client"

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import { CheckCircle, XCircle, ArrowRightLeft, Clock, TrendingUp, TrendingDown, Activity, Users, BarChart3, Zap } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer, Tooltip, AreaChart, Area } from 'recharts'

export function StatsCards() {
  const { patients } = useAppStore()
  
  // Memoize statistics calculations to prevent unnecessary re-computations
  const stats = useMemo(() => ({
    accepted: patients.filter(p => p.status === 'Accepted').length,
    rejected: patients.filter(p => p.status === 'Rejected').length,
    transferred: patients.filter(p => p.status === 'Transferred').length,
    pending: patients.filter(p => p.status === 'Pending').length,
    total: patients.length
  }), [patients])
  
  const acceptanceRate = useMemo(() => 
    stats.total > 0 ? Math.round((stats.accepted / stats.total) * 100) : 0,
    [stats.accepted, stats.total]
  )
  
  const rejectionRate = useMemo(() => 
    stats.total > 0 ? Math.round((stats.rejected / stats.total) * 100) : 0,
    [stats.rejected, stats.total]
  )

  // Enhanced trend data for charts
  const trendData = useMemo(() => [
    { name: 'Week 1', accepted: 45, rejected: 12, transferred: 8, pending: 15 },
    { name: 'Week 2', accepted: 52, rejected: 10, transferred: 12, pending: 18 },
    { name: 'Week 3', accepted: 48, rejected: 8, transferred: 15, pending: 12 },
    { name: 'Week 4', accepted: stats.accepted, rejected: stats.rejected, transferred: stats.transferred, pending: stats.pending }
  ], [stats])
  


  return (
    <div className="space-y-8">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Accepted Referrals */}
        <Card className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 dark:from-emerald-950/20 dark:via-slate-900 dark:to-emerald-950/10 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="pb-4 relative z-10">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-xl" />
                    <div className="relative p-3 bg-emerald-500 rounded-2xl shadow-lg">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Accepted Referrals
                    </p>
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">
                      {stats.accepted}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 px-3 py-1">
                    {acceptanceRate}% rate
                  </Badge>
                  <div className="flex items-center text-sm text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span className="font-medium">+12%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 relative z-10">
            <div className="h-16">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="acceptedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="accepted"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#acceptedGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Rejected Referrals */}
        <Card className="group relative overflow-hidden bg-gradient-to-br from-red-50 via-white to-red-50/30 dark:from-red-950/20 dark:via-slate-900 dark:to-red-950/10 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="pb-4 relative z-10">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-red-500/20 rounded-2xl blur-xl" />
                    <div className="relative p-3 bg-red-500 rounded-2xl shadow-lg">
                      <XCircle className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Rejected Referrals
                    </p>
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">
                      {stats.rejected}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0 px-3 py-1">
                    {rejectionRate}% rate
                  </Badge>
                  <div className="flex items-center text-sm text-red-600 dark:text-red-400">
                    <TrendingDown className="h-4 w-4 mr-1" />
                    <span className="font-medium">-8%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 relative z-10">
            <div className="h-16">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="rejectedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="rejected"
                    stroke="#ef4444"
                    strokeWidth={2}
                    fill="url(#rejectedGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Transferred Referrals */}
        <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50/30 dark:from-blue-950/20 dark:via-slate-900 dark:to-blue-950/10 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="pb-4 relative z-10">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl" />
                    <div className="relative p-3 bg-blue-500 rounded-2xl shadow-lg">
                      <ArrowRightLeft className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Transferred Referrals
                    </p>
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">
                      {stats.transferred}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0 px-3 py-1">
                    {Math.round((stats.transferred / stats.total) * 100) || 0}% rate
                  </Badge>
                  <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span className="font-medium">+5%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 relative z-10">
            <div className="h-16">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="transferredGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="transferred"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#transferredGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pending Referrals */}
        <Card className="group relative overflow-hidden bg-gradient-to-br from-amber-50 via-white to-amber-50/30 dark:from-amber-950/20 dark:via-slate-900 dark:to-amber-950/10 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="pb-4 relative z-10">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-amber-500/20 rounded-2xl blur-xl" />
                    <div className="relative p-3 bg-amber-500 rounded-2xl shadow-lg">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Pending Referrals
                    </p>
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">
                      {stats.pending}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0 px-3 py-1">
                    {Math.round((stats.pending / stats.total) * 100) || 0}% rate
                  </Badge>
                  <div className="flex items-center text-sm text-amber-600 dark:text-amber-400">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="font-medium">Review</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 relative z-10">
            <div className="h-16">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="pendingGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="pending"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fill="url(#pendingGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Overview Card */}
      <Card className="bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-0 shadow-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                  Referral Analytics Overview
                </CardTitle>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Comprehensive insights into referral patterns and trends
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.total}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Referrals</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {acceptanceRate}%
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Success Rate</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line type="monotone" dataKey="accepted" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }} />
                <Line type="monotone" dataKey="rejected" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }} />
                <Line type="monotone" dataKey="transferred" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }} />
                <Line type="monotone" dataKey="pending" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}