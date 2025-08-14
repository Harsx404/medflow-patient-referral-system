import { useCallback } from 'react'
import { AuditService } from '../audit-service'
import { AUDIT_ACTIONS, RESOURCE_TYPES } from '../models/audit-log'

export function useAudit() {
  const logAction = useCallback(async (params: {
    action: string
    resourceType: string
    resourceId: string
    resourceName: string
    oldValue?: any
    newValue?: any
    details: string
    ipAddress?: string
    userAgent?: string
  }) => {
    try {
      const currentUser = typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null
      const userRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null
      
      if (currentUser && userRole) {
        const user = {
          id: currentUser,
          name: currentUser,
          role: userRole
        }
        
        await AuditService.logAction({
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          ...params
        })
      }
    } catch (error) {
      console.error('Failed to log audit action:', error)
    }
  }, [])

  const logPatientAction = useCallback(async (
    action: string,
    patient: any,
    details: string,
    oldValue?: any,
    newValue?: any
  ) => {
    await logAction({
      action,
      resourceType: RESOURCE_TYPES.PATIENT,
      resourceId: patient.id,
      resourceName: patient.name,
      oldValue,
      newValue,
      details
    })
  }, [logAction])

  const logDoctorAction = useCallback(async (
    action: string,
    doctor: any,
    details: string,
    oldValue?: any,
    newValue?: any
  ) => {
    await logAction({
      action,
      resourceType: RESOURCE_TYPES.DOCTOR,
      resourceId: doctor.id,
      resourceName: doctor.name,
      oldValue,
      newValue,
      details
    })
  }, [logAction])

  const logSystemAction = useCallback(async (
    action: string,
    details: string,
    oldValue?: any,
    newValue?: any
  ) => {
    await logAction({
      action,
      resourceType: RESOURCE_TYPES.SYSTEM,
      resourceId: 'system',
      resourceName: 'System',
      oldValue,
      newValue,
      details
    })
  }, [logAction])

  const logFileAction = useCallback(async (
    action: string,
    file: any,
    details: string
  ) => {
    await logAction({
      action,
      resourceType: RESOURCE_TYPES.FILE,
      resourceId: file.id || file.name,
      resourceName: file.name,
      newValue: file,
      details
    })
  }, [logAction])

  const logSheetAction = useCallback(async (
    action: string,
    sheetName: string,
    details: string
  ) => {
    await logAction({
      action,
      resourceType: RESOURCE_TYPES.SHEET,
      resourceId: sheetName,
      resourceName: sheetName,
      details
    })
  }, [logAction])

  return {
    logAction,
    logPatientAction,
    logDoctorAction,
    logSystemAction,
    logFileAction,
    logSheetAction,
    AUDIT_ACTIONS,
    RESOURCE_TYPES
  }
} 