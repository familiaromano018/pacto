// src/lib/theme.ts
// Tema claro/escuro controlado manualmente. Padrão = escuro (identidade do Pacto).
// O CSS resolve via :root[data-theme='light']; aqui só lemos/gravamos a escolha.

export type Theme = 'dark' | 'light'
const KEY = 'pacto-theme'

export function getTheme(): Theme {
  if (typeof document === 'undefined') return 'dark'
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}

export function setTheme(t: Theme) {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.theme = t
  try {
    localStorage.setItem(KEY, t)
  } catch {
    /* ignore */
  }
}
