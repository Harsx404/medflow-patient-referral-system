import { AuditLog, AUDIT_ACTIONS, RESOURCE_TYPES } from './models/audit-log'

// Enhanced logging configuration
export interface LoggingConfig {
  enabled: boolean
  maxRetries: number
  retryDelay: number
  batchSize: number
  flushInterval: number
  includeStackTrace: boolean
  logLevel: 'debug' | 'info' | 'warn' | 'error'
  realTimeUpdates: boolean
  encryptSensitiveData: boolean
}

// Enhanced log entry interface
export interface EnhancedLogEntry extends AuditLog {
  correlationId?: string
  parentLogId?: string
  duration?: number
  errorCode?: string
  errorMessage?: string
  stackTrace?: string
  metadata?: Record<string, any>
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'security' | 'performance' | 'business' | 'system' | 'integration'
  source: 'web' | 'api' | 'system' | 'integration'
  geoLocation?: {
    country?: string
    region?: string
    city?: string
  }
  deviceInfo?: {
    browser?: string
    os?: string
    device?: string
  }
  complianceFlags?: string[]
  tags?: string[]
}

// Log batch for performance optimization
interface LogBatch {
  logs: EnhancedLogEntry[]
  timestamp: string
  batchId: string
}

// Real-time event interface
export interface LogEvent {
  type: 'log_created' | 'log_updated' | 'batch_processed' | 'error_occurred'
  data: EnhancedLogEntry | LogBatch | Error
  timestamp: string
}

// Enhanced error class for logging
export class LoggingError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, any>
  ) {
    super(message)
    this.name = 'LoggingError'
  }
}

// User context interface
export interface UserContext {
  id: string
  name: string
  role: string
  permissions?: string[]
  sessionId?: string
  loginTime?: string
  lastActivity?: string
}

// Performance tracking interface
export interface PerformanceMetrics {
  startTime: number
  endTime?: number
  duration?: number
  memoryUsage?: number
  cpuUsage?: number
}

class EnhancedLoggingService {
  private config: LoggingConfig
  private logQueue: EnhancedLogEntry[] = []
  private eventListeners: ((event: LogEvent) => void)[] = []
  private flushTimer: NodeJS.Timeout | null = null
  private isProcessing = false
  private correlationIdCounter = 0
  private performanceTrackers = new Map<string, PerformanceMetrics>()

  // In-memory storage (would be replaced with database in production)
  private logStorage: EnhancedLogEntry[] = []
  private readonly MAX_MEMORY_LOGS = 10000

  constructor(config: Partial<LoggingConfig> = {}) {
    this.config = {
      enabled: true,
      maxRetries: 3,
      retryDelay: 1000,
      batchSize: 50,
      flushInterval: 5000,
      includeStackTrace: process.env.NODE_ENV === 'development',
      logLevel: 'info',
      realTimeUpdates: true,
      encryptSensitiveData: false,
      ...config
    }

    // Start the flush timer if enabled
    if (this.config.enabled) {
      this.startFlushTimer()
    }
  }

  // Generate correlation ID for tracking related logs
  generateCorrelationId(): string {
    return `corr_${Date.now()}_${++this.correlationIdCounter}`
  }

  // Start performance tracking
  startPerformanceTracking(operationId: string): string {
    const metrics: PerformanceMetrics = {
      startTime: performance.now(),
      memoryUsage: typeof window !== 'undefined' ? 0 : process.memoryUsage().heapUsed
    }
    this.performanceTrackers.set(operationId, metrics)
    return operationId
  }

  // End performance tracking
  endPerformanceTracking(operationId: string): PerformanceMetrics | null {
    const metrics = this.performanceTrackers.get(operationId)
    if (metrics) {
      metrics.endTime = performance.now()
      metrics.duration = metrics.endTime - metrics.startTime
      this.performanceTrackers.delete(operationId)
      return metrics
    }
    return null
  }

  // Get current user context from various sources
  private getCurrentUserContext(): UserContext | null {
    try {
      if (typeof window === 'undefined') return null
      
      const currentUser = localStorage.getItem('currentUser')
      const userRole = localStorage.getItem('userRole')
      const sessionId = localStorage.getItem('sessionId') || sessionStorage.getItem('sessionId')
      
      if (!currentUser || !userRole) return null
      
      return {
        id: currentUser,
        name: currentUser,
        role: userRole,
        sessionId: sessionId || undefined,
        lastActivity: new Date().toISOString()
      }
    } catch (error) {
      console.warn('Failed to get user context:', error)
      return null
    }
  }

