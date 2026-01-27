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
    toggleBulletList: () => ({ state, dispatch }: any) => {
      // Команда для переключения маркированного списка
      return true
    },
    wrapInBulletList: () => ({ state, dispatch }: any) => {
      // Команда для оборачивания в маркированный список
      return true
    },
  }),
}
