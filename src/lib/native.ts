'use client'

import { useEffect, useState } from 'react'

/**
 * Detecta se o site está rodando DENTRO do app nativo (Capacitor/WebView),
 * lendo o global que o runtime nativo injeta na WebView. Não importa
 * @capacitor/core pra não pesar o bundle web nem arriscar SSR.
 *
 * Usado pela "Rota B": no app nativo escondemos os CTAs de pagamento externo
 * (checkout Hotmart) — a assinatura acontece só no site, fora das lojas.
 */
export function isNativeApp(): boolean {
  if (typeof window === 'undefined') return false
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean; isNative?: boolean } }).Capacitor
  if (!cap) return false
  try {
    return typeof cap.isNativePlatform === 'function' ? cap.isNativePlatform() : !!cap.isNative
  } catch {
    return false
  }
}

/** Hook client-side: false no SSR/primeira pintura, vira true após montar se for app nativo. */
export function useIsNative(): boolean {
  const [native, setNative] = useState(false)
  useEffect(() => {
    setNative(isNativeApp())
  }, [])
  return native
}