  // Get browser/device information
  private getDeviceInfo() {
    if (typeof window === 'undefined') return undefined
    
    const userAgent = navigator.userAgent
    return {
      browser: this.extractBrowserInfo(userAgent),
      os: this.extractOSInfo(userAgent),
      device: this.extractDeviceInfo(userAgent)
    }
  }

  private extractBrowserInfo(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome'
    if (userAgent.includes('Firefox')) return 'Firefox'
    if (userAgent.includes('Safari')) return 'Safari'
    if (userAgent.includes('Edge')) return 'Edge'
    return 'Unknown'
  }

  private extractOSInfo(userAgent: string): string {
    if (userAgent.includes('Windows')) return 'Windows'
    if (userAgent.includes('Mac OS')) return 'macOS'
    if (userAgent.includes('Linux')) return 'Linux'
    if (userAgent.includes('Android')) return 'Android'
    if (userAgent.includes('iOS')) return 'iOS'
    return 'Unknown'
  }

  private extractDeviceInfo(userAgent: string): string {
    if (userAgent.includes('Mobile')) return 'Mobile'
    if (userAgent.includes('Tablet')) return 'Tablet'
    return 'Desktop'
  }

  // Enhanced logging method with full context capture
  async logEnhanced(params: {
    action: string
    resourceType: string
    resourceId: string
    resourceName: string
    details: string
    oldValue?: any
    newValue?: any
    severity?: 'low' | 'medium' | 'high' | 'critical'
    category?: 'security' | 'performance' | 'business' | 'system' | 'integration'
    correlationId?: string
    parentLogId?: string
    userContext?: UserContext
    metadata?: Record<string, any>
    tags?: string[]
    performanceMetrics?: PerformanceMetrics
    error?: Error
  }): Promise<string> {
    if (!this.config.enabled) {
      return 'logging_disabled'
    }

    try {
      const timestamp = new Date().toISOString()
      const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const userContext = params.userContext || this.getCurrentUserContext()
      
      // Create enhanced log entry
      const logEntry: EnhancedLogEntry = {
        id: logId,
        userId: userContext?.id || 'anonymous',
        userName: userContext?.name || 'Anonymous',
        userRole: userContext?.role as any || 'unknown',
        action: params.action,
        resourceType: params.resourceType as any,
        resourceId: params.resourceId,
        resourceName: params.resourceName,
        oldValue: params.oldValue,
        newValue: params.newValue,
        details: params.details,
        timestamp,
        sessionId: userContext?.sessionId,
        correlationId: params.correlationId,
        parentLogId: params.parentLogId,
        severity: params.severity || 'medium',
        category: params.category || 'business',
        source: typeof window !== 'undefined' ? 'web' : 'system',
        metadata: {
          ...params.metadata,
          timestamp: Date.now(),
          environment: process.env.NODE_ENV || 'development'
        },
        tags: params.tags || [],
        deviceInfo: this.getDeviceInfo(),
        duration: params.performanceMetrics?.duration,
        complianceFlags: this.getComplianceFlags(params.action, params.resourceType)
      }

      // Add error information if provided
      if (params.error) {
        logEntry.errorCode = params.error.name
        logEntry.errorMessage = params.error.message
        if (this.config.includeStackTrace) {
          logEntry.stackTrace = params.error.stack
        }
      }

      // Add to queue for batch processing
      this.logQueue.push(logEntry)
      
      // Emit real-time event if enabled
      if (this.config.realTimeUpdates) {
        this.emitEvent({
          type: 'log_created',
          data: logEntry,
          timestamp
        })
      }

      // Force flush if queue is full
      if (this.logQueue.length >= this.config.batchSize) {
        await this.flush()
      }

      return logId
    } catch (error) {
      console.error('Enhanced logging failed:', error)
      this.emitEvent({
        type: 'error_occurred',
        data: error as Error,
        timestamp: new Date().toISOString()
      })
      throw new LoggingError('Failed to create log entry', 'LOG_CREATION_FAILED', { error })
    }
  }

  // Get compliance flags based on action and resource type
  private getComplianceFlags(action: string, resourceType: string): string[] {
    const flags: string[] = []
    
    // HIPAA compliance flags
    if (resourceType === 'patient') {
      flags.push('HIPAA')
    }
    
    // Security-sensitive actions
    if (action.includes('login') || action.includes('logout') || action.includes('auth')) {
      flags.push('SECURITY')
    }
    
    // Data modification flags
    if (action.includes('created') || action.includes('updated') || action.includes('deleted')) {
      flags.push('DATA_MODIFICATION')
    }
    
    return flags
  }

