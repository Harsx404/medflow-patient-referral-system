import { NextResponse } from 'next/server';
import { getOrCreateSheet } from '@/lib/google-sheets';

export async function GET() {
  try {
    // Test the Google Sheets connection
    const sheetName = await getOrCreateSheet('Test Practitioner');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Google Sheets connection successful', 
      sheetName 
    });
  } catch (error) {
    console.error('Google Sheets test error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Google Sheets connection failed', 
      error: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}