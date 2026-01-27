/**
 * Fate Engine - Зачеркивание
 * Метка для зачеркнутого текста
 */

import type { FateMarkDefinition } from '../types'

export const Strikethrough: FateMarkDefinition = {
  name: 'strikethrough',
  parseDOM: [
    {
      tag: 's',
    },
    {
      tag: 'strike',
    },
    {
      tag: 'del',
    },
    {
      style: 'text-decoration',
      getAttrs: (dom: HTMLElement) => {
        return dom.style.textDecoration === 'line-through' ? {} : null
      },
    },
  ],
  toDOM: () => {
    return ['s', 0]
  },
  addCommands: () => ({
    toggleStrikethrough: () => () => {
      // Команда для переключения зачеркивания
      return true
    },
    setStrikethrough: () => () => {
      // Команда для установки зачеркивания
      return true
    },
    unsetStrikethrough: () => () => {
      // Команда для снятия зачеркивания
      return true
    },
  }),
}
