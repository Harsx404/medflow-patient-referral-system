#!/usr/bin/env tsx

/**
 * Enhanced Logging System Demonstration Script
 * 
 * This script demonstrates the capabilities of the enhanced logging system
 * including performance tracking, correlation IDs, analytics, and real-time monitoring.
 * 
 * Run with: npx tsx scripts/test-enhanced-logging.ts
 */

import { enhancedLoggingService } from '../lib/enhanced-logging-service'

// Mock patient data for testing
const mockPatient = {
  id: 'pat-001',
  name: 'John Doe',
  age: 45,
  gender: 'Male',
  referringDoctor: 'Dr. Smith',
  assignedDoctor: 'Dr. Johnson',
  status: 'Pending' as const,
  summary: 'Patient requires cardiac consultation'
}

// Mock user context for testing
const mockUser = {
  id: 'user-001',
  name: 'Dr. Johnson',
  role: 'doctor',
  sessionId: 'session-123'
}

// Test performance tracking
async function testPerformanceTracking() {
  console.log('🏃‍♂️ Testing Performance Tracking...')
  
  const operationId = enhancedLoggingService.generateCorrelationId()
  enhancedLoggingService.startPerformanceTracking(operationId)
  
  // Simulate some work
  await new Promise(resolve => setTimeout(resolve, 150))
  
  const metrics = enhancedLoggingService.endPerformanceTracking(operationId)
  
  await enhancedLoggingService.logPerformanceMetric(
    'patient_form_submission',
    metrics!,
    {
      formType: 'referral',
      fieldsCount: 12,
      validationErrors: 0
    }
  )
  
  console.log(`✅ Performance tracked: ${metrics?.duration}ms`)
}

// Test patient actions with correlation
async function testPatientActions() {
  console.log('👤 Testing Patient Action Logging...')
  
  const correlationId = enhancedLoggingService.generateCorrelationId()
  
  // Log patient creation
  await enhancedLoggingService.logPatientAction(
    'patient_created',
    mockPatient,
    `Patient ${mockPatient.name} was created in the system`,
    undefined,
    mockPatient
  )
  
  // Simulate patient status change
  await enhancedLoggingService.logPatientAction(
    'patient_status_changed',
    mockPatient,
    `Patient status changed from Pending to Accepted`,
    { status: 'Pending' },
    { status: 'Accepted' }
  )
  
  console.log('✅ Patient actions logged with correlation ID:', correlationId)
}

// Test security events
async function testSecurityEvents() {
  console.log('🔒 Testing Security Event Logging...')
  
  // Successful login
  await enhancedLoggingService.logEnhanced({
    action: 'login_success',
    resourceType: 'system',
    resourceId: mockUser.id,
    resourceName: mockUser.name,
    details: `User ${mockUser.name} logged in successfully`,
    category: 'security',
    severity: 'medium',
    userContext: mockUser,
    tags: ['authentication', 'login']
  })
  
  // Failed login attempt
  await enhancedLoggingService.logEnhanced({
    action: 'login_failed',
    resourceType: 'system',
    resourceId: 'unknown',
    resourceName: 'Unknown User',
    details: 'Failed login attempt with invalid credentials',
    category: 'security',
    severity: 'high',
    tags: ['authentication', 'security-alert'],
    metadata: {
      attemptedEmail: 'test@example.com',
      failureReason: 'invalid_password'
    }
  })
  
  console.log('✅ Security events logged')
}

// Test error logging
async function testErrorLogging() {
  console.log('❌ Testing Error Logging...')
  
  try {
    // Simulate an error
    throw new Error('Database connection timeout')
  } catch (error) {
    await enhancedLoggingService.logSystemError(
      error as Error,
      'patient_data_retrieval',
      {
        operation: 'database_query',
        table: 'patients',
        query: 'SELECT * FROM patients WHERE id = ?',
        parameters: [mockPatient.id]
      }
    )
    console.log('✅ Error logged with full context')
  }
}

