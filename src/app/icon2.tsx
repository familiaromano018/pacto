import { ImageResponse } from 'next/og'

export const size = { width: 512, height: 512 }
export const contentType = 'image/png'

export default function Icon512() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0b1538',
        }}
      >
        <svg width="400" height="400" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="s" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f3f3f5" />
              <stop offset="100%" stopColor="#7d8088" />
            </linearGradient>
            <linearGradient id="g" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f5dca2" />
              <stop offset="100%" stopColor="#a07c3a" />
            </linearGradient>
          </defs>
          <path d="M 50 12 A 38 38 0 0 0 50 88" stroke="url(#s)" strokeWidth="10" strokeLinecap="round" fill="none" />
          <path d="M 50 12 A 38 38 0 0 1 50 88" stroke="url(#g)" strokeWidth="10" strokeLinecap="round" fill="none" />
          <circle cx="50" cy="50" r="6" fill="#e0e0e6" />
        </svg>
      </div>
    ),
    size,
  )
}
