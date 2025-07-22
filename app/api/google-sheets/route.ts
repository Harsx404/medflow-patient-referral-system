import { NextRequest, NextResponse } from 'next/server'
import { addPatientToSheet, updatePatientStatusInSheet, movePatientToSheet } from '@/lib/google-sheets'
import { Patient } from '@/lib/store'

export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json()

    switch (action) {
      case 'addPatient':
        await addPatientToSheet(data.patient as Patient)
        return NextResponse.json({ success: true, message: 'Patient added to Google Sheets' })

      case 'updateStatus':
        await updatePatientStatusInSheet(
          data.patientId,
          data.newStatus,
          data.practitionerName
        )
        return NextResponse.json({ success: true, message: 'Patient status updated in Google Sheets' })

      case 'movePatient':
        await movePatientToSheet(
          data.patientId,
          data.fromPractitioner,
          data.toPractitioner,
          data.patientData
        )
        return NextResponse.json({ success: true, message: 'Patient moved between sheets' })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Google Sheets API error:', error)
    return NextResponse.json(
      { error: 'Failed to update Google Sheets' },
      { status: 500 }
    )
  }
}