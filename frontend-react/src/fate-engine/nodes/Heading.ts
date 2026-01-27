/**
 * Fate Engine - Заголовок
 * Узел для заголовков разных уровней (h1-h6)
 */

import type { FateNodeDefinition } from '../types'

export const Heading: FateNodeDefinition = {
  name: 'heading',
  group: 'block',
  content: 'inline*',
  attrs: {
    level: {
      default: 1,
      parseDOM: (dom: HTMLElement) => {
        const match = dom.tagName.match(/^H([1-6])$/)
        return match ? parseInt(match[1], 10) : 1
      },
      toDOM: (level: number) => {
        return { level }
      },
    },
  },
  parseDOM: [
    { tag: 'h1', getAttrs: () => ({ level: 1 }) },
    { tag: 'h2', getAttrs: () => ({ level: 2 }) },
    { tag: 'h3', getAttrs: () => ({ level: 3 }) },
    { tag: 'h4', getAttrs: () => ({ level: 4 }) },
    { tag: 'h5', getAttrs: () => ({ level: 5 }) },
    { tag: 'h6', getAttrs: () => ({ level: 6 }) },
  ],
  toDOM: (node) => {
    const level = node.attrs?.level || 1
    const tag = `h${Math.min(Math.max(level, 1), 6)}`
    return [tag, 0]
  },
  addCommands: () => ({
    setHeading: (_attrs: { level: number }) => () => {
      // Команда для установки заголовка
      return true
    },
    toggleHeading: (_attrs: { level: number }) => () => {
      // Команда для переключения заголовка
      return true
    },
  }),
}
