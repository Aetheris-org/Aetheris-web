/**
 * Компонент для отображения контента статьи через Fate Engine
 * Использует Fate Engine в режиме только для чтения для правильного отображения всех блоков
 */
import { useEditor, EditorContent } from '@/fate-engine/react'
import { useMemo, useEffect, useRef } from 'react'
import { StarterKit } from '@/fate-engine/extensions/StarterKit'
import { Link } from '@/fate-engine/marks/Link'
import { Image } from '@/fate-engine/nodes/Image'
import { Underline } from '@/fate-engine/marks/Underline'
import { TextStyle } from '@/fate-engine/marks/TextStyle'
import { Color } from '@/fate-engine/marks/Color'
import { TextAlign } from '@/fate-engine/extensions/TextAlign'
import { Highlight } from '@/fate-engine/marks/Highlight'
import { CodeBlock } from '@/fate-engine/nodes/CodeBlock'
import { Callout } from '@/fate-engine/nodes/Callout'
import { Column, Columns } from '@/fate-engine/nodes/Columns'
import { slateToFate, prosemirrorToFate } from '@/fate-engine/utils/converter'
import { cn } from '@/lib/utils'
import { logger } from '@/lib/logger'

interface ArticleContentProps {
  content: any // Slate JSON или ProseMirror JSON
  className?: string
}

