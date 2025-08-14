'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { HomeButton } from '@/components/ui/home-button'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

export default function HalaxyTestPage() {
  const [clientId, setClientId] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [region, setRegion] = useState('au')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  
  const testConnection = async () => {
    setLoading(true)
    setError('')
    setResult(null)
    
    try {
      // Store credentials temporarily in localStorage for testing
      // This is only for testing - in production, always use environment variables
      localStorage.setItem('HALAXY_TEST_CLIENT_ID', clientId)
      localStorage.setItem('HALAXY_TEST_CLIENT_SECRET', clientSecret)
      localStorage.setItem('HALAXY_TEST_REGION', region)
      
      const response = await fetch('/api/halaxy/test-connection')
      const data = await response.json()
      
      if (response.ok) {
        setResult(data)
      } else {
        setError(data.message || 'Failed to connect to Halaxy API')
      }
    } catch (err) {
      setError((err as Error).message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }
  
  // Load saved credentials on component mount
  useState(() => {
    if (typeof window !== 'undefined') {
      setClientId(localStorage.getItem('HALAXY_TEST_CLIENT_ID') || '')
      setClientSecret(localStorage.getItem('HALAXY_TEST_CLIENT_SECRET') || '')
      setRegion(localStorage.getItem('HALAXY_TEST_REGION') || 'au')
    }
  })

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-end mb-4">
        <HomeButton />
      </div>
      
      <h1 className="text-3xl font-bold mb-6">Halaxy API Connection Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Halaxy Credentials</CardTitle>
            <CardDescription>
              Enter your Halaxy API credentials to test the connection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={(e) => {
              e.preventDefault()
              testConnection()
            }}>
              <div className="space-y-2">
                <Label htmlFor="clientId">Client ID</Label>
                <Input 
                  id="clientId" 
                  value={clientId} 
                  onChange={(e) => setClientId(e.target.value)} 
                  placeholder="Your Halaxy Client ID"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clientSecret">Client Secret</Label>
                <Input 
                  id="clientSecret" 
                  type="password"
                  value={clientSecret} 
                  onChange={(e) => setClientSecret(e.target.value)} 
                  placeholder="Your Halaxy Client Secret"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <select 
                  id="region"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={region} 
                  onChange={(e) => setRegion(e.target.value)}
                >
                  <option value="au">Australia (au)</option>
                  <option value="eu">Europe/UK (eu)</option>
                </select>
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={loading || !clientId || !clientSecret}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing Connection...
                  </>
                ) : 'Test Connection'}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              Connection status and details
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Testing connection...</span>
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Connection Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : result ? (
              <div className="space-y-4">
                <Alert variant={result.success ? "default" : "destructive"}>
                  {result.success ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <AlertTitle>{result.success ? 'Connection Successful' : 'Connection Failed'}</AlertTitle>
                  <AlertDescription>{result.message}</AlertDescription>
                </Alert>
                
                {result.success && (
                  <div className="mt-4 space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Region:</span> {result.config.region}
                    </div>
                    <div>
                      <span className="font-medium">API Base URL:</span> {result.config.baseUrl}
                    </div>
                    <div>
                      <span className="font-medium">Token:</span> {result.auth.tokenPreview}
                    </div>
                    
                    <div className="pt-4">
                      <Button 
                        size="sm" 
                        onClick={async () => {
                          try {
                            setLoading(true)
                            const response = await fetch('/api/halaxy/patients')
                            const data = await response.json()
                            setResult(prev => ({ ...prev, patients: data }))
                          } catch (err) {
                            setError((err as Error).message)
                          } finally {
                            setLoading(false)
                          }
                        }}
                      >
                        Test Fetch Patients
                      </Button>
                    </div>
                    
                    {result.patients && (
                      <div className="mt-4 pt-4 border-t">
                        <h3 className="font-medium mb-2">Patient Data Test:</h3>
                        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
                          <pre className="text-xs overflow-x-auto max-h-32">
                            {JSON.stringify(result.patients, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Enter your credentials and test the connection to see results
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>How to Set Up Halaxy API Integration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal pl-5 space-y-2">
              <li>Purchase Halaxy API access in your Halaxy account (Settings &gt; Add-ons)</li>
              <li>Create an API key in Halaxy (Settings &gt; Integrations &gt; External tab)</li>
              <li>Copy the Client ID and Client Secret</li>
              <li>Add these values to your <code>.env.local</code> file</li>
              <li>Set <code>HALAXY_ENABLED=true</code> to activate the integration</li>
            </ol>
            
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
              <p className="font-medium mb-2">Example .env.local configuration:</p>
              <pre className="text-sm overflow-x-auto p-2 bg-gray-200 dark:bg-gray-900 rounded">
                {`HALAXY_ENABLED=true
HALAXY_CLIENT_ID=your_client_id
HALAXY_CLIENT_SECRET=your_client_secret
HALAXY_REGION=au  # 'au' or 'eu'
HALAXY_VENDOR_NAME=GTG-MED Patient Referral System
HALAXY_VENDOR_EMAIL=support@gtg-med.com`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
