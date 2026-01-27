/**
 * Fate Engine - Стиль текста
 * Базовый класс для стилей текста (используется для Color и FontSize)
 */

import type { FateMarkDefinition } from '../types'

export const TextStyle: FateMarkDefinition = {
  name: 'textStyle',
  parseDOM: [
    {
      style: 'font-family',
    },
    {
      style: 'font-size',
    },
    {
      style: 'font-weight',
    },
  ],
  toDOM: () => {
    return ['span', 0]
  },
}
