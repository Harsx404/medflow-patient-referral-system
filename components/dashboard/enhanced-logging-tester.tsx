'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useEnhancedAudit } from '@/lib/hooks/use-enhanced-audit'
import { PlayIcon, RefreshCwIcon, CheckCircleIcon } from 'lucide-react'

export function EnhancedLoggingTester() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [logsGenerated, setLogsGenerated] = useState(0)
  
  const {
    logPatientAction,
    logUserAction,
    logSecurityEvent,
    logError,
    logSystemAction,
    withPerformanceTracking,
    startCorrelatedOperation,
    isConnected
  } = useEnhancedAudit()

  const mockPatient = {
    id: 'test-pat-001',
    name: 'John Test Patient',
    age: 45,
    gender: 'Male',
    referringDoctor: 'Dr. Test Smith',
    assignedDoctor: 'Dr. Test Johnson'
  }

  const generateSampleLogs = async () => {
    setIsGenerating(true)
    setLogsGenerated(0)

    try {
      // 1. Patient actions
      await logPatientAction(
        'patient_created',
        mockPatient,
        `Test patient ${mockPatient.name} was created`,
        undefined,
        mockPatient
      )
      setLogsGenerated(prev => prev + 1)

      await logPatientAction(
        'patient_status_changed',
        mockPatient,
        'Test patient status updated',
        { status: 'Pending' },
        { status: 'Accepted' }
      )
      setLogsGenerated(prev => prev + 1)

      // 2. User actions
      await logUserAction(
        'dashboard_accessed',
        'User accessed the enhanced audit dashboard',
        'low',
        { section: 'audit_logs', timestamp: new Date().toISOString() }
      )
      setLogsGenerated(prev => prev + 1)

      // 3. Security events
      await logSecurityEvent(
        'login_success',
        'Test successful login event',
        'medium',
        { loginMethod: 'email', testMode: true }
      )
      setLogsGenerated(prev => prev + 1)

      await logSecurityEvent(
        'login_failed',
        'Test failed login attempt',
        'high',
        { reason: 'invalid_credentials', attempts: 3, testMode: true }
      )
      setLogsGenerated(prev => prev + 1)

      // 4. System actions with correlation
      const correlationId = startCorrelatedOperation('test_batch_operation')
      
      for (let i = 1; i <= 3; i++) {
        await logSystemAction(
          'batch_processing',
          `Test batch operation step ${i}/3`,
          { 
            correlationId,
            step: i,
            totalSteps: 3,
            testMode: true
          }
        )
        setLogsGenerated(prev => prev + 1)
        
        // Small delay to show progression
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // 5. Error simulation
      try {
        throw new Error('This is a test error to demonstrate error logging')
      } catch (error) {
        await logError(error as Error, 'test_error_context', {
          testMode: true,
          errorType: 'simulated',
          component: 'enhanced-logging-tester'
        })
        setLogsGenerated(prev => prev + 1)
      }

      // 6. Performance tracking example
      const performanceTest = withPerformanceTracking(
        async () => {
          // Simulate some work
          await new Promise(resolve => setTimeout(resolve, 200))
          
          await logSystemAction(
            'performance_test_completed',
            'Test performance tracking completed',
            { testMode: true, simulatedWork: '200ms' }
          )
          setLogsGenerated(prev => prev + 1)
          
          return 'Performance test completed'
        },
        'test_performance_operation',
        { testMode: true }
      )

      await performanceTest()

    } catch (error) {
      console.error('Failed to generate sample logs:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlayIcon className="h-5 w-5" />
          Enhanced Logging Tester
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          
          {logsGenerated > 0 && (
            <Badge variant="secondary">
              <CheckCircleIcon className="h-3 w-3 mr-1" />
              {logsGenerated} logs generated
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Click the button below to generate sample enhanced logs for testing the dashboard:
          </p>
          
          <ul className="text-xs text-muted-foreground space-y-1 ml-4">
            <li>• Patient creation and status updates</li>
            <li>• User actions and security events</li>
            <li>• Correlated system operations</li>
            <li>• Error logging with context</li>
            <li>• Performance tracking metrics</li>
          </ul>
        </div>

        <Button 
          onClick={generateSampleLogs} 
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <RefreshCwIcon className="h-4 w-4 mr-2 animate-spin" />
              Generating Logs... ({logsGenerated})
            </>
          ) : (
            <>
              <PlayIcon className="h-4 w-4 mr-2" />
              Generate Sample Logs
            </>
          )}
        </Button>
        
        {logsGenerated > 0 && !isGenerating && (
          <div className="text-center text-sm text-green-600">
            ✅ Generated {logsGenerated} sample logs! Check the dashboard tabs above.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
