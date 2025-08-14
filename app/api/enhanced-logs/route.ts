import { NextRequest, NextResponse } from 'next/server'
import { enhancedLoggingService } from '@/lib/enhanced-logging-service'

// Helper function to get client IP address
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const clientIp = request.headers.get('cf-connecting-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  if (realIp) {
    return realIp.trim()
  }
  if (clientIp) {
    return clientIp.trim()
  }
  return 'unknown'
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Get filter parameters
    const userId = searchParams.get('userId')
    const userRole = searchParams.get('userRole')
    const action = searchParams.get('action')
    const resourceType = searchParams.get('resourceType')
    const resourceId = searchParams.get('resourceId')
    const severity = searchParams.get('severity')
    const category = searchParams.get('category')
    const source = searchParams.get('source')
    const correlationId = searchParams.get('correlationId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const tags = searchParams.get('tags')?.split(',').filter(Boolean)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const sortBy = searchParams.get('sortBy') || 'timestamp'
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'
    
    // Special endpoints
    const analytics = searchParams.get('analytics')
    const search = searchParams.get('search')
    const clear = searchParams.get('clear') === 'true'
    
    // Clear all logs
    if (clear) {
      enhancedLoggingService.clearAllLogs()
      return NextResponse.json({
        success: true,
        message: 'All enhanced logs cleared'
      })
    }
    
    if (analytics) {
      const timeframe = (searchParams.get('timeframe') as 'hour' | 'day' | 'week' | 'month') || 'day'
      const analyticsData = await enhancedLoggingService.getAnalytics(timeframe)
      return NextResponse.json(analyticsData)
    }
    
    if (search) {
      const searchFilters = {
        category,
        severity,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        limit
      }
      
      // Use enhanced search functionality
      const allLogs = await enhancedLoggingService.getLogs({
        ...searchFilters,
        limit: 1000 // Get more logs for searching
      })
      
      const searchLower = search.toLowerCase()
      const filteredLogs = allLogs.logs.filter(log => 
        log.details.toLowerCase().includes(searchLower) ||
        log.userName.toLowerCase().includes(searchLower) ||
        log.resourceName.toLowerCase().includes(searchLower) ||
        log.action.toLowerCase().includes(searchLower) ||
        log.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      )
      
      return NextResponse.json({
        logs: filteredLogs.slice(offset, offset + limit),
        total: filteredLogs.length,
        searchTerm: search,
        limit,
        offset
      })
    }
    
    // Get enhanced logs with comprehensive filtering
    const result = await enhancedLoggingService.getLogs({
      userId: userId || undefined,
      userRole: userRole || undefined,
      action: action || undefined,
      resourceType: resourceType || undefined,
      resourceId: resourceId || undefined,
      severity: severity || undefined,
      category: category || undefined,
      source: source || undefined,
      correlationId: correlationId || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      tags: tags || undefined,
      limit,
      offset,
      sortBy,
      sortOrder
    })
    
    return NextResponse.json({
      logs: result.logs,
      total: result.total,
      limit,
      offset,
      sortBy,
      sortOrder
    })
    
  } catch (error) {
    console.error('Error fetching enhanced logs:', error)
    
    // Log the API error
    try {
      await enhancedLoggingService.logSystemError(
        error as Error, 
        'GET /api/enhanced-logs',
        {
          endpoint: '/api/enhanced-logs',
          method: 'GET',
          userAgent: request.headers.get('user-agent'),
          ipAddress: getClientIP(request)
        }
      )
    } catch (logError) {
      console.error('Failed to log API error:', logError)
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch enhanced logs', details: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const ipAddress = getClientIP(request)
    const userAgent = request.headers.get('user-agent')
    
    // Enhanced logging with automatic context
    const logId = await enhancedLoggingService.logEnhanced({
      action: body.action,
      resourceType: body.resourceType,
      resourceId: body.resourceId,
      resourceName: body.resourceName,
      details: body.details,
      oldValue: body.oldValue,
      newValue: body.newValue,
      severity: body.severity || 'medium',
      category: body.category || 'business',
      correlationId: body.correlationId,
      parentLogId: body.parentLogId,
      userContext: body.userContext ? {
        id: body.userContext.id,
        name: body.userContext.name,
        role: body.userContext.role,
        sessionId: body.userContext.sessionId
      } : undefined,
      metadata: {
        ...body.metadata,
        ipAddress,
        userAgent,
        apiEndpoint: '/api/enhanced-logs',
        timestamp: Date.now()
      },
      tags: body.tags || [],
      error: body.error ? new Error(body.error.message) : undefined
    })
    
    return NextResponse.json({ 
      success: true, 
      logId,
      message: 'Log entry created successfully'
    })
    
  } catch (error) {
    console.error('Error creating enhanced log:', error)
    
    // Log the API error
    try {
      await enhancedLoggingService.logSystemError(
        error as Error, 
        'POST /api/enhanced-logs',
        {
          endpoint: '/api/enhanced-logs',
          method: 'POST',
          userAgent: request.headers.get('user-agent'),
          ipAddress: getClientIP(request)
        }
      )
    } catch (logError) {
      console.error('Failed to log API error:', logError)
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create enhanced log', 
        details: (error as Error).message 
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const operation = searchParams.get('operation')
    
    if (operation === 'flush') {
      // Force flush pending logs
      await (enhancedLoggingService as any).flush()
      return NextResponse.json({ 
        success: true, 
        message: 'Logs flushed successfully' 
      })
    }
    
    if (operation === 'analytics-refresh') {
      // Refresh analytics data
      const timeframe = (searchParams.get('timeframe') as 'hour' | 'day' | 'week' | 'month') || 'day'
      const analytics = await enhancedLoggingService.getAnalytics(timeframe)
      return NextResponse.json(analytics)
    }
    
    return NextResponse.json(
      { error: 'Invalid operation specified' },
      { status: 400 }
    )
    
  } catch (error) {
    console.error('Error in PUT operation:', error)
    
    return NextResponse.json(
      { error: 'Operation failed', details: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const operation = searchParams.get('operation')
    
    if (operation === 'cleanup') {
      // This would implement log cleanup/archival in a production system
      // For now, we'll just return a success message
      return NextResponse.json({ 
        success: true, 
        message: 'Log cleanup initiated (not implemented in demo)' 
      })
    }
    
    return NextResponse.json(
      { error: 'Invalid operation specified' },
      { status: 400 }
    )
    
  } catch (error) {
    console.error('Error in DELETE operation:', error)
    
    return NextResponse.json(
      { error: 'Operation failed', details: (error as Error).message },
      { status: 500 }
    )
  }
}
