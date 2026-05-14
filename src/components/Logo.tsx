interface LogoProps {
  size?: number
  showWord?: boolean
  wordColor?: string
  className?: string
}

/**
 * Pacto — marca composta.
 * Dois meios-arcos (prata + dourado) se encontrando, com ponto central.
 * showWord=true renderiza wordmark "PACTO" abaixo (lockup vertical).
 */
export function Logo({ size = 96, showWord = true, wordColor }: LogoProps) {
  const id = useUniqueId()
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: size * 0.16 }}>
      <LogoMark size={size} idPrefix={id} />
      {showWord && (
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 400,
            fontSize: size * 0.28,
            letterSpacing: '0.4em',
            color: wordColor ?? 'currentColor',
            textIndent: '0.4em',
            opacity: 0.92,
          }}
        >
          PACTO
        </span>
      )}
    </div>
  )
}

/**
 * Apenas o símbolo (sem wordmark). Use em headers, favicons, áreas pequenas.
 */
export function LogoMark({ size = 32, idPrefix }: { size?: number; idPrefix?: string }) {
  const fallback = useUniqueId()
  const id = idPrefix ?? fallback
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Pacto"
      role="img"
    >
      <defs>
        <linearGradient id={`${id}-silver`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f3f3f5" />
          <stop offset="50%" stopColor="#c5c8cf" />
          <stop offset="100%" stopColor="#7d8088" />
        </linearGradient>
        <linearGradient id={`${id}-gold`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5dca2" />
          <stop offset="50%" stopColor="#d4af6a" />
          <stop offset="100%" stopColor="#a07c3a" />
        </linearGradient>
        <radialGradient id={`${id}-dot`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#f3f3f5" />
          <stop offset="100%" stopColor="#7d8088" />
        </radialGradient>
      </defs>

      {/* Arco esquerdo (prata) — meio círculo top-bottom */}
      <path
        d="M 50 12 A 38 38 0 0 0 50 88"
        stroke={`url(#${id}-silver)`}
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />
      {/* Arco direito (dourado) — meio círculo top-bottom */}
      <path
        d="M 50 12 A 38 38 0 0 1 50 88"
        stroke={`url(#${id}-gold)`}
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />

      {/* Esfera central — ponto de encontro */}
      <circle cx="50" cy="50" r="5" fill={`url(#${id}-dot)`} />
    </svg>
  )
}

let uniqueIdCounter = 0
function useUniqueId() {
  // Cliente-only; gera id único por instância sem precisar useId (compat React 17)
  if (typeof window === 'undefined') return 'pacto-srv'
  uniqueIdCounter += 1
  return `pacto-${uniqueIdCounter}`
}
