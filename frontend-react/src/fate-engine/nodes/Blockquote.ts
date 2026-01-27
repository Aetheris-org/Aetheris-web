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
    setBlockquote: () => ({ state, dispatch }: any) => {
      // Команда для установки цитаты
      return true
    },
    toggleBlockquote: () => ({ state, dispatch }: any) => {
      // Команда для переключения цитаты
      return true
    },
    liftBlockquote: () => ({ state, dispatch }: any) => {
      // Команда для снятия цитаты
      return true
    },
  }),
}
