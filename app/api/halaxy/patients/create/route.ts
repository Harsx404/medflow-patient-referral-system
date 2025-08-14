/**
 * API endpoint to add a patient to Halaxy
 * POST /api/halaxy/patients/create
 */

import { NextRequest, NextResponse } from 'next/server'
import { HalaxyAPI, HalaxyPatient } from '@/lib/halaxy/api'
import { halaxyConfig } from '@/lib/halaxy/config'
import { enhancedLoggingService } from '@/lib/enhanced-logging-service'

export async function POST(request: NextRequest) {
  try {
    // Log the API call
    await enhancedLoggingService.logEnhanced({
      action: 'CREATE_HALAXY_PATIENT',
      resourceType: 'API',
      resourceId: 'halaxy-patients-create',
      resourceName: 'Halaxy Patient Creation',
      details: 'Creating a new patient in Halaxy API',
      severity: 'medium',
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
          hasClientSecret: Boolean(halaxyConfig.clientSecret)
        }
      }, { status: 400 })
    }
    
    // Get the patient data from the request
    const patientData = await request.json()

    // Validate the required fields
    const requiredFields = ['name', 'dob']
    const missingFields = requiredFields.filter(field => !patientData[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      }, { status: 400 })
    }

    // Initialize Halaxy API
    const halaxyApi = new HalaxyAPI()

    // Format patient data according to FHIR standard required by Halaxy
    // Use the API's mapping function for proper formatting
    const nameParts = patientData.name.split(' ')
    const lastName = nameParts.pop() || ''
    const firstName = nameParts.join(' ')

    const mappedPatient = {
      resourceType: 'Patient',
      name: [
        {
          given: [firstName],
          family: lastName,
          text: patientData.name
        }
      ],
      birthDate: patientData.dob,
      gender: patientData.gender?.toLowerCase() || 'unknown',
      telecom: [] as any[],
      address: [] as any[]
    }

    // Add phone if provided
    if (patientData.phone) {
      mappedPatient.telecom.push({
        system: 'phone',
        value: patientData.phone,
        use: 'mobile'
      })
    }

    // Add email if provided
    if (patientData.email) {
      mappedPatient.telecom.push({
        system: 'email',
        value: patientData.email,
        use: 'work'
      })
    }

    // Add address if provided
    if (patientData.address) {
      mappedPatient.address.push({
        use: 'home',
        line: [patientData.address],
        city: patientData.city || '',
        state: patientData.state || '',
        postalCode: patientData.postalCode || '',
        country: patientData.country || 'AU'
      })
    }

    // Create the patient in Halaxy
    try {
      const result = await halaxyApi.createPatient(mappedPatient)
      
      // Log success
      await enhancedLoggingService.logEnhanced({
        action: 'HALAXY_PATIENT_CREATED',
        resourceType: 'API',
        resourceId: result.id || 'unknown',
        resourceName: 'Halaxy Patient Creation',
        details: `Successfully created patient ${patientData.name} in Halaxy`,
        severity: 'medium',
        category: 'integration',
        metadata: {
          patientId: result.id,
          source: 'api'
        }
      })
      
      return NextResponse.json({
        success: true,
        message: 'Patient successfully created in Halaxy',
        patient: result,
        patientId: result.id
      })
    } catch (apiError) {
      console.error('API call error:', apiError)
      throw new Error(`Failed to create patient in Halaxy: ${(apiError as Error).message}`)
    }
    
  } catch (error) {
    console.error('Halaxy create patient error:', error)
    
    // Log the error
    await enhancedLoggingService.logSystemError(
      error as Error,
      'HALAXY_CREATE_PATIENT_ERROR',
      {
        endpoint: '/api/halaxy/patients/create',
        details: 'Error creating patient in Halaxy API'
      }
    )
    
    return NextResponse.json({
      success: false,
      message: 'Error creating patient in Halaxy API',
      error: (error as Error).message
    }, { status: 500 })
  }
}
