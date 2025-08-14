'use client'

import Link from 'next/link'
import { Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePathname } from 'next/navigation'

interface HomeButtonProps {
  variant?: 'default' | 'outline' | 'ghost'
  className?: string
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showLabel?: boolean
}

export function HomeButton({ 
  variant = 'outline', 
  className = '',
  size = 'default',
  showLabel = true
}: HomeButtonProps) {
  const pathname = usePathname()
  
  // Don't show on home page
  if (pathname === '/') {
    return null
  }

  return (
    <Link href="/" className={className}>
      <Button variant={variant} size={size}>
        <Home className="h-4 w-4 mr-2" />
        {showLabel && "Home"}
      </Button>
    </Link>
  )
}
