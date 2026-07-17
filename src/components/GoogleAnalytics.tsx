'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'
import { isNativeApp } from '@/lib/native'

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

export default function GoogleAnalytics() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!GA_ID) return null
  // Rota B: não carrega dentro do app nativo (Capacitor) — ver MetaPixel.
  if (!mounted || isNativeApp()) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  )
}

export function trackGA(eventName: string, params?: Record<string, any>) {
  if (typeof window === 'undefined') return
  const gtag = (window as any).gtag
  if (typeof gtag !== 'function') return
  gtag('event', eventName, params || {})
}
