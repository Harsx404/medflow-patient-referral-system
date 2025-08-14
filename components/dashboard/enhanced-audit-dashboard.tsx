'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  CalendarIcon, 
  FilterIcon, 
  SearchIcon, 
  UserIcon, 
  ActivityIcon, 
  AlertTriangleIcon, 
  TrendingUpIcon, 
  ClockIcon, 
  ShieldCheckIcon,
  DatabaseIcon,
  ZapIcon,
  BarChart3Icon,
  EyeIcon,
  RefreshCwIcon,
  DownloadIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  TimerIcon
} from 'lucide-react'
import { useEnhancedAudit } from '@/lib/hooks/use-enhanced-audit'
import { EnhancedLogEntry } from '@/lib/enhanced-logging-service'
import { EnhancedLoggingTester } from './enhanced-logging-tester'

interface EnhancedAuditDashboardProps {
  className?: string
}

export function EnhancedAuditDashboard({ className }: EnhancedAuditDashboardProps) {
  const {
    isConnected,
    recentLogs,
    logStats,
    getLogs,
    getAnalytics,
    searchLogs,
    clearLogs
  } = useEnhancedAudit()

  const [logs, setLogs] = useState<EnhancedLogEntry[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [selectedLog, setSelectedLog] = useState<EnhancedLogEntry | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  
  const [filters, setFilters] = useState({
    userId: '',
    userRole: '',
    action: '',
    resourceType: '',
    severity: '',
    category: '',
    source: '',
    startDate: '',
    endDate: '',
    search: '',
    correlationId: '',
    tags: '',
    sortBy: 'timestamp',
    sortOrder: 'desc' as 'asc' | 'desc'
  })

  // Fetch initial data
  useEffect(() => {
    fetchLogs()
    fetchAnalytics()
  }, [])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const result = await getLogs({
        ...filters,
        tags: filters.tags ? filters.tags.split(',').map(t => t.trim()) : undefined,
        limit: 100
      })
      setLogs(result.logs)
    } catch (error) {
      console.error('Error fetching logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const data = await getAnalytics('day')
      setAnalytics(data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
  }

  const handleSearch = async () => {
    if (filters.search) {
      const result = await searchLogs(filters.search, {
        category: filters.category || undefined,
        severity: filters.severity || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        limit: 100
      })
      setLogs(result.logs)
    } else {
      await fetchLogs()
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      userId: '',
      userRole: '',
      action: '',
      resourceType: '',
      severity: '',
      category: '',
      source: '',
      startDate: '',
      endDate: '',
      search: '',
      correlationId: '',
      tags: '',
      sortBy: 'timestamp',
      sortOrder: 'desc'
    })
    fetchLogs()
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'security': return <ShieldCheckIcon className="h-4 w-4" />
      case 'performance': return <ZapIcon className="h-4 w-4" />
      case 'business': return <BarChart3Icon className="h-4 w-4" />
      case 'system': return <DatabaseIcon className="h-4 w-4" />
      case 'integration': return <ActivityIcon className="h-4 w-4" />
      default: return <ActivityIcon className="h-4 w-4" />
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const formatDuration = (duration?: number) => {
    if (!duration) return 'N/A'
    if (duration < 1000) return `${duration.toFixed(2)}ms`
    return `${(duration / 1000).toFixed(2)}s`
  }

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Header with Status */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Enhanced Audit Dashboard</h2>
            <p className="text-muted-foreground">
              Comprehensive logging, monitoring, and analytics
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-muted-foreground">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <Button onClick={fetchAnalytics} variant="outline" size="sm">
              <RefreshCwIcon className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <ActivityIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="ml-2 text-sm font-medium">Total Logs</span>
                </div>
                <div className="text-2xl font-bold">{logStats.totalToday}</div>
                <div className="text-xs text-muted-foreground">Today</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <AlertTriangleIcon className="h-4 w-4 text-red-500" />
                  <span className="ml-2 text-sm font-medium">Errors</span>
                </div>
                <div className="text-2xl font-bold">{logStats.errorCount}</div>
                <div className="text-xs text-muted-foreground">
                  {analytics.errorRate.toFixed(1)}% rate
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 text-blue-500" />
                  <span className="ml-2 text-sm font-medium">Avg Response</span>
                </div>
                <div className="text-2xl font-bold">
                  {formatDuration(logStats.avgResponseTime)}
                </div>
                <div className="text-xs text-muted-foreground">Response time</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <UserIcon className="h-4 w-4 text-purple-500" />
                  <span className="ml-2 text-sm font-medium">Active Users</span>
                </div>
                <div className="text-2xl font-bold">
                  {Object.keys(analytics.logsByUser).length}
                </div>
                <div className="text-xs text-muted-foreground">Today</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUpIcon className="h-4 w-4 text-green-500" />
                  <span className="ml-2 text-sm font-medium">Actions</span>
                </div>
                <div className="text-2xl font-bold">
                  {Object.keys(analytics.logsByAction).length}
                </div>
                <div className="text-xs text-muted-foreground">Unique types</div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="logs">Live Logs</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="monitoring">Real-time</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Test Component */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <EnhancedLoggingTester />
              </div>
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Security Events</CardTitle>
                      <ShieldCheckIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {analytics?.logsByCategory?.security || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Security-related logs today
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Performance Issues</CardTitle>
                      <ZapIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {analytics?.logsByCategory?.performance || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Performance logs today
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Business Actions</CardTitle>
                      <BarChart3Icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {analytics?.logsByCategory?.business || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Business logs today
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="hidden">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Security Events</CardTitle>
                  <ShieldCheckIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics?.logsByCategory?.security || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Security-related logs today
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Performance Issues</CardTitle>
                  <ZapIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics?.logsByCategory?.performance || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Performance logs today
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Business Actions</CardTitle>
                  <BarChart3Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics?.logsByCategory?.business || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Business logs today
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ActivityIcon className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentLogs.slice(0, 10).map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getCategoryIcon(log.category)}
                        <div>
                          <div className="font-medium">{log.details}</div>
                          <div className="text-sm text-muted-foreground">
                            by {log.userName} • {formatTimestamp(log.timestamp)}
                          </div>
                        </div>
                      </div>
                      <Badge className={getSeverityColor(log.severity)}>
                        {log.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            {/* Enhanced Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FilterIcon className="h-5 w-5" />
                  Advanced Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
                  <Input
                    placeholder="Search..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                  
                  <Select value={filters.severity || "all"} onValueChange={(value) => handleFilterChange('severity', value === 'all' ? '' : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severities</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filters.category || "all"} onValueChange={(value) => handleFilterChange('category', value === 'all' ? '' : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="integration">Integration</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filters.source || "all"} onValueChange={(value) => handleFilterChange('source', value === 'all' ? '' : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sources</SelectItem>
                      <SelectItem value="web">Web</SelectItem>
                      <SelectItem value="api">API</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="integration">Integration</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  />

                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSearch} disabled={loading}>
                    <SearchIcon className="h-4 w-4 mr-2" />
                    {loading ? 'Searching...' : 'Search'}
                  </Button>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                  <Button variant="outline">
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={async () => {
                      const result = await clearLogs()
                      if (result) {
                        setLogs(result.logs)
                        fetchAnalytics()
                      }
                    }} 
                    className="ml-auto"
                  >
                    Clear All Logs
                  </Button>
                  <Button 
                    variant="ghost"
                    onClick={() => window.open('/test-logging', '_blank')}
                    className="ml-2"
                  >
                    Test Tools
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Logs Table */}
            <Card>
              <CardHeader>
                <CardTitle>Log Entries ({logs.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Severity</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Resource</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <Badge className={getSeverityColor(log.severity)}>
                              {log.severity}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(log.category)}
                              <span className="capitalize">{log.category}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{log.userName}</div>
                              <div className="text-sm text-muted-foreground">{log.userRole}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {log.action}
                            </code>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{log.resourceName}</div>
                              <div className="text-sm text-muted-foreground">{log.resourceType}</div>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="truncate" title={log.details}>
                              {log.details}
                            </div>
                          </TableCell>
                          <TableCell>
                            {log.duration ? (
                              <Badge variant="secondary">
                                <TimerIcon className="h-3 w-3 mr-1" />
                                {formatDuration(log.duration)}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {formatTimestamp(log.timestamp)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedLog(log)}
                                >
                                  <EyeIcon className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Enhanced Log Details</DialogTitle>
                                </DialogHeader>
                                {selectedLog && (
                                  <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                      <div className="space-y-4">
                                        <div>
                                          <label className="text-sm font-medium">Basic Information</label>
                                          <div className="mt-2 space-y-2">
                                            <div><strong>ID:</strong> {selectedLog.id}</div>
                                            <div><strong>User:</strong> {selectedLog.userName} ({selectedLog.userRole})</div>
                                            <div><strong>Action:</strong> {selectedLog.action}</div>
                                            <div><strong>Resource:</strong> {selectedLog.resourceName} ({selectedLog.resourceType})</div>
                                          </div>
                                        </div>

                                        <div>
                                          <label className="text-sm font-medium">Classification</label>
                                          <div className="mt-2 space-y-2">
                                            <div><strong>Severity:</strong> <Badge className={getSeverityColor(selectedLog.severity)}>{selectedLog.severity}</Badge></div>
                                            <div><strong>Category:</strong> {selectedLog.category}</div>
                                            <div><strong>Source:</strong> {selectedLog.source}</div>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="space-y-4">
                                        <div>
                                          <label className="text-sm font-medium">Timing & Performance</label>
                                          <div className="mt-2 space-y-2">
                                            <div><strong>Timestamp:</strong> {formatTimestamp(selectedLog.timestamp)}</div>
                                            {selectedLog.duration && (
                                              <div><strong>Duration:</strong> {formatDuration(selectedLog.duration)}</div>
                                            )}
                                            {selectedLog.correlationId && (
                                              <div><strong>Correlation ID:</strong> <code>{selectedLog.correlationId}</code></div>
                                            )}
                                          </div>
                                        </div>

                                        <div>
                                          <label className="text-sm font-medium">Context</label>
                                          <div className="mt-2 space-y-2">
                                            {selectedLog.sessionId && (
                                              <div><strong>Session:</strong> <code className="text-xs">{selectedLog.sessionId}</code></div>
                                            )}
                                            {selectedLog.deviceInfo && (
                                              <div><strong>Device:</strong> {selectedLog.deviceInfo.browser} on {selectedLog.deviceInfo.os}</div>
                                            )}
                                            {selectedLog.ipAddress && (
                                              <div><strong>IP Address:</strong> {selectedLog.ipAddress}</div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    <div>
                                      <label className="text-sm font-medium">Details</label>
                                      <p className="mt-2 p-3 bg-gray-50 rounded-lg text-sm">{selectedLog.details}</p>
                                    </div>

                                    {selectedLog.tags && selectedLog.tags.length > 0 && (
                                      <div>
                                        <label className="text-sm font-medium">Tags</label>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                          {selectedLog.tags.map((tag, index) => (
                                            <Badge key={index} variant="outline">{tag}</Badge>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {selectedLog.complianceFlags && selectedLog.complianceFlags.length > 0 && (
                                      <div>
                                        <label className="text-sm font-medium">Compliance Flags</label>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                          {selectedLog.complianceFlags.map((flag, index) => (
                                            <Badge key={index} className="bg-blue-100 text-blue-800">{flag}</Badge>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {(selectedLog.oldValue || selectedLog.newValue) && (
                                      <div className="grid grid-cols-2 gap-4">
                                        {selectedLog.oldValue && (
                                          <div>
                                            <label className="text-sm font-medium">Previous Value</label>
                                            <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                                              {JSON.stringify(selectedLog.oldValue, null, 2)}
                                            </pre>
                                          </div>
                                        )}
                                        {selectedLog.newValue && (
                                          <div>
                                            <label className="text-sm font-medium">New Value</label>
                                            <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                                              {JSON.stringify(selectedLog.newValue, null, 2)}
                                            </pre>
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {selectedLog.metadata && (
                                      <div>
                                        <label className="text-sm font-medium">Metadata</label>
                                        <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                                          {JSON.stringify(selectedLog.metadata, null, 2)}
                                        </pre>
                                      </div>
                                    )}

                                    {selectedLog.errorMessage && (
                                      <div>
                                        <label className="text-sm font-medium">Error Details</label>
                                        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                          <div className="text-sm text-red-800">
                                            <strong>{selectedLog.errorCode}:</strong> {selectedLog.errorMessage}
                                          </div>
                                          {selectedLog.stackTrace && (
                                            <pre className="mt-2 text-xs text-red-700 whitespace-pre-wrap">
                                              {selectedLog.stackTrace}
                                            </pre>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {analytics && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Actions by Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(analytics.logsByAction).slice(0, 10).map(([action, count]) => (
                        <div key={action} className="flex items-center justify-between">
                          <span className="text-sm">{action.replace(/_/g, ' ')}</span>
                          <div className="flex items-center gap-2">
                            <Progress value={(count as number) / Math.max(...Object.values(analytics.logsByAction).map(val => val as number)) * 100} className="w-20" />
                            <span className="text-sm font-medium">{count as number}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Activity by User</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(analytics.logsByUser).slice(0, 10).map(([user, count]) => (
                        <div key={user} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4" />
                            <span className="text-sm">{user}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={(count as number) / Math.max(...Object.values(analytics.logsByUser).map(val => val as number)) * 100} className="w-20" />
                            <span className="text-sm font-medium">{count as number}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Severity Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(analytics.logsBySeverity).map(([severity, count]) => (
                        <div key={severity} className="flex items-center justify-between">
                          <Badge className={getSeverityColor(severity)}>{severity}</Badge>
                          <div className="flex items-center gap-2">
                            <Progress value={(count as number) / analytics.totalLogs * 100} className="w-20" />
                            <span className="text-sm font-medium">{count as number}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Category Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(analytics.logsByCategory).map(([category, count]) => (
                        <div key={category} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(category)}
                            <span className="text-sm capitalize">{category}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={(count as number) / analytics.totalLogs * 100} className="w-20" />
                            <span className="text-sm font-medium">{count as number}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            {/* Real-time Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Connection Status</CardTitle>
                  {isConnected ? <CheckCircleIcon className="h-4 w-4 text-green-500" /> : <XCircleIcon className="h-4 w-4 text-red-500" />}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Real-time logging status
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Recent Logs</CardTitle>
                  <ActivityIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{recentLogs.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Last 20 entries
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                  <AlertCircleIcon className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics?.errorRate.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Current error rate
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Live Activity Feed */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ActivityIcon className="h-5 w-5" />
                  Live Activity Feed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {recentLogs.map((log, index) => (
                    <div key={log.id} className={`flex items-center gap-3 p-3 border rounded-lg ${index === 0 ? 'bg-blue-50 border-blue-200' : ''}`}>
                      <div className="flex-shrink-0">
                        {getCategoryIcon(log.category)}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{log.details}</span>
                          <Badge className={getSeverityColor(log.severity)} variant="secondary">
                            {log.severity}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {log.userName} • {formatTimestamp(log.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
