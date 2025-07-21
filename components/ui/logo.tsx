"use client"

import Image from 'next/image'
import { useTheme } from 'next-themes'
import { ASSETS, getLogoPath, IMAGE_SIZES } from '@/lib/assets'
import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'small' | 'medium' | 'large'
  className?: string
  priority?: boolean
  variant?: 'auto' | 'light' | 'dark'
}

export function Logo({ 
  size = 'medium', 
  className, 
  priority = false,
  variant = 'auto' 
}: LogoProps) {
  const { theme } = useTheme()
  
  // Determine which logo to use based on theme and variant
  const getLogoSrc = () => {
    if (variant !== 'auto') {
      return getLogoPath(variant)
    }
    
    // Auto-detect based on current theme
    if (theme === 'dark') {
      return ASSETS.LOGOS.MEDFLOW_LIGHT // Use light logo on dark background
    } else if (theme === 'light') {
      return ASSETS.LOGOS.MEDFLOW_DARK // Use dark logo on light background
    }
    
    // Default fallback
    return ASSETS.LOGOS.MEDFLOW_MAIN
  }

  const logoSize = IMAGE_SIZES.LOGO[size.toUpperCase() as keyof typeof IMAGE_SIZES.LOGO]

  return (
    <div className={cn("flex items-center", className)}>
      <Image
        src={getLogoSrc()}
        alt="MedFlow - Patient Referral Dashboard"
        width={logoSize.width}
        height={logoSize.height}
        priority={priority}
        className="object-contain"
        onError={(e) => {
          // Fallback to PNG version if SVG fails
          const target = e.target as HTMLImageElement
          target.src = ASSETS.LOGOS.MEDFLOW_PNG
        }}
      />
    </div>
  )
}

// Specialized logo variants for common use cases
export function NavigationLogo({ className }: { className?: string }) {
  return (
    <Logo 
      size="medium" 
      priority={true}
      className={className}
    />
  )
}

export function FooterLogo({ className }: { className?: string }) {
  return (
    <Logo 
      size="small"
      className={className}
    />
  )
}

export function HeroLogo({ className }: { className?: string }) {
  return (
    <Logo 
      size="large"
      priority={true}
      className={className}
    />
  )
} 