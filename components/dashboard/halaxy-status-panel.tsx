'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle, XCircle, Settings } from 'lucide-react'
import Link from 'next/link'
import { halaxyConfig } from '@/lib/halaxy/config'

export function HalaxyStatusPanel({ className }: { className?: string }) {
  const [status, setStatus] = useState<'loading' | 'connected' | 'disconnected' | 'unconfigured'>('loading')
  const [message, setMessage] = useState('')
  const [lastChecked, setLastChecked] = useState('')
  
  const checkHalaxyConnection = async () => {
    setStatus('loading')
    setMessage('Checking Halaxy connection...')
    
    try {
      const response = await fetch('/api/halaxy/test-connection')
      const data = await response.json()
      
      if (response.ok && data.success) {
        setStatus('connected')
        setMessage('Connected to Halaxy API')
      } else {
        setStatus('disconnected')
        setMessage(data.message || 'Failed to connect to Halaxy API')
      }
    } catch (error) {
      setStatus('disconnected')
      setMessage((error as Error).message || 'Error connecting to Halaxy')
    }
    
    setLastChecked(new Date().toLocaleTimeString())
  }
  
  // Check connection on mount
  useEffect(() => {
    // First check if configured
    if (!halaxyConfig.enabled || !halaxyConfig.clientId || !halaxyConfig.clientSecret) {
      setStatus('unconfigured')
      setMessage('Halaxy API not configured. Add credentials in .env.local file.')
      return
    }
    
    checkHalaxyConnection()
  }, [])
  
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Halaxy Integration Status</span>
          <Badge 
            variant={
              status === 'connected' ? 'success' :
              status === 'loading' ? 'outline' :
              status === 'unconfigured' ? 'secondary' : 'destructive'
            }
            className="ml-2"
          >
            {status === 'connected' ? 'Connected' :
             status === 'loading' ? 'Checking...' :
             status === 'unconfigured' ? 'Not Configured' : 'Disconnected'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-sm">
            {status === 'connected' && <CheckCircle className="h-4 w-4 text-green-500" />}
            {status === 'disconnected' && <XCircle className="h-4 w-4 text-red-500" />}
            {status === 'loading' && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
            {status === 'unconfigured' && <Settings className="h-4 w-4 text-gray-500" />}
            <span>{message}</span>
          </div>
          
          {lastChecked && (
            <div className="text-xs text-gray-500">
              Last checked: {lastChecked}
            </div>
          )}
          
          <div className="flex space-x-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={checkHalaxyConnection}
              disabled={status === 'loading' || status === 'unconfigured'}
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  Checking...
                </>
              ) : 'Check Connection'}
            </Button>
            
            <Link href="/halaxy-test">
              <Button variant="default" size="sm">
                Configure Halaxy
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
