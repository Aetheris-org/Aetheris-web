import { Extension, type Editor as TipTapEditor } from '@tiptap/core'
import { Plugin, PluginKey, type Transaction } from 'prosemirror-state'
import { nanoid } from 'nanoid'

export type AnchorData = {
  id: string
  text: string
}

export const getBlockAnchors = (editor: TipTapEditor) => {
  const anchors: AnchorData[] = []
  editor.state.doc.descendants((node) => {
    const blockId = node.attrs?.blockId as string | undefined
    if (blockId) {
      const text = node.textContent.trim().slice(0, 100)
      anchors.push({ id: blockId, text: text || `Блок ${blockId}` })
    }
  })
  return anchors
}

const BLOCK_ANCHOR_PLUGIN_KEY = new PluginKey('blockAnchor')

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

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: BLOCK_ANCHOR_PLUGIN_KEY,
        // Очистка blockId у нового пустого параграфа после split
        appendTransaction: (transactions, oldState, newState) => {
          // Пропускаем наши собственные транзакции
          if (transactions.some(tr => tr?.getMeta?.('blockAnchorCleanup'))) {
            return null
          }

          // Пропускаем, если документ не изменился
          if (!transactions.some(tr => tr?.docChanged)) {
            return null
          }

          try {
            const tr: Transaction = newState.tr
            const { $from } = newState.selection

            // Проверяем параграф, в котором находится курсор
            for (let depth = $from.depth; depth > 0; depth--) {
              const node = $from.node(depth)
              if (node.type.name === 'paragraph' && node.attrs?.blockId) {
                const pos = $from.before(depth)
                
                // Проверяем, был ли этот параграф в старом состоянии
                let wasInOldState = false
                oldState.doc.descendants((oldNode, oldPos) => {
                  if (oldNode.type.name === 'paragraph' && oldPos === pos) {
                    wasInOldState = true
                  }
                })
                
                // Очищаем blockId только у нового параграфа (созданного через split)
                // И только если он пустой
                if (!wasInOldState) {
                  const textContent = node.textContent || ''
                  const textWithoutSpaces = textContent.replace(/\s/g, '')
                  const hasNoChildren = node.childCount === 0
                  const hasOnlyHardBreak = node.childCount === 1 && node.firstChild?.type?.name === 'hardBreak'
                  
                  // Очищаем blockId только если параграф действительно пустой
                  if (textWithoutSpaces.length === 0 && (hasNoChildren || hasOnlyHardBreak)) {
                    const attrs = { ...node.attrs, blockId: null }
                    tr.setNodeMarkup(pos, undefined, attrs)
                    tr.setMeta('blockAnchorCleanup', true)
                    return tr
                  }
                }
                break
              }
            }

            return null
          } catch (error) {
            return null
          }
        },
      }),
    ]
  },

  addCommands() {
    return {
      setBlockAnchor:
        (customId?: string) =>
        ({ state, dispatch }: { state: any; dispatch?: any }) => {
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
        ({ state, dispatch }: { state: any; dispatch?: any }) => {
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


