import { Extension, type Editor as TipTapEditor } from '@tiptap/core'
import { nanoid } from 'nanoid'

export type AnchorData = {
  id: string
  text: string
}

export const getBlockAnchors = (editor: TipTapEditor) => {
  const anchors: AnchorData[] = []
  editor.state.doc.descendants((node, pos) => {
    const blockId = node.attrs?.blockId as string | undefined
    if (blockId) {
      const text = node.textContent.trim().slice(0, 100)
      anchors.push({ id: blockId, text: text || `Блок ${blockId}` })
    }
  })
  return anchors
}

export const BlockAnchor = Extension.create({
  name: 'blockAnchor',

  addOptions() {
    return {
      types: ['paragraph', 'heading', 'callout', 'columns', 'column', 'blockquote', 'codeBlock'],
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          blockId: {
            default: null,
            parseHTML: (element: HTMLElement) => element.getAttribute('data-block-id'),
            renderHTML: (attributes) => {
              if (!attributes.blockId) {
                return {}
              }
              return {
                id: attributes.blockId,
                'data-block-id': attributes.blockId,
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setBlockAnchor:
        (customId?: string) =>
        ({ state, dispatch }) => {
          const id = (customId || nanoid(6)).toLowerCase()
          const { selection } = state
          const { $from } = selection
          for (let depth = $from.depth; depth > 0; depth--) {
            const node = $from.node(depth)
            if (this.options.types.includes(node.type.name)) {
              const pos = $from.before(depth)
              if (dispatch) {
                dispatch(state.tr.setNodeMarkup(pos, undefined, { ...node.attrs, blockId: id }))
              }
              return true
            }
          }
          return false
        },
      unsetBlockAnchor:
        () =>
        ({ state, dispatch }) => {
          const { selection } = state
          const { $from } = selection
          for (let depth = $from.depth; depth > 0; depth--) {
            const node = $from.node(depth)
            if (this.options.types.includes(node.type.name) && node.attrs?.blockId) {
              const pos = $from.before(depth)
              if (dispatch) {
                dispatch(state.tr.setNodeMarkup(pos, undefined, { ...node.attrs, blockId: null }))
              }
              return true
            }
          }
          return false
        },
    }
  },
})


