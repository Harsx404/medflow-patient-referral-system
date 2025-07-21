import { Patient, Doctor, LiveUpdate, TimelineEvent } from './store'

export const mockDoctors: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Maria Rodriguez',
    specialization: 'Cardiology',
    availability: true,
    currentPatients: 8,
    responseTime: 45,
    email: 'maria.rodriguez@gtg.com',
    password: 'password123'
  },
  {
    id: '2',
    name: 'Dr. James Chen',
    specialization: 'Neurology',
    availability: true,
    currentPatients: 5,
    responseTime: 32,
    email: 'james.chen@gtg.com',
    password: 'password123'
  },
  {
    id: '3',
    name: 'Dr. Sarah Johnson',
    specialization: 'Orthopedics',
    availability: false,
    currentPatients: 12,
    responseTime: 67,
    email: 'sarah.johnson@gtg.com',
    password: 'password123'
  },
  {
    id: '4',
    name: 'Dr. Michael Brown',
    specialization: 'Dermatology',
    availability: true,
    currentPatients: 3,
    responseTime: 28,
    email: 'michael.brown@gtg.com',
    password: 'password123'
  },
  {
    id: '5',
    name: 'Dr. Emily Davis',
    specialization: 'Psychiatry',
    availability: true,
    currentPatients: 7,
    responseTime: 55,
    email: 'emily.davis@gtg.com',
    password: 'password123'
  },
  {
    id: '6',
    name: 'Dr. Robert Wilson',
    specialization: 'Gastroenterology',
    availability: false,
    currentPatients: 9,
    responseTime: 72,
    email: 'robert.wilson@gtg.com',
    password: 'password123'
  }
]

