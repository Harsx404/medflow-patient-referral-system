"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/lib/store'
import { mockDoctors } from '@/lib/mock-data'
import { UserCheck, Lock, Mail } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { HomeButton } from '@/components/ui/home-button'

export default function DoctorLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { loginDoctor, initializeStore } = useAppStore()
  const router = useRouter()
  const { toast } = useToast()

  // Initialize store data when component mounts
  useEffect(() => {
    initializeStore()
  }, [initializeStore])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const success = loginDoctor(email, password)
      if (success) {
        toast({
          title: "Login Successful",
          description: "Welcome to your doctor portal!",
        })
        
        // Log the login action to audit trail
        try {
          const doctorData = useAppStore.getState().currentDoctor
          
          if (doctorData) {
            // Log the login using the API endpoint
            await fetch('/api/action-logs', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: doctorData.id,
                userName: doctorData.name,
                userRole: 'doctor',
                action: 'user_login',
                resourceType: 'system',
                resourceId: doctorData.id,
                resourceName: doctorData.name,
                details: `Doctor ${doctorData.name} logged in`,
                ipAddress: '127.0.0.1', // In a real app, get from request
                userAgent: navigator.userAgent
              }),
            })
          }
        } catch (logError) {
          console.error('Error logging login action:', logError)
        }
        
        router.push('/doctor-dashboard')
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-slate-900 p-4">
      <div className="container mx-auto max-w-md">
        <div className="mb-4 flex justify-end">
          <HomeButton />
        </div>
        <Card className="w-full shadow-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4 p-3 rounded-full bg-blue-500 text-white w-fit">
            <UserCheck className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
            Doctor Portal
          </CardTitle>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Sign in to access your patient dashboard
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="doctor@gtg.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 transition-all duration-200 shadow-lg hover:shadow-xl"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 font-medium">Demo Credentials:</p>
            <div className="text-xs text-slate-500 dark:text-slate-500 space-y-1">
              <div>maria.rodriguez@gtg.com</div>
              <div>james.chen@gtg.com</div>
              <div>sarah.johnson@gtg.com</div>
              <div>michael.brown@gtg.com</div>
              <div>emily.davis@gtg.com</div>
              <div>robert.wilson@gtg.com</div>
              <div className="mt-2 font-medium">Password: password123</div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}