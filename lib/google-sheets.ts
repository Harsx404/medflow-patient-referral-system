import { google } from 'googleapis'
import { Patient } from './store'

// Google Sheets configuration
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n')
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_SHEETS_CLIENT_EMAIL

// Initialize Google Sheets API
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: GOOGLE_CLIENT_EMAIL,
    private_key: GOOGLE_PRIVATE_KEY,
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})

const sheets = google.sheets({ version: 'v4', auth })

// Helper function to get or create sheet by practitioner name
export async function getOrCreateSheet(practitionerName: string): Promise<string> {
  if (!SPREADSHEET_ID) {
    throw new Error('Google Sheets ID not configured')
  }

  try {
    // Get existing sheets
    const response = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    })

    const existingSheet = response.data.sheets?.find(
      sheet => sheet.properties?.title === practitionerName
    )

    if (existingSheet) {
      return practitionerName
    }

    // Create new sheet for practitioner
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: practitionerName,
              },
            },
          },
        ],
      },
    })

    // Add headers to the new sheet
    const headers = [
      'Patient ID',
      'Patient Name',
      'Age',
      'Gender',
      'Email',
      'Phone',
      'Referring Doctor',
      'Assigned Doctor',
      'Status',
      'Reason',
      'Diagnosis',
      'Created At',
      'Updated At',
      'Referral ID',
      'Source',
      'Insurance Provider',
      'Medicare Number',
      'DOB',
      'Address',
      'Urgency Level'
    ]

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${practitionerName}!A1:T1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [headers],
      },
    })

    return practitionerName
  } catch (error) {
    console.error('Error creating/getting sheet:', error)
    throw error
  }
}

// Add patient data to Google Sheets
export async function addPatientToSheet(patient: Patient): Promise<void> {
  if (!SPREADSHEET_ID) {
    console.warn('Google Sheets ID not configured, skipping sheet update')
    return
  }

  try {
    const practitionerName = patient.assignedDoctor || patient.referringDoctor || 'Unassigned'
    const sheetName = await getOrCreateSheet(practitionerName)

    // Prepare patient data row
    const patientRow = [
      patient.id,
      patient.name,
      patient.age?.toString() || '',
      patient.gender || '',
      patient.email || '',
      patient.contactNumber || '',
      patient.referringDoctor || '',
      patient.assignedDoctor || '',
      patient.status,
      patient.summary || '',
      patient.pdfExtractedData?.reasonPurpose || '',
      patient.createdAt,
      patient.updatedAt || '',
      patient.referralId || '',
      patient.source || '',
      patient.insuranceProvider || '',
      patient.pdfExtractedData?.medicareNumber || '',
      patient.pdfExtractedData?.dateOfBirth || '',
      patient.pdfExtractedData?.patientAddress || '',
      patient.urgencyLevel || ''
    ]

    // Append the row to the sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A:T`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [patientRow],
      },
    })

    console.log(`Patient ${patient.name} added to sheet: ${sheetName}`)
  } catch (error) {
    console.error('Error adding patient to sheet:', error)
    // Don't throw error to prevent form submission failure
  }
}

// Update patient status in Google Sheets
export async function updatePatientStatusInSheet(
  patientId: string,
  newStatus: string,
  practitionerName: string
): Promise<void> {
  if (!SPREADSHEET_ID) {
    console.warn('Google Sheets ID not configured, skipping sheet update')
    return
  }

  try {
    const sheetName = await getOrCreateSheet(practitionerName)

    // Get all data from the sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A:T`,
    })

    const rows = response.data.values || []
    const headerRow = rows[0] || []
    const statusColumnIndex = headerRow.indexOf('Status')
    const updatedAtColumnIndex = headerRow.indexOf('Updated At')
    const patientIdColumnIndex = headerRow.indexOf('Patient ID')

    if (statusColumnIndex === -1 || patientIdColumnIndex === -1) {
      console.error('Required columns not found in sheet')
      return
    }

    // Find the row with the matching patient ID
    let targetRowIndex = -1
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][patientIdColumnIndex] === patientId) {
        targetRowIndex = i + 1 // Google Sheets is 1-indexed
        break
      }
    }

    if (targetRowIndex === -1) {
      console.error(`Patient with ID ${patientId} not found in sheet ${sheetName}`)
      return
    }

    // Update status and timestamp
    const updates = [
      {
        range: `${sheetName}!${String.fromCharCode(65 + statusColumnIndex)}${targetRowIndex}`,
        values: [[newStatus]],
      },
    ]

    if (updatedAtColumnIndex !== -1) {
      updates.push({
        range: `${sheetName}!${String.fromCharCode(65 + updatedAtColumnIndex)}${targetRowIndex}`,
        values: [[new Date().toISOString()]],
      })
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: updates,
      },
    })

    console.log(`Patient ${patientId} status updated to ${newStatus} in sheet: ${sheetName}`)
  } catch (error) {
    console.error('Error updating patient status in sheet:', error)
    // Don't throw error to prevent status update failure
  }
}

// Move patient to different practitioner sheet
export async function movePatientToSheet(
  patientId: string,
  fromPractitioner: string,
  toPractitioner: string,
  patientData: Patient
): Promise<void> {
  if (!SPREADSHEET_ID) {
    console.warn('Google Sheets ID not configured, skipping sheet update')
    return
  }

  try {
    // Remove from old sheet
    await removePatientFromSheet(patientId, fromPractitioner)
    
    // Add to new sheet
    const updatedPatient = { ...patientData, assignedDoctor: toPractitioner }
    await addPatientToSheet(updatedPatient)

    console.log(`Patient ${patientId} moved from ${fromPractitioner} to ${toPractitioner}`)
  } catch (error) {
    console.error('Error moving patient between sheets:', error)
  }
}

// Remove patient from sheet
export async function removePatientFromSheet(
  patientId: string,
  practitionerName: string
): Promise<void> {
  if (!SPREADSHEET_ID) {
    console.warn('Google Sheets ID not configured, skipping sheet update')
    return
  }

  try {
    const sheetName = await getOrCreateSheet(practitionerName)

    // Get all data from the sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A:T`,
    })

    const rows = response.data.values || []
    const patientIdColumnIndex = rows[0]?.indexOf('Patient ID') || 0

    // Find the row with the matching patient ID
    let targetRowIndex = -1
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][patientIdColumnIndex] === patientId) {
        targetRowIndex = i + 1 // Google Sheets is 1-indexed
        break
      }
    }

    if (targetRowIndex === -1) {
      console.error(`Patient with ID ${patientId} not found in sheet ${sheetName}`)
      return
    }

    // Delete the row
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: 0, // You might need to get the actual sheet ID
                dimension: 'ROWS',
                startIndex: targetRowIndex - 1,
                endIndex: targetRowIndex,
              },
            },
          },
        ],
      },
    })

    console.log(`Patient ${patientId} removed from sheet: ${sheetName}`)
  } catch (error) {
    console.error('Error removing patient from sheet:', error)
  }
}