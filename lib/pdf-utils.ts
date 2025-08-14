// PDF processing utilities for medical referral extraction

/**
 * Extract text from PDF using pdf-parse library (server-side optimized)
 */
export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  try {
    console.log(`Processing PDF buffer of size: ${pdfBuffer.length} bytes`)
    
    // Validate buffer
    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error('Invalid PDF buffer: Buffer is empty or null')
    }
    
    // Check if buffer starts with PDF signature
    const pdfSignature = pdfBuffer.subarray(0, 4).toString()
    if (pdfSignature !== '%PDF') {
      throw new Error('Invalid PDF file: File does not have PDF signature')
    }
    
    // Use dynamic import for pdf-parse
    const pdfParse = (await import('pdf-parse')).default
    
    console.log('PDF-parse library loaded successfully')
    
    // Use pdf-parse to extract text with options
    const data = await pdfParse(pdfBuffer, {
      // Normalize whitespace
      normalizeWhitespace: true,
      // Disable font and image parsing for better performance
      disableFontFace: true,
      disableFileFontMapping: true
    })
    
    console.log(`PDF loaded successfully. Pages: ${data.numpages}`)
    console.log(`Extracted text length: ${data.text.length} characters`)
    
    if (!data.text || data.text.trim().length < 10) {
      throw new Error('No text could be extracted from the PDF. The PDF might contain only images, be password protected, or be corrupted.')
    }
    
    // Clean up the text
    const cleanedText = data.text
      .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
      .replace(/\n\s*\n/g, '\n') // Remove empty lines
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F]/g, '') // Remove control characters
      .trim()
    
    console.log(`Successfully extracted ${cleanedText.length} characters from PDF`)
    return cleanedText
    
  } catch (error) {
    console.error('Error extracting text from PDF:', error)
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Invalid PDF')) {
        throw new Error(`PDF validation failed: ${error.message}`)
      } else if (error.message.includes('password')) {
        throw new Error('PDF is password protected and cannot be processed')
      } else if (error.message.includes('Cannot read properties')) {
        throw new Error('PDF file appears to be corrupted or in an unsupported format')
      } else {
        throw new Error(`PDF text extraction failed: ${error.message}`)
      }
    } else {
      throw new Error('PDF text extraction failed: Unknown error occurred')
    }
  }
}

/**
 * Parse extracted text using regex patterns for medical referrals
 */
export function parseReferralText(text: string): Partial<any> {
  const patterns = {
    patientName: /(?:patient name|name|patient)\s*:?\s*([A-Za-z\s]+)/i,
    dateOfBirth: /(?:dob|date of birth|born|birth date)\s*:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    referringDoctor: /(?:referring doctor|dr\.?|physician|gp|doctor)\s*:?\s*([A-Za-z\s\.]+)/i,
    referrerClinic: /(?:clinic|practice|hospital|surgery)\s*:?\s*([A-Za-z\s]+)/i,
    clinicAddress: /(?:address|location|clinic address)\s*:?\s*([A-Za-z0-9\s\.,]+)/i,
    medicareNumber: /(?:medicare|health card|medicare number)\s*:?\s*([\d\s]+)/i,
    patientPhone: /(?:phone|tel|mobile|contact|telephone)\s*:?\s*([\d\s\-\(\)\+]+)/i,
    reasonPurpose: /(?:reason|purpose|referral for|referred for)\s*:?\s*([A-Za-z\s\.,]+)/i,
    diagnosis: /(?:diagnosis|condition|medical history|history)\s*:?\s*([A-Za-z\s\.,]+)/i,
    patientAddress: /(?:patient address|home address|residence|address)\s*:?\s*([A-Za-z0-9\s\.,]+)/i,
    email: /(?:email|e-mail)\s*:?\s*([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/i,
    fax: /(?:fax|facsimile)\s*:?\s*([\d\s\-\(\)\+]+)/i,
    referralDate: /(?:date|referral date|dated)\s*:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    referredTo: /(?:referred to|specialist|consultant|to see|appointment with)\s*:?\s*([A-Za-z\s\.]+)/i
  };

  const extracted: any = {};

  for (const [key, pattern] of Object.entries(patterns)) {
    const match = text.match(pattern);
    if (match && match[1]) {
      extracted[key] = match[1].trim();
    }
  }

  return extracted;
}

/**
 * Validate extracted data and assign confidence scores
 */
export function validateExtractedData(data: any): { data: any; confidence: number } {
  const requiredFields = ['patientName', 'referringDoctor', 'reasonPurpose'];
  const optionalFields = [
    'dateOfBirth', 
    'medicareNumber', 
    'patientPhone', 
    'referrerClinic',
    'clinicAddress',
    'patientAddress',
    'email',
    'fax',
    'referralDate',
    'referredTo'
  ];
  
  let score = 0;
  let maxScore = requiredFields.length * 2 + optionalFields.length;

  // Check required fields (worth 2 points each)
  for (const field of requiredFields) {
    if (data[field] && data[field].length > 2) {
      score += 2;
    }
  }

  // Check optional fields (worth 1 point each)
  for (const field of optionalFields) {
    if (data[field] && data[field].length > 0) {
      score += 1;
    }
  }

  const confidence = Math.round((score / maxScore) * 100);

  return {
    data,
    confidence
  };
}

/**
 * Enhanced text preprocessing for better extraction
 */
export function preprocessText(text: string): string {
  return text
    // Normalize line breaks
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Fix common OCR issues
    .replace(/[0O]/g, (match, offset, string) => {
      // Context-based replacement for common OCR errors
      const before = string.substring(Math.max(0, offset - 3), offset);
      const after = string.substring(offset + 1, Math.min(string.length, offset + 4));
      
      // If surrounded by numbers, likely should be 0
      if (/\d/.test(before) && /\d/.test(after)) {
        return '0';
      }
      // If in word context, likely should be O
      if (/[a-zA-Z]/.test(before) || /[a-zA-Z]/.test(after)) {
        return 'O';
      }
      return match;
    })
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    .trim();
}