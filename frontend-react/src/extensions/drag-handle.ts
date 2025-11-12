import { Extension } from '@tiptap/core'
import { Plugin, PluginKey, NodeSelection } from 'prosemirror-state'
import { dropPoint } from 'prosemirror-transform'

const DRAG_HANDLE_PLUGIN_KEY = new PluginKey('dragHandle')

const BLOCK_TYPES = new Set([
  'paragraph',
  'heading',
  'callout',
  'blockquote',
  'codeBlock',
  'columns',
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
          init: () => ({ pos: null, hoveredPos: null }),
          apply(tr, value) {
            // Обновляем позицию при изменении документа
            if (tr.docChanged && value.pos != null) {
              return { pos: tr.mapping.map(value.pos), hoveredPos: value.hoveredPos }
            }
            // Обновляем hoveredPos из метаданных
            if (tr.getMeta(DRAG_HANDLE_PLUGIN_KEY)) {
              const meta = tr.getMeta(DRAG_HANDLE_PLUGIN_KEY)
              if (meta?.hoveredPos !== undefined) {
                return { pos: value.pos, hoveredPos: meta.hoveredPos }
              }
            }
            // Обновляем pos при изменении selection
            if (tr.selectionSet) {
              const { $from } = tr.selection
              let pos: number | null = null
              for (let depth = $from.depth; depth > 0; depth--) {
                const node = $from.node(depth)
                if (BLOCK_TYPES.has(node.type.name) && node.type.isBlock) {
                  pos = $from.before(depth)
                  break
                }
              }
              return { pos, hoveredPos: value.hoveredPos }
            }
            return value
          },
        },
        props: {
          handleDOMEvents: {
            mouseover(view, event) {
              const target = event.target as HTMLElement
              if (target.classList.contains('editor-drag-handle')) {
                return false
              }
              
              const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })
              if (!pos) return false

              const $pos = view.state.doc.resolve(pos.pos)
              let hoveredPos: number | null = null
              
              for (let depth = $pos.depth; depth > 0; depth--) {
                const node = $pos.node(depth)
                if (BLOCK_TYPES.has(node.type.name) && node.type.isBlock) {
                  hoveredPos = $pos.before(depth)
                  break
                }
              }

              if (hoveredPos !== null) {
                const tr = view.state.tr.setMeta(DRAG_HANDLE_PLUGIN_KEY, { hoveredPos })
                view.dispatch(tr)
              }
              
              return false
            },
            mouseleave(view, event) {
              // Скрываем handle когда мышь уходит с редактора
              const target = event.relatedTarget as HTMLElement
              if (!target || !view.dom.contains(target)) {
                const tr = view.state.tr.setMeta(DRAG_HANDLE_PLUGIN_KEY, { hoveredPos: null })
                view.dispatch(tr)
              }
              return false
            },
          },
        },
        view: (editorView) => {
          const handle = document.createElement('button')
          handle.type = 'button'
          handle.className = 'editor-drag-handle'
          handle.setAttribute('aria-label', 'Перетащить блок')
          handle.setAttribute('draggable', 'true')
          
          // SVG иконка
          handle.innerHTML = `
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="2" cy="2" r="1" fill="currentColor"/>
              <circle cx="6" cy="2" r="1" fill="currentColor"/>
              <circle cx="10" cy="2" r="1" fill="currentColor"/>
              <circle cx="2" cy="6" r="1" fill="currentColor"/>
              <circle cx="6" cy="6" r="1" fill="currentColor"/>
              <circle cx="10" cy="6" r="1" fill="currentColor"/>
              <circle cx="2" cy="10" r="1" fill="currentColor"/>
              <circle cx="6" cy="10" r="1" fill="currentColor"/>
              <circle cx="10" cy="10" r="1" fill="currentColor"/>
            </svg>
          `

          const editorDOM = editorView.dom
          const editorContainer = editorDOM.closest('.tiptap')?.parentElement || editorDOM.parentElement
          
          if (!editorContainer) {
            return { destroy: () => {} }
          }

          editorContainer.style.position = 'relative'
          editorContainer.appendChild(handle)

          let draggedPos: number | null = null

          const updateHandle = () => {
            const state = DRAG_HANDLE_PLUGIN_KEY.getState(editorView.state)
            const pos = state?.hoveredPos ?? state?.pos ?? null

            if (pos === null || pos < 0) {
              handle.style.display = 'none'
              return
            }

            const node = editorView.state.doc.nodeAt(pos)
            if (!node || !BLOCK_TYPES.has(node.type.name)) {
              handle.style.display = 'none'
              return
            }

            const dom = editorView.nodeDOM(pos) as HTMLElement
            if (!dom) {
              handle.style.display = 'none'
              return
            }

            const domRect = dom.getBoundingClientRect()
            const containerRect = editorContainer.getBoundingClientRect()

            handle.style.display = 'flex'
            handle.style.position = 'absolute'
            handle.style.left = `${domRect.left - containerRect.left - 28}px`
            handle.style.top = `${domRect.top - containerRect.top + domRect.height / 2 - 12}px`
            handle.style.zIndex = '50'
          }

          // Обработка mousedown для начала drag
          handle.addEventListener('mousedown', (e) => {
            e.preventDefault()
            e.stopPropagation()
            
            const state = DRAG_HANDLE_PLUGIN_KEY.getState(editorView.state)
            const pos = state?.hoveredPos ?? state?.pos
            if (pos === null || pos < 0) return

            draggedPos = pos
          })

          // Обработка dragstart
          handle.addEventListener('dragstart', (e) => {
            // Если draggedPos не установлен, пытаемся получить из state
            if (draggedPos === null) {
              const state = DRAG_HANDLE_PLUGIN_KEY.getState(editorView.state)
              draggedPos = state?.hoveredPos ?? state?.pos ?? null
            }
            
            if (draggedPos === null || draggedPos < 0) {
              e.preventDefault()
              return
            }

            const node = editorView.state.doc.nodeAt(draggedPos)
            if (!node) {
              e.preventDefault()
              return
            }

            // Устанавливаем NodeSelection для ProseMirror
            const selection = NodeSelection.create(editorView.state.doc, draggedPos)
            const { tr } = editorView.state
            editorView.dispatch(tr.setSelection(selection))

            // Настраиваем drag для ProseMirror
            const slice = editorView.state.doc.slice(draggedPos, draggedPos + node.nodeSize)
            ;(editorView as any).dragging = { slice, move: true }

            if (e.dataTransfer) {
              e.dataTransfer.effectAllowed = 'move'
              e.dataTransfer.setData('text/html', '')
            }
          })

          handle.addEventListener('dragend', () => {
            draggedPos = null
          })

          // Обработка drop - используем встроенный механизм ProseMirror
          const handleDrop = (e: DragEvent) => {
            if (draggedPos === null) return false

            e.preventDefault()
            e.stopPropagation()

            const coords = { left: e.clientX, top: e.clientY }
            const targetPos = editorView.posAtCoords(coords)
            
            if (!targetPos) {
              draggedPos = null
              return false
            }

            const $pos = editorView.state.doc.resolve(targetPos.pos)
            const node = editorView.state.doc.nodeAt(draggedPos)
            
            if (!node) {
              draggedPos = null
              return false
            }

            // Используем dropPoint для правильного определения позиции вставки
            let insertPos = dropPoint(editorView.state.doc, $pos.pos, (slice) => {
              return node.type.create(node.attrs, node.content)
            })

            if (insertPos === null) {
              // Если dropPoint не сработал, используем простую логику
              for (let depth = $pos.depth; depth > 0; depth--) {
                const targetNode = $pos.node(depth)
                if (BLOCK_TYPES.has(targetNode.type.name) && targetNode.type.isBlock) {
                  insertPos = $pos.before(depth)
                  break
                }
              }
              
              if (insertPos === null) {
                insertPos = targetPos.pos
              }
            }

            if (insertPos !== null && insertPos !== draggedPos) {
              const { tr } = editorView.state
              const nodeSize = node.nodeSize

              // Вычисляем финальную позицию с учетом удаления
              let finalInsertPos = insertPos
              if (insertPos > draggedPos) {
                finalInsertPos = insertPos - nodeSize
              }

              // Удаляем из старой позиции
              tr.delete(draggedPos, draggedPos + nodeSize)
              
              // Вставляем в новую позицию
              try {
                tr.insert(finalInsertPos, node)
                // Сбрасываем selection
                const newPos = Math.min(finalInsertPos + node.nodeSize, tr.doc.content.size)
                const $newPos = tr.doc.resolve(newPos)
                const TextSelection = editorView.state.selection.constructor
                tr.setSelection(TextSelection.create(tr.doc, newPos))
                editorView.dispatch(tr)
              } catch (err) {
                console.warn('Failed to move node:', err)
              }
            }

            draggedPos = null
            return true
          }

          const handleDragOver = (e: DragEvent) => {
            if (draggedPos !== null) {
              e.preventDefault()
              e.stopPropagation()
              if (e.dataTransfer) {
                e.dataTransfer.dropEffect = 'move'
              }
            }
          }

          editorDOM.addEventListener('drop', handleDrop)
          editorDOM.addEventListener('dragover', handleDragOver)

          // Обновление позиции handle
          const updateInterval = setInterval(updateHandle, 100)
          updateHandle()

          return {
            update: () => {
              updateHandle()
            },
            destroy: () => {
              clearInterval(updateInterval)
              editorDOM.removeEventListener('drop', handleDrop)
              editorDOM.removeEventListener('dragover', handleDragOver)
              handle.remove()
            },
          }
        },
      }),
    ]
  },
})
