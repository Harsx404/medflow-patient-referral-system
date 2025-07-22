import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { addPatientToSheet } from '@/lib/google-sheets'

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
      name: data.fullName, // Map fullName to name for consistency
      age: data.age || 0,
      gender: data.gender || '',
      email: data.email || '',
      contactNumber: data.phone || '',
      referringDoctor: data.gpName,
      assignedDoctor: data.referredTo,
      status: 'Pending' as const,
      summary: data.reason,
      createdAt: new Date().toISOString(),
      referralLetter: '',
      referralId,
      source: 'custom-form' as const,
      insuranceProvider: data.insuranceProvider || '',
      urgencyLevel: data.urgencyLevel || 'Medium',
      pdfExtractedData: {
        referrerClinic: data.referrerClinic || '',
        clinicAddress: data.clinicAddress || '',
        referralDate: data.referralDate || new Date().toISOString().split('T')[0],
        patientName: data.fullName,
        dateOfBirth: data.dob || '',
        patientAddress: data.patientAddress || '',
        patientPhone: data.phone || '',
        medicareNumber: data.medicareNumber || '',
        reasonPurpose: data.reason,
        referredTo: data.referredTo
      }
    }

    // Add patient to Google Sheets
    try {
      await addPatientToSheet(patient)
    } catch (error) {
      console.error('Failed to add patient to Google Sheets:', error)
      // Continue with the response even if Google Sheets fails
    }
    
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