// Test bulk operations
async function testBulkOperations() {
  console.log('📦 Testing Bulk Operations...')
  
  const correlationId = enhancedLoggingService.generateCorrelationId()
  
  // Simulate multiple related operations
  for (let i = 1; i <= 5; i++) {
    await enhancedLoggingService.logEnhanced({
      action: 'bulk_patient_import',
      resourceType: 'patient',
      resourceId: `bulk-${i}`,
      resourceName: `Patient ${i}`,
      details: `Imported patient ${i} from CSV file`,
      category: 'business',
      severity: 'low',
      correlationId,
      tags: ['import', 'bulk-operation'],
      metadata: {
        batchNumber: 1,
        totalRecords: 5,
        recordNumber: i
      }
    })
  }
  
  console.log('✅ Bulk operations logged with correlation ID:', correlationId)
}

// Test analytics queries
async function testAnalytics() {
  console.log('📊 Testing Analytics...')
  
  // Get daily analytics
  const dailyAnalytics = await enhancedLoggingService.getAnalytics('day')
  console.log('Daily Analytics:', {
    totalLogs: dailyAnalytics.totalLogs,
    errorRate: `${dailyAnalytics.errorRate.toFixed(2)}%`,
    avgResponseTime: `${dailyAnalytics.averageResponseTime.toFixed(2)}ms`,
    categories: Object.keys(dailyAnalytics.logsByCategory).length
  })
  
  // Query specific logs
  const securityLogs = await enhancedLoggingService.getLogs({
    category: 'security',
    severity: 'high',
    limit: 10
  })
  console.log(`Found ${securityLogs.total} high-severity security events`)
  
  // Query by correlation
  const correlatedLogs = await enhancedLoggingService.getLogs({
    tags: ['bulk-operation'],
    limit: 10
  })
  console.log(`Found ${correlatedLogs.total} bulk operation logs`)
  
  console.log('✅ Analytics queries completed')
}

// Test real-time events
async function testRealTimeEvents() {
  console.log('⚡ Testing Real-time Events...')
  
  let eventCount = 0
  
  // Subscribe to events
  const unsubscribe = enhancedLoggingService.addEventListener((event) => {
    eventCount++
    console.log(`📡 Real-time event ${eventCount}: ${event.type}`)
    
    if (event.type === 'log_created') {
      const log = event.data as any
      console.log(`   → ${log.action}: ${log.details}`)
    }
  })
  
  // Generate some test events
  await enhancedLoggingService.logEnhanced({
    action: 'real_time_test',
    resourceType: 'system',
    resourceId: 'test',
    resourceName: 'Real-time Test',
    details: 'Testing real-time event broadcasting',
    category: 'system',
    severity: 'low',
    tags: ['test', 'real-time']
  })
  
  // Wait a moment for events to process
  await new Promise(resolve => setTimeout(resolve, 100))
  
  unsubscribe()
  console.log('✅ Real-time events tested')
}

// Comprehensive compliance test
async function testComplianceFeatures() {
  console.log('🏥 Testing HIPAA Compliance Features...')
  
  // Patient data access
  await enhancedLoggingService.logEnhanced({
    action: 'patient_data_accessed',
    resourceType: 'patient',
    resourceId: mockPatient.id,
    resourceName: mockPatient.name,
    details: `Medical records accessed for patient ${mockPatient.name}`,
    category: 'business',
    severity: 'high',
    userContext: mockUser,
    tags: ['hipaa', 'patient-access', 'medical-records'],
    metadata: {
      accessReason: 'treatment_consultation',
      dataFields: ['medical_history', 'current_medications', 'test_results'],
      accessDuration: 300 // seconds
    }
  })
  
  // Data modification
  await enhancedLoggingService.logEnhanced({
    action: 'patient_data_modified',
    resourceType: 'patient',
    resourceId: mockPatient.id,
    resourceName: mockPatient.name,
    details: 'Patient diagnosis updated',
    category: 'business',
    severity: 'high',
    oldValue: { diagnosis: 'Pending evaluation' },
    newValue: { diagnosis: 'Hypertension, Type 2 Diabetes' },
    userContext: mockUser,
    tags: ['hipaa', 'data-modification', 'diagnosis'],
    metadata: {
      modificationReason: 'diagnosis_confirmation',
      reviewedBy: 'Dr. Smith',
      approvalRequired: false
    }
  })
  
  console.log('✅ Compliance features tested')
}

