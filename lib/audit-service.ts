import { AuditLog, AUDIT_ACTIONS, RESOURCE_TYPES } from './models/audit-log'

// Using localStorage for audit logs (in production, this would be a database)
let auditLogs: AuditLog[] = []

// Initialize from localStorage if available (client-side only)
const initializeLogsFromStorage = () => {
  if (typeof window !== 'undefined') {
    try {
      const storedLogs = localStorage.getItem('medflow_audit_logs')
      if (storedLogs) {
        auditLogs = JSON.parse(storedLogs)
      }
    } catch (error) {
      console.error('Error loading audit logs from localStorage:', error)
    }
  }
}

export class AuditService {
  static async logAction(params: {
    userId: string
    userName: string
    userRole: string
    action: string
    resourceType: string
    resourceId: string
    resourceName: string
    oldValue?: any
    newValue?: any
    details: string
    ipAddress?: string
    userAgent?: string
    sessionId?: string
  }): Promise<void> {
    // Initialize logs from storage if they haven't been loaded yet
    if (auditLogs.length === 0) {
      initializeLogsFromStorage()
    }
    
    const auditLog: AuditLog = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      userId: params.userId,
      userName: params.userName,
      userRole: params.userRole as any,
      action: params.action,
      resourceType: params.resourceType as any,
      resourceId: params.resourceId,
      resourceName: params.resourceName,
      oldValue: params.oldValue,
      newValue: params.newValue,
      details: params.details,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      timestamp: new Date().toISOString(),
      sessionId: params.sessionId,
    }

    // Add to in-memory storage
    auditLogs.unshift(auditLog)
    
    // Keep only last 1000 logs to prevent memory issues
    if (auditLogs.length > 1000) {
      auditLogs = auditLogs.slice(0, 1000)
    }
    
    // Save to localStorage (client-side only)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('medflow_audit_logs', JSON.stringify(auditLogs))
      } catch (error) {
        console.error('Error saving audit logs to localStorage:', error)
      }
    }

    console.log('Audit Log:', auditLog)
  }

  static async getAuditLogs(filter?: {
    userId?: string
    userRole?: string
    action?: string
    resourceType?: string
    resourceId?: string
    startDate?: string
    endDate?: string
    limit?: number
    offset?: number
  }): Promise<AuditLog[]> {
    // Initialize logs from storage if they haven't been loaded yet
    if (auditLogs.length === 0) {
      initializeLogsFromStorage()
    }
    
    let filteredLogs = [...auditLogs]

    if (filter?.userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === filter.userId)
    }

    if (filter?.userRole) {
      filteredLogs = filteredLogs.filter(log => log.userRole === filter.userRole)
    }

    if (filter?.action) {
      filteredLogs = filteredLogs.filter(log => log.action === filter.action)
    }

    if (filter?.resourceType) {
      filteredLogs = filteredLogs.filter(log => log.resourceType === filter.resourceType)
    }

    if (filter?.resourceId) {
      filteredLogs = filteredLogs.filter(log => log.resourceId === filter.resourceId)
    }

    if (filter?.startDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= filter.startDate!)
    }

    if (filter?.endDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp <= filter.endDate!)
    }

    const offset = filter?.offset || 0
    const limit = filter?.limit || 50

    return filteredLogs.slice(offset, offset + limit)
  }

  static async getAuditLogsByUser(userId: string, limit: number = 50): Promise<AuditLog[]> {
    return this.getAuditLogs({ userId, limit })
  }

  static async getAuditLogsByResource(resourceId: string, limit: number = 50): Promise<AuditLog[]> {
    return this.getAuditLogs({ resourceId, limit })
  }

  static async getAuditSummary(): Promise<{
    totalActions: number
    actionsByUser: Record<string, number>
    actionsByType: Record<string, number>
    recentActivity: AuditLog[]
  }> {
    // Initialize logs from storage if they haven't been loaded yet
    if (auditLogs.length === 0) {
      initializeLogsFromStorage()
    }
    
    const actionsByUser: Record<string, number> = {}
    const actionsByType: Record<string, number> = {}

    auditLogs.forEach(log => {
      actionsByUser[log.userName] = (actionsByUser[log.userName] || 0) + 1
      actionsByType[log.action] = (actionsByType[log.action] || 0) + 1
    })

    return {
      totalActions: auditLogs.length,
      actionsByUser,
      actionsByType,
      recentActivity: auditLogs.slice(0, 10)
    }
  }

  // Helper methods for common actions
  static async logPatientCreated(patient: any, user: any): Promise<void> {
    await this.logAction({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: AUDIT_ACTIONS.PATIENT_CREATED,
      resourceType: RESOURCE_TYPES.PATIENT,
      resourceId: patient.id,
      resourceName: patient.name,
      newValue: patient,
      details: `Patient ${patient.name} was created`
    })
  }

  static async logPatientStatusChanged(patient: any, oldStatus: string, newStatus: string, user: any): Promise<void> {
    await this.logAction({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: AUDIT_ACTIONS.PATIENT_STATUS_CHANGED,
      resourceType: RESOURCE_TYPES.PATIENT,
      resourceId: patient.id,
      resourceName: patient.name,
      oldValue: { status: oldStatus },
      newValue: { status: newStatus },
      details: `Patient ${patient.name} status changed from ${oldStatus} to ${newStatus}`
    })
  }

  static async logUserLogin(user: any, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.logAction({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: AUDIT_ACTIONS.USER_LOGIN,
      resourceType: RESOURCE_TYPES.SYSTEM,
      resourceId: user.id,
      resourceName: user.name,
      details: `User ${user.name} logged in`,
      ipAddress,
      userAgent
    })
  }

  static async logUserLogout(user: any): Promise<void> {
    await this.logAction({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: AUDIT_ACTIONS.USER_LOGOUT,
      resourceType: RESOURCE_TYPES.SYSTEM,
      resourceId: user.id,
      resourceName: user.name,
      details: `User ${user.name} logged out`
    })
  }

  static async logFileUpload(file: any, user: any): Promise<void> {
    await this.logAction({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: AUDIT_ACTIONS.FILE_UPLOADED,
      resourceType: RESOURCE_TYPES.FILE,
      resourceId: file.id,
      resourceName: file.name,
      newValue: file,
      details: `File ${file.name} was uploaded`
    })
  }

  static async logSheetUpdate(sheetName: string, user: any, details: string): Promise<void> {
    await this.logAction({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: AUDIT_ACTIONS.SHEET_UPDATED,
      resourceType: RESOURCE_TYPES.SHEET,
      resourceId: sheetName,
      resourceName: sheetName,
      details: `Google Sheet ${sheetName} was updated: ${details}`
    })
  }
} 