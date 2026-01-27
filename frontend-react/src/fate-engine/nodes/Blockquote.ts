/**
 * Fate Engine - Цитата
 */

import type { FateNodeDefinition } from '../types'

export const Blockquote: FateNodeDefinition = {
  name: 'blockquote',
  group: 'block',
  content: 'block+',
  defining: true,
  parseDOM: [
    {
      tag: 'blockquote',
    },
  ],
  toDOM: () => {
    return ['blockquote', 0]
  },
  addCommands: () => ({
    setBlockquote: () => () => {
      // Команда для установки цитаты
      return true
    },
    toggleBlockquote: () => () => {
      // Команда для переключения цитаты
      return true
    },
    liftBlockquote: () => () => {
      // Команда для снятия цитаты
      return true
    },
  }),
}
