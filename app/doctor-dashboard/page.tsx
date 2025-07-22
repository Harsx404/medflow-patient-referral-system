"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAppStore } from '@/lib/store'
import { mockPatients, mockDoctors, mockLiveUpdates } from '@/lib/mock-data'
import { 
  Users, 
  Clock, 
  Activity, 
  LogOut, 
  CheckCircle, 
  XCircle, 
  ArrowRight,
  FileText,
  Calendar,
  ToggleLeft,
  ToggleRight,
  Eye,
  Download,
  History,
  X
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export default function DoctorDashboardPage() {
  const { 
    currentDoctor, 
    isAuthenticated, 
    patients, 
    doctors,
    setPatients, 
    setDoctors,
    logoutDoctor, 
    toggleDoctorAvailability,
    updatePatientStatus
  } = useAppStore()
  const router = useRouter()
  const { toast } = useToast()
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null)
  const [viewingPatient, setViewingPatient] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated || !currentDoctor) {
      router.push('/doctor-login')
      return
    }
    
    // Set user role as doctor for authorization checks
    localStorage.setItem('userRole', 'doctor')
    localStorage.setItem('currentUser', currentDoctor.name)
    
    // Initialize data if not already loaded
    if (patients.length === 0) {
      setPatients(mockPatients)
    }
    if (doctors.length === 0) {
      setDoctors(mockDoctors)
    }
  }, [isAuthenticated, currentDoctor, router, patients.length, doctors.length, setPatients, setDoctors])

  if (!isAuthenticated || !currentDoctor) {
    return (
      <div className="min-h-screen bg-blue-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  const myPatients = patients.filter(p => p.assignedDoctor === currentDoctor.name)
  const pendingPatients = myPatients.filter(p => p.status === 'Pending')
  const acceptedPatients = myPatients.filter(p => p.status === 'Accepted')
  const otherDoctors = doctors.filter(d => d.id !== currentDoctor.id)

  const handleLogout = () => {
    logoutDoctor()
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    })
    router.push('/doctor-login')
  }

  const handleToggleAvailability = () => {
    toggleDoctorAvailability(currentDoctor.id)
    toast({
      title: "Availability Updated",
      description: `You are now ${!currentDoctor.availability ? 'available' : 'unavailable'} for new patients.`,
    })
  }

  const handlePatientAction = async (patientId: string, action: 'Accepted' | 'Rejected' | 'Transferred', transferDoctor?: string) => {
    const patient = patients.find(p => p.id === patientId)
    if (!patient) return

    if (action === 'Transferred' && transferDoctor) {
      // Update patient's assigned doctor
      const updatedPatients = patients.map(p => 
        p.id === patientId 
          ? { ...p, assignedDoctor: transferDoctor, status: 'Transferred' as const }
          : p
      )
      setPatients(updatedPatients)
    }
    
    await updatePatientStatus(patientId, action, currentDoctor.name)
    
    toast({
      title: `Patient ${action}`,
      description: `${patient.name} has been ${action.toLowerCase()}${action === 'Transferred' ? ` to ${transferDoctor}` : ''}.`,
    })
    
    setSelectedPatient(null)
  }

  const initials = currentDoctor.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12 ring-2 ring-blue-200 dark:ring-blue-800">
                  <AvatarFallback className="bg-blue-500 text-white font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Grass Tree Group - Doctor Portal
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400">
                    Welcome, {currentDoctor.name} • {currentDoctor.specialization} • {currentDoctor.currentPatients} Active Patients
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  onClick={handleToggleAvailability}
                  variant={currentDoctor.availability ? "default" : "secondary"}
                  className={`flex items-center space-x-2 ${
                    currentDoctor.availability 
                      ? 'bg-green-500 hover:bg-green-600 text-white' 
                      : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                  }`}
                >
                  {currentDoctor.availability ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                  <span>{currentDoctor.availability ? 'Available' : 'Unavailable'}</span>
                </Button>
                <Button onClick={handleLogout} variant="outline" className="flex items-center space-x-2">
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg bg-orange-50 dark:bg-orange-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Pending Reviews</p>
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{pendingPatients.length}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-green-50 dark:bg-green-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">Accepted Patients</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{acceptedPatients.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-blue-50 dark:bg-blue-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Patients</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{myPatients.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Referrals */}
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-orange-500" />
              <span>Pending Referrals ({pendingPatients.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingPatients.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No pending referrals to review</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingPatients.map((patient) => (
                  <div key={patient.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-slate-900 dark:text-white">{patient.name}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {patient.age}y • {patient.gender}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                          Referred by: {patient.referringDoctor}
                        </p>
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          {patient.summary}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          onClick={async () => await handlePatientAction(patient.id, 'Accepted')}
                          size="sm"
                          className="bg-green-500 hover:bg-green-600 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          onClick={async () => await handlePatientAction(patient.id, 'Rejected')}
                          size="sm"
                          variant="destructive"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        <Button
                          onClick={() => setViewingPatient(patient.id)}
                          size="sm"
                          variant="outline"
                          className="mr-2"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        <Button
                          onClick={() => setSelectedPatient(patient.id)}
                          size="sm"
                          variant="outline"
                        >
                          <ArrowRight className="h-4 w-4 mr-1" />
                          Transfer
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Accepted Patients */}
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-500" />
              <span>My Patients ({acceptedPatients.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {acceptedPatients.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No accepted patients yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {acceptedPatients.map((patient) => (
                  <div key={patient.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-slate-900 dark:text-white">{patient.name}</h3>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {patient.status}
                        </Badge>
                      </div>
                      <Button
                        onClick={() => setViewingPatient(patient.id)}
                        size="sm"
                        variant="outline"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      {patient.age}y • {patient.gender}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      Accepted: {new Date(patient.timeline?.find(t => t.stage === 'Accepted')?.timestamp || '').toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Patient Details Modal */}
        {viewingPatient && (() => {
          const patient = patients.find(p => p.id === viewingPatient)
          if (!patient) return null
          
          return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Patient Details - {patient.name}</span>
                  </CardTitle>
                  <Button
                    onClick={() => setViewingPatient(null)}
                    variant="ghost"
                    size="sm"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="overflow-y-auto max-h-[calc(90vh-120px)]">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Patient Information */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center">
                          <Users className="h-5 w-5 mr-2" />
                          Patient Information
                        </h3>
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-2">
                          <div className="flex justify-between">
                            <span className="font-medium">Name:</span>
                            <span>{patient.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Age:</span>
                            <span>{patient.age} years</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Gender:</span>
                            <span>{patient.gender}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Status:</span>
                            <Badge className={`${
                              patient.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                              patient.status === 'Pending' ? 'bg-orange-100 text-orange-800' :
                              patient.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {patient.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Referring Doctor:</span>
                            <span>{patient.referringDoctor}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Assigned Doctor:</span>
                            <span>{patient.assignedDoctor}</span>
                          </div>
                        </div>
                      </div>

                      {/* Extracted Data */}
                      {patient.pdfExtractedData && (
                        <div>
                          <h3 className="text-lg font-semibold mb-3 flex items-center">
                            <FileText className="h-5 w-5 mr-2" />
                            Extracted Information
                          </h3>
                          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between">
                              <span className="font-medium">Referrer Clinic:</span>
                              <span>{patient.pdfExtractedData.referrerClinic}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Clinic Address:</span>
                              <span className="text-right">{patient.pdfExtractedData.clinicAddress}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Phone:</span>
                              <span>{patient.pdfExtractedData.phone}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Email:</span>
                              <span>{patient.pdfExtractedData.email}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Referral Date:</span>
                              <span>{patient.pdfExtractedData.referralDate}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Date of Birth:</span>
                              <span>{patient.pdfExtractedData.dateOfBirth}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Patient Address:</span>
                              <span className="text-right">{patient.pdfExtractedData.patientAddress}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Patient Phone:</span>
                              <span>{patient.pdfExtractedData.patientPhone}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Medicare Number:</span>
                              <span>{patient.pdfExtractedData.medicareNumber}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Referred To:</span>
                              <span>{patient.pdfExtractedData.referredTo}</span>
                            </div>
                            <div className="mt-3">
                              <span className="font-medium">Reason/Purpose:</span>
                              <p className="mt-1 text-sm bg-white dark:bg-slate-700 p-2 rounded border">
                                {patient.pdfExtractedData.reasonPurpose}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Timeline and PDF */}
                    <div className="space-y-4">
                      {/* Patient Timeline */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center">
                          <History className="h-5 w-5 mr-2" />
                          Patient Timeline
                        </h3>
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                          <div className="space-y-3">
                            {patient.timeline?.map((event, index) => (
                              <div key={index} className="flex items-start space-x-3">
                                <div className={`w-3 h-3 rounded-full mt-1 ${
                                  event.stage === 'Created' ? 'bg-blue-500' :
                                  event.stage === 'Viewed' ? 'bg-yellow-500' :
                                  event.stage === 'Accepted' ? 'bg-green-500' :
                                  event.stage === 'Rejected' ? 'bg-red-500' :
                                  'bg-purple-500'
                                }`}></div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium text-sm">{event.stage}</span>
                                    <span className="text-xs text-slate-500">
                                      {new Date(event.timestamp).toLocaleString()}
                                    </span>
                                  </div>
                                  {event.doctor && (
                                    <p className="text-xs text-slate-600 dark:text-slate-400">
                                      by {event.doctor}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Original PDF */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center">
                          <Download className="h-5 w-5 mr-2" />
                          Original Referral PDF
                        </h3>
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium">Referral Letter</span>
                            <Button
                              onClick={() => window.open(patient.referralLetter, '_blank')}
                              size="sm"
                              variant="outline"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download PDF
                            </Button>
                          </div>
                          <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center">
                            <FileText className="h-12 w-12 mx-auto mb-2 text-slate-400" />
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              Click download to view the original referral PDF
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {patient.referralLetter}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Summary */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Clinical Summary</h3>
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                          <p className="text-sm">{patient.summary}</p>
                        </div>
                      </div>

                      {/* Action Buttons for Pending Patients */}
                      {patient.status === 'Pending' && (
                        <div className="flex space-x-2">
                          <Button
                            onClick={async () => {
                              await handlePatientAction(patient.id, 'Accepted')
                              setViewingPatient(null)
                            }}
                            className="bg-green-500 hover:bg-green-600 text-white flex-1"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Accept Patient
                          </Button>
                          <Button
                            onClick={async () => {
                              await handlePatientAction(patient.id, 'Rejected')
                              setViewingPatient(null)
                            }}
                            variant="destructive"
                            className="flex-1"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject Patient
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        })()}

        {/* Transfer Modal */}
        {selectedPatient && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Transfer Patient</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Select a doctor to transfer this patient to:
                </p>
                <div className="space-y-2 mb-4">
                  {otherDoctors.filter(d => d.availability).map((doctor) => (
                    <Button
                      key={doctor.id}
                      onClick={async () => await handlePatientAction(selectedPatient, 'Transferred', doctor.name)}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {doctor.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-left">
                          <div className="font-medium">{doctor.name}</div>
                          <div className="text-xs text-slate-500">{doctor.specialization}</div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
                <Button
                  onClick={() => setSelectedPatient(null)}
                  variant="outline"
                  className="w-full"
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}