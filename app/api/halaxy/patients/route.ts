import { NextRequest, NextResponse } from 'next/server'
import { HalaxyAuth } from '@/lib/halaxy/auth'
import { halaxyConfig } from '@/lib/halaxy/config'
import { enhancedLoggingService } from '@/lib/enhanced-logging-service'

/**
 * API endpoint to fetch patients from Halaxy API
 * This is a test endpoint for demonstration purposes
 */
export async function GET(request: NextRequest) {
  try {
    // Log the API call
    await enhancedLoggingService.logEnhanced({
      action: 'FETCH_HALAXY_PATIENTS',
      resourceType: 'API',
      resourceId: 'halaxy-patients',
      resourceName: 'Halaxy Patients',
      details: 'Fetching patients from Halaxy API',
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
    
    // Get request headers with auth token
    const headers = await auth.getRequestHeaders()
    
    // Get base URL for region
    const baseUrl = auth.getBaseUrl()
    
    // Fetch patients from Halaxy API
    const patientsUrl = `${baseUrl}/Patient`
    
    // Log request details
    console.log(`Making request to: ${patientsUrl}`);
    console.log(`With headers: ${JSON.stringify({
      Accept: typeof headers === 'object' ? (headers as Record<string, string>)['Accept'] : 'unknown',
      ContentType: typeof headers === 'object' ? (headers as Record<string, string>)['Content-Type'] : 'unknown',
      Authorization: typeof headers === 'object' && (headers as Record<string, string>)['Authorization'] ? 'Bearer [REDACTED]' : 'Not set',
      UserAgent: typeof headers === 'object' ? (headers as Record<string, string>)['User-Agent'] || 'Not set' : 'unknown'
    }, null, 2)}`);
    
    const response = await fetch(patientsUrl, {
      method: 'GET',
      headers
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      
      // Special handling for 403 errors which might indicate permission issues
      if (response.status === 403) {
        // Log detailed error info
        await enhancedLoggingService.logEnhanced({
          action: 'HALAXY_API_PERMISSION_ERROR',
          resourceType: 'API',
          resourceId: 'halaxy-patients',
          resourceName: 'Halaxy Patients',
          details: `Permission error accessing Halaxy API: ${errorText}`,
          severity: 'high',
          category: 'integration',
          metadata: {
            status: response.status,
            responseText: errorText,
            url: patientsUrl,
            headers: Object.fromEntries(
              Object.entries(headers as Record<string, string>)
                .map(([k, v]) => [k, k === 'Authorization' ? 'Bearer [REDACTED]' : v])
            )
          }
        });
        
        return NextResponse.json({
          success: false,
          message: 'Access denied to Halaxy patients API (403): Please check that your API key has permission to access patient data.',
          error: errorText
        }, { status: 403 });
      }
      
      throw new Error(`Failed to fetch patients: ${response.status} ${errorText}`)
    }
    
    const data = await response.json()
    
    // Log success
    await enhancedLoggingService.logEnhanced({
      action: 'HALAXY_PATIENTS_FETCHED',
      resourceType: 'API',
      resourceId: 'halaxy-patients',
      resourceName: 'Halaxy Patients',
      details: `Successfully fetched ${data.entry?.length || 0} patients from Halaxy`,
      severity: 'low',
      category: 'integration'
    })
    
    return NextResponse.json({
      success: true,
      patients: data.entry || [],
      total: data.total || 0
    })
    
  } catch (error) {
    console.error('Halaxy fetch patients error:', error)
    
    // Log the error
    await enhancedLoggingService.logSystemError(
      error as Error,
      'HALAXY_FETCH_PATIENTS_FAILED',
      {
        endpoint: '/api/halaxy/patients',
        details: 'Error fetching patients from Halaxy API'
      }
    )
    
    return NextResponse.json({
      success: false,
      message: 'Error fetching patients from Halaxy API',
      error: (error as Error).message
    }, { status: 500 })
  }
}
