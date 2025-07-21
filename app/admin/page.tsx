"use client"

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useAppStore } from '@/lib/store'
import { mockPatients, mockDoctors, mockLiveUpdates } from '@/lib/mock-data'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { DoctorsPanel } from '@/components/dashboard/doctors-panel'
import { LiveUpdatesPanel } from '@/components/dashboard/live-updates-panel'
import { PatientsTable } from '@/components/dashboard/patients-table'
import { NewReferralQR } from '@/components/dashboard/qr-code-generator'
// Removed Google Forms integration
import { UploadReferral } from '@/components/dashboard/upload-referral'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Activity, 
  Users, 
  FileText, 
  QrCode, 
  Upload, 
  RefreshCw,
  Calendar,
  TrendingUp,
  Clock,
  Stethoscope
} from 'lucide-react'



export default function Dashboard() {
  const { liveUpdates, initializeStore, addLiveUpdate, isLoadingPatients } = useAppStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Set user role as admin for authorization checks
    localStorage.setItem('userRole', 'admin')
    localStorage.setItem('currentUser', 'Admin')
    
    // Initialize store with mock data
    initializeStore()
    
    // Simulate real-time updates with reduced frequency
    const interval = setInterval(() => {
      const randomActions = ['Accepted', 'Rejected', 'Transferred', 'Created'] as const
      const randomDoctors = ['Dr. Smith', 'Dr. Johnson', 'Dr. Williams', 'Dr. Brown', 'Dr. Jones']
      const randomPatients = ['John Doe', 'Jane Smith', 'Bob Wilson', 'Alice Brown', 'Charlie Davis']
      
      const newUpdate = {
        id: Date.now().toString(),
        type: randomActions[Math.floor(Math.random() * randomActions.length)],
        patientName: randomPatients[Math.floor(Math.random() * randomPatients.length)],
        doctorName: randomDoctors[Math.floor(Math.random() * randomDoctors.length)],
        timestamp: new Date().toISOString()
      }
      
      addLiveUpdate(newUpdate)
    }, 120000) // Every 2 minutes instead of 30 seconds

    return () => clearInterval(interval)
  }, [initializeStore, addLiveUpdate])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Modern Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-2xl shadow-lg">
                <Stethoscope className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  MedFlow Dashboard
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Streamline patient referrals with intelligent workflow management
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="px-3 py-1.5 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                <Calendar className="h-4 w-4 mr-2" />
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'short',
                  month: 'short', 
                  day: 'numeric' 
                })}
              </Badge>
              <Button 
                asChild 
                className="bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 text-white font-medium px-5 py-2.5"
              >
                <a href="/doctor-login">
                  Doctor Portal
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
          {/* Stats Overview - Spans 2 columns on large screens */}
          <div className="lg:col-span-2 xl:col-span-4">
            <StatsCards />
          </div>
          
          {/* Quick Actions Panel - Spans 1 column on large screens */}
          <div className="lg:col-span-2 xl:col-span-2">
            <Card className="h-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* QR Code Generation */}
                <div className="bg-blue-600 rounded-xl p-4 text-white shadow-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <QrCode className="h-5 w-5" />
                    <p className="font-medium">Generate QR Code</p>
                  </div>
                  <NewReferralQR />
                </div>
                
                {/* Upload Referral */}
                <div className="bg-emerald-600 rounded-xl p-4 text-white shadow-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Upload className="h-5 w-5" />
                    <p className="font-medium">Upload Referral</p>
                  </div>
                  <UploadReferral />
                </div>
                
                {/* Refresh Data */}
                <button 
                  disabled={isLoadingPatients}
                  className="w-full bg-amber-500 rounded-xl p-4 text-white shadow-lg flex items-center justify-center gap-2 hover:bg-amber-600 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`h-5 w-5 ${isLoadingPatients ? 'animate-spin' : ''}`} />
                  <p className="font-medium">{isLoadingPatients ? 'Loading...' : 'Refresh Data'}</p>
                </button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Doctors Panel */}
          <div className="lg:col-span-1">
            <Card className="h-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-emerald-600" />
                  Medical Staff
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <DoctorsPanel />
              </CardContent>
            </Card>
          </div>
          
          {/* Live Updates Panel */}
          <div className="lg:col-span-2">
            <Card className="h-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Live Activity Feed
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <LiveUpdatesPanel />
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Full Width Sections */}
        <div className="space-y-6">
          {/* Patients Table */}
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <FileText className="h-6 w-6 text-indigo-600" />
                Patient Referrals Management
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <PatientsTable />
            </CardContent>
          </Card>

          {/* Custom Form Integration - Coming Soon */}
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Activity className="h-6 w-6 text-green-600" />
                Custom Form Integration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Custom patient referral form with AI-powered document processing will be available here.</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}