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
  Stethoscope
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
  urgencyLevel?: 'Low' | 'Medium' | 'High' | 'Emergency'
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
      
      toast({
        title: "Extraction Complete!",
        description: `Patient information extracted with ${result.confidence || 85}% confidence`,
      })
    } catch (error) {
      console.error('PDF extraction error:', error)
      toast({
        title: "Extraction Failed",
        description: error instanceof Error ? error.message : "Failed to extract patient information from PDF",
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

  const handleSubmit = () => {
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
      urgencyLevel: 'Normal', // No longer using urgencyLevel from form
      preferredDoctor: extractedData.referredTo,
      insuranceProvider: '',
      pdfFileUrl: pdfDataUrl || undefined, // Store the PDF data URL
      referralId: referralId,
      source: 'admin-upload' as const,
      dob: extractedData.dob, // Add DOB field
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
        status: extractedData.status
      }
    }

    // Add patient to local store
    addPatient(newPatient)
    
    // Patient added to local system only
    
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="h-5 w-5" />
          <span>Upload Referral</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <div className="space-y-4">
            <FileText className="h-12 w-12 text-gray-400 mx-auto" />
            <div>
              <h3 className="text-lg font-medium">Upload PDF Referral Letter</h3>
              <p className="text-gray-500">Select a PDF file to extract patient information automatically</p>
            </div>
            <div className="space-y-2">
              <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Choose PDF File
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-500">Maximum file size: 10MB</p>
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Extracting Patient Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>PDF uploaded successfully</span>
          </div>
          {isProcessing ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
              <span>Extracting patient information using AI...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Information extracted successfully</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  const renderReviewStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Review Extracted Information</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye className="h-4 w-4 mr-2" />
                {showPreview ? 'Hide' : 'View'} PDF
              </Button>
              <Button variant="outline" size="sm" onClick={resetForm}>
                <X className="h-4 w-4 mr-2" />
                Start Over
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Patient Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <User className="h-5 w-5 text-blue-500" />
                <h3 className="font-medium">Patient Information</h3>
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
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Stethoscope className="h-5 w-5 text-green-500" />
                <h3 className="font-medium">Medical Information</h3>
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

              <div>
                <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                <Input
                  id="insuranceProvider"
                  value={extractedData.insuranceProvider || ''}
                  onChange={(e) => handleFieldUpdate('insuranceProvider', e.target.value)}
                />
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

          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Add Patient to System
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* PDF Preview */}
      {showPreview && pdfDataUrl && (
        <Card>
          <CardHeader>
            <CardTitle>PDF Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden bg-gray-50">
              <iframe
                src={pdfDataUrl}
                className="w-full h-96"
                title="PDF Preview"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderCompleteStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span>Referral Added Successfully</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Patient Added to System</h3>
            <p className="text-gray-600">
              {extractedData.fullName} has been successfully added to the patient referral system
            </p>
          </div>
          
          <div className="space-y-2">
            <Badge variant="outline" className="bg-green-50 text-green-700">
              Patient added successfully
            </Badge>
          </div>

          <p className="text-sm text-gray-500">
            This dialog will close automatically...
          </p>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="w-full bg-blue-500 text-white rounded-xl p-4 text-left transition-all duration-200 shadow-sm hover:shadow-md"
          onClick={() => setIsOpen(true)}
        >
          <div className="flex items-center justify-between w-full">
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