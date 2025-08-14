# 🚀 GTG-MED Patient Referral System Setup Guide

## 📋 Prerequisites

- **Node.js 18+** (Download from [nodejs.org](https://nodejs.org))
- **npm or yarn** (Comes with Node.js)
- **Google Gemini AI API Key** (Free tier available)
- **Google Sheets API** (Optional, for data persistence)

## 🛠️ Installation Steps

### 1. Clone and Install Dependencies

```bash
# Navigate to the project directory
cd medflow-patient-referral-system

# Install dependencies
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```bash
# Copy the example file
cp env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Required: Google Gemini AI for PDF processing
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Google Sheets Integration
GOOGLE_SHEETS_PRIVATE_KEY=your_google_sheets_private_key_here
GOOGLE_SHEETS_CLIENT_EMAIL=your_service_account_email@project.iam.gserviceaccount.com
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id_here

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Get Google Gemini AI API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key to your `.env.local` file

### 4. Run the Application

```bash
# Development mode
npm run dev

# Or production build
npm run build
npm start
```

The application will be available at `http://localhost:3000`

## 🔧 Google Sheets Setup (Optional)

If you want to use Google Sheets for data persistence:

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Sheets API

### 2. Create Service Account

1. Go to "IAM & Admin" > "Service Accounts"
2. Click "Create Service Account"
3. Fill in details and create
4. Download the JSON key file

### 3. Create Google Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Share it with your service account email
4. Copy the spreadsheet ID from the URL

### 4. Configure Environment Variables

Add the service account details to your `.env.local`:

```env
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SHEETS_SPREADSHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
```

## 🎯 System Features

### Admin Dashboard (`/admin`)
- **Patient Management**: View, edit, and track all patient referrals
- **Doctor Management**: Manage doctor profiles and assignments
- **Real-time Updates**: Live activity feed
- **Statistics**: Key metrics and analytics
- **QR Code Generation**: Generate QR codes for patient form access

### Patient Form (`/patient-form`)
- **Multi-step Process**: Upload → AI Extract → Review → Submit
- **AI-Powered Extraction**: Automatically extract data from PDF referrals
- **Form Validation**: Comprehensive validation and error handling
- **Mobile Responsive**: Works on all devices

### Doctor Portal (`/doctor-login`)
- **Secure Login**: Doctor authentication system
- **Patient Assignment**: View assigned patients
- **Status Updates**: Update patient referral status
- **Timeline Tracking**: Complete patient journey history

## 🔍 Troubleshooting

### Common Issues

#### 1. "GEMINI_API_KEY is not configured"
- Ensure you've added the API key to `.env.local`
- Restart the development server after adding environment variables

#### 2. PDF Processing Fails
- Check that the PDF contains extractable text (not just images)
- Ensure the PDF is not password protected
- Verify the file size is under 10MB

#### 3. Google Sheets Integration Not Working
- Verify all Google Sheets environment variables are set
- Check that the service account has edit permissions on the spreadsheet
- Ensure the Google Sheets API is enabled in your Google Cloud project

#### 4. Build Errors
- Clear the `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### Performance Optimization

#### For Production Deployment
1. Set `NODE_ENV=production`
2. Use a proper database instead of Google Sheets for large datasets
3. Implement proper authentication and authorization
4. Set up monitoring and logging

## 📱 Usage Guide

### For Administrators
1. Access the admin dashboard at `/admin`
2. Use the QR code generator to create patient form links
3. Monitor patient referrals and doctor assignments
4. Track system statistics and performance

### For Doctors
1. Login at `/doctor-login` with provided credentials
2. View assigned patients and their status
3. Update patient referral status as needed
4. Access patient details and timeline

### For Patients
1. Scan QR code or visit `/patient-form`
2. Upload referral PDF or fill form manually
3. Review extracted information
4. Submit the referral

## 🔐 Security Considerations

- **Environment Variables**: Never commit `.env.local` to version control
- **API Keys**: Keep API keys secure and rotate regularly
- **Authentication**: Implement proper user authentication for production
- **Data Privacy**: Ensure compliance with healthcare data regulations
- **HTTPS**: Use HTTPS in production environments

## 🚀 Deployment

### Vercel Deployment (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
- **Netlify**: Similar to Vercel setup
- **AWS**: Use AWS Amplify or EC2
- **Docker**: Create Dockerfile for containerized deployment

## 📞 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the code comments for implementation details
3. Create an issue in the repository
4. Check the console logs for detailed error messages

---

**Happy coding! 🎉** 