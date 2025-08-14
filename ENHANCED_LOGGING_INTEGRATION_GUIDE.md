# Enhanced Logging System Integration Guide

## Overview

This guide will help you integrate the new Enhanced Logging System into your MedFlow Patient Referral System. The enhanced system provides comprehensive logging, real-time monitoring, performance tracking, and advanced analytics.

## 🚀 Quick Start

### 1. Update Existing Components

Replace the existing audit logging in your components with the new enhanced system:

```typescript
// Before (old way)
import { useAudit } from '@/lib/hooks/use-audit'
const { logPatientAction } = useAudit()

// After (enhanced way)
import { useEnhancedAudit } from '@/lib/hooks/use-enhanced-audit'
const { logPatientAction, withPerformanceTracking } = useEnhancedAudit()
```

### 2. Replace Store Integration

Update your `lib/store.ts` to use the enhanced logging service:

```typescript
// Add this import
import { enhancedLoggingService } from './enhanced-logging-service'

// Replace existing audit logging calls
// Old:
await AuditService.logPatientCreated(patient, user)

// New:
await enhancedLoggingService.logPatientAction(
  'patient_created',
  patient,
  `Patient ${patient.name} was created`,
  undefined,
  patient
)
```

### 3. Update API Routes

Add the new enhanced API route alongside your existing ones:
- Keep existing `/api/action-logs` for backward compatibility
- Use new `/api/enhanced-logs` for advanced features

### 4. Add Enhanced Dashboard

Update your audit logs page to include the new enhanced dashboard:

```typescript
// In app/audit-logs/page.tsx
import { EnhancedAuditDashboard } from '@/components/dashboard/enhanced-audit-dashboard'

// Add as a new tab or replace existing dashboard
<TabsContent value="enhanced">
  <EnhancedAuditDashboard />
</TabsContent>
```

## 🔧 Detailed Integration Steps

### Step 1: Update Patient Operations

**File: `lib/store.ts`**

Update the `addPatient` function:

```typescript
addPatient: async (patient) => {
  const { logPatientAction, startCorrelatedOperation } = useEnhancedAudit()
  const correlationId = startCorrelatedOperation('add_patient')
  
  set((state) => ({ 
    patients: [...state.patients, patient] 
  }))
  
  // Enhanced logging with correlation
  await logPatientAction(
    'patient_created',
    patient,
    `Patient ${patient.name} was added to the system`,
    undefined,
    patient,
    correlationId
  )
  
  // Log Google Sheets integration
  try {
    await fetch('/api/google-sheets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'addPatient', patient })
    })
    
    await logSheetAction(
      'sheet_updated',
      'Patient Database',
      `Patient ${patient.name} added to Google Sheets`,
      correlationId
    )
  } catch (error) {
    await logError(error, 'Google Sheets Integration', { 
      correlationId,
      patient: patient.id 
    })
  }
}
```

### Step 2: Add Performance Tracking

**Example: Tracking Form Submissions**

```typescript
// In any component that handles form submissions
const { withPerformanceTracking, logUserAction } = useEnhancedAudit()

const handleSubmit = withPerformanceTracking(
  async (formData) => {
    // Your existing form submission logic
    const result = await submitPatientForm(formData)
    
    await logUserAction(
      'form_submitted',
      `Patient form submitted successfully`,
      'medium',
      { formType: 'patient_referral', resultId: result.id }
    )
    
    return result
  },
  'patient_form_submission',
  { formType: 'patient_referral' }
)
```

### Step 3: Enhanced Error Logging

**Replace basic console.error with structured logging:**

```typescript
// Before
try {
  await someOperation()
} catch (error) {
  console.error('Operation failed:', error)
}

// After
const { logError } = useEnhancedAudit()

try {
  await someOperation()
} catch (error) {
  await logError(error, 'someOperation', {
    operationType: 'data_processing',
    severity: 'high',
    affectedResource: 'patient_data'
  })
  throw error // Re-throw if needed
}
```

