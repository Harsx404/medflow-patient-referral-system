"use client"

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import { CheckCircle, XCircle, ArrowRightLeft, Clock, TrendingUp, TrendingDown, Activity, Users, FileText, BarChart3 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts'

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

  // Mock trend data for line charts
  const acceptanceTrendData = useMemo(() => [
    { month: 'Jan', rate: 78 },
    { month: 'Feb', rate: 82 },
    { month: 'Mar', rate: 85 },
    { month: 'Apr', rate: 88 },
    { month: 'May', rate: 92 },
    { month: 'Jun', rate: acceptanceRate }
  ], [acceptanceRate])
  
  // Pie chart data for status distribution
  const pieData = useMemo(() => [
    { name: 'Accepted', value: stats.accepted, color: '#10b981' },
    { name: 'Rejected', value: stats.rejected, color: '#ef4444' },
    { name: 'Transferred', value: stats.transferred, color: '#3b82f6' },
    { name: 'Pending', value: stats.pending, color: '#f59e0b' }
  ], [stats])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Accepted Referrals - Large Card */}
      <div className="md:col-span-2 lg:col-span-2">
        <Card className="h-full min-h-[220px] bg-emerald-50 dark:bg-emerald-900/20 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-base font-medium text-slate-600 dark:text-slate-300">
                    Accepted Referrals
                  </CardTitle>
                  <div className="text-4xl font-bold text-slate-900 dark:text-white mt-1">
                    {stats.accepted}
                  </div>
                </div>
              </div>
              <Badge className="bg-emerald-600 text-white border-0 px-3 py-1.5 text-sm font-medium shadow-md">
                {acceptanceRate}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-20 w-full mb-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={acceptanceTrendData}>
                  <Line 
                    type="monotone" 
                    dataKey="rate" 
                    stroke="#10b981" 
                    strokeWidth={3} 
                    dot={false}
                    activeDot={{ r: 5, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                      fontSize: '12px'
                    }}
                    formatter={(value) => [`${value}%`, 'Acceptance Rate']}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center text-sm text-white bg-emerald-600 px-3 py-1.5 rounded-lg">
              <TrendingUp className="h-4 w-4 mr-2" />
              <span className="font-medium">+12% from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rejected Referrals - Medium Card */}
      <div className="lg:col-span-1">
        <Card className="h-full min-h-[220px] bg-red-50 dark:bg-red-900/20 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-red-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                <XCircle className="h-6 w-6 text-white" />
              </div>
              <Badge className="bg-red-600 text-white border-0 px-3 py-1.5 text-sm font-medium shadow-md">
                {rejectionRate}%
              </Badge>
            </div>
            <div className="mt-3">
              <CardTitle className="text-base font-medium text-slate-600 dark:text-slate-300 mb-1">
                Rejected
              </CardTitle>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {stats.rejected}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center text-sm text-white bg-red-600 px-3 py-1.5 rounded-lg">
              <TrendingDown className="h-4 w-4 mr-2" />
              <span className="font-medium">-8% this month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transferred Referrals - Medium Card */}
      <div className="lg:col-span-1">
        <Card className="h-full min-h-[220px] bg-blue-50 dark:bg-blue-900/20 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                <ArrowRightLeft className="h-6 w-6 text-white" />
              </div>
              <Badge className="bg-blue-600 text-white border-0 px-3 py-1.5 text-sm font-medium shadow-md">
                {Math.round((stats.transferred / stats.total) * 100) || 0}%
              </Badge>
            </div>
            <div className="mt-3">
              <CardTitle className="text-base font-medium text-slate-600 dark:text-slate-300 mb-1">
                Transferred
              </CardTitle>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {stats.transferred}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center text-sm text-white bg-blue-600 px-3 py-1.5 rounded-lg">
              <TrendingUp className="h-4 w-4 mr-2" />
              <span className="font-medium">+5% this month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Referrals - Medium Card */}
      <div className="lg:col-span-1">
        <Card className="h-full min-h-[220px] bg-amber-50 dark:bg-amber-900/20 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-amber-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <Badge className="bg-amber-600 text-white border-0 px-3 py-1.5 text-sm font-medium shadow-md">
                {Math.round((stats.pending / stats.total) * 100) || 0}%
              </Badge>
            </div>
            <div className="mt-3">
              <CardTitle className="text-base font-medium text-slate-600 dark:text-slate-300 mb-1">
                Pending
              </CardTitle>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {stats.pending}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center text-sm text-white bg-amber-600 px-3 py-1.5 rounded-lg">
              <Clock className="h-4 w-4 mr-2" />
              <span className="font-medium">Awaiting review</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overview Chart - Wide Card */}
      <div className="md:col-span-2 lg:col-span-2">
        <Card className="h-full min-h-[220px] bg-slate-100 dark:bg-slate-800/50 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-slate-700 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-base font-medium text-slate-600 dark:text-slate-300">
                  Status Distribution
                </CardTitle>
                <div className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                  {stats.total}
                  <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-2">Total</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-24 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={45}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm mt-2 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                <span className="text-slate-700 dark:text-slate-300">Accepted</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="text-slate-700 dark:text-slate-300">Rejected</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span className="text-slate-700 dark:text-slate-300">Transferred</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-amber-500 rounded-full" />
                <span className="text-slate-700 dark:text-slate-300">Pending</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}