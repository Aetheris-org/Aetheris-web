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
      style: 'font-style=italic',
    },
  ],
  toDOM: () => {
    return ['em', 0]
  },
  addCommands: () => ({
    toggleItalic: () => ({ state, dispatch }: any) => {
      // Команда для переключения курсива
      return true
    },
    setItalic: () => ({ state, dispatch }: any) => {
      // Команда для установки курсива
      return true
    },
    unsetItalic: () => ({ state, dispatch }: any) => {
      // Команда для снятия курсива
      return true
    },
  }),
}
