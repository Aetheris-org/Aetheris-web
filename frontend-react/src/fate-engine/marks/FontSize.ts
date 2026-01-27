/**
 * Fate Engine - Размер шрифта
 * Метка для изменения размера шрифта
 */

import type { FateMarkDefinition } from '../types'

export const FontSize: FateMarkDefinition = {
  name: 'fontSize',
  attrs: {
    fontSize: {
      default: null,
      parseDOM: (dom: HTMLElement) => {
        return dom.style.fontSize || dom.getAttribute('data-font-size') || null
      },
      toDOM: (fontSize: string) => {
        return fontSize ? { 'data-font-size': fontSize, style: `font-size: ${fontSize}` } : {}
      },
    },
  },
  parseDOM: [
    {
      style: 'font-size',
      getAttrs: (value: string) => {
        return { fontSize: value }
      },
    },
    {
      tag: 'span[data-font-size]',
      getAttrs: (dom: HTMLElement) => {
        return {
          fontSize: dom.getAttribute('data-font-size') || dom.style.fontSize || null,
        }
      },
    },
  ],
  toDOM: (mark) => {
    const fontSize = mark.attrs?.fontSize
    if (!fontSize) {
      return ['span', 0]
    }
    return [
      'span',
      {
        'data-font-size': fontSize,
        style: `font-size: ${fontSize}`,
      },
      0,
    ]
  },
  addCommands: () => ({
    setFontSize: (fontSize: string) => ({ state, dispatch }: any) => {
      // Команда для установки размера шрифта
      return true
    },
    unsetFontSize: () => ({ state, dispatch }: any) => {
      // Команда для снятия размера шрифта
      return true
    },
  }),
}
