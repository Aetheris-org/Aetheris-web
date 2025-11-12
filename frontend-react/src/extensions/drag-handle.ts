import { Extension } from '@tiptap/core'
import { NodeSelection, Plugin, PluginKey } from 'prosemirror-state'
import { Slice } from 'prosemirror-model'

const DRAG_HANDLE_PLUGIN_KEY = new PluginKey<{ pos: number | null }>('drag-handle')

const BLOCK_TYPES_WITH_HANDLE = new Set([
  'paragraph',
  'heading',
  'callout',
  'blockquote',
  'codeBlock',
  'columns',
  'column',
  'orderedList',
  'bulletList',
])

export const DragHandle = Extension.create({
  name: 'dragHandle',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: DRAG_HANDLE_PLUGIN_KEY,
        state: {
          init: () => ({ pos: null }),
          apply(tr, value) {
            if (tr.docChanged && value.pos != null) {
              return { pos: tr.mapping.map(value.pos) }
            }
            if (tr.selectionSet) {
              const { $from } = tr.selection
              for (let depth = $from.depth; depth > 0; depth--) {
                const node = $from.node(depth)
                if (BLOCK_TYPES_WITH_HANDLE.has(node.type.name) && node.type.isBlock) {
                  return { pos: $from.before(depth) }
                }
              }
            }
            return value
          },
        },
        view: (editorView) => {
          const handle = document.createElement('button')
          handle.type = 'button'
          handle.className = 'editor-drag-handle hidden items-center justify-center rounded-full border border-border/60 bg-background/95 text-muted-foreground shadow-sm transition hover:text-foreground'
          handle.setAttribute('aria-label', 'Перетащить блок')
          handle.draggable = true

          const parent = editorView.dom.parentElement
          parent?.appendChild(handle)

          const updateHandlePosition = () => {
            const pluginState = DRAG_HANDLE_PLUGIN_KEY.getState(editorView.state)
            if (!pluginState?.pos || pluginState.pos < 0) {
              handle.classList.add('hidden')
              return
            }
            const dom = editorView.nodeDOM(pluginState.pos) as HTMLElement | null
            if (!dom) {
              handle.classList.add('hidden')
              return
            }
            const rect = dom.getBoundingClientRect()
            const parentRect = parent?.getBoundingClientRect()
            if (!parentRect) {
              handle.classList.add('hidden')
              return
            }
            handle.classList.remove('hidden')
            handle.style.position = 'absolute'
            handle.style.width = '28px'
            handle.style.height = '28px'
            handle.style.left = `${Math.max(0, rect.left - parentRect.left - 36)}px`
            handle.style.top = `${rect.top - parentRect.top + rect.height / 2 - 14}px`
          }

          handle.addEventListener('mousedown', (event) => {
            event.preventDefault()
            const pluginState = DRAG_HANDLE_PLUGIN_KEY.getState(editorView.state)
            if (!pluginState?.pos) {
              return
            }
            const selection = NodeSelection.create(editorView.state.doc, pluginState.pos)
            editorView.dispatch(editorView.state.tr.setSelection(selection))
          })

          handle.addEventListener('dragstart', (event) => {
            const pluginState = DRAG_HANDLE_PLUGIN_KEY.getState(editorView.state)
            if (!pluginState?.pos) {
              event.preventDefault()
              return
            }
            const node = editorView.state.doc.nodeAt(pluginState.pos)
            if (!node) {
              event.preventDefault()
              return
            }
            const selection = NodeSelection.create(editorView.state.doc, pluginState.pos)
            editorView.dispatch(editorView.state.tr.setSelection(selection))
            const slice = editorView.state.doc.slice(
              pluginState.pos,
              pluginState.pos + node.nodeSize
            )
            editorView.dragging = { slice: slice as Slice, move: true }
            if (event.dataTransfer) {
              event.dataTransfer.effectAllowed = 'move'
              event.dataTransfer.setData('application/x-prosemirror-slice', '')
            }
          })

          const observer =
            typeof ResizeObserver !== 'undefined'
              ? new ResizeObserver(() => updateHandlePosition())
              : null
          if (observer && parent) {
            observer.observe(parent)
          }

          updateHandlePosition()

          return {
            update: () => {
              updateHandlePosition()
            },
            destroy: () => {
              observer?.disconnect()
              handle.remove()
            },
          }
        },
      }),
    ]
  },
})


