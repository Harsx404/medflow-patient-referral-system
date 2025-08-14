/**
 * Halaxy API Bridge
 * Handles communication between the application and Halaxy API
 */

import { HalaxyAuth } from './auth';
import { halaxyConfig } from './config    const queryString = queryParams.toString();
    const endpoint = `Patient${queryString ? `?${queryString}` : ''}`;
    
    return this.request<import('./api').HalaxyListResponse<import('./api').HalaxyPatient>>(endpoint);import { enhancedLoggingService } from '../enhanced-logging-service';

export class HalaxyBridge {
  private auth: HalaxyAuth;
  
  constructor() {
    this.auth = new HalaxyAuth({
      clientId: halaxyConfig.clientId,
      clientSecret: halaxyConfig.clientSecret,
      region: halaxyConfig.region,
      vendorName: halaxyConfig.vendorName,
      vendorEmail: halaxyConfig.vendorEmail
    });
  }
  
  /**
   * Check if Halaxy integration is properly configured
   */
  isConfigured(): boolean {
    return halaxyConfig.enabled && 
           Boolean(halaxyConfig.clientId) && 
           Boolean(halaxyConfig.clientSecret);
  }
  
  /**
   * Get the base URL for Halaxy API
   */
  getBaseUrl(): string {
    return this.auth.getBaseUrl();
  }
  
  /**
   * Make an authenticated request to the Halaxy API
   */
  async request<T>(
    endpoint: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any
  ): Promise<T> {
    try {
      if (!this.isConfigured()) {
        throw new Error('Halaxy API is not properly configured');
      }
      
      // Get headers with auth token
      const headers = await this.auth.getRequestHeaders();
      
      // Full URL with endpoint
      const url = `${this.getBaseUrl()}/${endpoint.replace(/^\//, '')}`;
      
      // Log the request
      await enhancedLoggingService.logEnhanced({
        action: 'HALAXY_API_REQUEST',
        resourceType: 'API',
        resourceId: endpoint,
        resourceName: `Halaxy API - ${method} ${endpoint}`,
        details: `Making ${method} request to Halaxy API: ${url}`,
        severity: 'low',
        category: 'integration',
        metadata: {
          method,
          url,
          endpoint
        }
      });
      
      // Make the request
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
      });
      
      // Handle errors
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Halaxy API error (${response.status}): ${errorText}`);
      }
      
      // Parse response
      const data = await response.json();
      
      return data as T;
    } catch (error) {
      // Log the error
      await enhancedLoggingService.logSystemError(
        error as Error,
        'HALAXY_API_REQUEST_FAILED',
        {
          endpoint,
          method,
          details: `Error making ${method} request to Halaxy API: ${endpoint}`
        }
      );
      
      throw error;
    }
  }
  
/**
 * Get a list of patients from Halaxy
 */
async getPatients(params: { 
  limit?: number, 
  offset?: number,
  searchTerm?: string
} = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.limit) {
    queryParams.append('_count', params.limit.toString());
  }
  
  if (params.offset) {
    queryParams.append('_offset', params.offset.toString());
  }
  
  if (params.searchTerm) {
    queryParams.append('name', params.searchTerm);
  }
  
  const queryString = queryParams.toString();
  const endpoint = `Patient${queryString ? `?${queryString}` : ''}`;
  
  return this.request<import('./api').HalaxyListResponse<import('./api').HalaxyPatient>>(endpoint);
}  /**
   * Get a patient by ID
   */
  async getPatient(patientId: string) {
    return this.request<import('./api').HalaxyPatient>(`Patient/${patientId}`);
  }
  
  /**
   * Create a new patient in Halaxy
   */
  async createPatient(patientData: any) {
    return this.request<import('./api').HalaxyPatient>('Patient', 'POST', patientData);
  }
  
  /**
   * Update a patient in Halaxy
   */
  async updatePatient(patientId: string, patientData: any) {
    return this.request<import('./api').HalaxyPatient>(`Patient/${patientId}`, 'PUT', patientData);
  }
  
  /**
   * Get a list of referrals from Halaxy
   */
  async getReferrals(params: { 
    limit?: number, 
    offset?: number,
    patientId?: string
  } = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.limit) {
      queryParams.append('_count', params.limit.toString());
    }
    
    if (params.offset) {
      queryParams.append('_offset', params.offset.toString());
    }
    
    if (params.patientId) {
      queryParams.append('patient', params.patientId);
    }
    
    const queryString = queryParams.toString();
    const endpoint = `Referral${queryString ? `?${queryString}` : ''}`;
    
    return this.request<import('./api').HalaxyListResponse<import('./api').HalaxyReferral>>(endpoint);
  }
  
  /**
   * Get a referral by ID
   */
  async getReferral(referralId: string) {
    return this.request<import('./api').HalaxyReferral>(`Referral/${referralId}`);
  }
  
  /**
   * Create a new referral in Halaxy
   */
  async createReferral(referralData: any) {
    return this.request<import('./api').HalaxyReferral>('Referral', 'POST', referralData);
  }
  
  /**
   * Test the Halaxy connection
   * Returns the API info if successful
   */
  async testConnection() {
    try {
      // Get auth token
      const token = await this.auth.getAccessToken();
      
      // Get headers
      const headers = await this.auth.getRequestHeaders();
      
      // Return masked token for verification
      const maskedToken = token.substring(0, 10) + '...' + token.substring(token.length - 5);
      
      // Try a simple GET request to validate the token
      const metadataResponse = await fetch(`${this.getBaseUrl()}/metadata`, {
        method: 'GET',
        headers
      });
      
      const metadataStatus = metadataResponse.status;
      let metadataOk = metadataResponse.ok;
      let metadataText = '';
      
      try {
        metadataText = await metadataResponse.text();
      } catch (err) {
        metadataText = 'Could not read response';
      }
      
      return {
        success: true,
        message: 'Successfully authenticated with Halaxy API',
        config: {
          region: halaxyConfig.region,
          baseUrl: this.getBaseUrl(),
          vendorName: halaxyConfig.vendorName,
          vendorEmail: halaxyConfig.vendorEmail
        },
        auth: {
          tokenReceived: true,
          tokenPreview: maskedToken,
          headers: {
            accept: typeof headers === 'object' ? (headers as Record<string, string>)['Accept'] : 'unknown',
            contentType: typeof headers === 'object' ? (headers as Record<string, string>)['Content-Type'] : 'unknown',
            userAgent: typeof headers === 'object' ? (headers as Record<string, string>)['User-Agent'] : 'unknown'
          }
        },
        testRequest: {
          url: `${this.getBaseUrl()}/metadata`,
          status: metadataStatus,
          success: metadataOk,
          response: metadataText.substring(0, 200) + (metadataText.length > 200 ? '...' : '')
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Error connecting to Halaxy API: ${(error as Error).message}`,
        error: error as Error
      };
    }
  }
}
