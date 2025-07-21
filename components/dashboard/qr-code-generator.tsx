"use client"

import { useState } from 'react'
import QRCode from 'react-qr-code'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Copy, Download, QrCode } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
// Removed Google Forms integration

interface QRCodeGeneratorProps {
  referralId: string
  formUrl: string
  title?: string
  description?: string
}

export function QRCodeGenerator({ 
  referralId, 
  formUrl, 
  title = "New Referral QR Code",
  description = "Scan this QR code to access the patient referral form" 
}: QRCodeGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(formUrl)
      toast({
        title: "Copied!",
        description: "QR code URL copied to clipboard",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy URL",
        variant: "destructive"
      })
    }
  }

  const downloadQRCode = () => {
    const svg = document.getElementById(`qr-code-${referralId}`)
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0)
        
        const pngFile = canvas.toDataURL('image/png')
        const downloadLink = document.createElement('a')
        downloadLink.download = `referral-qr-${referralId}.png`
        downloadLink.href = pngFile
        downloadLink.click()
      }
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
      
      toast({
        title: "Downloaded!",
        description: "QR code image saved to downloads",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <QrCode className="h-4 w-4 mr-2" />
          Generate QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-white p-4 rounded-lg border-2 border-slate-200">
                         <QRCode
               id={`qr-code-${referralId}`}
               value={formUrl}
               size={200}
               level="M"
             />
          </div>
          
          <div className="text-center space-y-2">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Referral ID: <span className="font-mono text-slate-900 dark:text-slate-100">{referralId}</span>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
              Scan with any QR code reader or smartphone camera to access the referral form
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={copyToClipboard} className="w-full sm:w-auto">
            <Copy className="h-4 w-4 mr-2" />
            Copy URL
          </Button>
          <Button onClick={downloadQRCode} className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Download QR
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Component for generating a new referral with QR code
export function NewReferralQR() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [referralData, setReferralData] = useState<{
    id: string
    formUrl: string
  } | null>(null)
  const { toast } = useToast()

  const generateNewReferral = () => {
    setIsGenerating(true)
    
    // Generate unique referral ID
    const referralId = `REF-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
    
    // Generate URL for custom form with referral ID
    const baseUrl = window.location.origin
    const formUrl = `${baseUrl}/patient-form?ref=${encodeURIComponent(referralId)}`
    
    setTimeout(() => {
      setReferralData({
        id: referralId,
        formUrl: formUrl
      })
      setIsGenerating(false)
      
      toast({
        title: "Referral Created!",
        description: `New referral ${referralId} generated. QR code links to the form where patients can enter this ID.`,
      })
    }, 1000)
  }

  if (referralData) {
    return (
      <QRCodeGenerator
        referralId={referralData.id}
        formUrl={referralData.formUrl}
        title="New Referral Generated"
        description="Share this QR code with patients to complete their referral form"
      />
    )
  }

  return (
    <Button 
      onClick={generateNewReferral}
      disabled={isGenerating}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
    >
      {isGenerating ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Generating...
        </>
      ) : (
        <>
          <QrCode className="h-4 w-4 mr-2" />
          Create New Referral
        </>
      )}
    </Button>
  )
}