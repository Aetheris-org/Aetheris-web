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
      getAttrs: (dom: HTMLElement) => {
        const style = dom.style.textDecoration
        return style === 'underline' ? {} : null
      },
    },
  ],
  toDOM: () => {
    return ['u', 0]
  },
  addCommands: () => ({
    toggleUnderline: () => () => {
      // Команда для переключения подчеркивания
      return true
    },
    setUnderline: () => () => {
      // Команда для установки подчеркивания
      return true
    },
    unsetUnderline: () => () => {
      // Команда для снятия подчеркивания
      return true
    },
  }),
}
