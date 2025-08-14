# Audit Trail & User Activity Tracking Feature

## Overview

The Audit Trail feature provides comprehensive tracking and monitoring of all user actions and system changes in the MedFlow patient referral system. This feature helps maintain accountability, security, and compliance by recording detailed logs of all activities.

## Features

### 1. Comprehensive Activity Logging
- **User Actions**: Login, logout, profile updates
- **Patient Operations**: Create, update, delete, status changes, transfers
- **Doctor Operations**: Create, update, delete, availability changes
- **File Operations**: Upload, download, delete
- **Google Sheets**: Updates, creations, deletions
- **System Operations**: Configuration changes, maintenance tasks

### 2. Detailed Audit Information
Each audit log entry includes:
- **User Information**: ID, name, role
- **Action Details**: What was done, when, and why
- **Resource Information**: What was affected
- **Change Tracking**: Old and new values for updates
- **Technical Details**: IP address, user agent, session ID
- **Timestamps**: Precise timing of all actions

### 3. Advanced Filtering & Search
- Filter by user, role, action type, resource type
- Date range filtering
- Full-text search across all fields
- Real-time filtering and sorting

### 4. User Activity Timeline
- Individual user activity tracking
- Time-based activity grouping
- Visual timeline representation
- Activity summaries and statistics

### 5. Audit Summary Dashboard
- Total action counts
- Actions by user
- Actions by type
- Recent activity overview

## Components

### 1. Audit Service (`lib/audit-service.ts`)
Core service for logging and retrieving audit data:
```typescript
// Log an action
await AuditService.logAction({
  userId: 'user123',
  userName: 'Dr. Smith',
  userRole: 'doctor',
  action: 'patient_status_changed',
  resourceType: 'patient',
  resourceId: 'patient-001',
  resourceName: 'John Doe',
  oldValue: { status: 'Pending' },
  newValue: { status: 'Accepted' },
  details: 'Patient status updated'
})
```

### 2. Audit Models (`lib/models/audit-log.ts`)
TypeScript interfaces and constants:
- `AuditLog`: Main audit log interface
- `AuditLogFilter`: Filtering options
- `AUDIT_ACTIONS`: Predefined action constants
- `RESOURCE_TYPES`: Resource type constants

### 3. API Routes (`app/api/action-logs/route.ts`)
RESTful API for audit operations:
- `GET /api/action-logs`: Retrieve filtered audit logs
- `POST /api/action-logs`: Log new audit entry
- Query parameters for filtering and pagination

### 4. UI Components

#### Audit Logs Panel (`components/dashboard/audit-logs-panel.tsx`)
- Comprehensive audit log table
- Advanced filtering options
- Detailed view modal
- Export capabilities

#### User Activity Timeline (`components/dashboard/user-activity-timeline.tsx`)
- Individual user activity tracking
- Time-based grouping
- Visual timeline representation
- Activity summaries

### 5. Custom Hook (`lib/hooks/use-audit.ts`)
Simplified audit logging hook:
```typescript
const { logPatientAction, logSystemAction } = useAudit()

// Log patient action
await logPatientAction(
  'patient_status_changed',
  patient,
  'Status updated to Accepted',
  { status: 'Pending' },
  { status: 'Accepted' }
)
```

## Usage

### 1. Accessing Audit Logs
Navigate to the audit logs page via:
- User dropdown menu → "Audit Logs"
- Direct URL: `/audit-logs`

### 2. Filtering Audit Data
Use the filter controls to:
- Search by user, action, or resource
- Filter by user role or action type
- Set date ranges
- Combine multiple filters

### 3. Viewing User Activity
Switch to the "User Timeline" tab to:
- Select specific users
- Choose time ranges
- View grouped activities
- See activity summaries

### 4. Detailed Analysis
Click "View Details" on any audit log to see:
- Complete action details
- Old and new values
- Technical information (IP, user agent)
- Related context

## Integration Points

### 1. Store Integration
The audit service is integrated with the main application store:
- Patient operations automatically logged
- User login/logout tracked
- Status changes recorded

### 2. Google Sheets Integration
Sheet operations are automatically logged:
- Patient additions to sheets
- Status updates in sheets
- Sheet creation and modifications

### 3. File Operations
File uploads and downloads are tracked:
- File metadata recorded
- User information captured
- Timestamps and details logged

## Security & Compliance

### 1. Data Protection
- Audit logs are immutable (read-only)
- No sensitive data in logs (passwords, etc.)
- IP addresses and user agents logged for security

### 2. Access Control
- Audit logs accessible to admin users
- Role-based access control
- Secure API endpoints

### 3. Retention Policy
- Current implementation: In-memory storage (1000 logs)
- Production: Database storage with configurable retention
- Export capabilities for long-term storage

## Future Enhancements

### 1. Database Integration
- Replace in-memory storage with database
- Implement proper indexing for performance
- Add data retention policies

### 2. Advanced Analytics
- Activity heatmaps
- User behavior analysis
- Compliance reporting
- Automated alerts for suspicious activity

### 3. Export & Reporting
- CSV/PDF export functionality
- Scheduled reports
- Compliance documentation
- Integration with external audit systems

### 4. Real-time Monitoring
- Live activity feeds
- Real-time alerts
- Dashboard widgets
- WebSocket integration

## Technical Implementation

### 1. Data Structure
```typescript
interface AuditLog {
  id: string
  userId: string
  userName: string
  userRole: string
  action: string
  resourceType: string
  resourceId: string
  resourceName: string
  oldValue?: any
  newValue?: any
  details: string
  ipAddress?: string
  userAgent?: string
  timestamp: string
  sessionId?: string
}
```

### 2. API Endpoints
```typescript
// Get audit logs with filtering
GET /api/action-logs?userId=user123&action=patient_created&startDate=2024-01-01

// Get audit summary
GET /api/action-logs?summary=true

// Log new action
POST /api/action-logs
{
  userId: 'user123',
  userName: 'Dr. Smith',
  userRole: 'doctor',
  action: 'patient_status_changed',
  // ... other fields
}
```

### 3. Performance Considerations
- Pagination for large datasets
- Efficient filtering and indexing
- Memory management for in-memory storage
- Caching strategies for frequently accessed data

## Configuration

### 1. Environment Variables
```env
# Audit logging configuration
AUDIT_LOG_ENABLED=true
AUDIT_LOG_RETENTION_DAYS=90
AUDIT_LOG_MAX_ENTRIES=1000
```

### 2. Feature Flags
```typescript
// Enable/disable specific audit features
const AUDIT_CONFIG = {
  enabled: true,
  logPatientActions: true,
  logUserActions: true,
  logFileActions: true,
  logSheetActions: true,
  includeIPAddress: true,
  includeUserAgent: true
}
```

## Troubleshooting

### 1. Common Issues
- **No audit logs appearing**: Check if audit service is properly initialized
- **Filter not working**: Verify filter parameters match expected values
- **Performance issues**: Consider pagination and limiting result sets

### 2. Debug Mode
Enable debug logging:
```typescript
// In audit service
console.log('Audit Log:', auditLog)
```

### 3. Testing
Use the mock data for testing:
```typescript
import { mockAuditLogs } from './mock-audit-data'
// Use mockAuditLogs for testing scenarios
```

## Conclusion

The Audit Trail feature provides a robust foundation for tracking user activities and system changes. It enhances security, compliance, and accountability while providing valuable insights into system usage patterns. The modular design allows for easy extension and customization based on specific requirements. 