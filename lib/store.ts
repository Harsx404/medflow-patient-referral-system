import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { mockPatients, mockDoctors, mockLiveUpdates } from './mock-data'
import { AuditService } from './audit-service'

export interface TimelineEvent {
  stage: string
  timestamp: string
  doctor?: string
}

export interface Patient {
  id: string
  name: string
  age: number
  gender: string
  referringDoctor: string
  assignedDoctor: string
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Transferred'
  summary: string
  createdAt: string
  updatedAt?: string
  referralLetter: string
  timeline?: TimelineEvent[]
  // Additional fields for Google Sheets integration and admin uploads
  contactNumber?: string
  email?: string
  medicalHistory?: string
  currentSymptoms?: string
  urgencyLevel?: string
  preferredDoctor?: string
  insuranceProvider?: string
  pdfFileUrl?: string
  referralId?: string
  source?: 'mock' | 'admin-upload' | 'custom-form'
  // PDF-extracted fields (enhanced for admin uploads)
  pdfExtractedData?: {
    referrerClinic?: string
    clinicAddress?: string
    phone?: string
    fax?: string
    email?: string
    referralDate?: string
    patientName?: string
    dateOfBirth?: string
    patientAge?: string
    patientAddress?: string
    patientPhone?: string
    medicareNumber?: string
    reasonPurpose?: string
    referredTo?: string
  }
}

export interface Doctor {
  id: string
  name: string
  email: string
  password: string
  specialization: string
  availability: boolean
  currentPatients: number
  responseTime: number
}

export interface LiveUpdate {
  id: string
  type: 'Accepted' | 'Rejected' | 'Transferred' | 'Created' | 'Pending'
  patientName: string
  doctorName: string
  timestamp: string
}

interface AppState {
  patients: Patient[]
  doctors: Doctor[]
  liveUpdates: LiveUpdate[]
  currentDoctor: Doctor | null
  isAuthenticated: boolean
  isInitialized: boolean
  isLoadingPatients: boolean
  
  // Actions
  initializeStore: () => void
  setPatients: (patients: Patient[]) => void
  addPatient: (patient: Patient) => Promise<void>
  setDoctors: (doctors: Doctor[]) => void
  addLiveUpdate: (update: LiveUpdate) => void
  updatePatientStatus: (patientId: string, status: Patient['status'], doctorName: string) => Promise<void>
  loginDoctor: (email: string, password: string) => boolean
  logoutDoctor: () => void
  toggleDoctorAvailability: (doctorId: string) => void
}

