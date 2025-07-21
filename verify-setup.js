console.log('Verifying PDF Extraction Setup...');
console.log('');

// Test basic Node.js functionality
console.log('Node.js is working');

// Check if pdf-parse is available
try {
  require('pdf-parse');
  console.log('✅ pdf-parse library is available');
} catch (error) {
  console.log('❌ pdf-parse library error:', error.message);
}

// Check if Google Generative AI is available
try {
  require('@google/generative-ai');
  console.log('✅ Google Generative AI library is available');
} catch (error) {
  console.log('❌ Google Generative AI library error:', error.message);
}

// Check environment variables
if (process.env.GEMINI_API_KEY) {
  console.log('✅ GEMINI_API_KEY is configured');
} else {
  console.log('❌ GEMINI_API_KEY is NOT configured');
}

console.log('');
console.log('Setup Instructions:');
console.log('1. Create .env.local file in project root');
console.log('2. Add: GEMINI_API_KEY=your_actual_api_key');
console.log('3. Get API key: https://makersuite.google.com/app/apikey');
console.log('4. Restart development server');