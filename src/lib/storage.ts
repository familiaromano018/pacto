'use client'

import { useEffect, useRef, useState } from 'react'

const PREFIX = 'casal-no-azul/v1/'

export function useLocalState<T>(key: string, initial: T) {
  const fullKey = PREFIX + key
  const [value, setValue] = useState<T>(initial)
  const hydrated = useRef(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(fullKey)
      if (raw != null) setValue(JSON.parse(raw) as T)
    } catch {}
    hydrated.current = true
  }, [fullKey])

  useEffect(() => {
    if (!hydrated.current) return
    try {
      localStorage.setItem(fullKey, JSON.stringify(value))
    } catch {}
  }, [fullKey, value])

  return [value, setValue] as const
}

export function clearAllLocalState() {
  try {
    const toRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith(PREFIX)) toRemove.push(k)
    }
    toRemove.forEach((k) => localStorage.removeItem(k))
  } catch {}
}
