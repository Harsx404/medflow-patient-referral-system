import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { ASSETS } from '@/lib/assets'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MedFlow - Patient Referral Dashboard',
  description: 'AI-powered patient referral management system for Grass Tree Group',
  keywords: ['medical', 'referral', 'patient', 'healthcare', 'dashboard'],
  authors: [{ name: 'Grass Tree Group' }],
  creator: 'Grass Tree Group',
  publisher: 'Grass Tree Group',
  icons: {
    icon: ASSETS.ICONS.FAVICON,
    shortcut: ASSETS.ICONS.FAVICON,
    apple: ASSETS.ICONS.APP_ICON_192,
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'MedFlow - Patient Referral Dashboard',
    description: 'AI-powered patient referral management system',
    url: 'https://medflow.grassTreeGroup.com',
    siteName: 'MedFlow',
    images: [
      {
        url: ASSETS.LOGOS.MEDFLOW_PNG,
        width: 1200,
        height: 630,
        alt: 'MedFlow Logo',
      },
    ],
    locale: 'en_AU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MedFlow - Patient Referral Dashboard',
    description: 'AI-powered patient referral management system',
    images: [ASSETS.LOGOS.MEDFLOW_PNG],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload critical assets */}
        <link rel="preload" href={ASSETS.LOGOS.MEDFLOW_MAIN} as="image" />
        <link rel="preload" href={ASSETS.ILLUSTRATIONS.LOADING_MEDICAL} as="image" />
        
        {/* PWA icons */}
        <link rel="apple-touch-icon" sizes="192x192" href={ASSETS.ICONS.APP_ICON_192} />
        <link rel="icon" type="image/png" sizes="512x512" href={ASSETS.ICONS.APP_ICON_512} />
        
        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#2563eb" />
        <meta name="msapplication-TileColor" content="#2563eb" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}