  // Flush queued logs to storage
  private async flush(): Promise<void> {
    if (this.isProcessing || this.logQueue.length === 0) {
      return
    }

    this.isProcessing = true
    const batch = this.logQueue.splice(0, this.config.batchSize)
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    try {
      // Add to in-memory storage (replace with database in production)
      this.logStorage.unshift(...batch)
      
      // Maintain memory limit
      if (this.logStorage.length > this.MAX_MEMORY_LOGS) {
        this.logStorage = this.logStorage.slice(0, this.MAX_MEMORY_LOGS)
      }

      // Emit batch processed event
      this.emitEvent({
        type: 'batch_processed',
        data: { logs: batch, timestamp: new Date().toISOString(), batchId },
        timestamp: new Date().toISOString()
      })

      console.log(`Flushed ${batch.length} log entries in batch ${batchId}`)
    } catch (error) {
      console.error('Failed to flush log batch:', error)
      // Put logs back in queue for retry
      this.logQueue.unshift(...batch)
      throw error
    } finally {
      this.isProcessing = false
    }
  }

  // Start the automatic flush timer
  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
    }
    
    this.flushTimer = setInterval(async () => {
      try {
        await this.flush()
      } catch (error) {
        console.error('Scheduled flush failed:', error)
      }
    }, this.config.flushInterval)
  }

  // Event emission for real-time updates
  private emitEvent(event: LogEvent): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        console.error('Event listener failed:', error)
      }
    })
  }

  // Subscribe to logging events
  addEventListener(listener: (event: LogEvent) => void): () => void {
    this.eventListeners.push(listener)
    return () => {
      const index = this.eventListeners.indexOf(listener)
      if (index > -1) {
        this.eventListeners.splice(index, 1)
      }
    }
  }

  // Get logs with enhanced filtering
  async getLogs(filter: {
    userId?: string
    userRole?: string
    action?: string
    resourceType?: string
    resourceId?: string
    severity?: string
    category?: string
    source?: string
    correlationId?: string
    startDate?: string
    endDate?: string
    tags?: string[]
    limit?: number
    offset?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  } = {}): Promise<{ logs: EnhancedLogEntry[], total: number }> {
    let filteredLogs = [...this.logStorage]

    // Apply filters
    if (filter.userId) filteredLogs = filteredLogs.filter(log => log.userId === filter.userId)
    if (filter.userRole) filteredLogs = filteredLogs.filter(log => log.userRole === filter.userRole)
    if (filter.action) filteredLogs = filteredLogs.filter(log => log.action.includes(filter.action!))
    if (filter.resourceType) filteredLogs = filteredLogs.filter(log => log.resourceType === filter.resourceType)
    if (filter.resourceId) filteredLogs = filteredLogs.filter(log => log.resourceId === filter.resourceId)
    if (filter.severity) filteredLogs = filteredLogs.filter(log => log.severity === filter.severity)
    if (filter.category) filteredLogs = filteredLogs.filter(log => log.category === filter.category)
    if (filter.source) filteredLogs = filteredLogs.filter(log => log.source === filter.source)
    if (filter.correlationId) filteredLogs = filteredLogs.filter(log => log.correlationId === filter.correlationId)
    if (filter.startDate) filteredLogs = filteredLogs.filter(log => log.timestamp >= filter.startDate!)
    if (filter.endDate) filteredLogs = filteredLogs.filter(log => log.timestamp <= filter.endDate!)
    if (filter.tags?.length) {
      filteredLogs = filteredLogs.filter(log => 
        filter.tags!.some(tag => log.tags?.includes(tag))
      )
    }

    // Sorting
    const sortBy = filter.sortBy || 'timestamp'
    const sortOrder = filter.sortOrder || 'desc'
    filteredLogs.sort((a, b) => {
      const aVal = (a as any)[sortBy]
      const bVal = (b as any)[sortBy]
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      return sortOrder === 'desc' ? -comparison : comparison
    })

    const total = filteredLogs.length
    const offset = filter.offset || 0
    const limit = filter.limit || 50

    return {
      logs: filteredLogs.slice(offset, offset + limit),
      total
    }
  }

  // Get analytics data
  async getAnalytics(timeframe: 'hour' | 'day' | 'week' | 'month' = 'day'): Promise<{
    totalLogs: number
    logsByAction: Record<string, number>
    logsByUser: Record<string, number>
    logsBySeverity: Record<string, number>
    logsByCategory: Record<string, number>
    trendsOverTime: { timestamp: string, count: number }[]
    averageResponseTime: number
    errorRate: number
  }> {
    const logs = this.logStorage
    const now = new Date()
    let timeframeLogs = logs

    // Filter by timeframe
    const timeframeMs = {
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000
    }[timeframe]

    const cutoffTime = new Date(now.getTime() - timeframeMs).toISOString()
    timeframeLogs = logs.filter(log => log.timestamp >= cutoffTime)

    // Calculate analytics
    const logsByAction: Record<string, number> = {}
    const logsByUser: Record<string, number> = {}
    const logsBySeverity: Record<string, number> = {}
    const logsByCategory: Record<string, number> = {}
    let totalDuration = 0
    let durationsCount = 0
    let errorCount = 0

    timeframeLogs.forEach(log => {
      logsByAction[log.action] = (logsByAction[log.action] || 0) + 1
      logsByUser[log.userName] = (logsByUser[log.userName] || 0) + 1
      logsBySeverity[log.severity] = (logsBySeverity[log.severity] || 0) + 1
      logsByCategory[log.category] = (logsByCategory[log.category] || 0) + 1

      if (log.duration) {
        totalDuration += log.duration
        durationsCount++
      }

      if (log.errorCode) {
        errorCount++
      }
    })

    return {
      totalLogs: timeframeLogs.length,
      logsByAction,
      logsByUser,
      logsBySeverity,
      logsByCategory,
      trendsOverTime: this.calculateTrends(timeframeLogs, timeframe),
      averageResponseTime: durationsCount > 0 ? totalDuration / durationsCount : 0,
      errorRate: timeframeLogs.length > 0 ? (errorCount / timeframeLogs.length) * 100 : 0
    }
  }

  private calculateTrends(logs: EnhancedLogEntry[], timeframe: string): { timestamp: string, count: number }[] {
    const trends: { timestamp: string, count: number }[] = []
    const groupSize = {
      hour: 5 * 60 * 1000, // 5 minute intervals
      day: 60 * 60 * 1000, // 1 hour intervals
      week: 24 * 60 * 60 * 1000, // 1 day intervals
      month: 24 * 60 * 60 * 1000 // 1 day intervals
    }[timeframe]

    const grouped: Record<string, number> = {}
    logs.forEach(log => {
      const timestamp = new Date(log.timestamp)
      const groupKey = new Date(
        Math.floor(timestamp.getTime() / groupSize) * groupSize
      ).toISOString()
      grouped[groupKey] = (grouped[groupKey] || 0) + 1
    })

    Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([timestamp, count]) => {
        trends.push({ timestamp, count })
      })

    return trends
  }

  // Utility methods for common logging patterns
  async logUserAction(action: string, details: string, userContext?: UserContext, metadata?: Record<string, any>): Promise<string> {
    return this.logEnhanced({
      action,
      resourceType: 'system',
      resourceId: userContext?.id || 'anonymous',
      resourceName: userContext?.name || 'Anonymous User',
      details,
      category: 'security',
      severity: 'medium',
      userContext,
      metadata,
      tags: ['user-action']
    })
  }

  async logPatientAction(action: string, patient: any, details: string, oldValue?: any, newValue?: any): Promise<string> {
    return this.logEnhanced({
      action,
      resourceType: 'patient',
      resourceId: patient.id,
      resourceName: patient.name,
      details,
      oldValue,
      newValue,
      category: 'business',
      severity: 'high',
      tags: ['patient-data', 'hipaa']
    })
  }

  async logSystemError(error: Error, context: string, metadata?: Record<string, any>): Promise<string> {
    return this.logEnhanced({
      action: 'system_error',
      resourceType: 'system',
      resourceId: 'system',
      resourceName: 'System',
      details: `Error in ${context}: ${error.message}`,
      error,
      category: 'system',
      severity: 'critical',
      metadata,
      tags: ['error', 'system']
    })
  }

  async logPerformanceMetric(operation: string, metrics: PerformanceMetrics, metadata?: Record<string, any>): Promise<string> {
    return this.logEnhanced({
      action: 'performance_metric',
      resourceType: 'system',
      resourceId: 'performance',
      resourceName: operation,
      details: `Performance metric for ${operation}: ${metrics.duration}ms`,
      category: 'performance',
      severity: 'low',
      performanceMetrics: metrics,
      metadata,
      tags: ['performance']
    })
  }

  // Cleanup method
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
      this.flushTimer = null
    }
    this.eventListeners.length = 0
    this.logQueue.length = 0
  }
}

// Singleton instance
export const enhancedLoggingService = new EnhancedLoggingService({
  enabled: true,
  maxRetries: 3,
  batchSize: 25,
  flushInterval: 3000,
  realTimeUpdates: true,
  logLevel: 'info'
})

export default enhancedLoggingService
