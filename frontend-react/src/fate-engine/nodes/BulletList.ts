/**
 * Fate Engine - Маркированный список
 */

import type { FateNodeDefinition } from '../types'

export const BulletList: FateNodeDefinition = {
  name: 'bulletList',
  group: 'block',
  content: 'listItem+',
  parseDOM: [
    {
      tag: 'ul',
    },
  ],
  toDOM: () => {
    return ['ul', 0]
  },
  addCommands: () => ({
    toggleBulletList: () => () => {
      // Команда для переключения маркированного списка
      return true
    },
    wrapInBulletList: () => () => {
      // Команда для оборачивания в маркированный список
      return true
    },
  }),
}
