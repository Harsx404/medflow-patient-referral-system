import { NextRequest, NextResponse } from 'next/server'
import { AuditService } from '@/lib/audit-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Get filter parameters
    const userId = searchParams.get('userId')
    const userRole = searchParams.get('userRole')
    const action = searchParams.get('action')
    const resourceType = searchParams.get('resourceType')
    const resourceId = searchParams.get('resourceId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const summary = searchParams.get('summary') === 'true'

    if (summary) {
      // Return audit summary
      const auditSummary = await AuditService.getAuditSummary()
      return NextResponse.json(auditSummary)
    }

    // Get filtered audit logs
    const auditLogs = await AuditService.getAuditLogs({
      userId: userId || undefined,
      userRole: userRole || undefined,
      action: action || undefined,
      resourceType: resourceType || undefined,
      resourceId: resourceId || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      limit,
      offset,
    })

    return NextResponse.json({
      logs: auditLogs,
      total: auditLogs.length,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Log the action
    await AuditService.logAction({
      userId: body.userId,
      userName: body.userName,
      userRole: body.userRole,
      action: body.action,
      resourceType: body.resourceType,
      resourceId: body.resourceId,
      resourceName: body.resourceName,
      oldValue: body.oldValue,
      newValue: body.newValue,
      details: body.details,
      ipAddress: body.ipAddress,
      userAgent: body.userAgent,
      sessionId: body.sessionId,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error logging audit action:', error)
    return NextResponse.json(
      { error: 'Failed to log audit action' },
      { status: 500 }
    )
  }
} 