/**
 * Halaxy API module
 * Provides a simple interface for working with Halaxy data
 */

import { HalaxyBridge } from './bridge';

// Patient interfaces
export interface HalaxyPatient {
  resourceType: string;
  id: string;
  name: {
    given: string[];
    family: string;
    text: string;
  }[];
  birthDate: string;
  gender: string;
  telecom: {
    system: string;
    value: string;
    use: string;
  }[];
  address: {
    line: string[];
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }[];
  // Additional fields as needed
}

// Referral interfaces
export interface HalaxyReferral {
  resourceType: string;
  id: string;
  status: string;
  subject: {
    reference: string;
    display: string;
  };
  requester: {
    reference: string;
    display: string;
  };
  recipient: {
    reference: string;
    display: string;
  }[];
  date: string;
  description: string;
  // Additional fields as needed
}

// Response interfaces
export interface HalaxyListResponse<T> {
  resourceType: string;
  type: string;
  total: number;
  link: {
    relation: string;
    url: string;
  }[];
  entry: {
    fullUrl: string;
    resource: T;
  }[];
}

/**
 * Halaxy API class
 * Provides methods for working with Halaxy data
 */
export class HalaxyAPI {
  private bridge: HalaxyBridge;
  
  constructor() {
    this.bridge = new HalaxyBridge();
  }
  
  /**
   * Check if Halaxy integration is properly configured
   */
  isConfigured(): boolean {
    return this.bridge.isConfigured();
  }
  
  /**
   * Test the connection to Halaxy API
   */
  async testConnection() {
    return this.bridge.testConnection();
  }
  
  /**
   * Get patients from Halaxy
   */
  async getPatients(params: {
    limit?: number;
    offset?: number;
    searchTerm?: string;
  } = {}): Promise<HalaxyListResponse<HalaxyPatient>> {
    return this.bridge.getPatients(params);
  }
  
  /**
   * Get a patient by ID
   */
  async getPatient(patientId: string): Promise<HalaxyPatient> {
    return this.bridge.getPatient(patientId);
  }
  
  /**
   * Create a new patient in Halaxy
   */
  async createPatient(patientData: Partial<HalaxyPatient>): Promise<HalaxyPatient> {
    return this.bridge.createPatient(patientData);
  }
  
  /**
   * Update a patient in Halaxy
   */
  async updatePatient(patientId: string, patientData: Partial<HalaxyPatient>): Promise<HalaxyPatient> {
    return this.bridge.updatePatient(patientId, patientData);
  }
  
  /**
   * Get referrals from Halaxy
   */
  async getReferrals(params: {
    limit?: number;
    offset?: number;
    patientId?: string;
  } = {}): Promise<HalaxyListResponse<HalaxyReferral>> {
    return this.bridge.getReferrals(params);
  }
  
  /**
   * Get a referral by ID
   */
  async getReferral(referralId: string): Promise<HalaxyReferral> {
    return this.bridge.getReferral(referralId);
  }
  
  /**
   * Create a new referral in Halaxy
   */
  async createReferral(referralData: Partial<HalaxyReferral>): Promise<HalaxyReferral> {
    return this.bridge.createReferral(referralData);
  }
  
  /**
   * Map a patient from our system to Halaxy format
   */
  mapPatientToHalaxy(patient: any): Partial<HalaxyPatient> {
    return {
      resourceType: 'Patient',
      name: [
        {
          given: [patient.firstName],
          family: patient.lastName,
          text: `${patient.firstName} ${patient.lastName}`
        }
      ],
      birthDate: patient.dateOfBirth,
      gender: patient.gender.toLowerCase(),
      telecom: [
        {
          system: 'phone',
          value: patient.phone,
          use: 'mobile'
        },
        {
          system: 'email',
          value: patient.email,
          use: 'work'
        }
      ],
      address: patient.address ? [
        {
          line: [patient.address.street],
          city: patient.address.city,
          state: patient.address.state,
          postalCode: patient.address.postalCode,
          country: patient.address.country || 'AU'
        }
      ] : []
    };
  }
  
  /**
   * Map a patient from Halaxy format to our system
   */
  mapPatientFromHalaxy(halaxyPatient: HalaxyPatient): any {
    const name = halaxyPatient.name?.[0] || { given: [''], family: '' };
    const address = halaxyPatient.address?.[0] || { line: [''], city: '', state: '', postalCode: '', country: '' };
    const phone = halaxyPatient.telecom?.find(t => t.system === 'phone')?.value || '';
    const email = halaxyPatient.telecom?.find(t => t.system === 'email')?.value || '';
    
    return {
      id: halaxyPatient.id,
      externalId: halaxyPatient.id,
      externalSource: 'halaxy',
      firstName: name.given[0] || '',
      lastName: name.family || '',
      fullName: name.text || `${name.given[0] || ''} ${name.family || ''}`.trim(),
      dateOfBirth: halaxyPatient.birthDate || '',
      gender: halaxyPatient.gender ? halaxyPatient.gender.charAt(0).toUpperCase() + halaxyPatient.gender.slice(1) : '',
      phone,
      email,
      address: {
        street: address.line[0] || '',
        city: address.city || '',
        state: address.state || '',
        postalCode: address.postalCode || '',
        country: address.country || 'AU'
      }
    };
  }
}
