# Halaxy API Integration Guide

## Overview

This guide explains how the GTG-MED Patient Referral System integrates with the Halaxy API to synchronize patient, referral, and audit data. The integration allows for bidirectional data flow between our system and Halaxy, eliminating double data entry and ensuring consistent patient information across platforms.

## Prerequisites

To use the Halaxy API integration, you need:

1. An active Halaxy account with API access (subscription required)
2. Halaxy API credentials (Client ID and Client Secret)
3. Appropriate permissions in your Halaxy account

## Configuration

### Environment Variables

The following environment variables control the Halaxy integration:

```
HALAXY_ENABLED=true
HALAXY_CLIENT_ID=your_halaxy_client_id_here
HALAXY_CLIENT_SECRET=your_halaxy_client_secret_here
HALAXY_REGION=au  # 'au' or 'eu'
HALAXY_VENDOR_NAME=GTG-MED Patient Referral System
HALAXY_VENDOR_EMAIL=support@your-organization.com
```

### Steps to Configure

1. Purchase Halaxy API access in your Halaxy account (Settings > Add-ons)
2. Create an API key in Halaxy (Settings > Integrations > External tab)
3. Copy the Client ID and Client Secret
4. Add these values to your `.env.local` file
5. Set `HALAXY_ENABLED=true` to activate the integration

## Data Synchronization

The integration synchronizes the following data:

### Patient Data

- **Patient details**: Name, contact information, demographics
- **Automatic creation**: New patients in our system are created in Halaxy
- **Updates**: Changes to patient information synchronize both ways

### Referral Data

- **Referral details**: Source, summary, attached documents
- **Status updates**: Pending, Accepted, Rejected, and Transferred statuses are synced
- **Document attachments**: PDF referral letters are attached to Halaxy records

### Audit Trail

- **Enhanced logging**: Activity logs are stored in both systems
- **Compliance**: Ensures complete tracking of all patient-related actions

## Implementation Details

The integration uses the following components:

1. **Authentication Module** (`lib/halaxy/auth.ts`): Handles OAuth authentication with Halaxy API
2. **API Service** (`lib/halaxy/api.ts`): Contains methods for CRUD operations with Halaxy resources
3. **Bridge Service** (`lib/halaxy/bridge.ts`): Connects our app's data model with Halaxy API
4. **Configuration Module** (`lib/halaxy/config.ts`): Manages API settings and initialization
5. **API Route** (`app/api/halaxy/route.ts`): Server endpoint for Halaxy API operations

## Using the Integration in Code

### Example: Creating a Patient in Halaxy

```typescript
import { HalaxyBridge } from '@/lib/halaxy/bridge';

// Create patient in our system
const patient = {
  id: '12345',
  name: 'John Smith',
  age: 45,
  gender: 'male',
  // ... other patient fields
};

// Sync with Halaxy
const syncedPatient = await HalaxyBridge.syncPatient(patient);
```

### Example: Updating Referral Status

```typescript
import { HalaxyBridge } from '@/lib/halaxy/bridge';

// Update status in our system
await updatePatientStatus(patientId, 'Accepted', doctorName);

// Sync status to Halaxy
await HalaxyBridge.syncStatusUpdate(patient, 'Accepted');
```

## Error Handling and Fallbacks

The integration includes:

1. **Graceful degradation**: If Halaxy API is unavailable, the system continues to function
2. **Error logging**: Integration errors are logged with diagnostic information
3. **Retry mechanism**: Failed API calls can be retried automatically
4. **Sync status tracking**: Each record includes its Halaxy sync status

## Limitations and Considerations

1. **API Rate Limits**: Halaxy API has request limits that must be respected
2. **Data Mapping**: Some fields may not map perfectly between systems
3. **Coverage Entity**: Referrals require a Coverage entity in Halaxy that must be managed

## Troubleshooting

Common issues and solutions:

1. **Authentication Failures**: Check Client ID and Client Secret
2. **404 Errors**: Verify resource IDs and paths
3. **Sync Failures**: Check network connectivity and API status
4. **Missing Data**: Ensure required fields are provided

## Support and Resources

- [Halaxy API Documentation](https://developers.halaxy.com/)
- [Halaxy Support](https://support.halaxy.com/hc/en-au/articles/13014722009487-Guide-to-Halaxy-API)
- Contact our support team at support@gtg-med.com for assistance