export const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'Jane Smith',
    age: 38,
    gender: 'Female',
    referringDoctor: 'Dr. A. Patel',
    assignedDoctor: 'Dr. James Chen',
    status: 'Accepted',
    summary: 'Chronic migraines with visual disturbances. Patient reports increased frequency over past 3 months.',
    referralLetter: '/pdfs/jane_smith.pdf',
    timeline: [
      { stage: 'Created', timestamp: '2024-01-15T09:00:00Z' },
      { stage: 'Viewed', timestamp: '2024-01-15T10:15:00Z', doctor: 'Dr. James Chen' },
      { stage: 'Accepted', timestamp: '2024-01-15T11:45:00Z', doctor: 'Dr. James Chen' }
    ],
    createdAt: '2024-01-15T09:00:00Z',
    pdfExtractedData: {
      referrerClinic: 'Patel Family Medicine',
      clinicAddress: '123 Main Street, Sydney NSW 2000',
      phone: '(02) 9555-1234',
      fax: '(02) 9555-1235',
      email: 'admin@patelfm.com.au',
      referralDate: '01/15/2024',
      patientName: 'Jane Smith',
      dateOfBirth: '03/22/1985',
      patientAddress: '456 Oak Avenue, Parramatta NSW 2150',
      patientPhone: '0412 345 678',
      medicareNumber: '2234 56789 0',
      reasonPurpose: 'Chronic migraines with visual disturbances, increased frequency over past 3 months',
      referredTo: 'Neurology Department'
    }
  },
  {
    id: '2',
    name: 'Robert Johnson',
    age: 65,
    gender: 'Male',
    referringDoctor: 'Dr. K. Williams',
    assignedDoctor: 'Dr. Maria Rodriguez',
    status: 'Pending',
    summary: 'Chest pain and shortness of breath. ECG shows irregular rhythm.',
    referralLetter: '/pdfs/robert_johnson.pdf',
    timeline: [
      { stage: 'Created', timestamp: '2024-01-16T14:30:00Z' },
      { stage: 'Viewed', timestamp: '2024-01-16T15:00:00Z', doctor: 'Dr. Maria Rodriguez' }
    ],
    createdAt: '2024-01-16T14:30:00Z',
    pdfExtractedData: {
      referrerClinic: 'Williams Heart Clinic',
      clinicAddress: '789 George Street, Brisbane QLD 4000',
      phone: '(07) 3333-5678',
      fax: '(07) 3333-5679',
      email: 'reception@williamsheart.com.au',
      referralDate: '01/16/2024',
      patientName: 'Robert Johnson',
      dateOfBirth: '11/14/1958',
      patientAddress: '321 Pine Road, Toowong QLD 4066',
      patientPhone: '0423 987 654',
      medicareNumber: '3345 67890 1',
      reasonPurpose: 'Chest pain and shortness of breath, ECG shows irregular rhythm, requires cardiology assessment',
      referredTo: 'Cardiology Department'
    }
  },
  {
    id: '3',
    name: 'Lisa Anderson',
    age: 42,
    gender: 'Female',
    referringDoctor: 'Dr. M. Taylor',
    assignedDoctor: 'Dr. Sarah Johnson',
    status: 'Rejected',
    summary: 'Lower back pain following workplace injury. MRI shows disc herniation.',
    referralLetter: '/pdfs/lisa_anderson.pdf',
    timeline: [
      { stage: 'Created', timestamp: '2024-01-14T11:20:00Z' },
      { stage: 'Viewed', timestamp: '2024-01-14T12:30:00Z', doctor: 'Dr. Sarah Johnson' },
      { stage: 'Rejected', timestamp: '2024-01-14T13:15:00Z', doctor: 'Dr. Sarah Johnson' }
    ],
    createdAt: '2024-01-14T11:20:00Z'
  },
  {
    id: '4',
    name: 'David Miller',
    age: 29,
    gender: 'Male',
    referringDoctor: 'Dr. S. Garcia',
    assignedDoctor: 'Dr. Michael Brown',
    status: 'Accepted',
    summary: 'Persistent skin rash with scaling. Possible psoriasis or eczema.',
    referralLetter: '/pdfs/david_miller.pdf',
    timeline: [
      { stage: 'Created', timestamp: '2024-01-16T08:45:00Z' },
      { stage: 'Viewed', timestamp: '2024-01-16T09:30:00Z', doctor: 'Dr. Michael Brown' },
      { stage: 'Accepted', timestamp: '2024-01-16T10:00:00Z', doctor: 'Dr. Michael Brown' }
    ],
    createdAt: '2024-01-16T08:45:00Z'
  },
  {
    id: '5',
    name: 'Emma Wilson',
    age: 34,
    gender: 'Female',
    referringDoctor: 'Dr. L. Martinez',
    assignedDoctor: 'Dr. Emily Davis',
    status: 'Transferred',
    summary: 'Anxiety and depression symptoms. Patient requesting specialized therapy.',
    referralLetter: '/pdfs/emma_wilson.pdf',
    timeline: [
      { stage: 'Created', timestamp: '2024-01-13T16:00:00Z' },
      { stage: 'Viewed', timestamp: '2024-01-13T17:15:00Z', doctor: 'Dr. Emily Davis' },
      { stage: 'Accepted', timestamp: '2024-01-13T18:00:00Z', doctor: 'Dr. Emily Davis' },
      { stage: 'Transferred', timestamp: '2024-01-14T09:30:00Z', doctor: 'Dr. Emily Davis' }
    ],
    createdAt: '2024-01-13T16:00:00Z'
  },
  {
    id: '6',
    name: 'Thomas Brown',
    age: 56,
    gender: 'Male',
    referringDoctor: 'Dr. R. Lee',
    assignedDoctor: 'Dr. Robert Wilson',
    status: 'Pending',
    summary: 'Chronic abdominal pain and digestive issues. Requires endoscopy.',
    referralLetter: '/pdfs/thomas_brown.pdf',
    timeline: [
      { stage: 'Created', timestamp: '2024-01-16T13:20:00Z' }
    ],
    createdAt: '2024-01-16T13:20:00Z'
  },
  {
    id: '7',
    name: 'Sophie Taylor',
    age: 27,
    gender: 'Female',
    referringDoctor: 'Dr. J. White',
    assignedDoctor: 'Dr. James Chen',
    status: 'Accepted',
    summary: 'Severe headaches with neurological symptoms. History of concussion.',
    referralLetter: '/pdfs/sophie_taylor.pdf',
    timeline: [
      { stage: 'Created', timestamp: '2024-01-15T12:00:00Z' },
      { stage: 'Viewed', timestamp: '2024-01-15T13:45:00Z', doctor: 'Dr. James Chen' },
      { stage: 'Accepted', timestamp: '2024-01-15T14:30:00Z', doctor: 'Dr. James Chen' }
    ],
    createdAt: '2024-01-15T12:00:00Z'
  },
  {
    id: '8',
    name: 'Mark Davis',
    age: 48,
    gender: 'Male',
    referringDoctor: 'Dr. C. Thompson',
    assignedDoctor: 'Dr. Maria Rodriguez',
    status: 'Rejected',
    summary: 'Chest discomfort during exercise. Stress test recommended.',
    referralLetter: '/pdfs/mark_davis.pdf',
    timeline: [
      { stage: 'Created', timestamp: '2024-01-14T10:30:00Z' },
      { stage: 'Viewed', timestamp: '2024-01-14T11:00:00Z', doctor: 'Dr. Maria Rodriguez' },
      { stage: 'Rejected', timestamp: '2024-01-14T11:45:00Z', doctor: 'Dr. Maria Rodriguez' }
    ],
    createdAt: '2024-01-14T10:30:00Z'
  }
]

