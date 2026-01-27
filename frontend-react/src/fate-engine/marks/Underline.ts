/**
 * Fate Engine - Подчеркивание
 * Метка для подчеркнутого текста
 */

import type { FateMarkDefinition } from '../types'

export const Underline: FateMarkDefinition = {
  name: 'underline',
  parseDOM: [
    {
      tag: 'u',
    },
    {
      style: 'text-decoration',
      getAttrs: (value: string) => {
        return value === 'underline' && null
      },
    },
  ],
  toDOM: () => {
    return ['u', 0]
  },
  addCommands: () => ({
    toggleUnderline: () => ({ state, dispatch }: any) => {
      // Команда для переключения подчеркивания
      return true
    },
    setUnderline: () => ({ state, dispatch }: any) => {
      // Команда для установки подчеркивания
      return true
    },
    unsetUnderline: () => ({ state, dispatch }: any) => {
      // Команда для снятия подчеркивания
      return true
    },
  }),
}
