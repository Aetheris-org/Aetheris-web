/**
 * Fate Engine - Зачеркивание
 * Метка для зачеркнутого текста
 */

import type { FateMarkDefinition } from '../types'

export const Strikethrough: FateMarkDefinition = {
  name: 'strikethrough',
  parseDOM: [
    {
      tag: 's',
    },
    {
      tag: 'strike',
    },
    {
      tag: 'del',
    },
    {
      style: 'text-decoration=line-through',
    },
  ],
  toDOM: () => {
    return ['s', 0]
  },
  addCommands: () => ({
    toggleStrikethrough: () => ({ state, dispatch }: any) => {
      // Команда для переключения зачеркивания
      return true
    },
    setStrikethrough: () => ({ state, dispatch }: any) => {
      // Команда для установки зачеркивания
      return true
    },
    unsetStrikethrough: () => ({ state, dispatch }: any) => {
      // Команда для снятия зачеркивания
      return true
    },
  }),
}
