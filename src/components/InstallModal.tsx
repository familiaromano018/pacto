'use client'

import { useEffect, useState } from 'react'
import { tokens } from '@/lib/tokens'
import { LogoMark } from './Logo'

const DISMISS_KEY = 'casal-no-azul/v1/install-prompt-dismissed-at'
const REMIND_AFTER_DAYS = 7

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/**
 * Modal central que aparece automaticamente quando o user entra logado
 * sem ter o PWA instalado. Esconde se o user dispensou nos últimos 7 dias.
 */
export default function InstallModal() {
  const [open, setOpen] = useState(false)
  const [installed, setInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isSafari, setIsSafari] = useState(false)
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as { standalone?: boolean }).standalone === true
    setInstalled(standalone)
    if (standalone) return

    const ua = navigator.userAgent
    const iOS = /iPad|iPhone|iPod/.test(ua)
    const safari = iOS && /Safari/.test(ua) && !/CriOS|FxiOS/.test(ua)
    setIsIOS(iOS)
    setIsSafari(safari)

    const onBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    const onInstalled = () => { setInstalled(true); setOpen(false) }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)

    // Decide abrir automaticamente após 8s (não intrusivo no primeiro segundo)
    const dismissedAtRaw = localStorage.getItem(DISMISS_KEY)
    const dismissedAt = dismissedAtRaw ? Number(dismissedAtRaw) : 0
    const dismissedRecently = dismissedAt > 0 && Date.now() - dismissedAt < REMIND_AFTER_DAYS * 24 * 60 * 60 * 1000

    // Pra Android, esperamos o evento beforeinstallprompt antes de abrir.
    // Pra iOS Safari, abrimos direto pq não tem evento.
    let timer: number | undefined
    if (!dismissedRecently) {
      if (iOS && safari) {
        timer = window.setTimeout(() => setOpen(true), 8000)
      } else if (!iOS) {
        // Em Android, abre quando deferred chegar (ver outro effect)
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
      if (timer) window.clearTimeout(timer)
    }
  }, [])

  // Em Android, abrir quando o deferred prompt ficar disponível
  useEffect(() => {
    if (!deferred || installed) return
    const dismissedAtRaw = localStorage.getItem(DISMISS_KEY)
    const dismissedAt = dismissedAtRaw ? Number(dismissedAtRaw) : 0
    const dismissedRecently = dismissedAt > 0 && Date.now() - dismissedAt < REMIND_AFTER_DAYS * 24 * 60 * 60 * 1000
    if (dismissedRecently) return
    const t = window.setTimeout(() => setOpen(true), 6000)
    return () => window.clearTimeout(t)
  }, [deferred, installed])

  function dismiss() {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())) } catch {}
    setOpen(false)
  }

  async function install() {
    if (deferred) {
      try {
        await deferred.prompt()
        const choice = await deferred.userChoice
        if (choice.outcome === 'accepted') setInstalled(true)
      } catch {}
      setDeferred(null)
      setOpen(false)
      return
    }
    // iOS Safari não tem prompt — modal já mostra as instruções
  }

  if (installed || !open) return null

  return (
    <div
      onClick={dismiss}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999,
        padding: 20,
        animation: 'cna-fade-in 200ms ease-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: tokens.color.bg_card,
          borderRadius: 20,
          padding: '28px 24px 20px',
          maxWidth: 380,
          width: '100%',
          boxShadow: '0 30px 80px rgba(0,0,0,0.55)',
          border: `1px solid ${tokens.color.border_subtle}`,
          animation: 'cna-modal-pop 280ms cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <div
            style={{
              width: 70, height: 70,
              borderRadius: 18,
              background: '#0b1538',
              display: 'inline-flex',
              alignItems: 'center', justifyContent: 'center',
              marginBottom: 14,
              boxShadow: '0 12px 30px rgba(91,141,255,0.35)',
            }}
          >
            <LogoMark size={42} />
          </div>
          <div style={{ fontSize: 19, fontWeight: 800, color: tokens.color.text_heading, letterSpacing: '-0.01em' }}>
            Use Pacto como app
          </div>
          <div style={{ fontSize: 13, color: tokens.color.text_muted, marginTop: 6, lineHeight: 1.5 }}>
            Tela cheia, ícone na home, sem barra do navegador atrapalhando.
          </div>
        </div>

        {isIOS && isSafari && (
          <ol
            style={{
              paddingLeft: 22,
              margin: '0 0 18px',
              fontSize: 13.5,
              color: tokens.color.text_body,
              lineHeight: 1.7,
            }}
          >
            <li>
              Toque no botão <strong>compartilhar</strong>{' '}
              <span aria-hidden style={{ display: 'inline-flex', verticalAlign: 'middle' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5b8dff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
              </span>{' '}
              no rodapé do Safari.
            </li>
            <li>Role até <strong>Adicionar à Tela de Início</strong>.</li>
            <li>Toque em <strong>Adicionar</strong>.</li>
          </ol>
        )}

        {isIOS && !isSafari && (
          <div
            style={{
              fontSize: 13,
              color: tokens.color.text_body,
              background: tokens.color.bg_app,
              padding: '12px 14px',
              borderRadius: 12,
              marginBottom: 18,
              lineHeight: 1.55,
            }}
          >
            No iPhone, instalar como app só funciona pelo <strong>Safari</strong>. Abra <code style={{ background: tokens.color.bg_card, padding: '1px 6px', borderRadius: 4 }}>pacto-beta.vercel.app</code> no Safari pra continuar.
          </div>
        )}

        {!isIOS && deferred && (
          <div
            style={{
              fontSize: 13,
              color: tokens.color.text_body,
              padding: '0 4px',
              marginBottom: 18,
              lineHeight: 1.55,
            }}
          >
            Toque em <strong>Instalar</strong> abaixo. O navegador vai pedir confirmação.
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={dismiss}
            style={{
              flex: 1,
              background: 'transparent',
              color: tokens.color.text_secondary,
              border: `1.5px solid ${tokens.color.border_default}`,
              borderRadius: 12,
              padding: '12px 0',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Depois
          </button>
          {!isIOS && deferred && (
            <button
              onClick={install}
              style={{
                flex: 2,
                background: '#5b8dff',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                padding: '12px 0',
                fontSize: 14,
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: 'inherit',
                boxShadow: '0 8px 20px rgba(91,141,255,0.4)',
              }}
            >
              Instalar
            </button>
          )}
          {isIOS && isSafari && (
            <button
              onClick={dismiss}
              style={{
                flex: 2,
                background: '#5b8dff',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                padding: '12px 0',
                fontSize: 14,
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Entendi
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
