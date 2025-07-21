"use client"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { Upload, FileText, Loader2, CheckCircle, Edit3 } from 'lucide-react'
import { useAppStore } from '@/lib/store'

interface ExtractedData {
  fullName: string
  dob: string
  email: string
  phone: string
  referredTo: string
  gpName: string
  reason: string
  diagnosis: string
  insuranceProvider: string
  patientAddress: string
  medicareNumber: string
  referrerClinic: string
  clinicAddress: string
  referralDate: string
}

interface CustomPatientFormProps {
  referralId?: string
  onSubmitSuccess?: () => void
}

export function CustomPatientForm({ referralId, onSubmitSuccess }: CustomPatientFormProps) {
  const [step, setStep] = useState<'upload' | 'extract' | 'edit' | 'submit'>('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [currentReferralId, setReferralId] = useState<string>(referralId || '')
  const [extractedData, setExtractedData] = useState<ExtractedData>({
    fullName: '',
    dob: '',
    email: '',
    phone: '',
    referredTo: '',
    gpName: '',
    reason: '',
    diagnosis: '',
    insuranceProvider: '',
    patientAddress: '',
    medicareNumber: '',
    referrerClinic: '',
    clinicAddress: '',
    referralDate: ''
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { addPatient } = useAppStore()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file)
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a PDF file.",
        variant: "destructive"
      })
    }
  }

  const handleExtractData = async () => {
    if (!selectedFile) return

    setIsProcessing(true)
    setStep('extract')

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('/api/extract-patient-data', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to extract data')
      }

      const result = await response.json()
      
      if (result.success) {
        setExtractedData(result.data)
        setStep('edit')
        toast({
          title: "Data Extracted Successfully",
          description: "Please review and edit the extracted information if needed."
        })
      } else {
        throw new Error(result.error || 'Extraction failed')
      }
    } catch (error) {
      console.error('Error processing PDF:', error)
      toast({
        title: "Extraction Failed",
        description: "Failed to extract data from PDF. Please try again or fill the form manually.",
        variant: "destructive"
      })
      setStep('edit')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/submit-patient-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(extractedData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to submit form')
      }
      
      const result = await response.json()
      
      if (result.success) {
         setReferralId(result.referralId)
         
         // Add patient to store
         addPatient(result.patient)
         
         toast({
           title: "Referral Submitted Successfully",
           description: `Your referral has been submitted with ID: ${result.referralId}`,
         })

         setStep('submit')
         onSubmitSuccess?.()
       } else {
         throw new Error(result.error || 'Submission failed')
       }
    } catch (error) {
      console.error('Error submitting form:', error)
      toast({
        title: "Submission Failed",
        description: "Failed to submit referral. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const calculateAge = (dob: string): number => {
    if (!dob) return 0
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const handleInputChange = (field: keyof ExtractedData, value: string) => {
    setExtractedData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        <div className={`flex items-center space-x-2 ${step === 'upload' ? 'text-blue-600' : step === 'extract' || step === 'edit' || step === 'submit' ? 'text-green-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'upload' ? 'bg-blue-100 border-2 border-blue-600' : step === 'extract' || step === 'edit' || step === 'submit' ? 'bg-green-100 border-2 border-green-600' : 'bg-gray-100 border-2 border-gray-300'}`}>
            {step === 'extract' || step === 'edit' || step === 'submit' ? <CheckCircle className="w-4 h-4" /> : '1'}
          </div>
          <span className="font-medium">Upload Document</span>
        </div>
        
        <div className={`w-8 h-1 ${step === 'extract' || step === 'edit' || step === 'submit' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
        
        <div className={`flex items-center space-x-2 ${step === 'extract' ? 'text-blue-600' : step === 'edit' || step === 'submit' ? 'text-green-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'extract' ? 'bg-blue-100 border-2 border-blue-600' : step === 'edit' || step === 'submit' ? 'bg-green-100 border-2 border-green-600' : 'bg-gray-100 border-2 border-gray-300'}`}>
            {step === 'edit' || step === 'submit' ? <CheckCircle className="w-4 h-4" /> : '2'}
          </div>
          <span className="font-medium">Extract Data</span>
        </div>
        
        <div className={`w-8 h-1 ${step === 'edit' || step === 'submit' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
        
        <div className={`flex items-center space-x-2 ${step === 'edit' ? 'text-blue-600' : step === 'submit' ? 'text-green-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'edit' ? 'bg-blue-100 border-2 border-blue-600' : step === 'submit' ? 'bg-green-100 border-2 border-green-600' : 'bg-gray-100 border-2 border-gray-300'}`}>
            {step === 'submit' ? <CheckCircle className="w-4 h-4" /> : '3'}
          </div>
          <span className="font-medium">Review & Submit</span>
        </div>
      </div>

      {/* Step 1: Upload Document */}
      {step === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Referral Document
            </CardTitle>
            <CardDescription>
              Please upload your referral letter or medical document (PDF format only)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                {selectedFile ? selectedFile.name : 'Choose a PDF file'}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Upload your referral letter, medical report, or any relevant document
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="mb-4"
              >
                <Upload className="h-4 w-4 mr-2" />
                Select PDF File
              </Button>
            </div>
            
            {selectedFile && (
              <div className="flex justify-center">
                <Button onClick={handleExtractData} className="px-8">
                  <FileText className="h-4 w-4 mr-2" />
                  Extract Data from Document
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Extract Data */}
      {step === 'extract' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Extracting Data
            </CardTitle>
            <CardDescription>
              Our AI is analyzing your document and extracting relevant information...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-lg font-medium">Processing Document...</p>
                <p className="text-sm text-gray-500">This may take a few moments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Edit Form */}
      {step === 'edit' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit3 className="h-5 w-5" />
              Review & Edit Information
            </CardTitle>
            <CardDescription>
              Please review the extracted information and make any necessary corrections
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={extractedData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Enter patient's full name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth *</Label>
                <Input
                  id="dob"
                  type="date"
                  value={extractedData.dob}
                  onChange={(e) => handleInputChange('dob', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={extractedData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="patient@example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={extractedData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="referredTo">Referred To (Doctor/Specialist) *</Label>
                <Input
                  id="referredTo"
                  value={extractedData.referredTo}
                  onChange={(e) => handleInputChange('referredTo', e.target.value)}
                  placeholder="Dr. Smith, Cardiologist"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gpName">Referring GP/Doctor *</Label>
                <Input
                  id="gpName"
                  value={extractedData.gpName}
                  onChange={(e) => handleInputChange('gpName', e.target.value)}
                  placeholder="Dr. Johnson"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                <Input
                  id="insuranceProvider"
                  value={extractedData.insuranceProvider}
                  onChange={(e) => handleInputChange('insuranceProvider', e.target.value)}
                  placeholder="Medicare, Private Health, etc."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="medicareNumber">Medicare Number</Label>
                <Input
                  id="medicareNumber"
                  value={extractedData.medicareNumber}
                  onChange={(e) => handleInputChange('medicareNumber', e.target.value)}
                  placeholder="1234567890"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="referrerClinic">Referring Clinic</Label>
                <Input
                  id="referrerClinic"
                  value={extractedData.referrerClinic}
                  onChange={(e) => handleInputChange('referrerClinic', e.target.value)}
                  placeholder="City Medical Center"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="referralDate">Referral Date</Label>
                <Input
                  id="referralDate"
                  type="date"
                  value={extractedData.referralDate}
                  onChange={(e) => handleInputChange('referralDate', e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="patientAddress">Patient Address</Label>
              <Textarea
                id="patientAddress"
                value={extractedData.patientAddress}
                onChange={(e) => handleInputChange('patientAddress', e.target.value)}
                placeholder="123 Main St, City, State, ZIP"
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="clinicAddress">Clinic Address</Label>
              <Textarea
                id="clinicAddress"
                value={extractedData.clinicAddress}
                onChange={(e) => handleInputChange('clinicAddress', e.target.value)}
                placeholder="456 Medical Blvd, City, State, ZIP"
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Referral *</Label>
              <Textarea
                id="reason"
                value={extractedData.reason}
                onChange={(e) => handleInputChange('reason', e.target.value)}
                placeholder="Brief description of why the patient is being referred"
                rows={3}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnosis/Condition *</Label>
              <Textarea
                id="diagnosis"
                value={extractedData.diagnosis}
                onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                placeholder="Current diagnosis or suspected condition"
                rows={3}
                required
              />
            </div>
            
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setStep('upload')}
              >
                Back to Upload
              </Button>
              
              <Button
                onClick={handleSubmit}
                disabled={!extractedData.fullName || !extractedData.referredTo || !extractedData.gpName || !extractedData.reason || !extractedData.diagnosis || isSubmitting}
                className="px-8"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Referral'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Success */}
      {step === 'submit' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Referral Submitted Successfully
            </CardTitle>
            <CardDescription>
              Your referral has been submitted and is now being processed
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
            <p className="text-gray-600 mb-4">
              Your referral has been successfully submitted. You will receive updates on the status of your referral.
            </p>
            <p className="text-sm text-gray-500">
               Referral ID: {referralId || 'Generated automatically'}
             </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}