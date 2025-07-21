"use client"

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/lib/store'
import { PDFViewerModal } from './pdf-viewer-modal'
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  FileText, 
  Building, 
  CreditCard,
  Stethoscope,
  Clock,
  Info,
  Eye
} from 'lucide-react'

interface PatientDetailsModalProps {
  patientId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PatientDetailsModal({ patientId, open, onOpenChange }: PatientDetailsModalProps) {
  const { patients } = useAppStore()
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false)
  const patient = patients.find(p => p.id === patientId)

  if (!patient) {
    return null
  }

  const pdfData = patient.pdfExtractedData

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not provided'
    try {
      // Parse the date string - handles both MM/DD/YYYY and other formats
      const date = new Date(dateString)
      
      // Format as Month Day, Year (e.g., January 15, 2023)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  const InfoRow = ({ icon: Icon, label, value }: { icon: any, label: string, value?: string }) => (
    <div className="flex items-start space-x-3 py-2">
      <Icon className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-sm text-foreground break-words">{value || 'Not provided'}</p>
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Patient Details - {patient.name}</span>
              <Badge variant="outline" className="ml-2">
                PDF Extracted
              </Badge>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPdfViewerOpen(true)}
              className="flex items-center space-x-2"
            >
              <Eye className="h-4 w-4" />
              <span>View Original PDF</span>
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Patient Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Patient Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <InfoRow icon={User} label="Full Name" value={pdfData?.patientName || patient.name} />
              <InfoRow icon={Calendar} label="Date of Birth" value={formatDate(pdfData?.dateOfBirth)} />
              <InfoRow icon={Calendar} label="Age" value={pdfData?.patientAge ? `${pdfData.patientAge} years` : `${patient.age} years`} />
              <InfoRow icon={MapPin} label="Address" value={pdfData?.patientAddress} />
              <InfoRow icon={Phone} label="Phone Number" value={pdfData?.patientPhone} />
              <InfoRow icon={CreditCard} label="Medicare Number" value={pdfData?.medicareNumber} />
            </CardContent>
          </Card>

          {/* Referrer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-4 w-4" />
                <span>Referring Clinic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <InfoRow icon={Building} label="Clinic Name" value={pdfData?.referrerClinic} />
              <InfoRow icon={MapPin} label="Clinic Address" value={pdfData?.clinicAddress} />
              <InfoRow icon={Phone} label="Phone" value={pdfData?.phone} />
              <InfoRow icon={Phone} label="Fax" value={pdfData?.fax} />
              <InfoRow icon={Mail} label="Email" value={pdfData?.email} />
              <InfoRow icon={Stethoscope} label="Referring Doctor" value={patient.referringDoctor} />
            </CardContent>
          </Card>

          {/* Referral Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Referral Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <InfoRow icon={Calendar} label="Referral Date" value={formatDate(pdfData?.referralDate)} />
              <InfoRow icon={Stethoscope} label="Referred To" value={pdfData?.referredTo} />
              <InfoRow icon={Stethoscope} label="Assigned Doctor" value={patient.assignedDoctor} />
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium text-muted-foreground">Reason for Referral</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm leading-relaxed">
                    {pdfData?.reasonPurpose || patient.summary}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>System Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <InfoRow 
                icon={Clock} 
                label="Created" 
                value={new Date(patient.createdAt).toLocaleString('en-AU')} 
              />
              <InfoRow 
                icon={FileText} 
                label="Status" 
                value={patient.status} 
              />
              <InfoRow 
                icon={FileText} 
                label="PDF Document" 
                value={patient.referralLetter} 
              />
            </CardContent>
          </Card>

          {/* Data Completeness Indicator */}
          {pdfData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Info className="h-4 w-4" />
                  <span>Data Extraction Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(pdfData).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        value ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <span className="text-xs text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Green indicators show successfully extracted fields, red indicators show missing data.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
      
            <PDFViewerModal
        patient={patient}
        isOpen={pdfViewerOpen}
        onClose={() => setPdfViewerOpen(false)}
      />
    </Dialog>
  )
}