export const mockLiveUpdates: LiveUpdate[] = [
  {
    id: '1',
    type: 'Accepted',
    patientName: 'David Miller',
    doctorName: 'Dr. Michael Brown',
    timestamp: '2024-01-16T16:45:00Z'
  },
  {
    id: '2',
    type: 'Created',
    patientName: 'Robert Johnson',
    doctorName: 'System',
    timestamp: '2024-01-16T16:30:00Z'
  },
  {
    id: '3',
    type: 'Transferred',
    patientName: 'Emma Wilson',
    doctorName: 'Dr. Emily Davis',
    timestamp: '2024-01-16T16:15:00Z'
  },
  {
    id: '4',
    type: 'Accepted',
    patientName: 'Sophie Taylor',
    doctorName: 'Dr. James Chen',
    timestamp: '2024-01-16T16:00:00Z'
  },
  {
    id: '5',
    type: 'Rejected',
    patientName: 'Mark Davis',
    doctorName: 'Dr. Maria Rodriguez',
    timestamp: '2024-01-16T15:45:00Z'
  },
  {
    id: '6',
    type: 'Created',
    patientName: 'Alice Cooper',
    doctorName: 'System',
    timestamp: '2024-01-16T15:30:00Z'
  },
  {
    id: '7',
    type: 'Accepted',
    patientName: 'John Williams',
    doctorName: 'Dr. Sarah Johnson',
    timestamp: '2024-01-16T15:15:00Z'
  },
  {
    id: '8',
    type: 'Transferred',
    patientName: 'Maria Garcia',
    doctorName: 'Dr. Robert Wilson',
    timestamp: '2024-01-16T15:00:00Z'
  },
  {
    id: '9',
    type: 'Created',
    patientName: 'Peter Thompson',
    doctorName: 'System',
    timestamp: '2024-01-16T14:45:00Z'
  },
  {
    id: '10',
    type: 'Rejected',
    patientName: 'Sarah Mitchell',
    doctorName: 'Dr. Emily Davis',
    timestamp: '2024-01-16T14:30:00Z'
  },
  {
    id: '11',
    type: 'Accepted',
    patientName: 'Kevin Lee',
    doctorName: 'Dr. Maria Rodriguez',
    timestamp: '2024-01-16T14:15:00Z'
  },
  {
    id: '12',
    type: 'Created',
    patientName: 'Jennifer Adams',
    doctorName: 'System',
    timestamp: '2024-01-16T14:00:00Z'
  },
  {
    id: '13',
    type: 'Transferred',
    patientName: 'Michael Scott',
    doctorName: 'Dr. James Chen',
    timestamp: '2024-01-16T13:45:00Z'
  },
  {
    id: '14',
    type: 'Accepted',
    patientName: 'Lisa Wang',
    doctorName: 'Dr. Michael Brown',
    timestamp: '2024-01-16T13:30:00Z'
  },
  {
    id: '15',
    type: 'Created',
    patientName: 'Daniel Rodriguez',
    doctorName: 'System',
    timestamp: '2024-01-16T13:15:00Z'
  }
]