export const useAppStore = create<AppState>()(persist(
  (set, get) => ({
    patients: [],
    doctors: [],
    liveUpdates: [],
    currentDoctor: null,
    isAuthenticated: false,
    isInitialized: false,
    isLoadingPatients: false,
    
    initializeStore: () => {
      const { isInitialized } = get()
      if (!isInitialized) {
        set({ 
          patients: mockPatients,
          doctors: mockDoctors,
          liveUpdates: mockLiveUpdates,
          isInitialized: true
        })
        // Initialize with mock data only
      }
    },

    // Removed Google Sheets integration
    
    setPatients: (patients) => set({ patients }),
    
    addPatient: async (patient) => {
      set((state) => ({ 
        patients: [...state.patients, patient] 
      }))
      
      // Add live update for new patient
      const newUpdate: LiveUpdate = {
        id: Date.now().toString(),
        type: 'Created',
        patientName: patient.name,
        doctorName: patient.source === 'admin-upload' ? 'Admin' : 'System',
        timestamp: new Date().toISOString()
      }
      
      set((state) => ({
        liveUpdates: [newUpdate, ...state.liveUpdates].slice(0, 50)
      }))

      // Log audit trail
      try {
        const currentUser = typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null
        const userRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null
        
        if (currentUser && userRole) {
          const user = {
            id: currentUser,
            name: currentUser,
            role: userRole
          }
          await AuditService.logPatientCreated(patient, user)
        }
      } catch (error) {
        console.error('Failed to log patient creation:', error)
      }

      // Add patient to Google Sheets via API
      try {
        await fetch('/api/google-sheets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'addPatient',
            patient
          })
        })
      } catch (error) {
        console.error('Failed to add patient to Google Sheets:', error)
      }
    },
    
    setDoctors: (doctors) => set({ doctors }),
    addLiveUpdate: (update) => set((state) => ({ 
      liveUpdates: [update, ...state.liveUpdates].slice(0, 50) // Limit to 50 updates
    })),
    
    updatePatientStatus: async (patientId, status, doctorName) => {
      // Check user authorization from local storage
      const userRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;
      const currentUser = typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null;
      
      // Only allow status updates if user is admin or doctor
      if (!userRole || (userRole !== 'admin' && userRole !== 'doctor')) {
        console.error('Unauthorized attempt to update patient status:', {
          userRole,
          currentUser,
          attemptedPatientId: patientId,
          attemptedStatus: status,
          timestamp: new Date().toISOString()
        });
        
        // You could also show a toast notification here
        if (typeof window !== 'undefined') {
          alert('Access denied: Only admin staff and doctors can modify patient status.');
        }
        return;
      }
      
      // Log successful status update for audit trail
      console.log('Patient status update authorized:', {
        userRole,
        currentUser,
        patientId,
        newStatus: status,
        updatedBy: doctorName,
        timestamp: new Date().toISOString()
      });
      
      // Update the local state first
      set((state) => {
        const updatedPatients = state.patients.map(patient => 
          patient.id === patientId ? { ...patient, status } : patient
        )
        
        const patient = state.patients.find(p => p.id === patientId)
        if (patient) {
          // Log the status change
          const newUpdate: TimelineEvent = {
            stage: status,
            doctor: doctorName,
            timestamp: new Date().toISOString()
          }
          
          // Update the patient's timeline
          const updatedPatientsWithTimeline = updatedPatients.map(p => 
            p.id === patientId ? { 
              ...p, 
              timeline: [...(p.timeline || []), newUpdate] 
            } : p
          );
          
          // Create a live update
          const newLiveUpdate: LiveUpdate = {
            id: Date.now().toString(),
            type: status,
            patientName: patient.name,
            doctorName,
            timestamp: new Date().toISOString()
          }
          
          // Log audit trail for status change
          try {
            if (currentUser && userRole) {
              const user = {
                id: currentUser,
                name: currentUser,
                role: userRole
              }
              AuditService.logPatientStatusChanged(patient, patient.status, status, user)
            }
          } catch (error) {
            console.error('Failed to log status change:', error)
          }
          
          return {
            patients: updatedPatientsWithTimeline,
            liveUpdates: [newLiveUpdate, ...state.liveUpdates].slice(0, 50)
          }
        }
        
        return { patients: updatedPatients }
      })
      
      // Update status in Google Sheets via API
      try {
        const patient = get().patients.find(p => p.id === patientId)
        if (patient) {
          const practitionerName = patient.assignedDoctor || patient.referringDoctor || 'Unassigned'
          await fetch('/api/google-sheets', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              action: 'updateStatus',
              patientId,
              status,
              practitionerName
            })
          })
        }
      } catch (error) {
        console.error('Failed to update patient status in Google Sheets:', error)
      }
    },
    
    loginDoctor: (email, password) => {
      const { doctors } = get()
      const doctor = doctors.find(d => d.email === email && d.password === password)
      
      if (doctor) {
        set({ 
          currentDoctor: doctor, 
          isAuthenticated: true
        })
        
        // Log user login
        try {
          const user = {
            id: doctor.id,
            name: doctor.name,
            role: 'doctor'
          }
          AuditService.logUserLogin(user)
        } catch (error) {
          console.error('Failed to log user login:', error)
        }
        
        return true
      }
      
      return false
    },
    
    logoutDoctor: () => {
      // Log user logout before clearing
      try {
        const currentDoctor = get().currentDoctor
        if (currentDoctor) {
          const user = {
            id: currentDoctor.id,
            name: currentDoctor.name,
            role: 'doctor'
          }
          AuditService.logUserLogout(user)
        }
      } catch (error) {
        console.error('Failed to log user logout:', error)
      }
      
      // Clear user role and current user from local storage
      localStorage.removeItem('userRole')
      localStorage.removeItem('currentUser')
      
      set({ 
        currentDoctor: null, 
        isAuthenticated: false
      })
    },
    
    toggleDoctorAvailability: (doctorId) => {
      set((state) => ({
        doctors: state.doctors.map(doctor => 
          doctor.id === doctorId 
            ? { ...doctor, availability: !doctor.availability }
            : doctor
        )
      }))
    }
  }),
  {
    name: 'patient-referral-storage',
    partialize: (state) => ({ 
      patients: state.patients,
      doctors: state.doctors,
      liveUpdates: state.liveUpdates.slice(0, 10) // Only persist recent updates
    })
  }
))