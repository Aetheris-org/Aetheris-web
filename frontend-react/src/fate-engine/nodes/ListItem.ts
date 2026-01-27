/**
 * Fate Engine - Элемент списка
 */

import type { FateNodeDefinition } from '../types'

export const ListItem: FateNodeDefinition = {
  name: 'listItem',
  content: 'paragraph block+',
  defining: true,
  parseDOM: [
    {
      tag: 'li',
    },
  ],
  toDOM: () => {
    return ['li', 0]
  },
}
