import { AuditLog } from './models/audit-log'

export const mockAuditLogs: AuditLog[] = [
  {
    id: '1',
    userId: 'admin',
    userName: 'Admin User',
    userRole: 'admin',
    action: 'user_login',
    resourceType: 'system',
    resourceId: 'admin',
    resourceName: 'Admin User',
    details: 'Admin user logged in successfully',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  {
    id: '2',
    userId: 'doctor1',
    userName: 'Dr. Smith',
    userRole: 'doctor',
    action: 'patient_status_changed',
    resourceType: 'patient',
    resourceId: 'patient-001',
    resourceName: 'John Doe',
    oldValue: { status: 'Pending' },
    newValue: { status: 'Accepted' },
    details: 'Patient John Doe status changed from Pending to Accepted',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  },
  {
    id: '3',
    userId: 'nurse1',
    userName: 'Nurse Williams',
    userRole: 'nurse',
    action: 'patient_created',
    resourceType: 'patient',
    resourceId: 'patient-002',
    resourceName: 'Jane Smith',
    newValue: {
      id: 'patient-002',
      name: 'Jane Smith',
      age: 45,
      gender: 'Female',
      status: 'Pending'
    },
    details: 'New patient Jane Smith was created',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  {
    id: '4',
    userId: 'doctor2',
    userName: 'Dr. Johnson',
    userRole: 'doctor',
    action: 'patient_transferred',
    resourceType: 'patient',
    resourceId: 'patient-003',
    resourceName: 'Mike Wilson',
    oldValue: { assignedDoctor: 'Dr. Smith' },
    newValue: { assignedDoctor: 'Dr. Johnson' },
    details: 'Patient Mike Wilson transferred from Dr. Smith to Dr. Johnson',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
    ipAddress: '192.168.1.103',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  },
  {
    id: '5',
    userId: 'receptionist1',
    userName: 'Receptionist Brown',
    userRole: 'receptionist',
    action: 'file_uploaded',
    resourceType: 'file',
    resourceId: 'file-001',
    resourceName: 'referral_letter.pdf',
    newValue: {
      id: 'file-001',
      name: 'referral_letter.pdf',
      size: '2.5MB',
      type: 'application/pdf'
    },
    details: 'Referral letter PDF uploaded for patient John Doe',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    ipAddress: '192.168.1.104',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  {
    id: '6',
    userId: 'admin',
    userName: 'Admin User',
    userRole: 'admin',
    action: 'sheet_updated',
    resourceType: 'sheet',
    resourceId: 'Dr. Smith',
    resourceName: 'Dr. Smith',
    details: 'Google Sheet for Dr. Smith was updated with new patient data',
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 1.5 hours ago
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  {
    id: '7',
    userId: 'doctor1',
    userName: 'Dr. Smith',
    userRole: 'doctor',
    action: 'user_logout',
    resourceType: 'system',
    resourceId: 'doctor1',
    resourceName: 'Dr. Smith',
    details: 'Dr. Smith logged out',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  },
  {
    id: '8',
    userId: 'nurse1',
    userName: 'Nurse Williams',
    userRole: 'nurse',
    action: 'patient_updated',
    resourceType: 'patient',
    resourceId: 'patient-004',
    resourceName: 'Sarah Johnson',
    oldValue: { urgencyLevel: 'Low' },
    newValue: { urgencyLevel: 'High' },
    details: 'Patient Sarah Johnson urgency level updated from Low to High',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  {
    id: '9',
    userId: 'admin',
    userName: 'Admin User',
    userRole: 'admin',
    action: 'doctor_created',
    resourceType: 'doctor',
    resourceId: 'doctor3',
    resourceName: 'Dr. Davis',
    newValue: {
      id: 'doctor3',
      name: 'Dr. Davis',
      email: 'davis@medflow.com',
      specialization: 'Cardiology'
    },
    details: 'New doctor Dr. Davis was added to the system',
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(), // 4 hours ago
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  {
    id: '10',
    userId: 'receptionist1',
    userName: 'Receptionist Brown',
    userRole: 'receptionist',
    action: 'patient_deleted',
    resourceType: 'patient',
    resourceId: 'patient-005',
    resourceName: 'Tom Anderson',
    oldValue: {
      id: 'patient-005',
      name: 'Tom Anderson',
      status: 'Rejected'
    },
    details: 'Patient Tom Anderson was deleted from the system',
    timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(), // 5 hours ago
    ipAddress: '192.168.1.104',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
] 