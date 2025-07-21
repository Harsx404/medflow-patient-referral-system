"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import { AlertTriangle, TrendingDown, Clock } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export function RejectionTracker() {
  const { patients } = useAppStore()
  
  const totalReferrals = patients.length
  const rejectedCount = patients.filter(p => p.status === 'Rejected').length
  const acceptedCount = patients.filter(p => p.status === 'Accepted').length
  const pendingReviewCount = patients.filter(p => p.status === 'Pending').length
  
  const rejectionRate = totalReferrals > 0 ? Math.round((rejectedCount / totalReferrals) * 100) : 0
  const acceptanceRate = totalReferrals > 0 ? Math.round((acceptedCount / totalReferrals) * 100) : 0
  
  // Mock data for pending rejection reviews (would come from backend)
  const pendingRejectionReviews = 3
  
  // Mock data for line chart - rejection trends over time
  const rejectionTrendData = [
    { month: 'Jan', rejectionRate: 25, acceptanceRate: 75 },
    { month: 'Feb', rejectionRate: 22, acceptanceRate: 78 },
    { month: 'Mar', rejectionRate: 28, acceptanceRate: 72 },
    { month: 'Apr', rejectionRate: 20, acceptanceRate: 80 },
    { month: 'May', rejectionRate: 18, acceptanceRate: 82 },
    { month: 'Jun', rejectionRate: rejectionRate, acceptanceRate: acceptanceRate },
  ]
  
  const getRejectionSeverity = (rate: number) => {
    if (rate > 30) return { level: 'High', color: 'destructive', bgColor: 'bg-red-50 dark:bg-red-950' }
    if (rate > 15) return { level: 'Medium', color: 'warning', bgColor: 'bg-yellow-50 dark:bg-yellow-950' }
    return { level: 'Low', color: 'success', bgColor: 'bg-green-50 dark:bg-green-950' }
  }
  
  const severity = getRejectionSeverity(rejectionRate)

  return (
    <Card className="border-0 shadow-lg bg-white dark:bg-slate-800">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-3 text-lg font-semibold">
          <div className="p-2 rounded-lg bg-orange-600 text-white">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <span className="text-slate-900 dark:text-slate-200">
            Rejection Tracker
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Rejection Stats with Line Chart */}
        <div className={`p-6 rounded-xl border ${
          rejectionRate > 30 ? 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-800' :
          rejectionRate > 15 ? 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-800' :
          'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">Rejection Trends</div>
            <Badge 
              variant={severity.color as any}
              className={`px-3 py-1 font-medium ${
                severity.level === 'High' ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white border-0' :
                severity.level === 'Medium' ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0' :
                'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0'
              }`}
            >
              {severity.level} Risk
            </Badge>
          </div>
          
          {/* Current Stats Row */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className={`text-3xl font-bold ${
                rejectionRate > 30 ? 'text-red-600 dark:text-red-400' :
                rejectionRate > 15 ? 'text-yellow-600 dark:text-yellow-400' :
                'text-green-600 dark:text-green-400'
              }`}>{rejectionRate}%</div>
              <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                Current rejection rate
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                {rejectedCount}/{totalReferrals}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Rejected referrals
              </div>
            </div>
          </div>
          
          {/* Sleek Line Chart */}
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rejectionTrendData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="opacity-30" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px'
                  }}
                  labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="rejectionRate" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2, fill: '#fff' }}
                  name="Rejection Rate (%)"
                />
                <Line 
                  type="monotone" 
                  dataKey="acceptanceRate" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
                  name="Acceptance Rate (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Detailed Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 border border-red-200 dark:border-red-800 rounded-xl bg-red-50 dark:bg-red-900/20">
            <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-1">{rejectedCount}</div>
            <div className="text-xs font-medium text-red-700 dark:text-red-300">Total Rejections</div>
          </div>
          <div className="text-center p-4 border border-yellow-200 dark:border-yellow-800 rounded-xl bg-yellow-50 dark:bg-yellow-900/20">
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">{pendingRejectionReviews}</div>
            <div className="text-xs font-medium text-yellow-700 dark:text-yellow-300">Pending Reviews</div>
          </div>
        </div>
        
        {/* Acceptance vs Rejection Ratio */}
        <div className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Acceptance vs Rejection</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">{acceptanceRate}% : {rejectionRate}%</span>
          </div>
          <div className="flex h-3 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
            <div 
              className="bg-green-500 transition-all duration-500"
              style={{ width: `${acceptanceRate}%` }}
            />
            <div 
              className="bg-red-500 transition-all duration-500"
              style={{ width: `${rejectionRate}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
            <span>✅ Accepted ({acceptedCount})</span>
            <span>❌ Rejected ({rejectedCount})</span>
          </div>
        </div>
        
        {/* Recent Trends */}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
          <div className="flex items-center space-x-2 mb-3">
            <div className="p-1 rounded-lg bg-green-500 text-white">
              <TrendingDown className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Recent Trends</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
              <span className="text-slate-600 dark:text-slate-400">This week:</span>
              <span className="text-green-600 dark:text-green-400 font-semibold">-5% rejection rate</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
              <span className="text-slate-600 dark:text-slate-400">Last 30 days:</span>
              <span className="text-green-600 dark:text-green-400 font-semibold">-12% rejection rate</span>
            </div>
          </div>
        </div>
        
        {/* Pending Reviews Alert */}
        {pendingRejectionReviews > 0 && (
          <div className="flex items-center space-x-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
            <div className="p-2 rounded-lg bg-yellow-500 text-white">
              <Clock className="h-4 w-4" />
            </div>
            <div className="text-sm">
              <span className="font-semibold text-yellow-800 dark:text-yellow-200">{pendingRejectionReviews} rejections</span>
              <span className="text-yellow-700 dark:text-yellow-300"> need review</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}