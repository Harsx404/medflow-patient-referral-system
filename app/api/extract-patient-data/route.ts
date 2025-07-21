import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { extractTextFromPDF, parseReferralText, validateExtractedData, preprocessText } from '@/lib/pdf-utils'

// Force Node.js runtime for PDF processing
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not configured')
      return NextResponse.json(
        { 
          error: 'AI service not configured. Please add GEMINI_API_KEY to environment variables.',
          code: 'MISSING_API_KEY'
        },
        { status: 500 }
      )
    }

    console.log('Processing PDF extraction request...')

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    console.log(`Received file: ${file.name}, size: ${file.size} bytes, type: ${file.type}`)

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a PDF file.' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return NextResponse.json(
        { error: 'File too large. Please upload a PDF smaller than 10MB.' },
        { status: 400 }
      )
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: 'Empty file. Please upload a valid PDF file.' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    console.log('Converting file to buffer...')
    const buffer = await file.arrayBuffer()
    const pdfBuffer = Buffer.from(buffer)
    
    console.log(`Created buffer of size: ${pdfBuffer.length} bytes`)

    // Extract text from PDF with fallback
    let extractedText = ''
    let extractionMethod = 'pdf-parse'
    
    try {
      console.log('Extracting text from PDF using pdf-parse...')
      extractedText = await extractTextFromPDF(pdfBuffer)
      
      if (extractedText.length < 10) {
        throw new Error('PDF contains very little extractable text. It might be image-based or corrupted.')
      }
      
      // Preprocess the extracted text
      extractedText = preprocessText(extractedText)
      console.log(`Successfully extracted and preprocessed ${extractedText.length} characters`)
      
    } catch (pdfError) {
      console.error('PDF extraction error:', pdfError)
      
      // Try regex-based extraction as fallback
      try {
        console.log('Attempting regex-based extraction as fallback...')
        const regexExtracted = parseReferralText(extractedText || '')
        
        if (Object.keys(regexExtracted).length > 0) {
          extractionMethod = 'regex-fallback'
          // Create a structured text from regex results
          extractedText = Object.entries(regexExtracted)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n')
        } else {
          throw pdfError
        }
      } catch (fallbackError) {
        return NextResponse.json(
          { 
            error: 'Failed to extract text from PDF. Please ensure the file is a valid PDF with extractable text (not scanned images).',
            code: 'PDF_EXTRACTION_FAILED',
            details: pdfError instanceof Error ? pdfError.message : 'Unknown PDF error'
          },
          { status: 400 }
        )
      }
    }

    console.log(`Text extraction completed using: ${extractionMethod}`)

    // Initialize Gemini AI with retries
    let genAI
    try {
      genAI = new GoogleGenerativeAI(apiKey)
    } catch (initError) {
      console.error('Failed to initialize Gemini AI:', initError)
      return NextResponse.json(
        { 
          error: 'Failed to initialize AI service. Please check your API key.',
          code: 'AI_INIT_FAILED'
        },
        { status: 500 }
      )
    }

    // Use Gemini to extract structured data with improved prompt and retry logic
    let extractedData
    let aiSuccess = false
    const maxRetries = 3
    let retryCount = 0
    
    while (!aiSuccess && retryCount < maxRetries) {
      try {
        console.log(`Processing with Gemini AI... (attempt ${retryCount + 1}/${maxRetries})`)
        const model = genAI.getGenerativeModel({ 
          model: 'gemini-2.0-flash',
        })
        
        const prompt = `
You are a medical data extraction assistant. Analyze the following medical referral document and extract the relevant information. 

IMPORTANT: Return ONLY a valid JSON object with no additional text, comments, or markdown formatting.

Required JSON structure:
{
  "fullName": "Patient's full name",
  "dob": "Date of birth in YYYY-MM-DD format (if unclear, use empty string)",
  "email": "Patient's email address",
  "phone": "Patient's phone number",
  "referredTo": "Doctor or specialist being referred to",
  "gpName": "Referring GP or doctor name",
  "insuranceProvider": "Insurance provider name",
  "medicareNumber": "Medicare number if available",
  "referrerClinic": "Name of referring clinic",
  "referralDate": "Date of referral in YYYY-MM-DD format (if unclear, use today's date)",
  "patientAddress": "Patient's address",
  "clinicAddress": "Clinic address",
  "reason": "Reason for referral",
  "diagnosis": "Diagnosis or condition"
}

Rules:
1. If any field is not found or unclear, use an empty string ""
2. For dates, try to convert to YYYY-MM-DD format, if impossible use ""
3. Extract only factual information from the document
4. Do not make assumptions or add information not present in the text
5. Ensure the response is valid JSON

Document text:
${extractedText}
`

        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()
      
        console.log('Received AI response, parsing JSON...')
        
        // Parse the JSON response with better error handling
        try {
        // Clean the response more thoroughly
        let cleanedText = text.trim()
        
        // Remove common AI response wrappers
        cleanedText = cleanedText.replace(/^```json\s*/gi, '').replace(/```\s*$/gi, '')
        cleanedText = cleanedText.replace(/^```\s*/gi, '').replace(/```\s*$/gi, '')
        cleanedText = cleanedText.replace(/^Here.*?:\s*/gi, '')
        cleanedText = cleanedText.replace(/^Based.*?:\s*/gi, '')
        
        // Find JSON object boundaries
        const jsonStart = cleanedText.indexOf('{')
        const jsonEnd = cleanedText.lastIndexOf('}')
        
        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
          cleanedText = cleanedText.substring(jsonStart, jsonEnd + 1)
        }
        
        extractedData = JSON.parse(cleanedText)
        
        // Validate and clean the extracted data structure
        const requiredFields = ['fullName', 'dob', 'email', 'phone', 'referredTo', 'gpName', 
                               'insuranceProvider', 'medicareNumber', 'referrerClinic', 'referralDate', 
                               'patientAddress', 'clinicAddress', 'reason', 'diagnosis']
        
        // Ensure all required fields exist and clean them
        for (const field of requiredFields) {
          if (!(field in extractedData)) {
            extractedData[field] = ''
          } else if (extractedData[field] === null || extractedData[field] === undefined) {
            extractedData[field] = ''
          } else {
            // Clean the field value
            extractedData[field] = String(extractedData[field]).trim()
          }
        }
        
        // Validate and format dates
        const dateFields = ['dob', 'referralDate']
        for (const dateField of dateFields) {
          if (extractedData[dateField]) {
            const dateValue = extractedData[dateField]
            // Try to parse and format the date
            const parsedDate = new Date(dateValue)
            if (!isNaN(parsedDate.getTime())) {
              extractedData[dateField] = parsedDate.toISOString().split('T')[0]
            } else {
              // If it's referralDate and invalid, use today's date
              if (dateField === 'referralDate') {
                extractedData[dateField] = new Date().toISOString().split('T')[0]
              } else {
                extractedData[dateField] = ''
              }
            }
          }
        }
        
          console.log('Successfully parsed and validated AI response')
          aiSuccess = true
          
        } catch (parseError) {
          console.error('JSON parsing error:', parseError)
          console.error('Raw AI response:', text)
          throw parseError
        }
        
      } catch (aiError) {
        retryCount++
        console.error(`AI processing error (attempt ${retryCount}):`, aiError)
        
        // Check if it's a 503 service overload error
        if (aiError instanceof Error && aiError.message && aiError.message.includes('503') && aiError.message.includes('overloaded')) {
          if (retryCount < maxRetries) {
            const delay = Math.pow(2, retryCount) * 1000 + Math.random() * 1000 // Exponential backoff with jitter
            console.log(`Service overloaded, retrying in ${delay}ms...`)
            await new Promise(resolve => setTimeout(resolve, delay))
            continue
          }
        }
        
        // If not a retryable error or max retries reached, break the loop
        if (retryCount >= maxRetries) {
          console.log('Max retries reached, falling back to regex extraction')
          break
        }
        
        // For other errors, don't retry
        break
      }
    }
    
    // If AI extraction failed, use regex-based extraction as fallback
    if (!aiSuccess) {
      console.log('AI extraction failed, using regex-based extraction as fallback...')
      const regexData = parseReferralText(extractedText)
      const validated = validateExtractedData(regexData)
      
      // Map regex results to expected format
      extractedData = {
        fullName: regexData.patientName || '',
        dob: regexData.dateOfBirth || '',
        email: regexData.email || '',
        phone: regexData.patientPhone || '',
        referredTo: regexData.referredTo || '',
        gpName: regexData.referringDoctor || '',
        insuranceProvider: '',
        medicareNumber: regexData.medicareNumber || '',
        referrerClinic: regexData.referrerClinic || '',
        referralDate: regexData.referralDate || new Date().toISOString().split('T')[0],
        patientAddress: regexData.patientAddress || '',
        clinicAddress: regexData.clinicAddress || '',
        reason: regexData.reasonPurpose || '',
        diagnosis: regexData.diagnosis || ''
      }
      
      console.log('Regex fallback extraction completed')
    }

    // Calculate confidence based on how many fields were extracted
    const totalFields = 14
    const filledFields = Object.values(extractedData).filter(value => 
      value && String(value).trim().length > 0
    ).length
    const confidence = Math.round((filledFields / totalFields) * 100)

    const finalExtractionMethod = aiSuccess ? 'gemini-ai' : 'regex-fallback'
    console.log(`Extraction completed with ${confidence}% confidence (${filledFields}/${totalFields} fields) using ${finalExtractionMethod}`)

    return NextResponse.json({
      success: true,
      data: extractedData,
      rawText: extractedText.substring(0, 1000) + '...', // First 1000 chars for debugging
      confidence: confidence,
      extractionMethod: finalExtractionMethod,
      aiRetries: aiSuccess ? retryCount : maxRetries
    })

  } catch (error) {
    console.error('API Error:', error)
    
    // Final fallback to regex-only extraction if everything else fails
    try {
      console.log('Using final regex-only extraction fallback...')
      const regexData = parseReferralText('')
      const validated = validateExtractedData(regexData)
      
      const emergencyFallbackData = {
        fullName: '',
        dob: '',
        email: '',
        phone: '',
        referredTo: '',
        gpName: '',
        insuranceProvider: '',
        medicareNumber: '',
        referrerClinic: '',
        referralDate: new Date().toISOString().split('T')[0],
        patientAddress: '',
        clinicAddress: '',
        reason: '',
        diagnosis: ''
      }
      
      return NextResponse.json({
        success: true,
        data: emergencyFallbackData,
        rawText: 'Emergency fallback - manual entry required',
        confidence: 0,
        extractionMethod: 'emergency-fallback',
        warning: 'Extraction failed, manual data entry required'
      })
      
    } catch (fallbackError) {
      return NextResponse.json(
        { 
          error: 'Complete system failure. Please try again or enter data manually.',
          code: 'COMPLETE_FAILURE',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      )
    }
  }
}