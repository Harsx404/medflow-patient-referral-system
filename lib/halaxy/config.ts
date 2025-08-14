/**
 * Halaxy API configuration
 * Handles loading and providing configuration for Halaxy API integration
 */

// Get environment variables with fallbacks
const getEnv = (key: string, defaultValue = ''): string => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue;
  }
  
  // If running in browser, try localStorage (for testing purposes only)
  if (typeof window !== 'undefined' && window.localStorage) {
    const value = localStorage.getItem(`HALAXY_TEST_${key}`);
    if (value) return value;
  }
  
  return defaultValue;
};

// Configuration interface
export interface HalaxyConfig {
  enabled: boolean;
  clientId: string;
  clientSecret: string;
  region: 'au' | 'eu';
  baseUrl: {
    au: string;
    eu: string;
  };
  vendorName: string;
  vendorEmail: string;
}

// Initialize and export config object
export const halaxyConfig: HalaxyConfig = {
  enabled: getEnv('HALAXY_ENABLED', 'false') === 'true',
  clientId: getEnv('HALAXY_CLIENT_ID', ''),
  clientSecret: getEnv('HALAXY_CLIENT_SECRET', ''),
  region: (getEnv('HALAXY_REGION', 'au') === 'eu' ? 'eu' : 'au'),
  baseUrl: {
    au: 'https://au-api.halaxy.com/main',
    eu: 'https://eu-api.halaxy.com/main'
  },
  vendorName: getEnv('HALAXY_VENDOR_NAME', 'GTG-MED Patient Referral System'),
  vendorEmail: getEnv('HALAXY_VENDOR_EMAIL', 'support@gtg-med.com')
};

/**
 * Initialize the Halaxy configuration with overrides
 * Useful for testing or dynamic configuration changes
 */
export function initializeHalaxy(overrides: Partial<HalaxyConfig> = {}) {
  // Apply overrides
  Object.assign(halaxyConfig, overrides);
  
  return halaxyConfig;
}