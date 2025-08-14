'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEnhancedAudit } from '@/lib/hooks/use-enhanced-audit'
import { HomeButton } from '@/components/ui/home-button'

export default function TestPage() {
  const { clearLogs } = useEnhancedAudit()
  const [logCount, setLogCount] = useState<number | null>(null)
  const [message, setMessage] = useState<string>('')
  const [loading, setLoading] = useState(false)
  
  const addTestLogs = async () => {
    setLoading(true)
    setMessage('Adding test logs...')
    try {
      const response = await fetch('/api/test-logging?action=add-test-logs')
      const data = await response.json()
      setMessage(data.message || 'Added test logs')
    } catch (error) {
      setMessage('Error adding logs: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }
  
  const countLogs = async () => {
    setLoading(true)
    setMessage('Counting logs...')
    try {
      const response = await fetch('/api/test-logging?action=count-logs')
      const data = await response.json()
      setLogCount(data.count)
      setMessage(`Found ${data.count} logs`)
    } catch (error) {
      setMessage('Error counting logs: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }
  
  const handleClearLogs = async () => {
    setLoading(true)
    setMessage('Clearing logs...')
    try {
      await clearLogs()
      setMessage('Logs cleared')
      setLogCount(0)
    } catch (error) {
      setMessage('Error clearing logs: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="p-6">
      <div className="flex justify-end mb-4">
        <HomeButton />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Enhanced Logging Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <Button onClick={addTestLogs} disabled={loading}>
                Add Test Logs
              </Button>
              <Button onClick={countLogs} disabled={loading} variant="outline">
                Count Logs
              </Button>
              <Button onClick={handleClearLogs} disabled={loading} variant="destructive">
                Clear Logs
              </Button>
            </div>
            
            <div className="mt-4">
              <div className="text-sm">Status: {message}</div>
              {logCount !== null && (
                <div className="text-sm mt-2">
                  Current log count: <span className="font-bold">{logCount}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
