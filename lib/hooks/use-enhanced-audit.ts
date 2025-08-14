'use client'

import { useCallback, useEffect, useState } from 'react'
import { enhancedLoggingService, LogEvent, EnhancedLogEntry, UserContext, PerformanceMetrics } from '../enhanced-logging-service'
import { AUDIT_ACTIONS, RESOURCE_TYPES } from '../models/audit-log'

export function useEnhancedAudit() {
  const [isConnected, setIsConnected] = useState(false)
  const [recentLogs, setRecentLogs] = useState<EnhancedLogEntry[]>([])
  const [logStats, setLogStats] = useState<{
    totalToday: number
    errorCount: number
    avgResponseTime: number
  }>({
    totalToday: 0,
    errorCount: 0,
    avgResponseTime: 0
  })

  // Get current user context
  const getCurrentUser = useCallback((): UserContext | null => {
    if (typeof window === 'undefined') return null
    
    try {
      const currentUser = localStorage.getItem('currentUser')
      const userRole = localStorage.getItem('userRole')
      const sessionId = localStorage.getItem('sessionId') || sessionStorage.getItem('sessionId')
      
      if (!currentUser || !userRole) return null
      
      return {
        id: currentUser,
        name: currentUser,
        role: userRole,
        sessionId: sessionId || undefined
      }
    } catch (error) {
      console.warn('Failed to get current user:', error)
      return null
    }
  }, [])

  // Real-time event listener
  useEffect(() => {
    const unsubscribe = enhancedLoggingService.addEventListener((event: LogEvent) => {
      switch (event.type) {
        case 'log_created':
          const logEntry = event.data as EnhancedLogEntry
          setRecentLogs(prev => [logEntry, ...prev.slice(0, 19)]) // Keep last 20 logs
          break
        
        case 'batch_processed':
          console.log('Batch processed:', event.data)
          break
        
        case 'error_occurred':
          console.error('Logging error:', event.data)
          break
      }
    })

    setIsConnected(true)

    return () => {
      unsubscribe()
      setIsConnected(false)
    }
  }, [])

  // Update stats periodically
  useEffect(() => {
    const updateStats = async () => {
      try {
        const analytics = await enhancedLoggingService.getAnalytics('day')
        setLogStats({
          totalToday: analytics.totalLogs,
          errorCount: Math.round((analytics.errorRate * analytics.totalLogs) / 100),
          avgResponseTime: analytics.averageResponseTime
        })
      } catch (error) {
        console.warn('Failed to update log stats:', error)
      }
    }

    updateStats()
    const interval = setInterval(updateStats, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  // Enhanced logging function with automatic context
  const logEnhanced = useCallback(async (params: {
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
    metadata?: Record<string, any>
    tags?: string[]
    error?: Error
  }) => {
    try {
      const userContext = getCurrentUser()
      
      // Add automatic IP address if available
      let ipAddress: string | undefined
      try {
        // This would typically come from the server or a geolocation service
        ipAddress = params.metadata?.ipAddress
      } catch (error) {
        // IP address not available in client-side context
      }

      const logId = await enhancedLoggingService.logEnhanced({
        ...params,
        userContext: userContext || undefined,
        metadata: {
          ...params.metadata,
          ipAddress,
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
        }
      })

      return logId
    } catch (error) {
      console.error('Enhanced audit logging failed:', error)
      return null
    }
  }, [getCurrentUser])

  // Performance-tracked action wrapper
  const withPerformanceTracking = useCallback(<T extends (...args: any[]) => Promise<any>>(
    operation: T,
    operationName: string,
    metadata?: Record<string, any>
  ): T => {
    return (async (...args: any[]) => {
      const operationId = enhancedLoggingService.generateCorrelationId()
      enhancedLoggingService.startPerformanceTracking(operationId)
      
      try {
        const result = await operation(...args)
        const metrics = enhancedLoggingService.endPerformanceTracking(operationId)
        
        // Log the performance metric
        if (metrics) {
          await enhancedLoggingService.logPerformanceMetric(operationName, metrics, {
            ...metadata,
            success: true,
            operationId
          })
        }
        
        return result
      } catch (error) {
        const metrics = enhancedLoggingService.endPerformanceTracking(operationId)
        
        // Log the error with performance data
        await enhancedLoggingService.logSystemError(error as Error, operationName, {
          ...metadata,
          operationId,
          duration: metrics?.duration
        })
        
        throw error
      }
    }) as T
  }, [])

  // Specific logging methods with enhanced context
  const logPatientAction = useCallback(async (
    action: string,
    patient: any,
    details: string,
    oldValue?: any,
    newValue?: any,
    correlationId?: string
  ) => {
    return logEnhanced({
      action,
      resourceType: RESOURCE_TYPES.PATIENT,
      resourceId: patient.id,
      resourceName: patient.name,
      details,
      oldValue,
      newValue,
      correlationId,
      category: 'business',
      severity: 'high',
      tags: ['patient-data', 'hipaa'],
      metadata: {
        patientAge: patient.age,
        patientGender: patient.gender,
        referringDoctor: patient.referringDoctor,
        assignedDoctor: patient.assignedDoctor
      }
    })
  }, [logEnhanced])

  const logDoctorAction = useCallback(async (
    action: string,
    doctor: any,
    details: string,
    oldValue?: any,
    newValue?: any,
    correlationId?: string
  ) => {
    return logEnhanced({
      action,
      resourceType: RESOURCE_TYPES.DOCTOR,
      resourceId: doctor.id,
      resourceName: doctor.name,
      details,
      oldValue,
      newValue,
      correlationId,
      category: 'business',
      severity: 'medium',
      tags: ['doctor-management'],
      metadata: {
        specialization: doctor.specialization,
        availability: doctor.availability,
        currentPatients: doctor.currentPatients
      }
    })
  }, [logEnhanced])

  const logUserAction = useCallback(async (
    action: string,
    details: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    metadata?: Record<string, any>
  ) => {
    const user = getCurrentUser()
    return logEnhanced({
      action,
      resourceType: RESOURCE_TYPES.SYSTEM,
      resourceId: user?.id || 'anonymous',
      resourceName: user?.name || 'Anonymous User',
      details,
      category: 'security',
      severity,
      tags: ['user-action'],
      metadata: {
        ...metadata,
        sessionId: user?.sessionId
      }
    })
  }, [logEnhanced, getCurrentUser])

  const logSystemAction = useCallback(async (
    action: string,
    details: string,
    metadata?: Record<string, any>,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'low'
  ) => {
    return logEnhanced({
      action,
      resourceType: RESOURCE_TYPES.SYSTEM,
      resourceId: 'system',
      resourceName: 'System',
      details,
      category: 'system',
      severity,
      tags: ['system'],
      metadata
    })
  }, [logEnhanced])

  const logFileAction = useCallback(async (
    action: string,
    file: any,
    details: string,
    correlationId?: string
  ) => {
    return logEnhanced({
      action,
      resourceType: RESOURCE_TYPES.FILE,
      resourceId: file.id || file.name,
      resourceName: file.name,
      details,
      correlationId,
      category: 'business',
      severity: 'medium',
      tags: ['file-operation'],
      metadata: {
        fileSize: file.size,
        fileType: file.type,
        fileName: file.name
      }
    })
  }, [logEnhanced])

  const logSheetAction = useCallback(async (
    action: string,
    sheetName: string,
    details: string,
    correlationId?: string
  ) => {
    return logEnhanced({
      action,
      resourceType: RESOURCE_TYPES.SHEET,
      resourceId: sheetName,
      resourceName: sheetName,
      details,
      correlationId,
      category: 'integration',
      severity: 'medium',
      tags: ['google-sheets']
    })
  }, [logEnhanced])

  const logSecurityEvent = useCallback(async (
    event: string,
    details: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'high',
    metadata?: Record<string, any>
  ) => {
    return logEnhanced({
      action: `security_${event}`,
      resourceType: RESOURCE_TYPES.SYSTEM,
      resourceId: 'security',
      resourceName: 'Security System',
      details,
      category: 'security',
      severity,
      tags: ['security', 'alert'],
      metadata
    })
  }, [logEnhanced])

  const logError = useCallback(async (
    error: Error,
    context: string,
    metadata?: Record<string, any>
  ) => {
    return enhancedLoggingService.logSystemError(error, context, metadata)
  }, [])

  // Batch operations for multiple related logs
  const startCorrelatedOperation = useCallback((operationName: string) => {
    return enhancedLoggingService.generateCorrelationId()
  }, [])

  // Get enhanced logs with filtering
  const getLogs = useCallback(async (filter: {
    userId?: string
    action?: string
    resourceType?: string
    severity?: string
    category?: string
    startDate?: string
    endDate?: string
    correlationId?: string
    tags?: string[]
    limit?: number
    offset?: number
  } = {}) => {
    return enhancedLoggingService.getLogs(filter)
  }, [])

  // Get analytics
  const getAnalytics = useCallback(async (timeframe: 'hour' | 'day' | 'week' | 'month' = 'day') => {
    return enhancedLoggingService.getAnalytics(timeframe)
  }, [])

  // Search logs with full-text search
  const searchLogs = useCallback(async (searchTerm: string, filters?: {
    category?: string
    severity?: string
    startDate?: string
    endDate?: string
    limit?: number
  }) => {
    const allLogs = await enhancedLoggingService.getLogs({
      ...filters,
      limit: filters?.limit || 1000
    })
    
    const searchLower = searchTerm.toLowerCase()
    const filtered = allLogs.logs.filter(log => 
      log.details.toLowerCase().includes(searchLower) ||
      log.userName.toLowerCase().includes(searchLower) ||
      log.resourceName.toLowerCase().includes(searchLower) ||
      log.action.toLowerCase().includes(searchLower)
    )
    
    return { logs: filtered, total: filtered.length }
  }, [])

  // Clear all logs
  const clearLogs = useCallback(async () => {
    if (confirm('Are you sure you want to clear all enhanced logs? This cannot be undone.')) {
      try {
        // Call API to clear logs
        const response = await fetch('/api/enhanced-logs?clear=true')
        if (!response.ok) {
          throw new Error(`Failed to clear logs: ${response.statusText}`)
        }
        
        // Force refresh by calling the service directly
        return await enhancedLoggingService.getLogs({})
      } catch (error) {
        console.error('Error clearing logs:', error)
        return { logs: [], total: 0 }
      }
    }
    return null
  }, [])

  return {
    // Connection status
    isConnected,
    
    // Real-time data
    recentLogs,
    logStats,
    
    // Enhanced logging methods
    logEnhanced,
    logPatientAction,
    logDoctorAction,
    logUserAction,
    logSystemAction,
    logFileAction,
    logSheetAction,
    logSecurityEvent,
    logError,
    
    // Performance tracking
    withPerformanceTracking,
    
    // Correlation tracking
    startCorrelatedOperation,
    
    // Data retrieval
    getLogs,
    getAnalytics,
    searchLogs,
    clearLogs,
    
    // Constants
    AUDIT_ACTIONS,
    RESOURCE_TYPES,
    
    // Utilities
    getCurrentUser,
    generateCorrelationId: enhancedLoggingService.generateCorrelationId.bind(enhancedLoggingService)
  }
}
