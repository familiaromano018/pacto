import { CATEGORIES, EMOJIS } from '@/components/constants'
import type { CustomCategory } from '@/components/types'

export function allCategoryNames(custom: CustomCategory[]): string[] {
  const customNames = custom.map((c) => c.name)
  return [...CATEGORIES.filter((c) => c !== 'Outros'), ...customNames, 'Outros']
}

export function categoryEmoji(name: string, custom: CustomCategory[]): string {
  if (EMOJIS[name]) return EMOJIS[name]
  const found = custom.find((c) => c.name === name)
  return found?.emoji ?? '📦'
}

export const EMOJI_PICKER_OPTIONS = [
  '🍔', '🍕', '🍣', '🍺', '☕',
  '🚕', '⛽', '🚌', '✈️', '🚲',
  '🏠', '💡', '🛋️', '🧹', '🚿',
  '👕', '👟', '💄', '💇', '💅',
  '🎬', '🎮', '🎵', '📚', '🎁',
  '💊', '🦷', '🏥', '💪', '🧘',
  '🐶', '🐱', '🌱', '🎂', '💰',
  '📱', '💻', '🔌', '🛠️', '📦',
]
