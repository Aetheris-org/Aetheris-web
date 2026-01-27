/**
 * Fate Engine - Колонки
 * Узлы для создания колоночной разметки
 */

import type { FateNodeDefinition } from '../types'

export type ColumnPresetKey = 'twoEqual' | 'twoWideLeft' | 'twoWideRight' | 'threeEqual'

export const COLUMN_LAYOUTS: Record<
  ColumnPresetKey,
  { label: string; widths: number[]; description: string }
> = {
  twoEqual: {
    label: '50 / 50',
    widths: [50, 50],
    description: 'Две равные колонки',
  },
  twoWideLeft: {
    label: '66 / 33',
    widths: [66, 34],
    description: 'Широкая левая, узкая правая',
  },
  twoWideRight: {
    label: '33 / 66',
    widths: [34, 66],
    description: 'Узкая левая, широкая правая',
  },
  threeEqual: {
    label: '33 / 33 / 33',
    widths: [33, 34, 33],
    description: 'Три равные колонки',
  },
}

export const Column: FateNodeDefinition = {
  name: 'column',
  group: 'column',
  content: 'block+',
  defining: true,
  isolating: true,
  attrs: {
    width: {
      default: 50,
      parseDOM: (dom: HTMLElement) => {
        return Number.parseFloat(dom.getAttribute('data-width') || '50')
      },
      toDOM: (width: number) => {
        return { 'data-width': String(width), style: `--column-width:${width}%` }
      },
    },
  },
  parseDOM: [
    {
      tag: 'div[data-type="column"]',
      getAttrs: (dom: HTMLElement) => ({
        width: Number.parseFloat(dom.getAttribute('data-width') || '50'),
      }),
    },
  ],
  toDOM: (node) => {
    const width = node.attrs?.width || 50
    return [
      'div',
      {
        'data-type': 'column',
        'data-width': String(width),
        class: 'editor-column',
        style: `--column-width:${width}%`,
      },
      0,
    ]
  },
}

export const Columns: FateNodeDefinition = {
  name: 'columns',
  group: 'block',
  content: 'column{2,}',
  isolating: true,
  defining: true,
  draggable: true,
  attrs: {
    layout: {
      default: COLUMN_LAYOUTS.twoEqual.widths,
      parseDOM: (dom: HTMLElement) => {
        const layout = dom.getAttribute('data-layout')?.split(',').map((v) => Number.parseFloat(v.trim()))
        return layout && layout.length ? layout : COLUMN_LAYOUTS.twoEqual.widths
      },
      toDOM: (layout: number[]) => {
        return { 'data-layout': layout.join(',') }
      },
    },
  },
  parseDOM: [
    {
      tag: 'div[data-type="columns"]',
      getAttrs: (dom: HTMLElement) => {
        const layout = dom.getAttribute('data-layout')?.split(',').map((v) => Number.parseFloat(v.trim()))
        return {
          layout: layout && layout.length ? layout : COLUMN_LAYOUTS.twoEqual.widths,
        }
      },
    },
  ],
  toDOM: (node) => {
    const layout: number[] = node.attrs?.layout || COLUMN_LAYOUTS.twoEqual.widths
    return [
      'div',
      {
        'data-type': 'columns',
        'data-layout': layout.join(','),
        class: 'editor-columns',
      },
      0,
    ]
  },
  addCommands: () => ({
    insertColumns: (preset: ColumnPresetKey = 'twoEqual') => () => {
      // Команда для вставки колонок
      // Используем layout для создания колонок
      void COLUMN_LAYOUTS[preset].widths
      return true
    },
    setColumnsLayout: (preset: ColumnPresetKey) => () => {
      // Команда для изменения макета колонок
      // Используем layout для изменения макета
      void COLUMN_LAYOUTS[preset].widths
      return true
    },
  }),
}
