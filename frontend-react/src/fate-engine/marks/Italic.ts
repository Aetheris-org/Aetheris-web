/**
 * Fate Engine - Курсив
 * Метка для курсивного форматирования
 */

import type { FateMarkDefinition } from '../types'

export const Italic: FateMarkDefinition = {
  name: 'italic',
  parseDOM: [
    {
      tag: 'em',
    },
    {
      tag: 'i',
    },
    {
      style: 'font-style',
      getAttrs: (dom: HTMLElement) => {
        return dom.style.fontStyle === 'italic' ? {} : null
      },
    },
  ],
  toDOM: () => {
    return ['em', 0]
  },
  addCommands: () => ({
    toggleItalic: () => () => {
      // Команда для переключения курсива
      return true
    },
    setItalic: () => () => {
      // Команда для установки курсива
      return true
    },
    unsetItalic: () => () => {
      // Команда для снятия курсива
      return true
    },
  }),
}
