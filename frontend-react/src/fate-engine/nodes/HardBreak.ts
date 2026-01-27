/**
 * Fate Engine - Жесткий перенос строки
 * Узел для принудительного переноса строки
 */

import type { FateNodeDefinition } from '../types'

export const HardBreak: FateNodeDefinition = {
  name: 'hardBreak',
  group: 'inline',
  inline: true,
  selectable: false,
  parseDOM: [
    {
      tag: 'br',
    },
  ],
  toDOM: () => {
    return ['br']
  },
  addCommands: () => ({
    setHardBreak: () => ({ state, dispatch }: any) => {
      // Команда для вставки переноса строки
      return true
    },
  }),
}