### Step 4: Security Event Logging

**Add security event logging to login/logout:**

```typescript
// In login component
const { logSecurityEvent } = useEnhancedAudit()

const handleLogin = async (credentials) => {
  try {
    const result = await login(credentials)
    
    await logSecurityEvent(
      'login_success',
      `User ${credentials.email} logged in successfully`,
      'medium',
      { 
        loginMethod: 'email',
        userRole: result.role,
        sessionDuration: 'active'
      }
    )
    
    return result
  } catch (error) {
    await logSecurityEvent(
      'login_failed',
      `Failed login attempt for ${credentials.email}`,
      'high',
      { 
        reason: error.message,
        attemptCount: getFailedAttempts(credentials.email)
      }
    )
    throw error
  }
}
```

### Step 5: Real-time Monitoring Integration

**Add real-time logging display:**

```typescript
// Create a real-time monitor component
import { useEnhancedAudit } from '@/lib/hooks/use-enhanced-audit'

export function RealTimeMonitor() {
  const { isConnected, recentLogs, logStats } = useEnhancedAudit()
  
  return (
    <div className="fixed bottom-4 right-4 w-80 max-h-96">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>Live Activity</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {recentLogs.slice(0, 5).map(log => (
              <div key={log.id} className="text-xs p-2 border rounded">
                <div className="font-medium">{log.action}</div>
                <div className="text-muted-foreground">{log.details}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

## 📊 Analytics and Reporting

### Dashboard Analytics

The enhanced system provides built-in analytics:

1. **Performance Metrics**: Track operation durations
2. **Error Rates**: Monitor system health
3. **User Activity**: Track user behavior patterns
4. **Security Events**: Monitor authentication and authorization
5. **Compliance Flags**: Automatic HIPAA and security tagging

### Custom Analytics

Create custom analytics queries:

```typescript
const { getAnalytics, getLogs } = useEnhancedAudit()

// Get daily analytics
const dailyStats = await getAnalytics('day')

// Get security events from last week
const securityLogs = await getLogs({
  category: 'security',
  startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  severity: 'high'
})

// Get patient operations for specific user
const userActivity = await getLogs({
  userId: 'doctor123',
  resourceType: 'patient',
  limit: 100
})
```

## 🔒 Security and Compliance

### HIPAA Compliance

The system automatically:
- Tags patient-related logs with HIPAA compliance flags
- Excludes sensitive data from logs
- Tracks access to patient information
- Provides audit trails for compliance reporting

### Security Features

1. **IP Address Tracking**: Automatically captures client IP addresses
2. **Session Tracking**: Links all user actions to sessions
3. **Device Information**: Tracks browser and OS information
4. **Correlation IDs**: Links related operations
5. **Security Event Monitoring**: Tracks login attempts, access violations

## 🚨 Error Handling and Alerts

### Automatic Error Detection

The system automatically detects and logs:
- API failures
- Database errors
- Authentication issues
- Performance degradation
- Security violations

### Custom Alerting

Set up custom alerting based on log patterns:

```typescript
// Example: Alert on multiple failed login attempts
const { getLogs } = useEnhancedAudit()

const checkSecurityAlerts = async () => {
  const failedLogins = await getLogs({
    action: 'login_failed',
    startDate: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // Last 15 minutes
    severity: 'high'
  })
  
  if (failedLogins.total > 5) {
    // Trigger security alert
    await logSecurityEvent(
      'security_alert',
      `Multiple failed login attempts detected: ${failedLogins.total}`,
      'critical',
      { alertType: 'brute_force_detection' }
    )
  }
}
```

## 📈 Performance Optimization

### Batch Processing

The system automatically batches logs for optimal performance:
- Configurable batch sizes
- Automatic flushing intervals
- Memory management
- Performance monitoring

### Configuration Options

Customize the logging system:

```typescript
// In your app initialization
import { enhancedLoggingService } from '@/lib/enhanced-logging-service'

