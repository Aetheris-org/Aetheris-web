/**
 * Fate Engine - Горизонтальная линия
 * Узел для разделителя
 */

import type { FateNodeDefinition } from '../types'

export const HorizontalRule: FateNodeDefinition = {
  name: 'horizontalRule',
  group: 'block',
  parseDOM: [
    {
      tag: 'hr',
    },
  ],
  toDOM: () => {
    return ['hr']
  },
  addCommands: () => ({
    setHorizontalRule: () => ({ state, dispatch }: any) => {
      // Команда для вставки горизонтальной линии
      return true
    },
  }),
}
