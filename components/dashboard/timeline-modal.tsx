"use client"

import { useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAppStore } from '@/lib/store'
import { formatDate } from '@/lib/utils'
import { 
  CheckCircle, 
  Clock, 
  Eye, 
  XCircle, 
  ArrowRightLeft,
  FileText,
  User
} from 'lucide-react'

interface TimelineModalProps {
  patientId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TimelineModal({ patientId, open, onOpenChange }: TimelineModalProps) {
  const { patients } = useAppStore()
  
  const patient = useMemo(() => {
    return patients.find(p => p.id === patientId)
  }, [patients, patientId])
  
  if (!patient) return null
  
  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'Created':
        return <FileText className="h-4 w-4" />
      case 'Viewed':
        return <Eye className="h-4 w-4" />
      case 'Accepted':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'Rejected':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'Transferred':
        return <ArrowRightLeft className="h-4 w-4 text-blue-600" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }
  
  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Accepted':
        return 'bg-green-500'
      case 'Rejected':
        return 'bg-red-500'
      case 'Transferred':
        return 'bg-blue-500'
      case 'Viewed':
        return 'bg-yellow-500'
      case 'Created':
        return 'bg-gray-500'
      default:
        return 'bg-gray-300'
    }
  }
  
  const getProgressPercentage = () => {
    const totalStages = 4 // Created, Viewed, Decision (Accepted/Rejected/Transferred)
    const currentStage = patient.timeline?.length || 0
    return Math.min((currentStage / totalStages) * 100, 100)
  }
  
  const getCurrentStatus = () => {
    const timeline = patient.timeline || []
    const lastStage = timeline[timeline.length - 1]
    return lastStage?.stage || 'Unknown'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Referral Timeline - {patient.name}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Patient Info */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Patient:</span>
                <div className="font-medium">{patient.name}, {patient.age} years</div>
              </div>
              <div>
                <span className="text-muted-foreground">Current Status:</span>
                <div>
                  <Badge variant={patient.status === 'Accepted' ? 'success' : 
                                patient.status === 'Rejected' ? 'destructive' : 
                                patient.status === 'Transferred' ? 'default' : 'warning'}>
                    {patient.status}
                  </Badge>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Assigned Doctor:</span>
                <div className="font-medium">{patient.assignedDoctor}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Referring Doctor:</span>
                <div className="font-medium">{patient.referringDoctor}</div>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{Math.round(getProgressPercentage())}% Complete</span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>
          
          {/* Timeline */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Timeline</h3>
            
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border"></div>
              
              {(patient.timeline || []).map((event, index) => (
                <div key={index} className="relative flex items-start space-x-4 pb-6">
                  {/* Timeline dot */}
                  <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-4 border-background ${getStageColor(event.stage)}`}>
                    <div className="text-white">
                      {getStageIcon(event.stage)}
                    </div>
                  </div>
                  
                  {/* Event content */}
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-lg">{event.stage}</h4>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(event.timestamp)}
                      </span>
                    </div>
                    
                    {event.doctor && (
                      <div className="flex items-center space-x-1 mt-1 text-sm text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>by {event.doctor}</span>
                      </div>
                    )}
                    
                    {/* Stage description */}
                    <div className="mt-2 text-sm text-muted-foreground">
                      {event.stage === 'Created' && 'Referral was created and submitted to the system'}
                      {event.stage === 'Viewed' && 'Doctor has reviewed the referral details'}
                      {event.stage === 'Accepted' && 'Referral has been accepted and appointment will be scheduled'}
                      {event.stage === 'Rejected' && 'Referral has been rejected with feedback provided'}
                      {event.stage === 'Transferred' && 'Referral has been transferred to another specialist'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Summary */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Referral Summary</h4>
            <p className="text-sm text-muted-foreground">{patient.summary}</p>
          </div>
          
          {/* Processing Time */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Processing Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total Processing Time:</span>
                <div className="font-medium">
                  {(() => {
                    const timeline = patient.timeline || []
                    if (timeline.length === 0) return 'N/A'
                    const start = new Date(timeline[0]?.timestamp)
                    const end = new Date(timeline[timeline.length - 1]?.timestamp)
                    const diffHours = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60))
                    return diffHours > 24 ? `${Math.round(diffHours / 24)} days` : `${diffHours} hours`
                  })()} 
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Steps Completed:</span>
                <div className="font-medium">{patient.timeline?.length || 0} of 4</div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}