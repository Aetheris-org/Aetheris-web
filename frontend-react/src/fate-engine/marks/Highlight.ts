/**
 * Fate Engine - Подсветка
 * Метка для подсветки текста с поддержкой цветов
 */

import type { FateMarkDefinition } from '../types'

export const Highlight: FateMarkDefinition = {
  name: 'highlight',
  attrs: {
    color: {
      default: '#fef08a', // Желтый по умолчанию
      parseDOM: (dom: HTMLElement) => {
        return dom.style.backgroundColor || dom.getAttribute('data-color') || '#fef08a'
      },
      toDOM: (color: string) => {
        return { 'data-color': color, style: `background-color: ${color}` }
      },
    },
  },
  parseDOM: [
    {
      tag: 'mark',
    },
    {
      tag: 'span[data-type="highlight"]',
    },
    {
      style: 'background-color',
      getAttrs: (dom: HTMLElement) => {
        const color = dom.style.backgroundColor || dom.getAttribute('data-color')
        return color ? { color } : null
      },
    },
  ],
  toDOM: (mark) => {
    const color = mark.attrs?.color || '#fef08a'
    return [
      'mark',
      {
        'data-type': 'highlight',
        'data-color': color,
        style: `background-color: ${color}`,
      },
      0,
    ]
  },
  addCommands: () => ({
    setHighlight: (_attrs?: { color?: string }) => () => {
      // Команда для установки подсветки
      return true
    },
    toggleHighlight: (_attrs?: { color?: string }) => () => {
      // Команда для переключения подсветки
      return true
    },
    unsetHighlight: () => () => {
      // Команда для снятия подсветки
      return true
    },
  }),
}
