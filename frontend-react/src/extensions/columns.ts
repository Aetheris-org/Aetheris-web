import { Node, mergeAttributes } from '@tiptap/core'

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

const getColumnNodeAttrs = (width: number) => ({
  'data-type': 'column',
  style: `--column-width:${width}`,
})

export const Column = Node.create({
  name: 'column',
  group: 'column',
  content: 'block+',
  defining: true,
  isolating: true,

  addAttributes() {
    return {
      width: {
        default: 50,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="column"]',
        getAttrs: (dom: HTMLElement) => ({
          width: Number.parseFloat(dom.dataset.width ?? '50'),
        }),
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const width = Number(HTMLAttributes.width ?? 50)
    return [
      'div',
      mergeAttributes(HTMLAttributes, getColumnNodeAttrs(width), {
        'data-width': width,
        class: 'editor-column',
      }),
      0,
    ]
  },
})

export const Columns = Node.create({
  name: 'columns',
  group: 'block',
  content: 'column{2,}',
  isolating: true,
  defining: true,
  draggable: true,

  addAttributes() {
    return {
      layout: {
        default: COLUMN_LAYOUTS.twoEqual.widths,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="columns"]',
        getAttrs: (dom: HTMLElement) => {
          const layout = dom.dataset.layout?.split(',').map((value) => Number.parseFloat(value.trim()))
          return {
            layout: layout && layout.length ? layout : COLUMN_LAYOUTS.twoEqual.widths,
          }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const layout: number[] = HTMLAttributes.layout ?? COLUMN_LAYOUTS.twoEqual.widths
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'columns',
        'data-layout': layout.join(','),
        class: 'editor-columns',
      }),
      0,
    ]
  },

  addCommands() {
    return {
      insertColumns:
        (preset: ColumnPresetKey = 'twoEqual') =>
        ({ commands }) => {
          const layout = COLUMN_LAYOUTS[preset].widths
          return commands.insertContent({
            type: this.name,
            attrs: { layout },
            content: layout.map((width) => ({
              type: 'column',
              attrs: { width },
              content: [{ type: 'paragraph' }],
            })),
          })
        },
      setColumnsLayout:
        (preset: ColumnPresetKey) =>
        ({ state, dispatch }) => {
          const layout = COLUMN_LAYOUTS[preset].widths
          const { selection } = state
          const { $from } = selection

          for (let depth = $from.depth; depth > 0; depth--) {
            const node = $from.node(depth)
            if (node.type.name === this.name) {
              const pos = $from.before(depth)
              const transaction = state.tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                layout,
              })
              node.forEach((child, offset, index) => {
                const columnPos = pos + 1 + offset
                const width = layout[index] ?? layout[layout.length - 1] ?? 50
                transaction.setNodeMarkup(columnPos, undefined, {
                  ...child.attrs,
                  width,
                })
              })
              if (dispatch) {
                dispatch(transaction)
              }
              return true
            }
          }
          return false
        },
    }
  },
})


