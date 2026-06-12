/**
 * Transcrição de áudio via Groq (Whisper) — API compatível com OpenAI.
 * Notas de voz do WhatsApp chegam em OGG/Opus; o Whisper aceita direto.
 * Env: GROQ_API_KEY.
 */

export async function transcribeAudio(base64: string, mimetype?: string): Promise<string | null> {
  const key = process.env.GROQ_API_KEY
  if (!key) {
    console.warn('[whatsapp] GROQ_API_KEY ausente — não dá pra transcrever áudio')
    return null
  }
  try {
    const bytes = Buffer.from(base64, 'base64')
    const type = (mimetype || 'audio/ogg').split(';')[0]
    const ext = type.includes('mp4') || type.includes('m4a')
      ? 'm4a'
      : type.includes('mpeg') || type.includes('mp3')
        ? 'mp3'
        : type.includes('wav')
          ? 'wav'
          : 'ogg'

    const form = new FormData()
    form.append('file', new Blob([bytes], { type }), `audio.${ext}`)
    form.append('model', 'whisper-large-v3-turbo')
    form.append('language', 'pt')
    form.append('response_format', 'json')

    const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}` },
      body: form,
    })
    if (!res.ok) {
      console.error('[whatsapp] Groq transcribe', res.status, (await res.text().catch(() => '')).slice(0, 200))
      return null
    }
    const data = await res.json()
    return typeof data.text === 'string' ? data.text.trim() : null
  } catch (err) {
    console.error('[whatsapp] transcribeAudio erro', err)
    return null
  }
}
