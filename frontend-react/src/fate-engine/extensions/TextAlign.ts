/**
 * Fate Engine - Выравнивание текста
 * Расширение для выравнивания блоков
 */

import type { FateExtension } from '../types'

export interface TextAlignOptions {
  types?: string[]
  alignments?: string[]
  defaultAlignment?: string
}

export function TextAlign(options: TextAlignOptions = {}): FateExtension {
  const types = options.types || ['heading', 'paragraph']
  const alignments = options.alignments || ['left', 'center', 'right', 'justify']
  const defaultAlignment = options.defaultAlignment || 'left'

  return {
    name: 'textAlign',
    addGlobalAttributes: () => [
      {
        types,
        attributes: {
          textAlign: {
            default: defaultAlignment,
            parseDOM: (dom: HTMLElement) => {
              const align = dom.style.textAlign || dom.getAttribute('data-align') || defaultAlignment
              return alignments.includes(align) ? align : defaultAlignment
            },
            toDOM: (align: string) => {
              return align !== defaultAlignment
                ? { 'data-align': align, style: `text-align: ${align}` }
                : {}
            },
          },
        },
      },
    ],
    addCommands: () => ({
      setTextAlign: (alignment: string) => ({ state, dispatch }: any) => {
        if (!alignments.includes(alignment)) {
          return false
        }
        // Команда для установки выравнивания
        return true
      },
      unsetTextAlign: () => ({ state, dispatch }: any) => {
        // Команда для снятия выравнивания
        return true
      },
    }),
  }
}
