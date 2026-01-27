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
    },
    {
      style: 'font-weight',
      getAttrs: (dom: HTMLElement) => {
        const fontWeight = dom.style.fontWeight
        return /^(bold(er)?|[5-9]\d{2,})$/.test(fontWeight) ? {} : null
      },
    },
  ],
  toDOM: () => {
    return ['strong', 0]
  },
  addCommands: () => ({
    toggleBold: () => () => {
      // Команда для переключения жирного текста
      return true
    },
    setBold: () => () => {
      // Команда для установки жирного текста
      return true
    },
    unsetBold: () => () => {
      // Команда для снятия жирного текста
      return true
    },
  }),
}
