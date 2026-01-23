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
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/ebafe3e3-0264-4f10-b0b2-c1951d9e2325',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'A',location:'extensions/image-resize.ts:59',message:'image mousedown',data:{handle,relX:Math.round(x),relY:Math.round(y),w:Math.round(rect.width),h:Math.round(rect.height)},timestamp:Date.now()})}).catch(()=>{});
              // #endregion
              
              // Если клик не на handle, но на изображении - начинаем перетаскивание
              if (!handle) {
                // Проверяем, что клик не на краю (для resize)
                const isOnEdge = x <= handleSize || x >= rect.width - handleSize || 
                                y <= handleSize || y >= rect.height - handleSize
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/ebafe3e3-0264-4f10-b0b2-c1951d9e2325',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'A',location:'extensions/image-resize.ts:64',message:'drag branch candidate (handle null)',data:{isOnEdge},timestamp:Date.now()})}).catch(()=>{});
                // #endregion
                if (isOnEdge) return false
                
                // Начинаем перетаскивание изображения
                event.preventDefault()
                event.stopPropagation()
                
                const pos = view.posAtDOM(img, 0)
                if (pos === null) return false
                
                const $pos = view.state.doc.resolve(pos)
                const node = $pos.nodeAfter || $pos.nodeBefore
                if (!node || node.type.name !== 'image') return false
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/ebafe3e3-0264-4f10-b0b2-c1951d9e2325',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'A',location:'extensions/image-resize.ts:76',message:'starting image drag',data:{startPos:$pos.pos,nodeSize:node.nodeSize},timestamp:Date.now()})}).catch(()=>{});
                // #endregion
                
                // Устанавливаем курсор для перетаскивания
                img.style.cursor = 'move'
                img.style.opacity = '0.7'
                
                const startX = event.clientX
                const startY = event.clientY
                const startPos = $pos.pos
                
                let draggedPos: number | null = startPos
                let dropIndicator: HTMLElement | null = null
                
                const createDropIndicator = (x: number, y: number) => {
                  if (!dropIndicator) {
                    dropIndicator = document.createElement('div')
                    dropIndicator.className = 'image-drop-indicator'
                    dropIndicator.style.cssText = `
                      position: fixed;
                      pointer-events: none;
                      border: 2px dashed hsl(var(--primary));
                      background: hsl(var(--primary) / 0.1);
                      border-radius: 0.5rem;
                      z-index: 10000;
                      transition: all 0.1s;
                    `
                    document.body.appendChild(dropIndicator)
                  }
                  
                  const posAtCoords = view.posAtCoords({ left: x, top: y })
                  if (posAtCoords) {
                    const coords = view.coordsAtPos(posAtCoords.pos)
                    dropIndicator.style.left = `${coords.left}px`
                    dropIndicator.style.top = `${coords.top}px`
                    dropIndicator.style.width = `${Math.max(100, img.offsetWidth)}px`
                    dropIndicator.style.height = `${Math.max(50, img.offsetHeight)}px`
                    dropIndicator.style.display = 'block'
                  }
                }
                
                const removeDropIndicator = () => {
                  if (dropIndicator) {
                    dropIndicator.remove()
                    dropIndicator = null
                  }
                }
                
                const onMouseMove = (e: MouseEvent) => {
                  createDropIndicator(e.clientX, e.clientY)
                  
                  // Визуально перемещаем изображение
                  const deltaX = e.clientX - startX
                  const deltaY = e.clientY - startY
                  img.style.transform = `translate(${deltaX}px, ${deltaY}px)`
                }
                
                const onMouseUp = (e: MouseEvent) => {
                  document.removeEventListener('mousemove', onMouseMove)
                  document.removeEventListener('mouseup', onMouseUp)
                  
                  img.style.cursor = ''
                  img.style.opacity = ''
                  img.style.transform = ''
                  removeDropIndicator()
                  
                  if (draggedPos === null) return
                  
                  // Находим новую позицию для вставки
                  const posAtCoords = view.posAtCoords({ 
                    left: e.clientX, 
                    top: e.clientY 
                  })
                  // #region agent log
                  fetch('http://127.0.0.1:7242/ingest/ebafe3e3-0264-4f10-b0b2-c1951d9e2325',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'A',location:'extensions/image-resize.ts:145',message:'image drag mouseup',data:{hasPosAtCoords:!!posAtCoords,dropPos:posAtCoords?.pos ?? null,draggedPos},timestamp:Date.now()})}).catch(()=>{});
                  // #endregion
                  
                  if (posAtCoords) {
                    const newPos = posAtCoords.pos
                    const $newPos = view.state.doc.resolve(newPos)
                    
                    // Вычисляем позицию вставки на уровне top-level блока.
                    // Важно: нельзя делать before(0) — это и даёт RangeError.
                    let insertPos = 0
                    if ($newPos.depth >= 1) {
                      insertPos = $newPos.before(1)
                    }
                    // Если курсор попал в пустой параграф, вставим прямо в него
                    if ($newPos.parent.type.name === 'paragraph' && $newPos.parent.textContent.trim() === '') {
                      insertPos = $newPos.pos
                    }
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/ebafe3e3-0264-4f10-b0b2-c1951d9e2325',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'post-fix',hypothesisId:'A',location:'extensions/image-resize.ts:insertPos',message:'computed insertPos',data:{dropPos:newPos,dropDepth:$newPos.depth,insertPos,draggedPos},timestamp:Date.now()})}).catch(()=>{});
                    // #endregion
                    
                    if (insertPos !== draggedPos) {
                      const { tr } = view.state
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
                        view.dispatch(tr)
                      } catch (err) {
                        // #region agent log
                        fetch('http://127.0.0.1:7242/ingest/ebafe3e3-0264-4f10-b0b2-c1951d9e2325',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'post-fix',hypothesisId:'A',location:'extensions/image-resize.ts:insert',message:'failed to move image',data:{err:String(err),finalInsertPos,nodeSize},timestamp:Date.now()})}).catch(()=>{});
                        // #endregion
                      }
                    }
                  }
                  
                  draggedPos = null
                }
                
                document.addEventListener('mousemove', onMouseMove)
                document.addEventListener('mouseup', onMouseUp)
                
                return true
              }
              
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
                const isShiftPressed = e.shiftKey // Shift = пропорциональное изменение
                
                let newWidth = startWidth
                let newHeight = startHeight

                // Вычисляем новый размер в зависимости от угла/стороны
                switch (handle) {
                  case 'se': // Правый нижний
                    if (isShiftPressed) {
                      // Пропорциональное изменение
                      newWidth = Math.max(50, Math.min(startWidth + deltaX, view.dom.clientWidth - 100))
                      newHeight = newWidth / aspectRatio
                    } else {
                      // Независимое изменение
                      newWidth = Math.max(50, Math.min(startWidth + deltaX, view.dom.clientWidth - 100))
                      newHeight = Math.max(50, Math.min(startHeight + deltaY, view.dom.clientHeight - 100))
                    }
                    break
                  case 'sw': // Левый нижний
                    if (isShiftPressed) {
                      newWidth = Math.max(50, Math.min(startWidth - deltaX, view.dom.clientWidth - 100))
                      newHeight = newWidth / aspectRatio
                    } else {
                      newWidth = Math.max(50, Math.min(startWidth - deltaX, view.dom.clientWidth - 100))
                      newHeight = Math.max(50, Math.min(startHeight + deltaY, view.dom.clientHeight - 100))
                    }
                    break
                  case 'ne': // Правый верхний
                    if (isShiftPressed) {
                      newWidth = Math.max(50, Math.min(startWidth + deltaX, view.dom.clientWidth - 100))
                      newHeight = newWidth / aspectRatio
                    } else {
                      newWidth = Math.max(50, Math.min(startWidth + deltaX, view.dom.clientWidth - 100))
                      newHeight = Math.max(50, Math.min(startHeight - deltaY, view.dom.clientHeight - 100))
                    }
                    break
                  case 'nw': // Левый верхний
                    if (isShiftPressed) {
                      newWidth = Math.max(50, Math.min(startWidth - deltaX, view.dom.clientWidth - 100))
                      newHeight = newWidth / aspectRatio
                    } else {
                      newWidth = Math.max(50, Math.min(startWidth - deltaX, view.dom.clientWidth - 100))
                      newHeight = Math.max(50, Math.min(startHeight - deltaY, view.dom.clientHeight - 100))
                    }
                    break
                  case 'e': // Правая сторона - только ширина
                    newWidth = Math.max(50, Math.min(startWidth + deltaX, view.dom.clientWidth - 100))
                    // Высота не меняется при изменении только ширины
                    break
                  case 'w': // Левая сторона - только ширина
                    newWidth = Math.max(50, Math.min(startWidth - deltaX, view.dom.clientWidth - 100))
                    // Высота не меняется при изменении только ширины
                    break
                  case 's': // Нижняя сторона - только высота
                    newHeight = Math.max(50, Math.min(startHeight + deltaY, view.dom.clientHeight - 100))
                    // Ширина не меняется при изменении только высоты
                    break
                  case 'n': // Верхняя сторона - только высота
                    newHeight = Math.max(50, Math.min(startHeight - deltaY, view.dom.clientHeight - 100))
                    // Ширина не меняется при изменении только высоты
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
