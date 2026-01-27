/**
 * Fate Engine - Инлайн код
 * Метка для инлайн кода
 */

import type { FateMarkDefinition } from '../types'

export const Code: FateMarkDefinition = {
  name: 'code',
  excludes: 'bold italic underline strikethrough link',
  parseDOM: [
    {
      tag: 'code',
    },
  ],
  toDOM: () => {
    return ['code', 0]
  },
  addCommands: () => ({
    toggleCode: () => () => {
      // Команда для переключения инлайн кода
      return true
    },
    setCode: () => () => {
      // Команда для установки инлайн кода
      return true
    },
    unsetCode: () => () => {
      // Команда для снятия инлайн кода
      return true
    },
  }),
}