// Main demonstration function
async function runEnhancedLoggingDemo() {
  console.log('🚀 Starting Enhanced Logging System Demo...\n')
  
  try {
    await testPerformanceTracking()
    console.log()
    
    await testPatientActions()
    console.log()
    
    await testSecurityEvents()
    console.log()
    
    await testErrorLogging()
    console.log()
    
    await testBulkOperations()
    console.log()
    
    await testRealTimeEvents()
    console.log()
    
    await testComplianceFeatures()
    console.log()
    
    // Wait for all logs to be processed
    console.log('⏳ Processing logs...')
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    await testAnalytics()
    
    console.log('\n🎉 Enhanced Logging Demo Completed Successfully!')
    console.log('\nKey Features Demonstrated:')
    console.log('• Performance tracking with automatic timing')
    console.log('• Correlation IDs for tracking related operations')
    console.log('• Security event monitoring')
    console.log('• Structured error logging with context')
    console.log('• Bulk operation logging')
    console.log('• Real-time event broadcasting')
    console.log('• HIPAA compliance tagging')
    console.log('• Advanced analytics and querying')
    
  } catch (error) {
    console.error('❌ Demo failed:', error)
    process.exit(1)
  }
}

// Integration examples
function printIntegrationExamples() {
  console.log('\n📚 Integration Examples:')
  
  console.log(`
// 1. Basic Usage in React Component
import { useEnhancedAudit } from '@/lib/hooks/use-enhanced-audit'

export function PatientForm() {
  const { logPatientAction, withPerformanceTracking } = useEnhancedAudit()
  
  const handleSubmit = withPerformanceTracking(
    async (formData) => {
      const patient = await createPatient(formData)
      await logPatientAction('patient_created', patient, 'New patient registered')
      return patient
    },
    'patient_form_submission'
  )
}

// 2. Error Handling with Context
const { logError } = useEnhancedAudit()

try {
  await fetchPatientData(patientId)
} catch (error) {
  await logError(error, 'patient_data_fetch', {
    patientId,
    retryCount: 3,
    lastSuccessfulFetch: lastFetchTime
  })
}

// 3. Security Monitoring
const { logSecurityEvent } = useEnhancedAudit()

await logSecurityEvent(
  'unauthorized_access_attempt',
  'User attempted to access restricted patient data',
  'critical',
  { attemptedResource: 'patient_records', userId: suspiciousUserId }
)

// 4. Correlation Tracking
const { startCorrelatedOperation, logSystemAction } = useEnhancedAudit()

const processReferral = async (referralData) => {
  const correlationId = startCorrelatedOperation('referral_processing')
  
  await logSystemAction('referral_received', 'Referral processing started', { correlationId })
  // ... process referral ...
  await logSystemAction('referral_completed', 'Referral processing completed', { correlationId })
}
`)
}

// Performance benchmarking
async function benchmarkPerformance() {
  console.log('\n🏁 Performance Benchmark:')
  
  const startTime = Date.now()
  const logCount = 100
  
  // Benchmark logging performance
  const promises = []
  for (let i = 0; i < logCount; i++) {
    promises.push(
      enhancedLoggingService.logEnhanced({
        action: 'benchmark_test',
        resourceType: 'system',
        resourceId: `bench-${i}`,
        resourceName: `Benchmark ${i}`,
        details: `Performance benchmark log entry ${i}`,
        category: 'performance',
        severity: 'low',
        tags: ['benchmark']
      })
    )
  }
  
  await Promise.all(promises)
  
  const endTime = Date.now()
  const duration = endTime - startTime
  const logsPerSecond = Math.round((logCount / duration) * 1000)
  
  console.log(`📈 Logged ${logCount} entries in ${duration}ms`)
  console.log(`📊 Performance: ${logsPerSecond} logs/second`)
  console.log(`⚡ Average time per log: ${(duration / logCount).toFixed(2)}ms`)
}

// Run the demo if this script is executed directly
if (require.main === module) {
  runEnhancedLoggingDemo()
    .then(() => benchmarkPerformance())
    .then(() => printIntegrationExamples())
    .then(() => {
      console.log('\n✨ Demo completed! Check the Enhanced Audit Dashboard to see all logged events.')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Demo failed:', error)
      process.exit(1)
    })
}

export {
  runEnhancedLoggingDemo,
  testPerformanceTracking,
  testPatientActions,
  testSecurityEvents,
  testErrorLogging,
  testAnalytics
}
