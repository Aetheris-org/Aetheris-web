/**
 * Fate Engine - Нумерованный список
 */

import type { FateNodeDefinition } from '../types'

export const OrderedList: FateNodeDefinition = {
  name: 'orderedList',
  group: 'block',
  content: 'listItem+',
  attrs: {
    start: {
      default: 1,
      parseDOM: (dom: HTMLElement) => {
        return parseInt(dom.getAttribute('start') || '1', 10)
      },
      toDOM: (start: number) => {
        return start !== 1 ? { start } : {}
      },
    },
  },
  parseDOM: [
    {
      tag: 'ol',
    },
  ],
  toDOM: (node) => {
    const attrs: Record<string, any> = {}
    if (node.attrs?.start && node.attrs.start !== 1) {
      attrs.start = node.attrs.start
    }
    return ['ol', attrs, 0]
  },
  addCommands: () => ({
    toggleOrderedList: () => () => {
      // Команда для переключения нумерованного списка
      return true
    },
    wrapInOrderedList: () => () => {
      // Команда для оборачивания в нумерованный список
      return true
    },
  }),
}
