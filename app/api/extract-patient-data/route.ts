import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { extractTextFromPDF } from '@/lib/pdf-utils'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const buffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(buffer)

    // Extract text from PDF
    let extractedText = ''
    try {
      const buffer = Buffer.from(uint8Array)
      extractedText = await extractTextFromPDF(buffer)
    } catch (pdfError) {
      console.error('PDF extraction error:', pdfError)
      return NextResponse.json(
        { error: 'Failed to extract text from PDF' },
        { status: 400 }
      )
    }

    if (!extractedText.trim()) {
      return NextResponse.json(
        { error: 'No text could be extracted from the PDF' },
        { status: 400 }
      )
    }

    // Use Gemini to extract structured data
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    
    const prompt = `
Analyze the following medical referral document and extract the relevant information. Return the data in JSON format with the following structure:

{
  "fullName": "Patient's full name",
  "dob": "Date of birth in YYYY-MM-DD format",
  "email": "Patient's email address",
  "phone": "Patient's phone number",
  "referredTo": "Doctor or specialist being referred to",
  "gpName": "Referring GP or doctor name",
  "insuranceProvider": "Insurance provider name",
  "medicareNumber": "Medicare number if available",
  "referrerClinic": "Name of referring clinic",
  "referralDate": "Date of referral in YYYY-MM-DD format",
  "patientAddress": "Patient's address",
  "clinicAddress": "Clinic address",
  "reason": "Reason for referral",
  "diagnosis": "Diagnosis or condition"
}

If any field is not found or unclear, use an empty string. Ensure dates are in the correct format.

Document text:
${extractedText}
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Try to parse the JSON response
    let extractedData
    try {
      // Remove any markdown formatting
      const cleanedText = text.replace(/```json\n?|```\n?/g, '').trim()
      extractedData = JSON.parse(cleanedText)
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      console.error('Raw response:', text)
      
      // Fallback: return empty structure
      extractedData = {
        fullName: '',
        dob: '',
        email: '',
        phone: '',
        referredTo: '',
        gpName: '',
        insuranceProvider: '',
        medicareNumber: '',
        referrerClinic: '',
        referralDate: '',
        patientAddress: '',
        clinicAddress: '',
        reason: '',
        diagnosis: ''
      }
    }

    return NextResponse.json({
      success: true,
      data: extractedData,
      rawText: extractedText.substring(0, 500) + '...' // First 500 chars for debugging
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}