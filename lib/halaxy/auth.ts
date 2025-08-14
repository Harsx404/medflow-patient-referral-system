/**
 * Halaxy API Authentication Module
 * Handles authentication with Halaxy API using OAuth client credentials flow
 */

interface AuthConfig {
  clientId: string;
  clientSecret: string;
  region: 'au' | 'eu';
  vendorName: string;
  vendorEmail: string;
}

interface AuthResponse {
  token_type: string;
  expires_in: number;
  access_token: string;
}

export class HalaxyAuth {
  private config: AuthConfig;
  private token: string | null = null;
  private tokenExpiry: Date | null = null;
  
  constructor(config: AuthConfig) {
    this.config = config;
  }
  
  /**
   * Get the API base URL based on region
   * EU and UK use EU server, all others use AU server
   */
  getBaseUrl(): string {
    return this.config.region === 'eu' 
      ? 'https://eu-api.halaxy.com/main'
      : 'https://au-api.halaxy.com/main';
  }
  
  /**
   * Get an access token, refreshing if necessary
   */
  async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.token && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.token;
    }
    
    // Request new token
    return this.requestAccessToken();
  }
  
  /**
   * Request a new access token from Halaxy API
   */
  private async requestAccessToken(): Promise<string> {
    try {
      // Determine endpoint based on region
      const tokenUrl = `https://${this.config.region}-api.halaxy.com/main/oauth/token`;
      
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/fhir+json',
          'Content-Type': 'application/json',
          'User-Agent': `${this.config.vendorName} (${this.config.vendorEmail})`
        },
        body: JSON.stringify({
          grant_type: 'client_credentials',
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret
        })
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Halaxy API authentication failed: ${response.status} ${error}`);
      }
      
      const data: AuthResponse = await response.json();
      
      // Store the token and calculate expiry (15 minutes = 900 seconds)
      // Subtract 60 seconds as buffer to ensure we don't use an expired token
      this.token = data.access_token;
      this.tokenExpiry = new Date(Date.now() + ((data.expires_in - 60) * 1000));
      
      return this.token;
    } catch (error) {
      console.error('Failed to authenticate with Halaxy API:', error);
      throw error;
    }
  }
  
  /**
   * Create headers for Halaxy API requests
   */
  async getRequestHeaders(): Promise<HeadersInit> {
    const token = await this.getAccessToken();
    
    // Check if running in browser (Next.js client component)
    const isBrowser = typeof window !== 'undefined';
    
    // Prepare headers object
    const headers: Record<string, string> = {
      'Accept': 'application/fhir+json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    // Add User-Agent header only on server-side to avoid browser restrictions
    // Browsers don't allow setting User-Agent header in fetch requests
    if (!isBrowser) {
      headers['User-Agent'] = `${this.config.vendorName} (${this.config.vendorEmail})`;
    }
    
    return headers;
  }
}

// Export a singleton instance that will be initialized in the service
let halaxyAuth: HalaxyAuth | null = null;

export const initializeHalaxyAuth = (config: AuthConfig): HalaxyAuth => {
  halaxyAuth = new HalaxyAuth(config);
  return halaxyAuth;
};

export const getHalaxyAuth = (): HalaxyAuth => {
  if (!halaxyAuth) {
    throw new Error('Halaxy Auth not initialized. Call initializeHalaxyAuth first.');
  }
  return halaxyAuth;
};