// Configure for your environment
enhancedLoggingService.configure({
  enabled: true,
  batchSize: 25,           // Smaller batches for real-time
  flushInterval: 3000,     // Flush every 3 seconds
  realTimeUpdates: true,   // Enable real-time events
  includeStackTrace: process.env.NODE_ENV === 'development'
})
```

## 🔄 Migration Strategy

### Phase 1: Parallel Implementation (Week 1)
1. Install enhanced logging alongside existing system
2. Update 25% of components to use enhanced logging
3. Test real-time monitoring features

### Phase 2: Component Updates (Week 2)
1. Update remaining components
2. Add performance tracking to critical operations
3. Implement custom analytics

### Phase 3: Full Migration (Week 3)
1. Replace old audit dashboard with enhanced version
2. Remove deprecated logging code
3. Optimize configuration for production

### Phase 4: Advanced Features (Week 4)
1. Implement custom alerts
2. Add compliance reporting
3. Integrate with external monitoring tools

## 🧪 Testing

### Test the Enhanced System

```typescript
// Test logging functionality
const testEnhancedLogging = async () => {
  const { logPatientAction, logUserAction, logError } = useEnhancedAudit()
  
  // Test patient action logging
  await logPatientAction(
    'patient_test',
    { id: 'test-123', name: 'Test Patient' },
    'Test patient action logging'
  )
  
  // Test user action logging
  await logUserAction(
    'test_action',
    'Testing user action logging',
    'low'
  )
  
  // Test error logging
  try {
    throw new Error('Test error')
  } catch (error) {
    await logError(error, 'test_context', { testMode: true })
  }
}
```

### Verify Real-time Features

1. Open the Enhanced Audit Dashboard
2. Perform various actions in the application
3. Verify logs appear in real-time
4. Check analytics are updating correctly

## 📋 Checklist

- [ ] Install enhanced logging service
- [ ] Update store.ts with enhanced logging
- [ ] Replace useAudit with useEnhancedAudit in components
- [ ] Add enhanced API route
- [ ] Integrate enhanced dashboard
- [ ] Test real-time monitoring
- [ ] Verify performance tracking
- [ ] Check analytics functionality
- [ ] Test error logging
- [ ] Validate security event logging
- [ ] Review compliance flags
- [ ] Optimize configuration for production

## 🤝 Support

If you encounter any issues during integration:

1. Check the console for error messages
2. Verify all imports are correct
3. Ensure the enhanced logging service is properly initialized
4. Test with smaller components first
5. Use the built-in debug mode for troubleshooting

## 📚 Advanced Usage Examples

### Correlation Tracking Example

```typescript
// Track a complex multi-step operation
const { startCorrelatedOperation, logPatientAction, logSheetAction } = useEnhancedAudit()

const processPatientReferral = async (patient) => {
  const correlationId = startCorrelatedOperation('patient_referral_process')
  
  try {
    // Step 1: Create patient
    await createPatient(patient)
    await logPatientAction(
      'patient_created',
      patient,
      'Patient created in referral process',
      undefined,
      patient,
      correlationId
    )
    
    // Step 2: Update Google Sheets
    await updateGoogleSheet(patient)
    await logSheetAction(
      'sheet_updated',
      'Patient Database',
      'Patient added to tracking sheet',
      correlationId
    )
    
    // Step 3: Notify assigned doctor
    await notifyDoctor(patient.assignedDoctor)
    await logUserAction(
      'doctor_notified',
      `Doctor ${patient.assignedDoctor} notified of new patient`,
      'medium',
      { correlationId, patientId: patient.id }
    )
    
  } catch (error) {
    await logError(error, 'patient_referral_process', {
      correlationId,
      step: 'unknown',
      patientId: patient.id
    })
  }
}
```

This enhanced logging system provides comprehensive tracking, monitoring, and analytics capabilities that will help you maintain better oversight of your medical referral system while ensuring compliance and security.
