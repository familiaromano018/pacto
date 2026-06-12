'use client'

import { useState } from 'react'

/**
 * Embed leve do YouTube (facade): mostra poster + botão de play e só carrega
 * o iframe pesado no clique — não estoura o LCP. Usa youtube-nocookie.
 */
export default function YouTubeLite({ id, poster, title }: { id: string; poster: string; title: string }) {
  const [play, setPlay] = useState(false)

  if (play) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
      />
    )
  }

  return (
    <button
      type="button"
      onClick={() => setPlay(true)}
      aria-label={`Reproduzir: ${title}`}
      className="pl-yt"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`}
        alt=""
        onError={(e) => {
          const t = e.currentTarget
          if (t.dataset.fb === '2') return
          if (!t.dataset.fb) { t.dataset.fb = '1'; t.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg` }
          else { t.dataset.fb = '2'; t.src = poster }
        }}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <span className="pl-yt-veil" aria-hidden />
      <span className="pl-yt-play" aria-hidden>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
      </span>
    </button>
  )
}
