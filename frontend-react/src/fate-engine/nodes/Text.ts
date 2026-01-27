/**
 * Fate Engine - Текстовый узел
 * Базовый узел для текстового содержимого
 */

import type { FateNodeDefinition } from '../types'

export const Text: FateNodeDefinition = {
  name: 'text',
  group: 'inline',
  inline: true,
  parseDOM: [
    {
      tag: '#text',
    },
  ],
  toDOM: (node) => {
    return node.text || ''
  },
}
