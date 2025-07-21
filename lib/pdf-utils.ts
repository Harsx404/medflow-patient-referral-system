// PDF processing utilities for medical referral extraction

/**
 * Extract text from PDF using pdf-parse as fallback
 */
export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  try {
    const pdfParse = require('pdf-parse');
    const data = await pdfParse(pdfBuffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

/**
 * Parse extracted text using regex patterns for medical referrals
 */
export function parseReferralText(text: string): Partial<any> {
  const patterns = {
    patientName: /(?:patient|name)\s*:?\s*([A-Za-z\s]+)/i,
    dateOfBirth: /(?:dob|date of birth|born)\s*:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i, // Captures MM/DD/YYYY format
    referringDoctor: /(?:referring doctor|dr\.?|physician)\s*:?\s*([A-Za-z\s\.]+)/i,
    referrerClinic: /(?:clinic|practice|hospital)\s*:?\s*([A-Za-z\s]+)/i,
    clinicAddress: /(?:address|location)\s*:?\s*([A-Za-z0-9\s\.,]+)/i,
    medicareNumber: /(?:medicare|health card)\s*:?\s*([\d\s]+)/i,
    patientPhone: /(?:phone|tel|mobile)\s*:?\s*([\d\s\-\(\)\+]+)/i,
    reasonPurpose: /(?:reason|purpose)\s*:?\s*([A-Za-z\s\.,]+)/i,
    diagnosis: /(?:diagnosis|condition|medical history)\s*:?\s*([A-Za-z\s\.,]+)/i,
    patientAddress: /(?:patient address|home address|residence)\s*:?\s*([A-Za-z0-9\s\.,]+)/i,
    email: /(?:email|e-mail)\s*:?\s*([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/i,
    fax: /(?:fax|facsimile)\s*:?\s*([\d\s\-\(\)\+]+)/i,
    referralDate: /(?:date|referral date)\s*:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    referredTo: /(?:referred to|specialist|consultant)\s*:?\s*([A-Za-z\s\.]+)/i
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