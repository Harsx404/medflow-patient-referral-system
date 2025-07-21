"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { X, Download, ExternalLink, ZoomIn, ZoomOut, RotateCw } from 'lucide-react'
// Removed Google Sheets integration

// Simple PDF utility functions
const generatePdfPreviewLink = (url: string) => {
  // For now, return the URL as-is for iframe display
  return url
}

const generateDirectDownloadLink = (url: string) => {
  // For now, return the URL as-is for direct download
  return url
}

// Using existing Patient type from the store
interface Patient {
  [key: string]: any
}

interface PDFViewerModalProps {
  patient: Patient | null
  isOpen: boolean
  onClose: () => void
}

export function PDFViewerModal({ patient, isOpen, onClose }: PDFViewerModalProps) {
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)

  if (!patient) return null

  const hasOriginalPDF = patient.pdfFileUrl && patient.pdfFileUrl.trim() !== ''
  const pdfPreviewUrl = hasOriginalPDF ? generatePdfPreviewLink(patient.pdfFileUrl!) : ''
  const pdfDownloadUrl = hasOriginalPDF ? generateDirectDownloadLink(patient.pdfFileUrl!) : ''

  const downloadPDF = () => {
    if (pdfDownloadUrl) {
      window.open(pdfDownloadUrl, '_blank')
    }
  }

  const openInNewTab = () => {
    if (pdfPreviewUrl) {
      window.open(pdfPreviewUrl, '_blank')
    }
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50))
  }

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">Medical Records - {patient.name}</DialogTitle>
              <DialogDescription>
                {patient.referralId && `Referral ID: ${patient.referralId} • `}
                View original uploaded documents and extracted patient information
              </DialogDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
          {/* Left Column - Patient Information */}
          <div className="space-y-4 overflow-y-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  Patient Information
                  <Badge variant={
                    patient.urgencyLevel === 'Emergency' ? 'destructive' :
                    patient.urgencyLevel === 'High' ? 'destructive' :
                    patient.urgencyLevel === 'Medium' ? 'default' : 'secondary'
                  }>
                    {patient.urgencyLevel || 'Medium'} Priority
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-slate-700 dark:text-slate-300">Name:</span>
                    <p className="text-slate-900 dark:text-slate-100">{patient.name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-700 dark:text-slate-300">Age:</span>
                    <p className="text-slate-900 dark:text-slate-100">{patient.age} years</p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-700 dark:text-slate-300">Gender:</span>
                    <p className="text-slate-900 dark:text-slate-100">{patient.gender}</p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-700 dark:text-slate-300">Contact:</span>
                    <p className="text-slate-900 dark:text-slate-100">{patient.contactNumber}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <span className="font-medium text-slate-700 dark:text-slate-300">Email:</span>
                  <p className="text-slate-900 dark:text-slate-100">{patient.email}</p>
                </div>

                <div>
                  <span className="font-medium text-slate-700 dark:text-slate-300">Preferred Doctor:</span>
                  <p className="text-slate-900 dark:text-slate-100">{patient.preferredDoctor || 'No preference'}</p>
                </div>

                <div>
                  <span className="font-medium text-slate-700 dark:text-slate-300">Insurance Provider:</span>
                  <p className="text-slate-900 dark:text-slate-100">{patient.insuranceProvider || 'Not specified'}</p>
                </div>

                <Separator />

                <div>
                  <span className="font-medium text-slate-700 dark:text-slate-300">Current Symptoms:</span>
                  <p className="text-slate-900 dark:text-slate-100 mt-1 leading-relaxed">
                    {patient.currentSymptoms || 'No symptoms reported'}
                  </p>
                </div>

                <div>
                  <span className="font-medium text-slate-700 dark:text-slate-300">Medical History:</span>
                  <p className="text-slate-900 dark:text-slate-100 mt-1 leading-relaxed">
                    {patient.medicalHistory || 'No medical history provided'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - PDF Viewer */}
          <div className="flex flex-col overflow-hidden">
            <Card className="flex-1 flex flex-col">
              <CardHeader className="flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Original Medical Documents</CardTitle>
                  {hasOriginalPDF && (
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={handleZoomOut}>
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-medium">{zoom}%</span>
                      <Button variant="outline" size="sm" onClick={handleZoomIn}>
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleRotate}>
                        <RotateCw className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col overflow-hidden">
                {hasOriginalPDF ? (
                  <div className="flex-1 flex flex-col">
                    <div className="flex gap-2 mb-4">
                      <Button size="sm" onClick={downloadPDF}>
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                      <Button variant="outline" size="sm" onClick={openInNewTab}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open in New Tab
                      </Button>
                    </div>
                    
                    <div className="flex-1 border rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900">
                      <iframe
                        src={pdfPreviewUrl}
                        className="w-full h-full border-none"
                        style={{
                          transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                          transformOrigin: 'top left'
                        }}
                        title={`Medical records for ${patient.name}`}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                        <Download className="h-8 w-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                        No Original PDF Available
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        No PDF document was uploaded with this referral form.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}