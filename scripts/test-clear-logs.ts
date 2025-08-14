/**
 * This script tests the enhanced logging service clear functionality
 */

import { enhancedLoggingService } from '../lib/enhanced-logging-service'

// No need to initialize, the service does this automatically

// Log test data
async function runTest() {
  console.log('Starting Enhanced Logging Clear Test')
  
  // Add some test logs
  console.log('Adding test logs...')
  for (let i = 0; i < 5; i++) {
    await enhancedLoggingService.logEnhanced({
      action: 'TEST_ACTION',
      resourceType: 'TEST_RESOURCE',
      resourceId: `test-${i}`,
      resourceName: `Test Resource ${i}`,
      details: `Test log entry ${i}`,
      severity: 'low',
      category: 'system',
      // source is automatically determined
      userContext: {
        id: 'test-user',
        name: 'Test User',
        role: 'tester'
      }
    })
  }
  
  // Get logs before clearing
  const beforeClear = await enhancedLoggingService.getLogs({})
  console.log(`Logs count before clearing: ${beforeClear.total}`)
  
  // Clear logs
  console.log('Clearing all logs...')
  enhancedLoggingService.clearAllLogs()
  
  // Get logs after clearing
  const afterClear = await enhancedLoggingService.getLogs({})
  console.log(`Logs count after clearing: ${afterClear.total}`)
  
  // Done
  console.log('Test completed!')
}

runTest().catch(console.error)
