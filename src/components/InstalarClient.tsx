'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/Logo'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type Platform = 'android' | 'ios-safari' | 'ios-other' | 'desktop' | 'unknown'

const SITE = 'pacto-app.tec.br'

export default function InstalarClient() {
  const [platform, setPlatform] = useState<Platform>('unknown')
  const [installed, setInstalled] = useState(false)
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const ua = navigator.userAgent
    const isIOS = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    const isAndroid = /android/i.test(ua)
    const isSafari = /safari/i.test(ua) && !/crios|fxios|chrome|android/i.test(ua)
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as { standalone?: boolean }).standalone === true

    setInstalled(standalone)
    if (isAndroid) setPlatform('android')
    else if (isIOS) setPlatform(isSafari ? 'ios-safari' : 'ios-other')
    else setPlatform('desktop')

    const onBIP = (e: Event) => { e.preventDefault(); setDeferred(e as BeforeInstallPromptEvent) }
    const onInstalled = () => setInstalled(true)
    window.addEventListener('beforeinstallprompt', onBIP)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBIP)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  async function install() {
    if (!deferred) return
    await deferred.prompt()
    setDeferred(null)
  }

  function copyUrl() {
    navigator.clipboard?.writeText(`https://${SITE}`).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    }).catch(() => {})
  }

  return (
    <main style={{ background: '#0b0b10', color: '#f4f4f6', minHeight: '100vh' }}>
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center' }}>
          <Link href="/" style={{ textDecoration: 'none' }}><Logo size={30} wordColor="#f4f4f6" /></Link>
          <Link href="/" style={{ marginLeft: 'auto', color: '#a0a3ad', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>← Início</Link>
        </div>
      </header>

      <section style={{ maxWidth: 560, margin: '0 auto', padding: '56px 24px 80px' }}>
        <h1 style={{ fontSize: 'clamp(28px,5vw,40px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, color: '#fff', textAlign: 'center', margin: 0 }}>
          Instale o Pacto no seu celular
        </h1>
        <p style={{ fontSize: 17, color: '#a0a3ad', lineHeight: 1.55, textAlign: 'center', marginTop: 16 }}>
          Vira um app de verdade na sua tela inicial — abre rápido e funciona como qualquer outro.
        </p>

        <div style={{ marginTop: 40 }}>
          {installed ? (
            <Card>
              <Big>🎉</Big>
              <H>O Pacto já está instalado!</H>
              <P>Procure o ícone do Pacto na sua tela inicial. Se quiser, <Link href="/app" style={linkStyle}>abra o app agora</Link>.</P>
            </Card>
          ) : platform === 'android' ? (
            <Card>
              <Big>🤖</Big>
              <H>No Android</H>
              {deferred ? (
                <>
                  <P>É só um toque:</P>
                  <button onClick={install} style={primaryBtn}>📲 Instalar o Pacto</button>
                </>
              ) : (
                <Steps
                  items={[
                    'Toque no menu do navegador (⋮ no canto superior).',
                    'Escolha "Instalar app" ou "Adicionar à tela inicial".',
                    'Confirme. Pronto — o Pacto aparece na sua tela.',
                  ]}
                />
              )}
            </Card>
          ) : platform === 'ios-safari' ? (
            <Card>
              <Big>🍎</Big>
              <H>No iPhone (Safari)</H>
              <Steps
                items={[
                  'Toque no botão Compartilhar — o quadradinho com a seta ↑ na barra do Safari.',
                  'Role e toque em "Adicionar à Tela de Início".',
                  'Toque em "Adicionar". Pronto — o Pacto vira um app na sua tela.',
                ]}
              />
            </Card>
          ) : platform === 'ios-other' ? (
            <Card>
              <Big>🧭</Big>
              <H>Abra no Safari</H>
              <P>No iPhone, instalar como app só funciona pelo <strong style={{ color: '#fff' }}>Safari</strong>. Copie o endereço, abra no Safari e volte aqui:</P>
              <button onClick={copyUrl} style={primaryBtn}>{copied ? '✓ Copiado!' : `Copiar ${SITE}`}</button>
            </Card>
          ) : (
            <Card>
              <Big>💻</Big>
              <H>No computador</H>
              <P>No Chrome ou Edge, clique no ícone de instalar (⊕) que aparece no fim da barra de endereço — ou abra <strong style={{ color: '#fff' }}>{SITE}</strong> no celular pra usar como app.</P>
            </Card>
          )}
        </div>

        <div style={{ marginTop: 28, textAlign: 'center' }}>
          <Link href="/app" style={{ color: '#5b8dff', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            Prefere usar pelo navegador? Abrir o Pacto →
          </Link>
        </div>
      </section>
    </main>
  )
}

const linkStyle: React.CSSProperties = { color: '#5b8dff', textDecoration: 'underline' }
const primaryBtn: React.CSSProperties = {
  display: 'inline-block', width: '100%', marginTop: 18,
  background: '#5b8dff', color: '#fff', border: 'none',
  padding: '15px 24px', borderRadius: 12, fontSize: 16, fontWeight: 700,
  fontFamily: 'inherit', cursor: 'pointer',
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '36px 30px', textAlign: 'center' }}>
      {children}
    </div>
  )
}
function Big({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 48, marginBottom: 12 }}>{children}</div>
}
function H({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>{children}</h2>
}
function P({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 15, color: '#a0a3ad', lineHeight: 1.6, marginTop: 12 }}>{children}</p>
}
function Steps({ items }: { items: string[] }) {
  return (
    <ol style={{ listStyle: 'none', counterReset: 'step', padding: 0, margin: '20px 0 0', textAlign: 'left' }}>
      {items.map((t, i) => (
        <li key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 16 }}>
          <span
            style={{
              flexShrink: 0, width: 28, height: 28, borderRadius: '50%',
              background: 'rgba(91,141,255,0.15)', color: '#5b8dff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700,
            }}
          >
            {i + 1}
          </span>
          <span style={{ fontSize: 15, color: '#cacace', lineHeight: 1.55, paddingTop: 3 }}>{t}</span>
        </li>
      ))}
    </ol>
  )
}
