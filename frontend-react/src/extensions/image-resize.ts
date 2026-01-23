import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'

const IMAGE_RESIZE_PLUGIN_KEY = new PluginKey('imageResize')

type ResizeHandle = 'nw' | 'n' | 'ne' | 'w' | 'e' | 'sw' | 's' | 'se' | null

function getResizeHandle(rect: DOMRect, x: number, y: number, handleSize: number): ResizeHandle {
  const { width, height } = rect
  
  // Проверяем углы
  if (x <= handleSize && y <= handleSize) return 'nw'
  if (x >= width - handleSize && y <= handleSize) return 'ne'
  if (x <= handleSize && y >= height - handleSize) return 'sw'
  if (x >= width - handleSize && y >= height - handleSize) return 'se'
  
  // Проверяем стороны
  if (x <= handleSize) return 'w'
  if (x >= width - handleSize) return 'e'
  if (y <= handleSize) return 'n'
  if (y >= height - handleSize) return 's'
  
  return null
}

function getCursorForHandle(handle: ResizeHandle): string {
  switch (handle) {
    case 'nw': return 'nwse-resize'
    case 'ne': return 'nesw-resize'
    case 'sw': return 'nesw-resize'
    case 'se': return 'nwse-resize'
    case 'n': return 'ns-resize'
    case 's': return 'ns-resize'
    case 'w': return 'ew-resize'
    case 'e': return 'ew-resize'
    default: return ''
  }
}

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

              const rect = img.getBoundingClientRect()
              const x = event.clientX - rect.left
              const y = event.clientY - rect.top
              const handleSize = 20
              
              const handle = getResizeHandle(rect, x, y, handleSize)
              if (!handle) return false

              event.preventDefault()
              event.stopPropagation()

              const startX = event.clientX
              const startY = event.clientY
              const startWidth = img.offsetWidth
              const startHeight = img.offsetHeight
              const aspectRatio = startWidth / startHeight

              // Добавляем визуальный индикатор
              img.style.cursor = getCursorForHandle(handle)
              img.style.outline = '2px dashed hsl(var(--primary))'

              const onMouseMove = (e: MouseEvent) => {
                const deltaX = e.clientX - startX
                const deltaY = e.clientY - startY
                
                let newWidth = startWidth
                let newHeight = startHeight

                // Вычисляем новый размер в зависимости от угла/стороны
                switch (handle) {
                  case 'se': // Правый нижний - увеличиваем при движении вправо-вниз
                    newWidth = Math.max(50, Math.min(startWidth + deltaX, view.dom.clientWidth - 100))
                    newHeight = newWidth / aspectRatio
                    break
                  case 'sw': // Левый нижний - увеличиваем при движении влево-вниз
                    newWidth = Math.max(50, Math.min(startWidth - deltaX, view.dom.clientWidth - 100))
                    newHeight = newWidth / aspectRatio
                    break
                  case 'ne': // Правый верхний - увеличиваем при движении вправо-вверх
                    newWidth = Math.max(50, Math.min(startWidth + deltaX, view.dom.clientWidth - 100))
                    newHeight = newWidth / aspectRatio
                    break
                  case 'nw': // Левый верхний - увеличиваем при движении влево-вверх
                    newWidth = Math.max(50, Math.min(startWidth - deltaX, view.dom.clientWidth - 100))
                    newHeight = newWidth / aspectRatio
                    break
                  case 'e': // Правая сторона
                    newWidth = Math.max(50, Math.min(startWidth + deltaX, view.dom.clientWidth - 100))
                    newHeight = newWidth / aspectRatio
                    break
                  case 'w': // Левая сторона
                    newWidth = Math.max(50, Math.min(startWidth - deltaX, view.dom.clientWidth - 100))
                    newHeight = newWidth / aspectRatio
                    break
                  case 's': // Нижняя сторона
                    newHeight = Math.max(50, Math.min(startHeight + deltaY, view.dom.clientHeight - 100))
                    newWidth = newHeight * aspectRatio
                    break
                  case 'n': // Верхняя сторона
                    newHeight = Math.max(50, Math.min(startHeight - deltaY, view.dom.clientHeight - 100))
                    newWidth = newHeight * aspectRatio
                    break
                }

                // Применяем размеры с !important, чтобы перезаписать стили из HTMLAttributes
                img.style.setProperty('width', `${newWidth}px`, 'important')
                img.style.setProperty('height', `${newHeight}px`, 'important')
                img.style.setProperty('max-width', 'none', 'important')
                img.style.setProperty('max-height', 'none', 'important')
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

                // Получаем финальные размеры
                const finalWidth = Math.round(img.offsetWidth)
                const finalHeight = Math.round(img.offsetHeight)

                // Обновляем атрибуты изображения
                const attrs = {
                  ...node.attrs,
                  width: finalWidth,
                  height: finalHeight,
                }

                const tr = view.state.tr.setNodeMarkup($pos.pos, undefined, attrs)
                view.dispatch(tr)
              }

              document.addEventListener('mousemove', onMouseMove)
              document.addEventListener('mouseup', onMouseUp)

              return true
            },
            mouseover(_view, event) {
              const target = event.target as HTMLElement
              const img = target.closest('img') as HTMLImageElement
              if (!img || !img.closest('.ProseMirror')) return false

              const rect = img.getBoundingClientRect()
              const x = event.clientX - rect.left
              const y = event.clientY - rect.top
              const handleSize = 20
              
              const handle = getResizeHandle(rect, x, y, handleSize)
              if (handle) {
                img.style.cursor = getCursorForHandle(handle)
                return true
              }
              return false
            },
            mouseout(_view, event) {
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
