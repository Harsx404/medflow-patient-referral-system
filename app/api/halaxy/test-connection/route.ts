import { NextRequest, NextResponse } from 'next/server'
import { HalaxyAuth } from '@/lib/halaxy/auth'
import { halaxyConfig } from '@/lib/halaxy/config'
import { enhancedLoggingService } from '@/lib/enhanced-logging-service'

/**
 * API endpoint for testing Halaxy connectivity
 */
export async function GET(request: NextRequest) {
  try {
    // Log the test attempt
    await enhancedLoggingService.logEnhanced({
      action: 'TEST_HALAXY_CONNECTION',
      resourceType: 'API',
      resourceId: 'halaxy-test',
      resourceName: 'Halaxy Test Connection',
      details: 'Testing Halaxy API connection',
      severity: 'low',
      category: 'integration'
    })

    // Check if Halaxy is configured properly
    if (!halaxyConfig.enabled) {
      return NextResponse.json({
        success: false,
        message: 'Halaxy integration is not enabled. Set HALAXY_ENABLED=true in your .env file.'
      }, { status: 400 })
    }
    
    if (!halaxyConfig.clientId || !halaxyConfig.clientSecret) {
      return NextResponse.json({
        success: false,
        message: 'Halaxy credentials are missing. Check your .env.local file.',
        config: {
          enabled: halaxyConfig.enabled,
          hasClientId: Boolean(halaxyConfig.clientId),
          hasClientSecret: Boolean(halaxyConfig.clientSecret),
          region: halaxyConfig.region,
          vendorName: halaxyConfig.vendorName,
          vendorEmail: halaxyConfig.vendorEmail
        }
      }, { status: 400 })
    }
    
    // Initialize Halaxy auth
    const auth = new HalaxyAuth({
      clientId: halaxyConfig.clientId,
      clientSecret: halaxyConfig.clientSecret,
      region: halaxyConfig.region,
      vendorName: halaxyConfig.vendorName,
      vendorEmail: halaxyConfig.vendorEmail
    })
    
    // Test authentication by getting a token
    const token = await auth.getAccessToken()
    
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Failed to obtain authentication token from Halaxy'
      }, { status: 401 })
    }
    
    // Get base URL for region
    const baseUrl = auth.getBaseUrl()
    
    // Return success with masked token for verification
    const maskedToken = token.substring(0, 10) + '...' + token.substring(token.length - 5)
    
    // Log success
    await enhancedLoggingService.logEnhanced({
      action: 'HALAXY_CONNECTION_SUCCESSFUL',
      resourceType: 'API',
      resourceId: 'halaxy-test',
      resourceName: 'Halaxy Test Connection',
      details: 'Successfully connected to Halaxy API',
      severity: 'low',
      category: 'integration'
    })
    
    return NextResponse.json({
      success: true,
      message: 'Successfully authenticated with Halaxy API',
      config: {
        region: halaxyConfig.region,
        baseUrl,
        vendorName: halaxyConfig.vendorName
      },
      auth: {
        tokenReceived: true,
        tokenPreview: maskedToken
      }
    })
    
  } catch (error) {
    console.error('Halaxy test connection error:', error)
    
    // Log the error
    await enhancedLoggingService.logSystemError(
      error as Error,
      'HALAXY_CONNECTION_FAILED',
      {
        endpoint: '/api/halaxy/test-connection',
        details: 'Error connecting to Halaxy API'
      }
    )
    
    return NextResponse.json({
      success: false,
      message: 'Error connecting to Halaxy API',
      error: (error as Error).message
    }, { status: 500 })
  }
}
