"use client"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { useAppStore } from '@/lib/store'
import { 
  Upload, 
  FileText, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Eye,
  X,
  User,
  Calendar,
  Phone,
  Mail,
  CreditCard,
  Stethoscope,
  Sparkles,
  FileCheck,
  UserCheck,
  Activity,
  Shield
} from 'lucide-react'

interface ExtractedData {
  // New field structure
  fullName: string
  dob: string
  phone: string
  email: string
  referredTo: string
  gpName: string
  reason: string
  diagnosis: string
  // Status is always set to 'Pending' by default and can only be changed by admin/doctor
  // Not editable by users in the form
  status?: string
  insuranceProvider: string
  
  // Additional extracted fields
  patientAddress: string
  medicareNumber: string
  referrerClinic: string
  clinicAddress: string
  referralDate: string
  
  // Legacy fields for backward compatibility
  patientName?: string
  patientAge?: string
  patientGender?: string
  dateOfBirth?: string
  contactNumber?: string
  medicalHistory?: string
  currentSymptoms?: string
  urgencyLevel?: string
  preferredDoctor?: string
  referringDoctor?: string
  reasonPurpose?: string
}

export function UploadReferral() {
  const { addPatient } = useAppStore()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [isOpen, setIsOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null)
  const [extractedData, setExtractedData] = useState<Partial<ExtractedData>>({})
  const [showPreview, setShowPreview] = useState(false)
  const [step, setStep] = useState<'upload' | 'extract' | 'review' | 'complete'>('upload')

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive"
      })
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File too large",
        description: "Please upload a PDF smaller than 10MB",
        variant: "destructive"
      })
      return
    }

    setIsUploading(true)
    setUploadedFile(file)

    try {
      // Create a data URL for the PDF
      const reader = new FileReader()
      reader.onload = () => {
        setPdfDataUrl(reader.result as string)
        setStep('extract')
        setIsUploading(false)
        extractFieldsFromPDF(file)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to process the PDF file",
        variant: "destructive"
      })
      setIsUploading(false)
    }
  }

  const extractFieldsFromPDF = async (file: File) => {
    setIsProcessing(true)
    
    try {
      // Create a FormData object to send the file
      const formData = new FormData()
      formData.append('file', file)
      
      // Call the correct PDF processing API endpoint
      const response = await fetch('/api/extract-patient-data', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to process PDF' }))
        throw new Error(errorData.error || 'Failed to process PDF')
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to extract data from PDF')
      }
      
      // Map the API response to our ExtractedData format
      const extractedData: Partial<ExtractedData> = {
        // Use the direct field mapping from the API response
        fullName: result.data.fullName || '',
        dob: result.data.dob || '',
        phone: result.data.phone || '',
        email: result.data.email || '',
        referredTo: result.data.referredTo || '',
        gpName: result.data.gpName || '',
        reason: result.data.reason || '',
        diagnosis: result.data.diagnosis || '',
        status: 'Pending',
        
        // Additional extracted fields
        patientAddress: result.data.patientAddress || '',
        medicareNumber: result.data.medicareNumber || '',
        referrerClinic: result.data.referrerClinic || '',
        clinicAddress: result.data.clinicAddress || '',
        referralDate: result.data.referralDate || new Date().toISOString().split('T')[0],
        insuranceProvider: result.data.insuranceProvider || ''
      }
      
      setExtractedData(extractedData)
      setStep('review')
      
      // Show appropriate success message based on extraction method
      let successMessage = `Patient information extracted with ${result.confidence || 85}% confidence`
      if (result.extractionMethod === 'regex') {
        successMessage += ' (using fallback extraction)'
      } else if (result.extractionMethod === 'emergency') {
        successMessage = 'Basic extraction completed - please review and complete missing fields'
      }
      
      // Show retry information if available
      if (result.retryCount && result.retryCount > 0) {
        successMessage += ` (completed after ${result.retryCount} retry${result.retryCount > 1 ? 's' : ''})`
      }
      
      toast({
        title: "Extraction Complete!",
        description: successMessage,
      })
    } catch (error) {
      console.error('PDF extraction error:', error)
      
      // Provide more specific error messages
      let errorMessage = "Failed to extract patient information from PDF"
      if (error instanceof Error) {
        if (error.message.includes('503') || error.message.includes('overloaded')) {
          errorMessage = "AI service is temporarily overloaded. The system will retry automatically, or you can manually enter the information."
        } else if (error.message.includes('timeout')) {
          errorMessage = "Processing timed out. Please try again or enter information manually."
        } else {
          errorMessage = error.message
        }
      }
      
      toast({
        title: "Extraction Failed",
        description: errorMessage,
        variant: "destructive"
      })
      setStep('review') // Allow manual entry
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFieldUpdate = (field: keyof ExtractedData, value: string) => {
    setExtractedData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async () => {
    if (!extractedData.fullName || !extractedData.reason) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in at least patient name and reason for referral",
        variant: "destructive"
      })
      return
    }

    // Generate unique ID and referral ID
    const patientId = `admin-${Date.now()}`
    const referralId = `REF-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`

    // Calculate age from DOB if available
    let age = 0;
    if (extractedData.dob) {
      const birthDate = new Date(extractedData.dob);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }

    // Create patient object for the system
    const newPatient = {
      id: patientId,
      name: extractedData.fullName || '',
      age: age,
      gender: 'Not specified', // No longer using patientGender
      referringDoctor: extractedData.gpName || 'Admin Upload',
      assignedDoctor: extractedData.referredTo || 'Unassigned',
      // Always set status to 'Pending' by default - can only be changed by admin/doctor later
      status: 'Pending' as const,
      summary: extractedData.reason || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      referralLetter: `Patient: ${extractedData.fullName}\nDOB: ${extractedData.dob}\nReason: ${extractedData.reason}\nDiagnosis: ${extractedData.diagnosis || 'None provided'}`,
      timeline: [
        {
          stage: 'PDF Uploaded by Admin',
          timestamp: new Date().toISOString(),
          doctor: 'Admin'
        }
      ],
      // System compatible fields
      contactNumber: extractedData.phone,
      email: extractedData.email,
      medicalHistory: extractedData.diagnosis || '',
      currentSymptoms: extractedData.reason || '',
      urgencyLevel: extractedData.urgencyLevel || 'Normal',
      preferredDoctor: extractedData.referredTo,
      insuranceProvider: extractedData.insuranceProvider || '',
      pdfFileUrl: pdfDataUrl || undefined, // Store the PDF data URL
      referralId: referralId,
      source: 'admin-upload' as const,
      // Additional extracted fields
      pdfExtractedData: {
        referrerClinic: extractedData.referrerClinic,
        clinicAddress: extractedData.clinicAddress,
        phone: extractedData.phone,
        email: extractedData.email,
        referralDate: extractedData.referralDate,
        patientName: extractedData.fullName,
        dateOfBirth: extractedData.dob,
        patientAge: age.toString(),
        patientAddress: extractedData.patientAddress,
        patientPhone: extractedData.phone,
        medicareNumber: extractedData.medicareNumber,
        reasonPurpose: extractedData.reason,
        diagnosis: extractedData.diagnosis,
        referredTo: extractedData.referredTo,
        gpName: extractedData.gpName,
        status: 'Pending',
        insuranceProvider: extractedData.insuranceProvider,
        urgencyLevel: extractedData.urgencyLevel || 'Medium'
      }
    }

    // Add patient to local store and Google Sheets
    try {
      await addPatient(newPatient)
    } catch (error) {
      console.error('Failed to add patient:', error)
      toast({
        title: "Warning",
        description: "Patient added locally but may not have been saved to Google Sheets",
        variant: "destructive"
      })
    }
    
    toast({
      title: "Referral Added Successfully!",
      description: `Patient ${extractedData.fullName} has been added to the system`,
    })

    handleSuccess()
  }

  const resetForm = () => {
    setUploadedFile(null)
    setPdfDataUrl(null)
    setExtractedData({})
    setStep('upload')
    setShowPreview(false)
    setIsOpen(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSuccess = () => {
    setStep('complete')
    // Auto close after 2 seconds on success
    setTimeout(() => {
      resetForm()
    }, 2000)
  }

  const renderUploadStep = () => (
    <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
            <Upload className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Upload Referral Document
            </span>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-normal mt-1">
              AI-powered document processing
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
          <div className="relative border-2 border-dashed border-slate-300/50 dark:border-slate-600/50 rounded-2xl p-12 text-center bg-gradient-to-br from-slate-50/50 to-white/50 dark:from-slate-800/50 dark:to-slate-900/50 backdrop-blur-sm hover:border-blue-400/50 dark:hover:border-blue-500/50 transition-all duration-300">
            <div className="space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-2xl" />
                <div className="relative w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                    <Upload className="h-10 w-10 text-white" />
                  </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Upload PDF Referral Letter
                </h3>
                <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                  Our AI will automatically extract patient information with high accuracy
                </p>
              </div>
              <div className="space-y-4">
                <Button 
                  onClick={() => fileInputRef.current?.click()} 
                  disabled={isUploading}
                  className="relative px-3 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-l shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>  
                      <Upload className="h-5 w-5 mr-3" />
                      <span>Choose PDF File</span>
                    </>
                  )}
                </Button>
                <div className="flex items-center justify-center gap-6 text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span>Secure Upload</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-4 w-4" />
                    <span>Max 10MB</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    <span>AI Powered</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
      </CardContent>
    </Card>
  )

  const renderExtractStep = () => (
    <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl shadow-lg">
            <Activity className="h-5 w-5 text-white animate-pulse" />
          </div>
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              AI Processing Document
            </span>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-normal mt-1">
              Extracting patient information with advanced AI
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-2xl blur-xl" />
            <div className="relative bg-gradient-to-br from-slate-50/50 to-white/50 dark:from-slate-800/50 dark:to-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/50 dark:border-slate-700/50">
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-emerald-50/80 dark:bg-emerald-900/20 rounded-xl border border-emerald-200/50 dark:border-emerald-700/50">
                  <div className="p-2 bg-emerald-500 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-700 dark:text-emerald-400">PDF Upload Complete</p>
                    <p className="text-sm text-emerald-600 dark:text-emerald-500">Document received and validated</p>
                  </div>
                </div>
                
                {isProcessing ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 p-4 bg-blue-50/80 dark:bg-blue-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <Loader2 className="h-5 w-5 text-white animate-spin" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-blue-700 dark:text-blue-400">AI Analysis in Progress</p>
                        <p className="text-sm text-blue-600 dark:text-blue-500">Extracting patient information using advanced AI...</p>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50/50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200/50 dark:border-slate-700/50">
                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span>Processing with Gemini AI (with automatic retry on overload)</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500 mt-1">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <span>Fallback to regex extraction if needed</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 p-4 bg-emerald-50/80 dark:bg-emerald-900/20 rounded-xl border border-emerald-200/50 dark:border-emerald-700/50">
                    <div className="p-2 bg-emerald-500 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-emerald-700 dark:text-emerald-400">Extraction Complete</p>
                      <p className="text-sm text-emerald-600 dark:text-emerald-500">Patient information successfully extracted</p>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-2">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Document</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Analyzed</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center mb-2">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">AI Processing</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Active</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-2">
                      <UserCheck className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Data Ready</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Soon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderReviewStep = () => (
    <div className="space-y-6">
      <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Review Extracted Information
                </span>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-normal mt-1">
                  Verify and edit patient details before submission
                </p>
              </div>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 transition-all duration-200"
              >
                <Eye className="h-4 w-4 mr-2" />
                {showPreview ? 'Hide' : 'View'} PDF
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetForm}
                className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
              >
                <X className="h-4 w-4 mr-2" />
                Start Over
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Patient Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Patient Information</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Personal and contact details</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Patient Name *</Label>
                  <Input
                    id="fullName"
                    value={extractedData.fullName || ''}
                    onChange={(e) => handleFieldUpdate('fullName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={extractedData.dob || ''}
                    onChange={(e) => handleFieldUpdate('dob', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="medicareNumber">Medicare Number</Label>
                  <Input
                    id="medicareNumber"
                    value={extractedData.medicareNumber || ''}
                    onChange={(e) => handleFieldUpdate('medicareNumber', e.target.value)}
                  />
                </div>
                <div>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 mt-2">
                    Status: Pending (Can only be changed by admin/doctor)
                  </Badge>
                </div>
              </div>

              <div>
                <Label htmlFor="patientAddress">Address</Label>
                <Input
                  id="patientAddress"
                  value={extractedData.patientAddress || ''}
                  onChange={(e) => handleFieldUpdate('patientAddress', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Contact Number</Label>
                  <Input
                    id="phone"
                    value={extractedData.phone || ''}
                    onChange={(e) => handleFieldUpdate('phone', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={extractedData.email || ''}
                    onChange={(e) => handleFieldUpdate('email', e.target.value)}
                  />
                </div>
              </div>


            </div>

            {/* Medical Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
                  <Stethoscope className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Medical Information</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Clinical details and referral data</p>
                </div>
              </div>

              <div>
                <Label htmlFor="reason">Reason/Purpose *</Label>
                <Textarea
                  id="reason"
                  value={extractedData.reason || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleFieldUpdate('reason', e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="diagnosis">Diagnosis</Label>
                <Textarea
                  id="diagnosis"
                  value={extractedData.diagnosis || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleFieldUpdate('diagnosis', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="referrerClinic">Referrer Clinic</Label>
                  <Input
                    id="referrerClinic"
                    value={extractedData.referrerClinic || ''}
                    onChange={(e) => handleFieldUpdate('referrerClinic', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="referredTo">Referred To</Label>
                  <Input
                    id="referredTo"
                    value={extractedData.referredTo || ''}
                    onChange={(e) => handleFieldUpdate('referredTo', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                  <Input
                    id="insuranceProvider"
                    value={extractedData.insuranceProvider || ''}
                    onChange={(e) => handleFieldUpdate('insuranceProvider', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="urgencyLevel">Urgency Level</Label>
                  <Select
                    value={extractedData.urgencyLevel || 'Medium'}
                    onValueChange={(value) => handleFieldUpdate('urgencyLevel', value)}
                  >
                    <SelectTrigger id="urgencyLevel">
                      <SelectValue placeholder="Select urgency level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="gpName">GP Name</Label>
                <Input
                  id="gpName"
                  value={extractedData.gpName || ''}
                  onChange={(e) => handleFieldUpdate('gpName', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="clinicAddress">Clinic Address</Label>
                <Input
                  id="clinicAddress"
                  value={extractedData.clinicAddress || ''}
                  onChange={(e) => handleFieldUpdate('clinicAddress', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
            <Button 
              variant="ghost" 
              onClick={resetForm}
              className="px-6 py-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 rounded-xl"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Add Patient to System
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced PDF Preview */}
      {showPreview && pdfDataUrl && (
        <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                <Eye className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Document Preview
                </span>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-normal mt-1">
                  Original referral document
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl blur-xl" />
              <div className="relative border border-slate-200/50 dark:border-slate-700/50 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm shadow-inner">
                <iframe
                  src={pdfDataUrl}
                  className="w-full h-96"
                  title="PDF Preview"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderCompleteStep = () => (
    <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg">
            <CheckCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              Success!
            </span>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-normal mt-1">
              Referral processed successfully
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-2xl blur-xl" />
          <div className="relative text-center space-y-6 p-8 bg-gradient-to-br from-slate-50/50 to-white/50 dark:from-slate-800/50 dark:to-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
            <div className="space-y-4">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-2xl">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Patient Added Successfully!
                </h3>
                <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{extractedData.fullName}</span> has been successfully added to the patient referral management system
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Status: Pending Review</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Activity className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-400">System Updated</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
              <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span>This dialog will close automatically...</span>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
          onClick={() => setIsOpen(true)}
        >
          <div className="flex items-center justify-between w-full px-2 py-3 gap-4">
             <p className="font-medium">Upload PDF</p>
             <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
               <Upload className="h-4 w-4" />
             </div>
           </div>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Upload Patient Referral Letter</span>
            {step === 'review' && (
              <Badge variant="outline" className="ml-2">
                Step 3 of 3: Review & Submit
              </Badge>
            )}
            {step === 'extract' && (
              <Badge variant="outline" className="ml-2">
                Step 2 of 3: Extracting Data
              </Badge>
            )}
            {step === 'upload' && (
              <Badge variant="outline" className="ml-2">
                Step 1 of 3: Upload PDF
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6 p-1">
            {step === 'upload' && renderUploadStep()}
            {step === 'extract' && renderExtractStep()}
            {step === 'review' && renderReviewStep()}
            {step === 'complete' && renderCompleteStep()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}