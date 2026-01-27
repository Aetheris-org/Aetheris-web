/**
 * Fate Engine - Параграф
 * Базовый блоковый узел для текста
 */

import type { FateNodeDefinition } from '../types'

export const Paragraph: FateNodeDefinition = {
  name: 'paragraph',
  group: 'block',
  content: 'inline*',
  parseDOM: [
    {
      tag: 'p',
    },
  ],
  toDOM: () => {
    return ['p', 0]
  },
  addCommands: () => ({
    setParagraph: () => ({ state, dispatch }: any) => {
      // Команда для установки параграфа
      return true
    },
  }),
}
