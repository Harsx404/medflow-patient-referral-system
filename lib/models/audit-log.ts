export interface AuditLog {
  id: string
  userId: string
  userName: string
  userRole: 'admin' | 'doctor' | 'nurse' | 'receptionist'
  action: string
  resourceType: 'patient' | 'doctor' | 'referral' | 'system'
  resourceId: string
  resourceName: string
  oldValue?: any
  newValue?: any
  details: string
  ipAddress?: string
  userAgent?: string
  timestamp: string
  sessionId?: string
}

export interface AuditLogFilter {
  userId?: string
  userRole?: string
  action?: string
  resourceType?: string
  resourceId?: string
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
}

export interface AuditLogSummary {
  totalActions: number
  actionsByUser: Record<string, number>
  actionsByType: Record<string, number>
  recentActivity: AuditLog[]
}

export const AUDIT_ACTIONS = {
  // Patient actions
  PATIENT_CREATED: 'patient_created',
  PATIENT_UPDATED: 'patient_updated',
  PATIENT_STATUS_CHANGED: 'patient_status_changed',
  PATIENT_DELETED: 'patient_deleted',
  PATIENT_ASSIGNED: 'patient_assigned',
  PATIENT_TRANSFERRED: 'patient_transferred',
  
  // Doctor actions
  DOCTOR_CREATED: 'doctor_created',
  DOCTOR_UPDATED: 'doctor_updated',
  DOCTOR_DELETED: 'doctor_deleted',
  DOCTOR_AVAILABILITY_TOGGLED: 'doctor_availability_toggled',
  
  // Referral actions
  REFERRAL_CREATED: 'referral_created',
  REFERRAL_UPDATED: 'referral_updated',
  REFERRAL_APPROVED: 'referral_approved',
  REFERRAL_REJECTED: 'referral_rejected',
  
  // System actions
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  USER_CREATED: 'user_created',
  USER_UPDATED: 'user_updated',
  USER_DELETED: 'user_deleted',
  
  // File actions
  FILE_UPLOADED: 'file_uploaded',
  FILE_DELETED: 'file_deleted',
  FILE_DOWNLOADED: 'file_downloaded',
  
  // Google Sheets actions
  SHEET_UPDATED: 'sheet_updated',
  SHEET_CREATED: 'sheet_created',
  SHEET_DELETED: 'sheet_deleted',
} as const

export const RESOURCE_TYPES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  REFERRAL: 'referral',
  SYSTEM: 'system',
  FILE: 'file',
  SHEET: 'sheet',
} as const 