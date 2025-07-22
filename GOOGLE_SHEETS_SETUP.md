# Google Sheets Integration Setup Guide

This guide will help you set up Google Sheets integration for the Patient Referral System.

## Overview

The Google Sheets integration automatically:
- Creates separate tabs for each practitioner
- Adds patient data when PDFs are uploaded or forms are submitted
- Updates patient status when changed on the website
- Organizes data by practitioner name

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter a project name (e.g., "Patient Referral System")
4. Click "Create"

## Step 2: Enable Google Sheets API

1. In your Google Cloud project, go to "APIs & Services" → "Library"
2. Search for "Google Sheets API"
3. Click on it and press "Enable"

## Step 3: Create a Service Account

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "Service Account"
3. Enter a name (e.g., "sheets-service-account")
4. Click "Create and Continue"
5. Skip the optional steps and click "Done"

## Step 4: Generate Service Account Key

1. In the "Credentials" page, find your service account
2. Click on the service account email
3. Go to the "Keys" tab
4. Click "Add Key" → "Create New Key"
5. Select "JSON" and click "Create"
6. Save the downloaded JSON file securely

## Step 5: Create Google Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com/)
2. Create a new spreadsheet
3. Name it "Patient Referral Data" (or your preferred name)
4. Copy the spreadsheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
   ```
5. Share the spreadsheet with your service account email:
   - Click "Share" button
   - Add the service account email (from the JSON file)
   - Give "Editor" permissions

## Step 6: Configure Environment Variables

1. Open your `.env.local` file
2. Extract the following values from your downloaded JSON file:

```env
# From the JSON file:
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id_here
```

### Important Notes:
- The private key must include the `\n` characters for line breaks
- Wrap the private key in double quotes
- Use the exact client email from the JSON file
- Use the spreadsheet ID from step 5

## Step 7: Test the Integration

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Upload a PDF or submit a patient form
3. Check your Google Spreadsheet - you should see:
   - A new tab created for the practitioner
   - Patient data automatically added
   - Status updates when you change patient status

## Spreadsheet Structure

Each practitioner tab will have the following columns:
- Patient ID
- Name
- Age
- Gender
- Email
- Contact Number
- Referring Doctor
- Status
- Summary
- Created At
- Referral ID
- Source
- Insurance Provider
- Urgency Level

## Troubleshooting

### Common Issues:

1. **"Service account not found" error:**
   - Check that the service account email is correct
   - Ensure the spreadsheet is shared with the service account

2. **"Invalid private key" error:**
   - Ensure the private key includes proper line breaks (`\n`)
   - Check that the key is wrapped in double quotes

3. **"Spreadsheet not found" error:**
   - Verify the spreadsheet ID is correct
   - Ensure the spreadsheet is shared with the service account

4. **"Insufficient permissions" error:**
   - Make sure the service account has "Editor" access to the spreadsheet

### Debug Mode:

Check the server console for detailed error messages when testing the integration.

## Security Notes

- Never commit the `.env.local` file to version control
- Keep your service account JSON file secure
- Regularly rotate your service account keys
- Only share spreadsheets with necessary service accounts

## Support

If you encounter issues:
1. Check the server console for error messages
2. Verify all environment variables are set correctly
3. Ensure the Google Sheets API is enabled
4. Confirm spreadsheet permissions are correct