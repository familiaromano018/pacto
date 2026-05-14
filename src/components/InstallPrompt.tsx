'use client'

import { useEffect, useState } from 'react'
import { tokens } from '@/lib/tokens'
import { LogoMark } from './Logo'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/**
 * Card "Instalar como app" — esconde se já tá rodando como PWA.
 * - Android/Chrome: captura beforeinstallprompt e dispara prompt nativo no clique.
 * - iOS Safari: abre um modal com instruções visuais (Apple não tem prompt programático).
 */
export default function InstallPrompt() {
  const [installed, setInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandaloneCapable, setIsStandaloneCapable] = useState(false)
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [iosHelpOpen, setIosHelpOpen] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as { standalone?: boolean }).standalone === true
    setInstalled(standalone)

    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(iOS)
    // No iOS, só dá pra instalar pelo Safari (nem Chrome iOS suporta).
    const isSafari = iOS && /Safari/.test(navigator.userAgent) && !/CriOS|FxiOS/.test(navigator.userAgent)
    setIsStandaloneCapable(iOS ? isSafari : true)

    const onBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    const onInstalled = () => setInstalled(true)

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (installed) return null
  // Esconde quando não dá pra instalar (ex: desktop normal sem beforeinstallprompt + não-iOS)
  if (!isIOS && !deferred) return null

  async function handleInstall() {
    if (deferred) {
      try {
        await deferred.prompt()
        const choice = await deferred.userChoice
        if (choice.outcome === 'accepted') setInstalled(true)
      } catch {}
      setDeferred(null)
      return
    }
    if (isIOS && isStandaloneCapable) {
      setIosHelpOpen(true)
    }
  }

  return (
    <>
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(91,141,255,0.14) 0%, rgba(91,141,255,0.04) 100%)',
          border: '1.5px solid rgba(91,141,255,0.35)',
          borderRadius: tokens.primitive.radius.lg,
          padding: '18px 18px',
          marginBottom: tokens.primitive.space[7],
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <div
          style={{
            width: 46, height: 46,
            borderRadius: 12,
            background: '#0b1538',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <LogoMark size={28} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: tokens.color.text_heading }}>
            Use Pacto como app
          </div>
          <div style={{ fontSize: 12, color: tokens.color.text_muted, marginTop: 2, lineHeight: 1.4 }}>
            {isIOS && !isStandaloneCapable
              ? 'Abra esta página no Safari pra instalar.'
              : 'Tela cheia, ícone na tela inicial, sem barra do navegador.'}
          </div>
        </div>
        <button
          onClick={handleInstall}
          disabled={isIOS && !isStandaloneCapable}
          style={{
            background: '#5b8dff',
            color: '#fff',
            border: 'none',
            padding: '9px 14px',
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 700,
            cursor: isIOS && !isStandaloneCapable ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            opacity: isIOS && !isStandaloneCapable ? 0.5 : 1,
            flexShrink: 0,
            letterSpacing: '0.02em',
          }}
        >
          Instalar
        </button>
      </div>

      {iosHelpOpen && (
        <div
          onClick={() => setIosHelpOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: tokens.color.bg_card,
              borderRadius: 18,
              padding: '28px 24px',
              maxWidth: 360,
              width: '100%',
              boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: 18 }}>
              <LogoMark size={48} />
              <div style={{ fontSize: 18, fontWeight: 700, color: tokens.color.text_heading, marginTop: 12 }}>
                Instale Pacto no iPhone
              </div>
            </div>
            <ol style={{ paddingLeft: 18, fontSize: 14, color: tokens.color.text_body, lineHeight: 1.65, margin: '0 0 18px' }}>
              <li>
                Toque no botão <strong style={{ color: tokens.color.text_heading }}>compartilhar</strong> abaixo (
                <span aria-hidden style={{ display: 'inline-flex', verticalAlign: 'middle' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={tokens.color.brand} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
                    <polyline points="16 6 12 2 8 6" />
                    <line x1="12" y1="2" x2="12" y2="15" />
                  </svg>
                </span>
                ).
              </li>
              <li>Role pra baixo até <strong style={{ color: tokens.color.text_heading }}>Adicionar à Tela de Início</strong>.</li>
              <li>Confirme em <strong style={{ color: tokens.color.text_heading }}>Adicionar</strong>.</li>
            </ol>
            <div
              style={{
                fontSize: 12,
                color: tokens.color.text_muted,
                background: tokens.color.bg_app,
                padding: '10px 12px',
                borderRadius: 10,
                marginBottom: 18,
                lineHeight: 1.5,
              }}
            >
              💡 Não acha a opção? Role todo o menu até o final e toque em <strong>Editar Ações…</strong> pra ativá-la.
            </div>
            <button
              onClick={() => setIosHelpOpen(false)}
              style={{
                width: '100%',
                background: '#5b8dff',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                padding: '13px 0',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  )
}
