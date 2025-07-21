'use client'

import { CustomPatientForm } from '@/components/dashboard/custom-patient-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Shield, Clock } from 'lucide-react'

export default function PatientFormPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Medical Referral Form
          </h1>
          <p className="text-lg text-gray-600">
            Please complete this form to submit your medical referral
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="flex items-center p-4">
              <FileText className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h3 className="font-semibold text-sm">Upload Document</h3>
                <p className="text-xs text-gray-600">Upload your referral document</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-4">
              <Shield className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h3 className="font-semibold text-sm">AI Extraction</h3>
                <p className="text-xs text-gray-600">AI extracts your information</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-4">
              <Clock className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <h3 className="font-semibold text-sm">Quick Review</h3>
                <p className="text-xs text-gray-600">Review and submit</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Form */}
        <CustomPatientForm />
        
        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Your information is secure and will only be used for medical referral purposes.</p>
        </div>
      </div>
    </div>
  )
}