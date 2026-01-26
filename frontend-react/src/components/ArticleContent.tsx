/**
 * Компонент для отображения контента статьи через TipTap Editor
 * Использует TipTap в режиме только для чтения для правильного отображения всех блоков
 */
import { useEditor, EditorContent } from '@tiptap/react'
import { useMemo, useEffect, useRef } from 'react'
import { StarterKit } from '@tiptap/starter-kit'
import { Link } from '@tiptap/extension-link'
import { Image } from '@tiptap/extension-image'
import { Placeholder } from '@tiptap/extension-placeholder'
import { CodeBlockWithCopy } from '@/extensions/code-block-with-copy'
import { Callout } from '@/extensions/callout'
import { BlockAnchor } from '@/extensions/block-anchor'
import { Column, Columns } from '@/extensions/columns'
import { slateToProseMirror } from '@/lib/slate-to-prosemirror'
import { cn } from '@/lib/utils'
import { logger } from '@/lib/logger'

interface ArticleContentProps {
  content: any // Slate JSON или ProseMirror JSON
  className?: string
}

export function ArticleContent({ content, className }: ArticleContentProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  
  // Диагностическое логирование при монтировании компонента (работает везде)
  console.log('[ArticleContent] Component mounted/updated:', {
    hasContent: !!content,
    contentType: typeof content,
    contentPreview: content ? JSON.stringify(content).substring(0, 200) : 'null',
  })
  
  // Конвертируем Slate в ProseMirror, если нужно
  const proseMirrorContent = useMemo(() => {
    if (!content) {
      return { type: 'doc', content: [] }
    }

    // Если это уже ProseMirror формат (есть type: 'doc')
    if (typeof content === 'object' && content.type === 'doc') {
      return content
    }

    // Если это Slate формат, конвертируем
    return slateToProseMirror(content)
  }, [content])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Отключаем некоторые функции, которые не нужны для отображения
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        codeBlock: false, // Используем CodeBlockWithCopy вместо стандартного
        link: false, // Используем кастомный Link
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline hover:text-primary/80 cursor-pointer',
          style: 'color: hsl(var(--primary));',
        },
      }),
      Image.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            src: {
              default: null,
            },
            alt: {
              default: null,
            },
          }
        },
      }).configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4',
        },
      }),
      CodeBlockWithCopy,
      Callout,
      BlockAnchor.configure({
        types: [
          'paragraph',
          'heading',
          'callout',
          'columns',
          'column',
          'blockquote',
          'codeBlock',
          'image',
        ],
      }),
      Column,
      Columns,
      Placeholder.configure({
        placeholder: '',
      }),
    ],
    content: proseMirrorContent,
    editable: false, // Режим только для чтения
    editorProps: {
      attributes: {
        class: cn(
          'tiptap prose prose-neutral dark:prose-invert max-w-none',
          'text-foreground leading-relaxed break-words',
          className
        ),
      },
    },
    onCreate: ({ editor }) => {
      // #region agent log
      const json = editor.getJSON()
      const headings = json.content?.filter((n: any) => n.type === 'heading') || []
      const paragraphs = json.content?.filter((n: any) => n.type === 'paragraph') || []
      fetch('http://127.0.0.1:7242/ingest/ebafe3e3-0264-4f10-b0b2-c1951d9e2325',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ArticleContent.tsx:116',message:'Editor created - content structure',data:{headingsCount:headings.length,paragraphsCount:paragraphs.length,headingLevels:headings.map((h:any)=>h.attrs?.level),contentTypes:json.content?.map((n:any)=>n.type)||[]},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
    },
  })

  // Обновляем контент редактора при изменении proseMirrorContent
  useEffect(() => {
    if (!editor || !proseMirrorContent) return
    
    const currentContent = editor.getJSON()
    // Сравниваем контент, чтобы не обновлять без необходимости
    const currentContentStr = JSON.stringify(currentContent)
    const newContentStr = JSON.stringify(proseMirrorContent)
    
    if (currentContentStr !== newContentStr) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/ebafe3e3-0264-4f10-b0b2-c1951d9e2325',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ArticleContent.tsx:127',message:'Content update - checking structure',data:{contentTypes:proseMirrorContent.content?.map((n:any)=>n.type)||[],headingsCount:proseMirrorContent.content?.filter((n:any)=>n.type==='heading').length||0,paragraphsCount:proseMirrorContent.content?.filter((n:any)=>n.type==='paragraph').length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      if (import.meta.env.DEV) {
        // Логируем наличие изображений в контенте для отладки
        const hasImages = JSON.stringify(proseMirrorContent).includes('"type":"image"')
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
          const images = findImages(proseMirrorContent.content || [])
          logger.debug('[ArticleContent] Content contains images:', {
            count: images.length,
            images: images.map(img => ({
              src: img.attrs?.src?.substring(0, 100),
              alt: img.attrs?.alt,
            })),
          })
        }
      }
      
      editor.commands.setContent(proseMirrorContent, { emitUpdate: false })
    }
  }, [editor, proseMirrorContent])

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
        const hasImages = JSON.stringify(proseMirrorContent).includes('"type":"image"')
        if (hasImages) {
          logger.warn('[ArticleContent] Images in JSON but not in DOM!', {
            proseMirrorContent: JSON.stringify(proseMirrorContent).substring(0, 500),
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

    // Запускаем после небольшой задержки, чтобы дать TipTap время отрендерить
    const timeoutId = setTimeout(handleMediaElements, 200)
    return () => clearTimeout(timeoutId)
  }, [editor, proseMirrorContent])

  // В опубликованных статьях добавляем только кратковременную подсветку при клике на якорную ссылку
  // Постоянные индикаторы не нужны - только эффект при навигации

  // Отладочная информация: проверяем, что blockId правильно применены
  useEffect(() => {
    if (!editor || !editorRef.current) return
    
    // Проверяем наличие элементов с blockId после рендеринга
    const checkAnchors = () => {
      // #region agent log
      const headings = editorRef.current?.querySelectorAll('h1, h2, h3, h4, h5, h6') || []
      const paragraphs = editorRef.current?.querySelectorAll('p') || []
      const headingStyles = Array.from(headings).slice(0, 3).map((h: Element) => {
        const styles = window.getComputedStyle(h as HTMLElement)
        return {
          tag: h.tagName,
          fontSize: styles.fontSize,
          fontWeight: styles.fontWeight,
          marginTop: styles.marginTop,
          marginBottom: styles.marginBottom,
          classes: h.className,
        }
      })
      const paragraphStyles = Array.from(paragraphs).slice(0, 3).map((p: Element) => {
        const styles = window.getComputedStyle(p as HTMLElement)
        return {
          fontSize: styles.fontSize,
          fontWeight: styles.fontWeight,
          marginTop: styles.marginTop,
          marginBottom: styles.marginBottom,
          classes: p.className,
        }
      })
      fetch('http://127.0.0.1:7242/ingest/ebafe3e3-0264-4f10-b0b2-c1951d9e2325',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ArticleContent.tsx:264',message:'DOM structure and styles check',data:{headingsCount:headings.length,paragraphsCount:paragraphs.length,headingStyles,paragraphStyles,editorClasses:editorRef.current?.querySelector('.tiptap')?.className},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      
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
    
    // Проверяем после небольшой задержки, чтобы дать TipTap время отрендерить контент
    const timeoutId = setTimeout(checkAnchors, 500)
    return () => clearTimeout(timeoutId)
  }, [editor, proseMirrorContent])

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
        // Ищем внутри всего документа, так как TipTap может рендерить контент в разных местах
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

  return (
    <div ref={editorRef}>
      <EditorContent editor={editor} />
    </div>
  )
}

