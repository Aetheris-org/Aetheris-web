import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'

const IMAGE_RESIZE_PLUGIN_KEY = new PluginKey('imageResize')

export const ImageResize = Extension.create({
  name: 'imageResize',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: IMAGE_RESIZE_PLUGIN_KEY,
        props: {
          handleDOMEvents: {
            mousedown(view, event) {
              const target = event.target as HTMLElement
              const img = target.closest('img') as HTMLImageElement
              if (!img || !img.closest('.ProseMirror')) return false

              // Проверяем, что клик был на правом нижнем углу изображения
              const rect = img.getBoundingClientRect()
              const x = event.clientX - rect.left
              const y = event.clientY - rect.top
              const handleSize = 20
              
              if (x < rect.width - handleSize || y < rect.height - handleSize) {
                return false
              }

              event.preventDefault()
              event.stopPropagation()

              const startX = event.clientX
              const startY = event.clientY
              const startWidth = img.offsetWidth
              const startHeight = img.offsetHeight
              const aspectRatio = startWidth / startHeight

              // Добавляем визуальный индикатор
              img.style.cursor = 'nwse-resize'
              img.style.outline = '2px dashed hsl(var(--primary))'

              const onMouseMove = (e: MouseEvent) => {
                const deltaX = e.clientX - startX
                
                // Изменяем размер с сохранением пропорций
                const newWidth = Math.max(50, Math.min(startWidth + deltaX, view.dom.clientWidth - 100))
                const newHeight = newWidth / aspectRatio

                img.style.width = `${newWidth}px`
                img.style.height = `${newHeight}px`
                img.style.maxWidth = 'none'
                img.style.maxHeight = 'none'
              }

              const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove)
                document.removeEventListener('mouseup', onMouseUp)

                img.style.cursor = ''
                img.style.outline = ''

                // Находим позицию изображения в документе
                const pos = view.posAtDOM(img, 0)
                if (pos === null) return

                const $pos = view.state.doc.resolve(pos)
                const node = $pos.nodeAfter || $pos.nodeBefore
                if (!node || node.type.name !== 'image') return

                // Обновляем атрибуты изображения
                const attrs = {
                  ...node.attrs,
                  width: Math.round(img.offsetWidth),
                  height: Math.round(img.offsetHeight),
                }

                const tr = view.state.tr.setNodeMarkup($pos.pos, undefined, attrs)
                view.dispatch(tr)
              }

              document.addEventListener('mousemove', onMouseMove)
              document.addEventListener('mouseup', onMouseUp)

              return true
            },
            mouseover(view, event) {
              const target = event.target as HTMLElement
              const img = target.closest('img') as HTMLImageElement
              if (!img || !img.closest('.ProseMirror')) return false

              const rect = img.getBoundingClientRect()
              const x = event.clientX - rect.left
              const y = event.clientY - rect.top
              const handleSize = 20
              
              if (x >= rect.width - handleSize && y >= rect.height - handleSize) {
                img.style.cursor = 'nwse-resize'
                return true
              }
              return false
            },
            mouseout(view, event) {
              const target = event.target as HTMLElement
              const img = target.closest('img') as HTMLImageElement
              if (!img || !img.closest('.ProseMirror')) return false
              
              if (!img.matches(':hover')) {
                img.style.cursor = ''
              }
              return false
            },
          },
        },
      }),
    ]
  },
})
