/**
 * Fate Engine - Жирный текст
 * Метка для жирного форматирования
 */

import type { FateMarkDefinition } from '../types'

export const Bold: FateMarkDefinition = {
  name: 'bold',
  parseDOM: [
    {
      tag: 'strong',
    },
    {
      tag: 'b',
      getAttrs: () => ({ style: 'font-weight' }),
    },
    {
      style: 'font-weight',
      getAttrs: (value: string) => {
        return /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null
      },
    },
  ],
  toDOM: () => {
    return ['strong', 0]
  },
  addCommands: () => ({
    toggleBold: () => ({ state, dispatch }: any) => {
      // Команда для переключения жирного текста
      return true
    },
    setBold: () => ({ state, dispatch }: any) => {
      // Команда для установки жирного текста
      return true
    },
    unsetBold: () => ({ state, dispatch }: any) => {
      // Команда для снятия жирного текста
      return true
    },
  }),
}
