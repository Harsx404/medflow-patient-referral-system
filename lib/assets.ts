// Assets configuration and helper functions
// Centralized asset path management for the MedFlow application

export const ASSETS = {
  // Logos
  LOGOS: {
    MEDFLOW_MAIN: '/assets/logos/medflow-logo.svg',
    MEDFLOW_DARK: '/assets/logos/medflow-logo-dark.svg',
    MEDFLOW_LIGHT: '/assets/logos/medflow-logo-light.svg',
    MEDFLOW_PNG: '/assets/logos/medflow-logo.png',
    GRASS_TREE_GROUP: '/assets/logos/grass-tree-group-logo.png',
  },

  // Icons
  ICONS: {
    FAVICON: '/assets/icons/favicon.ico',
    APP_ICON_192: '/assets/icons/app-icon-192x192.png',
    APP_ICON_512: '/assets/icons/app-icon-512x512.png',
    STETHOSCOPE: '/assets/icons/stethoscope.svg',
    MEDICAL_CHART: '/assets/icons/medical-chart.svg',
    UPLOAD: '/assets/icons/upload.svg',
  },

  // Images
  IMAGES: {
    HERO_BACKGROUND: '/assets/images/medical-hero-bg.jpg',
    PATIENT_CARD_BG: '/assets/images/patient-card-background.jpg',
    MEDICAL_TEAM: '/assets/images/medical-team.jpg',
    HOSPITAL_INTERIOR: '/assets/images/hospital-interior.jpg',
  },

  // Illustrations
  ILLUSTRATIONS: {
    EMPTY_STATE_PATIENTS: '/assets/illustrations/empty-state-no-patients.svg',
    LOADING_MEDICAL: '/assets/illustrations/loading-medical-animation.svg',
    ERROR_ILLUSTRATION: '/assets/illustrations/error-illustration.svg',
    SUCCESS_CHECKMARK: '/assets/illustrations/success-checkmark.svg',
    PDF_UPLOAD: '/assets/illustrations/pdf-upload.svg',
    DOCTOR_CONSULTATION: '/assets/illustrations/doctor-consultation.svg',
  }
} as const

// Helper function to get asset path with fallback
export function getAssetPath(path: string, fallback?: string): string {
  return path || fallback || '/assets/images/placeholder.png'
}

// Helper function to get logo based on theme
export function getLogoPath(theme: 'light' | 'dark' | 'auto' = 'auto'): string {
  switch (theme) {
    case 'light':
      return ASSETS.LOGOS.MEDFLOW_LIGHT
    case 'dark':
      return ASSETS.LOGOS.MEDFLOW_DARK
    default:
      return ASSETS.LOGOS.MEDFLOW_MAIN
  }
}

// Helper function to get responsive image props
export function getImageProps(src: string, alt: string, width?: number, height?: number) {
  return {
    src: getAssetPath(src),
    alt,
    width,
    height,
    loading: 'lazy' as const,
  }
}

// Common image sizes for consistency
export const IMAGE_SIZES = {
  LOGO: {
    SMALL: { width: 80, height: 30 },
    MEDIUM: { width: 120, height: 40 },
    LARGE: { width: 200, height: 60 },
  },
  ICON: {
    SMALL: { width: 16, height: 16 },
    MEDIUM: { width: 24, height: 24 },
    LARGE: { width: 32, height: 32 },
  },
  CARD: {
    THUMBNAIL: { width: 150, height: 100 },
    SMALL: { width: 300, height: 200 },
    MEDIUM: { width: 600, height: 400 },
  }
} as const

// Asset validation helper
export function validateAssetPath(path: string): boolean {
  return path.startsWith('/assets/') && path.length > 8
}

// Get all assets for preloading
export function getPreloadAssets(): string[] {
  return [
    ASSETS.LOGOS.MEDFLOW_MAIN,
    ASSETS.ICONS.FAVICON,
    ASSETS.ILLUSTRATIONS.LOADING_MEDICAL,
  ]
} 