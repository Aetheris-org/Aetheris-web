/**
 * Fate Engine - Цвет текста
 * Метка для изменения цвета текста
 */

import type { FateMarkDefinition } from '../types'

export const Color: FateMarkDefinition = {
  name: 'color',
  attrs: {
    color: {
      default: null,
      parseDOM: (dom: HTMLElement) => {
        return dom.style.color || dom.getAttribute('data-color') || null
      },
      toDOM: (color: string) => {
        return color ? { 'data-color': color, style: `color: ${color}` } : {}
      },
    },
  },
  parseDOM: [
    {
      style: 'color',
      getAttrs: (value: string) => {
        return { color: value }
      },
    },
    {
      tag: 'span[data-color]',
      getAttrs: (dom: HTMLElement) => {
        return {
          color: dom.getAttribute('data-color') || dom.style.color || null,
        }
      },
    },
  ],
  toDOM: (mark) => {
    const color = mark.attrs?.color
    if (!color) {
      return ['span', 0]
    }
    return [
      'span',
      {
        'data-color': color,
        style: `color: ${color}`,
      },
      0,
    ]
  },
  addCommands: () => ({
    setColor: (color: string) => ({ state, dispatch }: any) => {
      // Команда для установки цвета
      return true
    },
    unsetColor: () => ({ state, dispatch }: any) => {
      // Команда для снятия цвета
      return true
    },
  }),
}
