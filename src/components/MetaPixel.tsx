'use client'

import Script from 'next/script'

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '1484532419600656'

/**
 * Meta (Facebook) Pixel — instala script e dispara PageView automático.
 * Pra disparar outros eventos (InitiateCheckout, Purchase, etc), usa o helper
 * `trackPixel(event, params?)` definido abaixo.
 */
export default function MetaPixel() {
  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${PIXEL_ID}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  )
}

/**
 * Dispara evento custom no Meta Pixel.
 * Eventos padrão suportados:
 *  - PageView, ViewContent, AddToCart, InitiateCheckout, Purchase,
 *    Lead, CompleteRegistration, Subscribe, StartTrial
 *
 * Uso: trackPixel('InitiateCheckout', { value: 29.90, currency: 'BRL' })
 */
export function trackPixel(eventName: string, params?: Record<string, any>) {
  if (typeof window === 'undefined') return
  const fbq = (window as any).fbq
  if (typeof fbq !== 'function') return
  if (params) fbq('track', eventName, params)
  else fbq('track', eventName)
}
