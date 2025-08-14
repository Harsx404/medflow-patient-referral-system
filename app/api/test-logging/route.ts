import { NextRequest, NextResponse } from 'next/server'
import { enhancedLoggingService } from '@/lib/enhanced-logging-service'

/**
 * Test API for enhanced logging functionality
 * This is used for development/testing only
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    
    if (action === 'add-test-logs') {
      // Add test logs
      for (let i = 0; i < 5; i++) {
        await enhancedLoggingService.logEnhanced({
          action: 'TEST_ACTION',
          resourceType: 'TEST_RESOURCE',
          resourceId: `test-${i}`,
          resourceName: `Test Resource ${i}`,
          details: `Test log entry ${i}`,
          severity: 'low',
          category: 'system',
          userContext: {
            id: 'test-user',
            name: 'Test User',
            role: 'tester'
          }
        })
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Added 5 test logs' 
      })
    }
    
    if (action === 'count-logs') {
      const result = await enhancedLoggingService.getLogs({})
      return NextResponse.json({ 
        success: true, 
        count: result.total
      })
    }
    
    return NextResponse.json({ 
      success: false, 
      message: 'Unknown action. Use ?action=add-test-logs or ?action=count-logs' 
    })
    
  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
