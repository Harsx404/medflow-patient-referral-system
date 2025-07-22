# Vercel Deployment with Google Sheets Integration

This guide explains how to properly configure your Vercel deployment to work with Google Sheets integration.

## Prerequisites

1. Complete the steps in [GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md) to set up your Google Cloud project and obtain the necessary credentials
2. Have your Vercel account ready and connected to your GitHub repository

## Environment Variables Configuration

When deploying to Vercel, you must configure the following environment variables in the Vercel dashboard:

1. Go to your project in the Vercel dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following environment variables:

```
# Google Gemini AI API Key (Required for PDF extraction)
GEMINI_API_KEY = your_gemini_api_key_here

# Application URL
NEXT_PUBLIC_APP_URL = https://your-project-name.vercel.app

# Environment
NODE_ENV = production

# Google Sheets Integration (Required for spreadsheet functionality)
GOOGLE_SHEETS_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_CLIENT_EMAIL = your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_SHEETS_SPREADSHEET_ID = your_spreadsheet_id_here
```

### Important Notes for Google Sheets Variables

- The `GOOGLE_SHEETS_PRIVATE_KEY` must:
  - Include the `\n` characters for line breaks
  - Be wrapped in double quotes
  - Be properly escaped for Vercel environment variables
  - Be copied exactly from your Google Cloud service account JSON file

- The `GOOGLE_SHEETS_CLIENT_EMAIL` must be the exact email from your service account

- The `GOOGLE_SHEETS_SPREADSHEET_ID` is the ID from your Google Spreadsheet URL:
  ```
  https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
  ```

## Vercel Function Configuration

The application uses Vercel Serverless Functions with extended execution times for Google Sheets operations. This is configured in the `vercel.json` file:

```json
{
  "functions": {
    "app/api/extract-patient-data/route.ts": {
      "maxDuration": 30
    },
    "app/api/submit-patient-form/route.ts": {
      "maxDuration": 10
    },
    "app/api/google-sheets/**/*.ts": {
      "maxDuration": 15
    }
  }
}
```

## Testing the Integration

After deploying to Vercel with the proper environment variables:

1. Visit your deployed application
2. Test the Google Sheets connection by visiting:
   ```
   https://your-project-name.vercel.app/api/google-sheets/test
   ```
3. If configured correctly, you should see a success message
4. Upload a PDF or submit a patient form to verify data is being added to your Google Spreadsheet

## Troubleshooting

If you encounter issues with the Google Sheets integration on Vercel:

1. **Check Environment Variables**: Verify all environment variables are correctly set in the Vercel dashboard
2. **Verify Private Key Format**: Ensure the private key includes all line breaks (`\n`) and is properly escaped
3. **Check Permissions**: Make sure your Google Spreadsheet is shared with the service account email
4. **Review Logs**: Check the Vercel deployment logs for any specific error messages
5. **Test Locally First**: Ensure the integration works in your local development environment before deploying

## Security Considerations

- Never commit your `.env.local` file or any files containing API keys to your repository
- Use Vercel's environment variables for all sensitive credentials
- Restrict your Google Cloud service account permissions to only what's necessary
- Consider setting up IP restrictions in Google Cloud for additional security