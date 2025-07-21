import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Validate required fields
    const requiredFields = ['fullName', 'referredTo', 'gpName', 'reason', 'diagnosis']
    const missingFields = requiredFields.filter(field => !data[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Generate a unique referral ID
    const referralId = `REF-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`
    
    // Create patient object
    const patient = {
      id: uuidv4(),
      fullName: data.fullName,
      dob: data.dob || '',
      email: data.email || '',
      phone: data.phone || '',
      referredTo: data.referredTo,
      gpName: data.gpName,
      insuranceProvider: data.insuranceProvider || '',
      medicareNumber: data.medicareNumber || '',
      referrerClinic: data.referrerClinic || '',
      referralDate: data.referralDate || new Date().toISOString().split('T')[0],
      patientAddress: data.patientAddress || '',
      clinicAddress: data.clinicAddress || '',
      reason: data.reason,
      diagnosis: data.diagnosis,
      status: 'pending' as const,
      source: 'custom-form' as const,
      createdAt: new Date().toISOString(),
      referralId
    }

    // In a real application, you would save this to a database
    // For now, we'll return the patient data and let the frontend handle it
    
    return NextResponse.json({
      success: true,
      patient,
      referralId,
      message: 'Patient referral submitted successfully'
    })

  } catch (error) {
    console.error('Submit form error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}