'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { CalendarIcon, FilterIcon, SearchIcon, UserIcon, ActivityIcon } from 'lucide-react'
import { AuditLog, AUDIT_ACTIONS, RESOURCE_TYPES } from '@/lib/models/audit-log'

interface AuditLogsPanelProps {
  className?: string
}

export function AuditLogsPanel({ className }: AuditLogsPanelProps) {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<any>(null)
  const [showTestTools, setShowTestTools] = useState(false)
  const [filters, setFilters] = useState({
    userId: '',
    userRole: 'all',
    action: 'all',
    resourceType: 'all',
    startDate: '',
    endDate: '',
    search: '',
  })
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)

  // Initialize on mount and fetch data
  useEffect(() => {
    // Create some sample logs if no logs exist yet (for demo purposes)
    if (typeof window !== 'undefined' && !localStorage.getItem('medflow_audit_logs')) {
      const currentUser = {
        id: 'current-user',
        name: 'Current User',
        role: 'admin'
      }
      
      // Create an initial system startup log
      const initialLog = {
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'system_startup',
        resourceType: 'system',
        resourceId: 'system',
        resourceName: 'MedFlow System',
        details: 'System initialized with real logging'
      }
      
      // Log the action using our audit service
      fetch('/api/action-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(initialLog),
      }).then(() => {
        fetchAuditLogs()
        fetchSummary()
      })
    } else {
      fetchAuditLogs()
      fetchSummary()
    }
  }, [])

  const fetchAuditLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') params.append(key, value)
      })

      const response = await fetch(`/api/action-logs?${params}`)
      const data = await response.json()
      setAuditLogs(data.logs || [])
    } catch (error) {
      console.error('Error fetching audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSummary = async () => {
    try {
      const response = await fetch('/api/action-logs?summary=true')
      const data = await response.json()
      setSummary(data)
    } catch (error) {
      console.error('Error fetching audit summary:', error)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleSearch = () => {
    fetchAuditLogs()
  }

  const clearFilters = () => {
    setFilters({
      userId: '',
      userRole: 'all',
      action: 'all',
      resourceType: 'all',
      startDate: '',
      endDate: '',
      search: '',
    })
    fetchAuditLogs()
  }
  
  const clearAllLogs = () => {
    if (typeof window !== 'undefined') {
      if (confirm('Are you sure you want to clear all audit logs? This cannot be undone.')) {
        localStorage.removeItem('medflow_audit_logs')
        fetchAuditLogs()
        fetchSummary()
      }
    }
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
    return new Date(timestamp).toLocaleString()
  }

  const filteredLogs = auditLogs.filter(log => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      return (
        log.userName.toLowerCase().includes(searchLower) ||
        log.details.toLowerCase().includes(searchLower) ||
        log.resourceName.toLowerCase().includes(searchLower)
      )
    }
    return true
  })

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ActivityIcon className="h-5 w-5" />
            Audit Trail & User Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{summary.totalActions}</div>
                  <div className="text-sm text-gray-600">Total Actions</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{Object.keys(summary.actionsByUser).length}</div>
                  <div className="text-sm text-gray-600">Active Users</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{Object.keys(summary.actionsByType).length}</div>
                  <div className="text-sm text-gray-600">Action Types</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{summary.recentActivity.length}</div>
                  <div className="text-sm text-gray-600">Recent Activities</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <Input
              placeholder="Search..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="col-span-1"
            />
            <Select value={filters.userRole} onValueChange={(value) => handleFilterChange('userRole', value)}>
              <SelectTrigger>
                <SelectValue placeholder="User Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="doctor">Doctor</SelectItem>
                <SelectItem value="nurse">Nurse</SelectItem>
                <SelectItem value="receptionist">Receptionist</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.action} onValueChange={(value) => handleFilterChange('action', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Action Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {Object.entries(AUDIT_ACTIONS).map(([key, value]) => (
                  <SelectItem key={key} value={value || key}>
                    {key.replace(/_/g, ' ').toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.resourceType} onValueChange={(value) => handleFilterChange('resourceType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Resource Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Resources</SelectItem>
                {Object.entries(RESOURCE_TYPES).map(([key, value]) => (
                  <SelectItem key={key} value={value || key}>
                    {key.toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              placeholder="Start Date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
            <Input
              type="date"
              placeholder="End Date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mb-4">
            <Button onClick={handleSearch} disabled={loading}>
              <SearchIcon className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button variant="outline" onClick={clearFilters}>
              <FilterIcon className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
            <Button variant="destructive" onClick={clearAllLogs} className="ml-auto">
              Clear All Logs
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setShowTestTools(!showTestTools)}
              className="ml-2"
            >
              {showTestTools ? "Hide Test Tools" : "Test Tools"}
            </Button>
            {showTestTools && (
              <Button 
                variant="outline" 
                className="ml-2"
                onClick={() => window.open('/test-logging', '_blank')}
              >
                Open Test Page
              </Button>
            )}
          </div>

          {/* Audit Logs Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{log.userName}</div>
                          <div className="text-sm text-gray-500">{log.userRole}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getActionColor(log.action)}>
                        {log.action.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{log.resourceName}</div>
                        <div className="text-sm text-gray-500">{log.resourceType}</div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {log.details}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        {formatTimestamp(log.timestamp)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedLog(log)}
                          >
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Audit Log Details</DialogTitle>
                          </DialogHeader>
                          {selectedLog && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">User</label>
                                  <p>{selectedLog.userName} ({selectedLog.userRole})</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Action</label>
                                  <p>{selectedLog.action}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Resource</label>
                                  <p>{selectedLog.resourceName} ({selectedLog.resourceType})</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Timestamp</label>
                                  <p>{formatTimestamp(selectedLog.timestamp)}</p>
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Details</label>
                                <p className="text-sm">{selectedLog.details}</p>
                              </div>
                              {selectedLog.oldValue && (
                                <div>
                                  <label className="text-sm font-medium">Previous Value</label>
                                  <pre className="text-xs bg-gray-100 p-2 rounded">
                                    {JSON.stringify(selectedLog.oldValue, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {selectedLog.newValue && (
                                <div>
                                  <label className="text-sm font-medium">New Value</label>
                                  <pre className="text-xs bg-gray-100 p-2 rounded">
                                    {JSON.stringify(selectedLog.newValue, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {selectedLog.ipAddress && (
                                <div>
                                  <label className="text-sm font-medium">IP Address</label>
                                  <p className="text-sm">{selectedLog.ipAddress}</p>
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

          {loading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            </div>
          )}

          {!loading && filteredLogs.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No audit logs found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 