export function ArticleContent({ content, className }: ArticleContentProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  
  // Конвертируем Slate или ProseMirror в Fate Engine формат
  const fateContent = useMemo(() => {
    if (!content) {
      return { type: 'doc', content: [] }
    }

    // Если это уже ProseMirror формат (есть type: 'doc')
    if (typeof content === 'object' && content.type === 'doc') {
      return prosemirrorToFate(content)
    }

    // Если это Slate формат, конвертируем
    return slateToFate(content)
  }, [content])

  const editor = useEditor({
    extensions: [
      StarterKit({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        bold: true,
        italic: true,
        underline: true,
        strikethrough: true,
        code: true,
        hardBreak: true,
        horizontalRule: true,
      }),
      Link,
      Image,
      CodeBlock,
      Callout,
      Column,
      Columns,
      TextStyle,
      Color,
      Underline,
      Highlight,
      TextAlign({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
    ],
    content: fateContent,
    editable: false, // Режим только для чтения
    onCreate: ({ doc }: { doc: any }) => {
      if (import.meta.env.DEV) {
        logger.debug('[ArticleContent] Fate Engine editor created', { content: doc })
      }
    },
  })

  // Обновляем контент редактора при изменении fateContent
  useEffect(() => {
    if (!editor || !fateContent) return
    
    const currentContent = editor.getJSON()
    // Сравниваем контент, чтобы не обновлять без необходимости
    const currentContentStr = JSON.stringify(currentContent)
    const newContentStr = JSON.stringify(fateContent)
    
    if (currentContentStr !== newContentStr) {
      if (import.meta.env.DEV) {
        // Логируем наличие изображений в контенте для отладки
        const hasImages = JSON.stringify(fateContent).includes('"type":"image"')
        if (hasImages) {
          // Находим все узлы изображений для детального логирования
          const findImages = (content: any[]): any[] => {
            const images: any[] = []
            for (const node of content || []) {
              if (node.type === 'image') {
                images.push(node)
              }
              if (node.content && Array.isArray(node.content)) {
                images.push(...findImages(node.content))
              }
            }
            return images
          }
          const images = findImages(fateContent.content || [])
          logger.debug('[ArticleContent] Content contains images:', {
            count: images.length,
            images: images.map(img => ({
              src: img.attrs?.src?.substring(0, 100),
              alt: img.attrs?.alt,
            })),
          })
        }
      }
      
      editor.setContent(fateContent)
    }
  }, [editor, fateContent])

  // Проверка и обработка изображений, видео и аудио после рендеринга
  useEffect(() => {
    if (!editor || !editorRef.current) return

    const handleMediaElements = () => {
      // Проверяем изображения
      const images = editorRef.current?.querySelectorAll('img')
      if (images && images.length > 0) {
        images.forEach(img => {
          // Убеждаемся, что изображения имеют правильные стили
          if (!img.classList.contains('max-w-full')) {
            img.classList.add('max-w-full', 'h-auto', 'rounded-lg', 'my-4')
          }
          
          // Принудительно устанавливаем стили для гарантированного отображения
          img.style.maxWidth = '100%'
          img.style.height = 'auto'
          img.style.display = img.src ? 'block' : 'none'
          
          // Проверяем, что src установлен и валиден
          if (!img.src || img.src === window.location.href) {
            logger.warn('[ArticleContent] Image has invalid or missing src:', {
              src: img.getAttribute('src'),
              alt: img.alt,
            })
          }
          
          if (import.meta.env.DEV && img.src) {
            logger.debug('[ArticleContent] Found image in DOM:', {
              src: img.src.substring(0, 100),
              alt: img.alt,
              width: img.width,
              height: img.height,
              naturalWidth: img.naturalWidth,
              naturalHeight: img.naturalHeight,
              display: window.getComputedStyle(img).display,
              visibility: window.getComputedStyle(img).visibility,
            })
          }
        })
      } else if (import.meta.env.DEV) {
        // Если в JSON есть изображения, но в DOM их нет - это проблема
        const hasImages = JSON.stringify(fateContent).includes('"type":"image"')
        if (hasImages) {
          logger.warn('[ArticleContent] Images in JSON but not in DOM!', {
            fateContent: JSON.stringify(fateContent).substring(0, 500),
          })
          
          // Попробуем найти изображения в редакторе через JSON
          const json = editor.getJSON()
          const findImagesInJSON = (content: any[]): any[] => {
            const images: any[] = []
            for (const node of content || []) {
              if (node.type === 'image') {
                images.push(node)
              }
              if (node.content && Array.isArray(node.content)) {
                images.push(...findImagesInJSON(node.content))
              }
            }
            return images
          }
          const imagesInJSON = findImagesInJSON(json.content || [])
          
          if (imagesInJSON.length > 0) {
            logger.warn('[ArticleContent] Images found in editor JSON but not rendered in DOM:', {
              count: imagesInJSON.length,
              images: imagesInJSON.map(img => ({
                src: img.attrs?.src?.substring(0, 100),
              })),
            })
          }
        }
      }

      // Находим все элементы video и audio внутри редактора
      const videoWrappers = editorRef.current?.querySelectorAll('.editor-video-wrapper')
      const audioWrappers = editorRef.current?.querySelectorAll('.editor-audio-wrapper')
      
      // Убеждаемся, что video и audio элементы правильно отображаются
      videoWrappers?.forEach(wrapper => {
        const video = wrapper.querySelector('video')
        if (video && !video.hasAttribute('controls')) {
          video.setAttribute('controls', '')
        }
      })
      
      audioWrappers?.forEach(wrapper => {
        const audio = wrapper.querySelector('audio')
        if (audio && !audio.hasAttribute('controls')) {
          audio.setAttribute('controls', '')
        }
      })
    }

    // Запускаем после небольшой задержки, чтобы дать Fate Engine время отрендерить
    const timeoutId = setTimeout(handleMediaElements, 200)
    return () => clearTimeout(timeoutId)
  }, [editor, fateContent])

  // В опубликованных статьях добавляем только кратковременную подсветку при клике на якорную ссылку
  // Постоянные индикаторы не нужны - только эффект при навигации

  // Отладочная информация: проверяем, что blockId правильно применены
  useEffect(() => {
    if (!editor || !editorRef.current) return
    
    // Проверяем наличие элементов с blockId после рендеринга
    const checkAnchors = () => {
      if (import.meta.env.DEV) {
        const allAnchors = editorRef.current?.querySelectorAll('[id], [data-block-id]')
        if (allAnchors && allAnchors.length > 0) {
          logger.debug('[ArticleContent] Anchors found after render:', Array.from(allAnchors).map(el => ({
            id: el.id,
            dataBlockId: el.getAttribute('data-block-id'),
            tagName: el.tagName,
            textContent: el.textContent?.substring(0, 50),
          })))
        }
      }
    }
    
    // Проверяем после небольшой задержки, чтобы дать Fate Engine время отрендерить контент
    const timeoutId = setTimeout(checkAnchors, 500)
    return () => clearTimeout(timeoutId)
  }, [editor, fateContent])

  // Обработка кликов по якорным ссылкам (href="#anchor-id")
  // Добавляем кратковременную подсветку блока-якоря при клике
  useEffect(() => {
    if (!editor || !editorRef.current) return

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const link = target.closest('a[href^="#"]')
      
      if (link) {
        event.preventDefault()
        const href = link.getAttribute('href')
        if (!href || !href.startsWith('#')) return
        
        const anchorId = href.substring(1) // Убираем #
        if (!anchorId) return
        
        if (import.meta.env.DEV) {
          logger.debug('[ArticleContent] Anchor link clicked:', { href, anchorId })
        }
        
        // Ищем элемент с id или data-block-id равным anchorId
        // Ищем внутри всего документа, так как Fate Engine может рендерить контент в разных местах
        const anchorElement = document.querySelector(
          `[id="${anchorId}"], [data-block-id="${anchorId}"]`
        ) as HTMLElement | null
        
        if (import.meta.env.DEV) {
          logger.debug('[ArticleContent] Found anchor element:', anchorElement)
          if (!anchorElement) {
            // Проверяем, какие элементы с id или data-block-id есть в документе
            const allAnchors = document.querySelectorAll('[id], [data-block-id]')
            const anchorsInfo = Array.from(allAnchors).map(el => ({
              id: el.id,
              dataBlockId: el.getAttribute('data-block-id'),
              tagName: el.tagName,
              className: el.className,
              textContent: el.textContent?.substring(0, 50),
            }))
            logger.debug('[ArticleContent] All anchors in document:', anchorsInfo)
            logger.debug('[ArticleContent] Looking for anchorId:', anchorId)
            logger.debug('[ArticleContent] Editor content:', editor.getJSON())
          }
        }
        
        if (anchorElement) {
          // Прокручиваем к элементу
          anchorElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          })
          
          // Красивая анимация подсветки через CSS класс
          anchorElement.classList.add('anchor-highlight')
          
          // Убираем класс после завершения анимации
          setTimeout(() => {
            anchorElement.classList.remove('anchor-highlight')
          }, 2000)
        } else {
          // Если не нашли, попробуем найти внутри редактора
          const editorElement = editorRef.current
          const anchorInEditor = editorElement?.querySelector(
            `[id="${anchorId}"], [data-block-id="${anchorId}"]`
          ) as HTMLElement | null
          
          if (anchorInEditor) {
            anchorInEditor.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            })
            
            anchorInEditor.classList.add('anchor-highlight')
            
            setTimeout(() => {
              anchorInEditor.classList.remove('anchor-highlight')
            }, 2000)
          } else if (import.meta.env.DEV) {
            logger.warn('[ArticleContent] Anchor element not found:', anchorId)
          }
        }
      }
    }

    const editorElement = editorRef.current
    editorElement?.addEventListener('click', handleClick)
    
    return () => {
      editorElement?.removeEventListener('click', handleClick)
    }
  }, [editor])

  if (!editor) {
    return null
  }

  // Применяем стили напрямую к элементам после рендеринга с использованием MutationObserver
  useEffect(() => {
    if (!editor || !editorRef.current) return

    const applyStyles = () => {
      // Ищем элемент .fate-editor в разных местах
      let fateElement = editorRef.current?.querySelector('.fate-editor')
      if (!fateElement) {
        // Если не нашли, проверяем сам editorRef
        fateElement = editorRef.current
      }
      
      if (!fateElement) {
        console.warn('[ArticleContent] Fate Engine element not found!')
        return
      }

      // Применяем стили к параграфам
      const paragraphs = fateElement.querySelectorAll('p')
      paragraphs.forEach((p, index) => {
        const el = p as HTMLElement
        el.style.setProperty('margin-bottom', '1rem', 'important')
        el.style.setProperty('margin-top', '0', 'important')
        el.style.setProperty('white-space', 'normal', 'important')
        el.style.setProperty('line-height', '1.7', 'important')
        el.style.setProperty('display', 'block', 'important')
        
        // Убираем margin-bottom у последнего параграфа
        if (index === paragraphs.length - 1) {
          el.style.setProperty('margin-bottom', '0', 'important')
        }
      })
      
      // Применяем стили к заголовкам
      const headings = fateElement.querySelectorAll('h1, h2, h3, h4, h5, h6')
      headings.forEach((h, index) => {
        const el = h as HTMLElement
        const tagName = el.tagName.toLowerCase()
        
        // Общие стили для всех заголовков
        el.style.setProperty('white-space', 'normal', 'important')
        el.style.setProperty('display', 'block', 'important')
        
        // Специфичные стили по уровню
        if (tagName === 'h1') {
          el.style.setProperty('margin-top', index === 0 ? '0' : '2rem', 'important')
          el.style.setProperty('margin-bottom', '1rem', 'important')
          el.style.setProperty('font-size', '1.875rem', 'important')
          el.style.setProperty('font-weight', '700', 'important')
          el.style.setProperty('line-height', '1.2', 'important')
          el.style.setProperty('letter-spacing', '-0.025em', 'important')
        } else if (tagName === 'h2') {
          el.style.setProperty('margin-top', index === 0 ? '0' : '1.5rem', 'important')
          el.style.setProperty('margin-bottom', '1rem', 'important')
          el.style.setProperty('font-size', '1.5rem', 'important')
          el.style.setProperty('font-weight', '600', 'important')
          el.style.setProperty('line-height', '1.3', 'important')
          el.style.setProperty('letter-spacing', '-0.025em', 'important')
        } else if (tagName === 'h3') {
          el.style.setProperty('margin-top', index === 0 ? '0' : '1.25rem', 'important')
          el.style.setProperty('margin-bottom', '1rem', 'important')
          el.style.setProperty('font-size', '1.25rem', 'important')
          el.style.setProperty('font-weight', '600', 'important')
          el.style.setProperty('line-height', '1.4', 'important')
        } else if (tagName === 'h4') {
          el.style.setProperty('margin-top', index === 0 ? '0' : '1rem', 'important')
          el.style.setProperty('margin-bottom', '0.75rem', 'important')
          el.style.setProperty('font-size', '1.125rem', 'important')
          el.style.setProperty('font-weight', '600', 'important')
          el.style.setProperty('line-height', '1.4', 'important')
        } else if (tagName === 'h5') {
          el.style.setProperty('margin-top', index === 0 ? '0' : '1rem', 'important')
          el.style.setProperty('margin-bottom', '0.75rem', 'important')
          el.style.setProperty('font-size', '1rem', 'important')
          el.style.setProperty('font-weight', '600', 'important')
          el.style.setProperty('line-height', '1.5', 'important')
        } else if (tagName === 'h6') {
          el.style.setProperty('margin-top', index === 0 ? '0' : '0.75rem', 'important')
          el.style.setProperty('margin-bottom', '0.5rem', 'important')
          el.style.setProperty('font-size', '0.875rem', 'important')
          el.style.setProperty('font-weight', '600', 'important')
          el.style.setProperty('line-height', '1.5', 'important')
        }
      })
      
      console.log('[ArticleContent] Applied styles:', {
        paragraphs: paragraphs.length,
        headings: headings.length,
      })
    }
    
    // Применяем стили сразу
    applyStyles()
    
    // Применяем стили через интервалы
    const timeouts: NodeJS.Timeout[] = []
    for (let i = 0; i < 10; i++) {
      timeouts.push(setTimeout(applyStyles, i * 100))
    }
    
    // Используем MutationObserver для отслеживания изменений DOM
    const observer = new MutationObserver(() => {
      applyStyles()
    })
    
    if (editorRef.current) {
      observer.observe(editorRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
      })
    }
    
    return () => {
      timeouts.forEach(clearTimeout)
      observer.disconnect()
    }
  }, [editor, fateContent])

  return (
    <div ref={editorRef} className="article-content-wrapper">
      <EditorContent editor={editor} className={cn('fate-editor article-content', className)} />
    </div>
  )
}

